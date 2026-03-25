import { NextResponse } from "next/server";
import { stFetch } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

export async function GET() {
  try {
    const tenantId = process.env.ST_TENANT_ID!;
    const { from, to } = getTodayRange();

    // Fetch today's jobs from dispatch
    const jobsData = await stFetch(`/jpm/v2/tenant/${tenantId}/jobs`, {
      scheduledOnOrAfter: from,
      scheduledBefore: to,
      pageSize: "500",
    });

    const jobs = jobsData.data || [];

    // Normalise each job for the dispatch board
    const normalised = jobs.map((job: Record<string, unknown>) => {
      const bu = ((job.businessUnit as Record<string, unknown>)?.name as string) || "";
      const trade = bu.toLowerCase().includes("electrical")
        ? "electrical"
        : bu.toLowerCase().includes("hvac") || bu.toLowerCase().includes("air")
        ? "hvac"
        : bu.toLowerCase().includes("solar")
        ? "solar"
        : bu.toLowerCase().includes("plumb")
        ? "plumbing"
        : "other";

      const assignments = (job.assignments as Record<string, unknown>[]) || [];
      const tech = assignments[0]
        ? (assignments[0].technician as Record<string, unknown>)?.name || "Unassigned"
        : "Unassigned";

      const scheduled = job.scheduledDate as string | undefined;
      const timeStr = scheduled
        ? new Date(scheduled).toLocaleTimeString("en-AU", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Australia/Sydney",
          })
        : "--";

      return {
        id: job.id,
        time: timeStr,
        customer: (job.customer as Record<string, unknown>)?.name || "Customer",
        suburb: (job.location as Record<string, unknown>)?.city || "",
        trade,
        type: job.type || job.jobTypeName || "",
        tech,
        status: job.jobStatus || job.status || "Scheduled",
        total: job.total || 0,
      };
    });

    // Sort by time
    normalised.sort((a: { time: string }, b: { time: string }) => a.time.localeCompare(b.time));

    const unassigned = normalised.filter((j: { tech: string }) => j.tech === "Unassigned");
    const assigned = normalised.filter((j: { tech: string }) => j.tech !== "Unassigned");

    return NextResponse.json({
      ok: true,
      date: new Date().toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Australia/Sydney",
      }),
      totalJobs: normalised.length,
      assignedJobs: assigned.length,
      unassignedJobs: unassigned.length,
      jobs: normalised,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/jobs]", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
