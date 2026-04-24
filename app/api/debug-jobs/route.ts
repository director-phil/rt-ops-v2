import { NextRequest, NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const tenantId = process.env.SERVICETITAN_TENANT_ID!;
  const appKey = process.env.SERVICETITAN_APP_KEY!;
  const token = await getSTToken();
  const headers = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey };

  // Get one completed March job
  const jobsUrl = new URL(`https://api.servicetitan.io/jpm/v2/tenant/${tenantId}/jobs`);
  jobsUrl.searchParams.set("pageSize", "2");
  jobsUrl.searchParams.set("jobStatus", "Completed");
  jobsUrl.searchParams.set("completedOnOrAfter", "2026-03-01T00:00:00Z");
  
  const jobsRes = await fetch(jobsUrl.toString(), { headers, cache: "no-store" });
  const jobsData = jobsRes.ok ? await jobsRes.json() : { err: await jobsRes.text() };
  const job = jobsData.data?.[0] || {};
  
  // Try appointments endpoint
  const apptId = job.firstAppointmentId;
  let apptData: Record<string, unknown> = {};
  if (apptId) {
    const apptUrl = `https://api.servicetitan.io/jpm/v2/tenant/${tenantId}/appointments/${apptId}`;
    const apptRes = await fetch(apptUrl, { headers, cache: "no-store" });
    apptData = apptRes.ok ? await apptRes.json() : { status: apptRes.status, err: await apptRes.text() };
  }

  // Try dispatch appointments
  let dispatchData: Record<string, unknown> = {};
  if (apptId) {
    const dispUrl = `https://api.servicetitan.io/dispatch/v2/tenant/${tenantId}/appointment-assignments?jobId=${job.id}`;
    const dispRes = await fetch(dispUrl, { headers, cache: "no-store" });
    dispatchData = dispRes.ok ? await dispRes.json() : { status: dispRes.status };
  }

  return NextResponse.json({
    job: { keys: Object.keys(job), id: job.id, jobNumber: job.jobNumber, firstAppointmentId: job.firstAppointmentId, total: job.total },
    appointment: apptData,
    dispatch: dispatchData,
  });
}
