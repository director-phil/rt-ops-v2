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

    // Fetch active technicians
    const techsData = await stFetch(`/hrm/v2/tenant/${tenantId}/employees`, {
      active: "True",
      pageSize: "200",
    });

    const employees = techsData.data || [];

    // Fetch completed jobs for the month with assigned tech info
    const jobsData = await stFetch(`/jpm/v2/tenant/${tenantId}/jobs`, {
      createdOnOrAfter: from,
      createdBefore: to,
      jobStatus: "Completed",
      pageSize: "500",
    });

    const jobs = jobsData.data || [];

    // Build revenue per tech from job assignments
    const techRevenue: Record<number, { revenue: number; jobs: number; name: string; role: string }> = {};

    for (const job of jobs) {
      const assignments = job.assignments || [];
      for (const assignment of assignments) {
        const techId = assignment.technician?.id;
        const techName = assignment.technician?.name || "Unknown";
        if (!techId) continue;

        if (!techRevenue[techId]) {
          techRevenue[techId] = { revenue: 0, jobs: 0, name: techName, role: "" };
        }
        techRevenue[techId].revenue += job.total || 0;
        techRevenue[techId].jobs++;
      }
    }

    // Enrich with employee data
    for (const emp of employees) {
      if (techRevenue[emp.id]) {
        techRevenue[emp.id].role = emp.jobTitle || emp.role || "";
      }
    }

    // Sort by revenue desc
    const technicians = Object.entries(techRevenue)
      .map(([id, data]) => ({
        id: Number(id),
        name: data.name,
        role: data.role,
        revenueMTD: Math.round(data.revenue),
        jobCount: data.jobs,
        target: 46000,
        pctOfTarget: Math.round((data.revenue / 46000) * 100),
        onTarget: data.revenue >= 46000,
      }))
      .sort((a, b) => b.revenueMTD - a.revenueMTD);

    return NextResponse.json({
      ok: true,
      month: new Date().toLocaleString("en-AU", { month: "long", year: "numeric" }),
      technicians,
      totalTechs: technicians.length,
      onTarget: technicians.filter((t) => t.onTarget).length,
      target: 46000,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/technicians]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
