import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const COMMISSION_THRESHOLD = 80000;
const NET_SALE_FACTOR = 0.95;
const COMMISSION_RATE = 0.015;

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

async function fetchTechMetrics(from: string, to: string) {
  const tenantId = process.env.ST_TENANT_ID!;

  // Use invoices to get tech data via employeeInfo field
  const invoices = await stFetchAll(`/accounting/v2/tenant/${tenantId}/invoices`, {
    createdOnOrAfter: from,
    createdBefore: to,
    active: "True",
    pageSize: "500",
  }) as Record<string, unknown>[];

  const techMap: Record<string, {
    id: number | string;
    name: string;
    revenue: number;
    invoices: number;
    recalls: number;
  }> = {};

  for (const inv of invoices) {
    const revenue = parseNum(inv.total);

    // employeeInfo is the tech who performed the work
    const empInfo = inv.employeeInfo as Record<string, unknown> | null;
    // assignedTo may also have tech info
    const assignedTo = inv.assignedTo as Record<string, unknown> | null;
    // createdBy as fallback
    const createdBy = inv.createdBy as Record<string, unknown> | null;

    const techInfo = empInfo || assignedTo || createdBy;
    if (!techInfo?.id) continue;

    const id = String(techInfo.id);
    const name = (techInfo.name as string) || "Unknown";

    if (!techMap[id]) {
      techMap[id] = { id, name, revenue: 0, invoices: 0, recalls: 0 };
    }
    techMap[id].revenue += revenue;
    techMap[id].invoices++;
  }

  return Object.values(techMap);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const [current, previous] = await Promise.all([
      fetchTechMetrics(range.from, range.to),
      fetchTechMetrics(range.prevFrom, range.prevTo),
    ]);

    const prevMap = new Map(previous.map(t => [t.name, t]));

    const technicians = current.map(tech => {
      const prev = prevMap.get(tech.name);
      const revChange = prev ? tech.revenue - prev.revenue : null;
      const revChangePct = prev && prev.revenue > 0 ? ((tech.revenue - prev.revenue) / prev.revenue) * 100 : null;

      const netSale = tech.revenue * NET_SALE_FACTOR;
      const meetsThreshold = tech.revenue >= COMMISSION_THRESHOLD;
      const commission = meetsThreshold ? netSale * COMMISSION_RATE : 0;
      const progressPct = Math.min(100, Math.round((tech.revenue / COMMISSION_THRESHOLD) * 100));

      return {
        id: tech.id,
        name: tech.name,
        revenueMTD: Math.round(tech.revenue),
        prevRevenue: prev ? Math.round(prev.revenue) : null,
        revChange: revChange !== null ? Math.round(revChange) : null,
        revChangePct: revChangePct !== null ? Math.round(revChangePct * 10) / 10 : null,
        jobCount: tech.invoices,
        hoursWorked: 0, // not available from invoices
        revPerHr: null,
        recalls: tech.recalls,
        commission: Math.round(commission * 100) / 100,
        meetsThreshold,
        progressPct,
        thresholdGap: Math.max(0, Math.round(COMMISSION_THRESHOLD - tech.revenue)),
      };
    }).sort((a, b) => b.revenueMTD - a.revenueMTD);

    return NextResponse.json({
      ok: true,
      period: range.label,
      commissionThreshold: COMMISSION_THRESHOLD,
      technicians,
      noData: technicians.length === 0,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
