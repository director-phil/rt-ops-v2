import { NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

async function getVzToken(): Promise<string> {
  const res = await fetch("https://fim.api.us.fleetmatics.com/token", {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.VERIZON_CONNECT_USERNAME}:${process.env.VERIZON_CONNECT_PASSWORD}`
      ).toString("base64")}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`VZ token ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.access_token as string;
}

export async function GET() {
  const tenantId = process.env.SERVICETITAN_TENANT_ID!;
  const appKey   = process.env.SERVICETITAN_APP_KEY!;
  const token    = await getSTToken();
  const headers  = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey };

  const today = new Date();
  const from  = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0).toISOString();
  const to    = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();

  // 1. Sample appointments from today
  const apptUrl = new URL(`https://api.servicetitan.io/jpm/v2/tenant/${tenantId}/appointments`);
  apptUrl.searchParams.set("startsOnOrAfter", from);
  apptUrl.searchParams.set("startsBefore", to);
  apptUrl.searchParams.set("pageSize", "3");
  const apptRes  = await fetch(apptUrl.toString(), { headers, cache: "no-store" });
  const apptData = apptRes.ok ? await apptRes.json() : { status: apptRes.status, err: await apptRes.text() };
  const appts = apptData.data || [];
  const sampleAppt = appts[0] || {};

  // 2. Full job for that appointment — need location/address
  let jobData: Record<string, unknown> = {};
  if (sampleAppt.jobId) {
    const jobRes = await fetch(
      `https://api.servicetitan.io/jpm/v2/tenant/${tenantId}/jobs/${sampleAppt.jobId}`,
      { headers, cache: "no-store" }
    );
    jobData = jobRes.ok ? await jobRes.json() : { status: jobRes.status };
  }

  // 3. Verizon FIM — check trips endpoint exists
  const vzResults: Record<string, unknown> = {};
  try {
    const vzToken = await getVzToken();
    const appId = process.env.VERIZON_APP_ID || "fleetmatics-p-us-EBQgoSmLpkRSvZ85rU6ZcejtnNxw8xHoUIfQ7IWC";
    const vzHeaders = {
      Authorization: `Atmosphere atmosphere_app_id=${appId}, Bearer ${vzToken}`,
    };

    // Try known trips-style endpoints
    const endpoints = [
      "https://fim.api.us.fleetmatics.com/rad/v1/vehicles/1/trips",
      "https://fim.api.us.fleetmatics.com/rad/v1/trips",
      "https://fim.api.us.fleetmatics.com/rpt/v1/vehicles/1/trips",
    ];
    for (const url of endpoints) {
      const r = await fetch(`${url}?pageSize=1`, { headers: vzHeaders, cache: "no-store" });
      vzResults[url] = { status: r.status, body: r.ok ? await r.json() : await r.text() };
    }
  } catch (e) {
    vzResults.error = String(e);
  }

  return NextResponse.json({
    appointments: {
      status: apptRes.status,
      total: apptData.totalCount,
      sampleKeys: Object.keys(sampleAppt),
      sample: sampleAppt,
    },
    job: {
      keys: Object.keys(jobData),
      location: (jobData as Record<string, unknown>).location,
      locationId: (jobData as Record<string, unknown>).locationId,
      address: (jobData as Record<string, unknown>).address,
      customFields: (jobData as Record<string, unknown>).customFields,
    },
    verizonTrips: vzResults,
  });
}
