import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date") || "this-week";

  const now = new Date();
  let from: Date, to: Date;

  if (dateParam === "today") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else {
    // This week Mon-Sun
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    from = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
    to = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
  }

  try {
    const tenantId = process.env.ST_TENANT_ID!;

    const jobs = await stFetchAll(`/jpm/v2/tenant/${tenantId}/jobs`, {
      scheduledOnOrAfter: from.toISOString(),
      scheduledBefore: to.toISOString(),
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Group by tech
    const techSchedule: Record<string, {
      name: string;
      jobs: { id: string; time: string; suburb: string; type: string; status: string; value: number }[];
      totalValue: number;
      scheduledHours: number;
    }> = {};

    for (const job of jobs) {
      const assignments = (job.assignments as Record<string, unknown>[]) || [];
      const techName = assignments.length > 0
        ? ((assignments[0].technician as Record<string, unknown>)?.name as string) || "Unassigned"
        : "Unassigned";

      if (!techSchedule[techName]) {
        techSchedule[techName] = { name: techName, jobs: [], totalValue: 0, scheduledHours: 0 };
      }

      const scheduled = job.scheduledDate as string;
      const timeStr = scheduled
        ? new Date(scheduled).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Australia/Sydney" })
        : "--";

      techSchedule[techName].jobs.push({
        id: String(job.id),
        time: timeStr,
        suburb: ((job.location as Record<string, unknown>)?.city as string) || "",
        type: (job.type as string) || (job.jobTypeName as string) || "Service",
        status: (job.jobStatus as string) || (job.status as string) || "Scheduled",
        value: (job.total as number) || 0,
      });
      techSchedule[techName].totalValue += (job.total as number) || 0;
      techSchedule[techName].scheduledHours += (job.duration as number) || 2;
    }

    const techs = Object.values(techSchedule).sort((a, b) => b.totalValue - a.totalValue);

    return NextResponse.json({
      ok: true,
      period: dateParam === "today" ? "Today" : "This Week",
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
      techCount: techs.length,
      totalJobs: jobs.length,
      techs,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/capacity]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
