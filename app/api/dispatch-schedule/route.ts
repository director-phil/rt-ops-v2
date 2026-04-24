import { NextRequest, NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";
import { stFetchAll } from "@/app/lib/st-fetch-all";

export const dynamic = "force-dynamic";

// Brisbane = UTC+10, no DST
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000;

function getLocalDayRange(dateParam?: string | null): {
  from: Date; to: Date; label: string; localDate: string;
} {
  let year: number, month: number, day: number;

  if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    [year, month, day] = dateParam.split("-").map(Number);
    month -= 1;
  } else if (dateParam === "tomorrow") {
    const local = new Date(Date.now() + AEST_OFFSET_MS);
    local.setUTCDate(local.getUTCDate() + 1);
    year = local.getUTCFullYear(); month = local.getUTCMonth(); day = local.getUTCDate();
  } else {
    const local = new Date(Date.now() + AEST_OFFSET_MS);
    year = local.getUTCFullYear(); month = local.getUTCMonth(); day = local.getUTCDate();
  }

  // Local midnight → UTC
  const from = new Date(Date.UTC(year, month, day) - AEST_OFFSET_MS);
  const to   = new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1000);
  const localDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const label = new Date(from.getTime() + AEST_OFFSET_MS)
    .toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return { from, to, label, localDate };
}

function toLocalTime(utcStr: string): string {
  const d = new Date(utcStr);
  const local = new Date(d.getTime() + AEST_OFFSET_MS);
  return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
}

function normalizeTrade(buName: string): string {
  const n = (buName || "").toLowerCase();
  if (n.includes("electrical")) return "electrical";
  if (n.includes("hvac") || n.includes("air") || n.includes("ac")) return "hvac";
  if (n.includes("solar") || n.includes("battery")) return "solar";
  if (n.includes("plumb")) return "plumbing";
  return "other";
}

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

