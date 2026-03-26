import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getSTToken } from "@/app/lib/st-auth";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const COMMISSION_THRESHOLD = 80000;
const NET_SALE_FACTOR = 0.95;
const COMMISSION_RATE = 0.015;

// Whitelist of real field technicians — sourced from Phillip 2026-03-25
const TECH_WHITELIST = [
  "Mitch Powell",
  "Romello Moore",
  "Curtis Jeffrey",
  "Kyle Rootes",
  "Zachary Lingard",
  "Dean Retra",
  "Hayden Sibley",
  "Scott Gullick",
  "Lachlan Henzell",
  "Rusty Daniells",
  "Bradley Tinworth MT",
  "Kristian Calcagno",
  "Alex Naughton",
  "David White",
  "Bailey Somerville",
  "Daniel Hayes",
  "Alex Peisler",
];

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

function isTech(name: string): boolean {
  // Never show email addresses or login accounts
  if (!name || name.includes("@")) return false;
  // Use whitelist match (case-insensitive)
  for (const w of TECH_WHITELIST) {
    if (w.toLowerCase() === name.toLowerCase()) return true;
  }
  return false;
}

async function fetchEmployeeTechIds(): Promise<Set<string>> {
  const tenantId = process.env.ST_TENANT_ID!;
  const appKey = process.env.ST_APP_KEY!;
  const techIds = new Set<string>();

  try {
    const token = await getSTToken();
    // Try HR API first for role-filtered employees
    const url = `https://api.servicetitan.io/hr/v2/tenant/${tenantId}/employees?active=true&pageSize=200`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "ST-App-Key": appKey },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const employees = data.data || [];
      for (const emp of employees) {
        const name = (emp.name as string) || "";
        const roles = (emp.roles as string[]) || [];
        const roleStr = roles.join(",").toLowerCase();
        // Include if in whitelist OR has Technician role and not email
        if (
          isTech(name) ||
          (roleStr.includes("technician") && !name.includes("@"))
        ) {
          techIds.add(String(emp.id));
        }
      }
    }
  } catch {
    // Fall through — we'll rely on whitelist filtering of invoice data
  }

  return techIds;
}

async function fetchTechMetrics(from: string, to: string) {
  const tenantId = process.env.ST_TENANT_ID!;

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

    const empInfo = inv.employeeInfo as Record<string, unknown> | null;
    const assignedTo = inv.assignedTo as Record<string, unknown> | null;
    const createdBy = inv.createdBy as Record<string, unknown> | null;

    const techInfo = empInfo || assignedTo || createdBy;
    if (!techInfo?.id) continue;

    const id = String(techInfo.id);
    const name = (techInfo.name as string) || "Unknown";

    // Filter: must be a real tech (not email/login account)
    if (!isTech(name)) continue;

    if (!techMap[id]) {
      techMap[id] = { id, name, revenue: 0, invoices: 0, recalls: 0 };
    }
    techMap[id].revenue += revenue;
    techMap[id].invoices++;
  }

  // Also try to get any whitelisted techs from jobs endpoint (they may not appear in invoices)
  // but return what we have from invoices for now
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
        hoursWorked: 0,
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
