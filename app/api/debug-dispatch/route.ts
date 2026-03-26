import { NextRequest, NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const tenantId = process.env.ST_TENANT_ID!;
  const appKey = process.env.ST_APP_KEY!;
  const token = await getSTToken();
  const headers = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey };

  // Test: can we query assignments by date range?
  const tests: Record<string, unknown> = {};
  
  // Test 1: by modifiedOnOrAfter
  const url1 = new URL(`https://api.servicetitan.io/dispatch/v2/tenant/${tenantId}/appointment-assignments`);
  url1.searchParams.set("modifiedOnOrAfter", "2026-03-01T00:00:00Z");
  url1.searchParams.set("modifiedBefore", "2026-03-02T00:00:00Z");
  url1.searchParams.set("pageSize", "5");
  const r1 = await fetch(url1.toString(), { headers, cache: "no-store" });
  tests.byModifiedDate = { status: r1.status, data: r1.ok ? (await r1.json()) : await r1.text() };

  // Test 2: by assignedOnOrAfter
  const url2 = new URL(`https://api.servicetitan.io/dispatch/v2/tenant/${tenantId}/appointment-assignments`);
  url2.searchParams.set("assignedOnOrAfter", "2026-03-01T00:00:00Z");
  url2.searchParams.set("pageSize", "5");
  const r2 = await fetch(url2.toString(), { headers, cache: "no-store" });
  tests.byAssignedDate = { status: r2.status, sample: r2.ok ? ((await r2.json()).data?.slice(0,2)) : await r2.text() };

  // Test 3: plain list with pageSize
  const url3 = new URL(`https://api.servicetitan.io/dispatch/v2/tenant/${tenantId}/appointment-assignments`);
  url3.searchParams.set("pageSize", "3");
  const r3 = await fetch(url3.toString(), { headers, cache: "no-store" });
  const d3 = r3.ok ? await r3.json() : {};
  tests.plainList = { status: r3.status, hasMore: d3.hasMore, total: d3.totalCount, sample: d3.data?.slice(0,1) };

  return NextResponse.json(tests);
}