async function getDriveMinutes(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  departureTime: Date
): Promise<number | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;
  if (!fromLat || !fromLng || !toLat || !toLng) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", `${fromLat},${fromLng}`);
  url.searchParams.set("destinations", `${toLat},${toLng}`);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("region", "au");
  url.searchParams.set("key", apiKey);

  // departure_time must be now or future for traffic data
  const deptSec = Math.floor(departureTime.getTime() / 1000);
  const nowSec  = Math.floor(Date.now() / 1000);
  if (deptSec > nowSec) {
    url.searchParams.set("departure_time", String(deptSec));
    url.searchParams.set("traffic_model", "best_guess");
  }

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    const el = d.rows?.[0]?.elements?.[0];
    if (el?.status !== "OK") return null;
    const secs = el.duration_in_traffic?.value ?? el.duration?.value;
    return secs ? Math.round(secs / 60) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const { from, to, label, localDate } = getLocalDayRange(dateParam);

  try {
    const tenantId = process.env.SERVICETITAN_TENANT_ID!;
    const appKey   = process.env.SERVICETITAN_APP_KEY!;
    const token    = await getSTToken();
    const headers  = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey } as HeadersInit;

    // 1. Appointments for the day
    const appointments = await stFetchAll(
      `/jpm/v2/tenant/${tenantId}/appointments`,
      { startsOnOrAfter: from.toISOString(), startsBefore: to.toISOString(), pageSize: "500" }
    ) as Record<string, unknown>[];

    if (appointments.length === 0) {
      return NextResponse.json({ ok: true, date: localDate, label, companySummary: null, techSchedules: [], updatedAt: new Date().toISOString() });
    }

    const jobIds = [...new Set(
      appointments.map(a => String(a.jobId)).filter(id => id && id !== "0")
    )];

    // 2. Tech assignments (7-day lookback to catch advance-scheduled jobs)
    const lookback = new Date(from.getTime() - 7 * 24 * 60 * 60 * 1000);
    const assignments = await stFetchAll(
      `/dispatch/v2/tenant/${tenantId}/appointment-assignments`,
      { modifiedOnOrAfter: lookback.toISOString(), modifiedBefore: to.toISOString(), pageSize: "500" }
    ) as Record<string, unknown>[];

    const jobToTech: Record<string, string> = {};
    const jobIdSet = new Set(jobIds);
    for (const a of assignments) {
      if (a.status === "Dismissed") continue;
      const jid = String(a.jobId);
      if (!jobIdSet.has(jid)) continue;
      const name = ((a.technicianName as string) || "").trim();
      if (name) jobToTech[jid] = name;
    }

    // 3. Job details
    const jobs = await stFetchAll(
      `/jpm/v2/tenant/${tenantId}/jobs`,
      { ids: jobIds.join(","), pageSize: "500" }
    ) as Record<string, unknown>[];

    const jobMap: Record<string, Record<string, unknown>> = {};
    for (const j of jobs) jobMap[String(j.id)] = j;

    // 4. Business unit names
    const buData = await stFetchAll(`/jpm/v2/tenant/${tenantId}/business-units`, { pageSize: "200" }) as Record<string, unknown>[];
    const buMap: Record<number, string> = {};
    for (const bu of buData) buMap[Number(bu.id)] = String(bu.name || "");

    // 5. Location details (address + lat/lng) — parallel fetch in batches of 20
    const locationIds = [...new Set(
      jobs.map(j => Number(j.locationId)).filter(id => id > 0)
    )];

    type LocationData = { id: number; name: string; address: { street: string; city: string; state: string; zip: string; latitude: number; longitude: number } };
    const locationMap: Record<number, LocationData> = {};

    const BATCH = 20;
    for (let i = 0; i < locationIds.length; i += BATCH) {
      const batch = locationIds.slice(i, i + BATCH);
      const results = await Promise.all(
        batch.map(id =>
          fetch(`https://api.servicetitan.io/crm/v2/tenant/${tenantId}/locations/${id}`, { headers, cache: "no-store" })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      for (let j = 0; j < batch.length; j++) {
        if (results[j]?.address) locationMap[batch[j]] = results[j];
      }
    }

    // 6. Group and sort appointments per tech
    type EnrichedAppt = {
      appt: Record<string, unknown>;
      job: Record<string, unknown>;
      loc: LocationData | null;
    };
    const techAppts: Record<string, EnrichedAppt[]> = {};

    for (const appt of appointments) {
      const jid = String(appt.jobId);
      const job = jobMap[jid];
      if (!job) continue;
      const tech = jobToTech[jid] || "Unassigned";
      const loc = locationMap[Number(job.locationId)] || null;
      if (!techAppts[tech]) techAppts[tech] = [];
      techAppts[tech].push({ appt, job, loc });
    }

    for (const list of Object.values(techAppts)) {
      list.sort((a, b) => new Date(a.appt.start as string).getTime() - new Date(b.appt.start as string).getTime());
    }

    // 7. Compute drive times for all consecutive legs in parallel
    type LegRef = { ti: number; ai: number };
    const legRefs: LegRef[] = [];
    const legPromises: Promise<number | null>[] = [];
    const techKeys = Object.keys(techAppts).filter(t => t !== "Unassigned");

    for (let ti = 0; ti < techKeys.length; ti++) {
      const list = techAppts[techKeys[ti]];
      for (let ai = 1; ai < list.length; ai++) {
        const prev = list[ai - 1];
        const curr = list[ai];
        const pLoc = prev.loc; const cLoc = curr.loc;
        if (pLoc?.address && cLoc?.address) {
          legRefs.push({ ti, ai });
          legPromises.push(getDriveMinutes(
            pLoc.address.latitude, pLoc.address.longitude,
            cLoc.address.latitude, cLoc.address.longitude,
            new Date(prev.appt.end as string)
          ));
        }
      }
    }

    const driveResults = await Promise.all(legPromises);
    const driveMap = new Map<string, number | null>();
    for (let i = 0; i < legRefs.length; i++) {
      driveMap.set(`${legRefs[i].ti}-${legRefs[i].ai}`, driveResults[i]);
    }

    // 8. Build final response
    const techSchedules = techKeys.map((tech, ti) => {
      const list = techAppts[tech];
      let totalDrive = 0, tightBuffers = 0, estRevenue = 0;

      const appts = list.map((item, ai) => {
        const { appt, job, loc } = item;
        const revenue = Math.round(parseNum(job.total));
        estRevenue += revenue;

        const buId = Number(job.businessUnitId) || 0;
        const trade = normalizeTrade(buMap[buId] || "");

        const address = loc?.address
          ? `${loc.address.street}, ${loc.address.city} ${loc.address.state}`
          : "Address unavailable";
        const suburb = loc?.address?.city || "";
        const lat = loc?.address?.latitude ?? 0;
        const lng = loc?.address?.longitude ?? 0;

        const driveFromPrev = ai > 0 ? (driveMap.get(`${ti}-${ai}`) ?? null) : null;
        let bufferFromPrev: number | null = null;
        let tight = false;

        if (ai > 0) {
          const prevEndMs  = new Date(list[ai - 1].appt.end as string).getTime();
          const thisStartMs = new Date(appt.start as string).getTime();
          bufferFromPrev = Math.round((thisStartMs - prevEndMs) / 60000);
          if (driveFromPrev !== null) {
            tight = driveFromPrev > bufferFromPrev;
            totalDrive += driveFromPrev;
          }
          if (tight) tightBuffers++;
        }

        return {
          appointmentId: Number(appt.id),
          jobId: Number(job.id),
          jobNumber: (job.jobNumber as string) || String(job.id),
          start: toLocalTime(appt.start as string),
          end: toLocalTime(appt.end as string),
          arrivalWindow: `${toLocalTime(appt.arrivalWindowStart as string)} – ${toLocalTime(appt.arrivalWindowEnd as string)}`,
          status: appt.status as string,
          address,
          suburb,
          lat,
          lng,
          trade,
          estimatedRevenue: revenue,
          driveMinutesFromPrev: driveFromPrev,
          bufferMinutesFromPrev: bufferFromPrev,
          bufferTight: tight,
        };
      });

      return {
        tech,
        appointments: appts,
        summary: {
          jobCount: list.length,
          estimatedRevenue: estRevenue,
          totalDriveMinutes: totalDrive,
          tightBufferCount: tightBuffers,
        },
      };
    });

    techSchedules.sort((a, b) => b.summary.jobCount - a.summary.jobCount);

    const companySummary = {
      totalJobs:        techSchedules.reduce((s, t) => s + t.summary.jobCount, 0),
      totalEstRevenue:  techSchedules.reduce((s, t) => s + t.summary.estimatedRevenue, 0),
      techsWorking:     techSchedules.length,
      avgDriveMinutes:  techSchedules.length
        ? Math.round(techSchedules.reduce((s, t) => s + t.summary.totalDriveMinutes, 0) / techSchedules.length)
        : 0,
      totalTightBuffers: techSchedules.reduce((s, t) => s + t.summary.tightBufferCount, 0),
    };

    return NextResponse.json({
      ok: true,
      date: localDate,
      label,
      companySummary,
      techSchedules,
      updatedAt: new Date().toISOString(),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
