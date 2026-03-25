import { NextResponse } from "next/server";
import { stFetch } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: start.toISOString(),
    to: now.toISOString(),
  };
}

export async function GET() {
  try {
    const tenantId = process.env.ST_TENANT_ID!;
    const { from, to } = getMonthRange();

    // Fetch completed invoices for current month
    const invoicesData = await stFetch(`/accounting/v2/tenant/${tenantId}/invoices`, {
      createdOnOrAfter: from,
      createdBefore: to,
      pageSize: "500",
      active: "True",
    });

    const invoices = invoicesData.data || [];

    // Calculate totals
    let totalRevenue = 0;
    let invoiceCount = 0;

    for (const inv of invoices) {
      totalRevenue += inv.total || 0;
      invoiceCount++;
    }

    // Fetch jobs by business unit to get trade breakdown
    const jobsData = await stFetch(`/jpm/v2/tenant/${tenantId}/jobs`, {
      createdOnOrAfter: from,
      createdBefore: to,
      jobStatus: "Completed",
      pageSize: "500",
    });

    const jobs = jobsData.data || [];

    // Group by business unit name (trade)
    const byTrade: Record<string, { jobs: number; revenue: number }> = {};
    for (const job of jobs) {
      const bu = job.businessUnit?.name || "Other";
      const tradeName = bu.toLowerCase().includes("electrical")
        ? "Electrical"
        : bu.toLowerCase().includes("hvac") || bu.toLowerCase().includes("air")
        ? "AC/HVAC"
        : bu.toLowerCase().includes("solar")
        ? "Solar"
        : bu.toLowerCase().includes("plumb")
        ? "Plumbing"
        : "Other";

      if (!byTrade[tradeName]) byTrade[tradeName] = { jobs: 0, revenue: 0 };
      byTrade[tradeName].jobs++;
      byTrade[tradeName].revenue += job.total || 0;
    }

    return NextResponse.json({
      ok: true,
      month: new Date().toLocaleString("en-AU", { month: "long", year: "numeric" }),
      totalRevenue,
      invoiceCount,
      jobCount: jobs.length,
      byTrade,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/revenue]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
