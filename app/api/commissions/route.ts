import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const COMMISSION_THRESHOLD = 80000;   // $80K
const NET_SALE_FACTOR = 0.95;         // 5% system fee deduction
const COMMISSION_RATE = 0.015;        // 1.5% per role

function normalizeTrade(buName: string): string {
  const n = buName.toLowerCase();
  if (n.includes("electrical")) return "Electrical";
  if (n.includes("hvac") || n.includes("air") || n.includes("ac")) return "AC/HVAC";
  if (n.includes("solar") || n.includes("battery")) return "Solar";
  if (n.includes("plumb")) return "Plumbing";
  return "Other";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const tenantId = process.env.ST_TENANT_ID!;

    // Fetch invoices with tech assignment data
    const invoices = await stFetchAll(`/accounting/v2/tenant/${tenantId}/invoices`, {
      createdOnOrAfter: range.from,
      createdBefore: range.to,
      active: "True",
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Fetch jobs to get sold-by (salesman) vs performed-by (installer)
    const jobs = await stFetchAll(`/jpm/v2/tenant/${tenantId}/jobs`, {
      createdOnOrAfter: range.from,
      createdBefore: range.to,
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Build job map: jobId -> { soldBy, assignedTo, total, status, invoiceId, businessUnit }
    const jobMap: Record<string, {
      jobId: string;
      soldBy: { id: number; name: string } | null;
      assignedTo: { id: number; name: string } | null;
      total: number;
      status: string;
      trade: string;
      invoiceTotal: number;
      paid: boolean;
      isCallback: boolean;
    }> = {};

    for (const job of jobs) {
      const jobId = String(job.id);
      const assignments = (job.assignments as Record<string, unknown>[]) || [];
      const bu = ((job.businessUnit as Record<string, unknown>)?.name as string) || "";

      // First assignment = installer, soldBy comes from soldById field
      const assignedTech = assignments.length > 0
        ? {
            id: (assignments[0].technician as Record<string, unknown>)?.id as number,
            name: ((assignments[0].technician as Record<string, unknown>)?.name as string) || "Unknown"
          }
        : null;

      // soldBy — ST may store this as 'soldBy' or 'leadSource'
      const soldByRaw = job.soldBy as Record<string, unknown> | null;
      const soldBy = soldByRaw
        ? { id: soldByRaw.id as number, name: (soldByRaw.name as string) || "Unknown" }
        : assignedTech; // if no explicit sold-by, assume same person

      const isCallback = (job.jobTypeName as string || "").toLowerCase().includes("callback")
        || (job.tags as string[] || []).some((t: string) => t.toLowerCase().includes("callback"));

      jobMap[jobId] = {
        jobId,
        soldBy: soldBy,
        assignedTo: assignedTech,
        total: (job.total as number) || 0,
        status: (job.jobStatus as string) || (job.status as string) || "",
        trade: normalizeTrade(bu),
        invoiceTotal: (job.total as number) || 0,
        paid: false, // will update from invoices
        isCallback,
      };
    }

    // Match invoices to jobs, mark paid status
    for (const inv of invoices) {
      const jobId = String((inv.jobId as number) || (inv.job as Record<string, unknown>)?.id || "");
      if (jobMap[jobId]) {
        jobMap[jobId].invoiceTotal = (inv.total as number) || jobMap[jobId].total;
        const status = (inv.status as string || "").toLowerCase();
        jobMap[jobId].paid = status === "paid" || status === "sent";
      }
    }

    // Aggregate per technician
    // Each tech can be salesman, installer, or both on any job
    const techData: Record<string, {
      id: number;
      name: string;
      asSalesman: { grossValue: number; jobs: number };
      asInstaller: { grossValue: number; jobs: number };
      totalGross: number; // for threshold check
      jobDetails: {
        jobId: string;
        role: string;
        grossValue: number;
        netValue: number;
        commission: number;
        trade: string;
        paid: boolean;
        blocked: boolean;
        blockReason: string;
      }[];
    }> = {};

    const ensureTech = (id: number, name: string) => {
      if (!techData[id]) {
        techData[id] = {
          id, name,
          asSalesman: { grossValue: 0, jobs: 0 },
          asInstaller: { grossValue: 0, jobs: 0 },
          totalGross: 0,
          jobDetails: [],
        };
      }
    }

    for (const job of Object.values(jobMap)) {
      const salesmanId = job.soldBy?.id;
      const installerId = job.assignedTo?.id;

      if (salesmanId && job.soldBy) {
        ensureTech(salesmanId, job.soldBy.name);
        techData[salesmanId].asSalesman.grossValue += job.invoiceTotal;
        techData[salesmanId].asSalesman.jobs++;
        techData[salesmanId].totalGross += job.invoiceTotal;
      }
      if (installerId && job.assignedTo && installerId !== salesmanId) {
        ensureTech(installerId, job.assignedTo.name);
        techData[installerId].asInstaller.grossValue += job.invoiceTotal;
        techData[installerId].asInstaller.jobs++;
        techData[installerId].totalGross += job.invoiceTotal;
      } else if (installerId && job.assignedTo && installerId === salesmanId) {
        // Already counted in salesman — add installer too separately
        techData[installerId].asInstaller.grossValue += job.invoiceTotal;
        techData[installerId].asInstaller.jobs++;
      }
    }

    // Now compute commissions per tech
    const techResults = Object.values(techData).map(tech => {
      const threshold = COMMISSION_THRESHOLD;
      const meetsThreshold = tech.totalGross >= threshold;

      // Commission on jobs where threshold is met
      const salesmanNetValue = tech.asSalesman.grossValue * NET_SALE_FACTOR;
      const installerNetValue = tech.asInstaller.grossValue * NET_SALE_FACTOR;
      const salesmanCommission = meetsThreshold ? salesmanNetValue * COMMISSION_RATE : 0;
      const installerCommission = meetsThreshold ? installerNetValue * COMMISSION_RATE : 0;

      // Determine role
      const hasSales = tech.asSalesman.jobs > 0;
      const hasInstall = tech.asInstaller.jobs > 0;
      const role = hasSales && hasInstall ? "Both" : hasSales ? "Salesman" : "Installer";

      const totalGrossValue = tech.asSalesman.grossValue + (tech.asInstaller.grossValue !== tech.asSalesman.grossValue ? tech.asInstaller.grossValue : 0);
      const totalNetValue = totalGrossValue * NET_SALE_FACTOR;
      const totalCommission = salesmanCommission + installerCommission;
      const progressPct = Math.min(100, Math.round((tech.totalGross / threshold) * 100));

      return {
        techId: tech.id,
        name: tech.name,
        role,
        grossJobsValue: Math.round(tech.totalGross),
        netValue: Math.round(totalNetValue),
        salesmanGross: Math.round(tech.asSalesman.grossValue),
        installerGross: Math.round(tech.asInstaller.grossValue),
        salesmanCommission: Math.round(salesmanCommission * 100) / 100,
        installerCommission: Math.round(installerCommission * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        meetsThreshold,
        progressPct,
        thresholdGap: Math.max(0, Math.round(threshold - tech.totalGross)),
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
    console.error("[/api/commissions]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
