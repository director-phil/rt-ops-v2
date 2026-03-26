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

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const tenantId = process.env.ST_TENANT_ID!;

    const invoices = await stFetchAll(`/accounting/v2/tenant/${tenantId}/invoices`, {
      createdOnOrAfter: range.from,
      createdBefore: range.to,
      active: "True",
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Aggregate per tech using employeeInfo (performer/installer)
    // soldById from job.soldById → but we don't have that from invoice directly
    // Use employeeInfo as installer, soldBy as salesman if different
    const techData: Record<string, {
      id: string;
      name: string;
      grossAsInstaller: number;
      grossAsSalesman: number;
      totalGross: number;
      invoiceCount: number;
    }> = {};

    const ensureTech = (id: string, name: string) => {
      if (!techData[id]) {
        techData[id] = { id, name, grossAsInstaller: 0, grossAsSalesman: 0, totalGross: 0, invoiceCount: 0 };
      }
    };

    for (const inv of invoices) {
      const revenue = parseNum(inv.total);
      const isPaid = ["paid", "sent"].includes(((inv.sentStatus as string) || "").toLowerCase());

      const empInfo = inv.employeeInfo as Record<string, unknown> | null;
      const assignedTo = inv.assignedTo as Record<string, unknown> | null;
      const createdBy = inv.createdBy as Record<string, unknown> | null;

      // Installer = employeeInfo (tech who did the job)
      const installer = empInfo || assignedTo;
      if (installer?.id) {
        const id = String(installer.id);
        const name = (installer.name as string) || "Unknown";
        ensureTech(id, name);
        techData[id].grossAsInstaller += revenue;
        techData[id].totalGross += revenue;
        techData[id].invoiceCount++;
      }

      // Salesman = soldById from the job (not available on invoice directly)
      // If different from installer, we'd add separately
      // For now use same tech as both salesman and installer (common for trade)
    }

    const techResults = Object.values(techData).map(tech => {
      const meetsThreshold = tech.totalGross >= COMMISSION_THRESHOLD;

      const installerNetValue = tech.grossAsInstaller * NET_SALE_FACTOR;
      const salesmanNetValue = tech.grossAsSalesman * NET_SALE_FACTOR;
      const installerCommission = meetsThreshold ? installerNetValue * COMMISSION_RATE : 0;
      const salesmanCommission = meetsThreshold ? salesmanNetValue * COMMISSION_RATE : 0;
      const totalCommission = installerCommission + salesmanCommission;
      const progressPct = Math.min(100, Math.round((tech.totalGross / COMMISSION_THRESHOLD) * 100));

      const role = tech.grossAsSalesman > 0 && tech.grossAsInstaller > 0
        ? "Both"
        : tech.grossAsSalesman > 0 ? "Salesman" : "Installer";

      return {
        techId: tech.id,
        name: tech.name,
        role,
        grossJobsValue: Math.round(tech.totalGross),
        netValue: Math.round(tech.totalGross * NET_SALE_FACTOR),
        salesmanGross: Math.round(tech.grossAsSalesman),
        installerGross: Math.round(tech.grossAsInstaller),
        salesmanCommission: Math.round(salesmanCommission * 100) / 100,
        installerCommission: Math.round(installerCommission * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        meetsThreshold,
        progressPct,
        thresholdGap: Math.max(0, Math.round(COMMISSION_THRESHOLD - tech.totalGross)),
      };
    }).sort((a, b) => b.grossJobsValue - a.grossJobsValue);

    const totalCommission = techResults.reduce((s, t) => s + t.totalCommission, 0);
    const earnerCount = techResults.filter(t => t.meetsThreshold).length;

    return NextResponse.json({
      ok: true,
      period: range.label,
      threshold: COMMISSION_THRESHOLD,
      netSaleFactor: NET_SALE_FACTOR,
      commissionRate: COMMISSION_RATE,
      totalCommission: Math.round(totalCommission * 100) / 100,
      earnerCount,
      techCount: techResults.length,
      technicians: techResults,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
