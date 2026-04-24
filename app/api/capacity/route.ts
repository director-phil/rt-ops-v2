import { NextRequest, NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

const TENANT_ID = process.env.SERVICETITAN_TENANT_ID!;
const APP_KEY = process.env.SERVICETITAN_APP_KEY!;

async function stGet(path: string, params: Record<string, string> = {}): Promise<Record<string, unknown>> {
  const token = await getSTToken();
  const url = new URL(`https://api.servicetitan.io${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, "ST-App-Key": APP_KEY },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ST API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function fetchAllPages(path: string, params: Record<string, string> = {}): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let page = 1;
  let hasMore = true;
  while (hasMore && page <= 20) {
    const data = await stGet(path, { ...params, page: String(page), pageSize: "200" });
    const items = (data.data as Record<string, unknown>[]) || [];
    all.push(...items);
    hasMore = data.hasMore === true || items.length >= 200;
    page++;
  }
  return all;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date") || "this-week";

  const now = new Date();
  // Use AEST offset (+10)
  const aestOffset = 10 * 60;
  const localNow = new Date(now.getTime() + aestOffset * 60000);

  let todayStr: string;
  let endStr: string;

  if (dateParam === "today") {
    const y = localNow.getUTCFullYear();
    const m = String(localNow.getUTCMonth() + 1).padStart(2, "0");
    const d = String(localNow.getUTCDate()).padStart(2, "0");
    todayStr = `${y}-${m}-${d}`;
    endStr = todayStr;
  } else {
    // This week Mon–Sun in local time
    const dayOfWeek = localNow.getUTCDay(); // 0=Sun
    const daysToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(localNow.getTime() + daysToMon * 86400000);
    const sunday = new Date(monday.getTime() + 6 * 86400000);
    const fmt = (d: Date) => {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    todayStr = fmt(monday);
    endStr = fmt(sunday);
  }

  const fromISO = `${todayStr}T00:00:00Z`;
  const toISO = `${endStr}T23:59:59Z`;

  try {
    // Fetch appointments for the window
    const appointments = await fetchAllPages(`/jpm/v2/tenant/${TENANT_ID}/appointments`, {
      startsOnOrAfter: fromISO,
      startsOnOrBefore: toISO,
    });

    // Collect unique job IDs
    const jobIdSet = new Set<string>();
    for (const appt of appointments) {
      const jid = appt.jobId as number | string;
      if (jid) jobIdSet.add(String(jid));
    }

    // Batch-fetch jobs (up to 200 at a time via ids param)
    const jobMap = new Map<string, Record<string, unknown>>();
    const jobIds = Array.from(jobIdSet);
    for (let i = 0; i < jobIds.length; i += 50) {
      const batch = jobIds.slice(i, i + 50);
      try {
        const jobs = await fetchAllPages(`/jpm/v2/tenant/${TENANT_ID}/jobs`, {
          ids: batch.join(","),
          pageSize: "50",
        });
        for (const job of jobs) {
          jobMap.set(String(job.id), job);
        }
      } catch {
        // Continue with what we have
      }
    }

    // Group appointments by technician
    type TechEntry = {
      name: string;
      jobs: {
        id: string;
        jobNumber: string;
        time: string;
        suburb: string;
        type: string;
        status: string;
        value: number;
        customerName: string;
        durationHours: number;
      }[];
      totalValue: number;
      scheduledHours: number;
    };

    const techSchedule: Record<string, TechEntry> = {};

    for (const appt of appointments) {
      // Get assigned techs from appointment
      const techAssignments = (appt.technicianAssignments as Record<string, unknown>[]) || [];
      const status = (appt.status as string) || "Scheduled";

      // Parse start time
      const startStr = (appt.start as string) || (appt.scheduledDate as string) || "";
      const timeStr = startStr
        ? new Date(startStr).toLocaleTimeString("en-AU", {
            hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Australia/Sydney",
          })
        : "—";

      // Duration in hours
      const durationMins = (appt.duration as number) || 0;
      const durationHours = durationMins > 0 ? durationMins / 60 : 2;

      // Get job data
      const jobId = String(appt.jobId || "");
      const job = jobMap.get(jobId) || {};
      const jobNumber = (job.jobNumber as string) || (job.number as string) || "";
      const jobType = (job.type as string) || (job.jobTypeName as string) || (job.jobType as string) || "Service";
      const jobValue = (job.total as number) || (job.estimatedPayrollCost as number) || 0;
      const jobStatus = status || (job.jobStatus as string) || (job.status as string) || "Scheduled";

      // Location/suburb
      const loc = (job.location as Record<string, unknown>) || {};
      const suburb = (loc.city as string) || (loc.suburb as string) || (loc.zip as string) || "";

      // Customer name
      const customer = (job.customer as Record<string, unknown>) || {};
      const customerName = (customer.name as string) || "";

      const techNames: string[] = [];
      for (const ta of techAssignments) {
        const tName = ((ta.technician as Record<string, unknown>)?.name as string) ||
                      (ta.technicianName as string) || "";
        if (tName) techNames.push(tName);
      }
      if (techNames.length === 0) techNames.push("Unassigned");

      for (const techName of techNames) {
        if (!techSchedule[techName]) {
          techSchedule[techName] = { name: techName, jobs: [], totalValue: 0, scheduledHours: 0 };
        }
        techSchedule[techName].jobs.push({
          id: String(appt.id),
          jobNumber,
          time: timeStr,
          suburb,
          type: jobType,
          status: jobStatus,
          value: jobValue,
          customerName,
          durationHours,
        });
        techSchedule[techName].totalValue += jobValue;
        techSchedule[techName].scheduledHours += durationHours;
      }
    }

    const techs = Object.values(techSchedule).sort((a, b) => b.totalValue - a.totalValue);

    // Build summary rows for today
    const todayStart = new Date(`${todayStr}T00:00:00+10:00`).toISOString();
    const todayEnd = new Date(`${todayStr}T23:59:59+10:00`).toISOString();

    return NextResponse.json({
      ok: true,
      period: dateParam === "today" ? "Today" : "This Week",
      fromDate: fromISO,
      toDate: toISO,
      techCount: techs.length,
      totalJobs: appointments.length,
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
