import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const range = getDateRange(null);
  
  const invoices = await stFetchAll(`/accounting/v2/tenant/${process.env.ST_TENANT_ID!}/invoices`, {
    createdOnOrAfter: range.from,
    createdBefore: range.to,
    active: "True",
    pageSize: "500",
  }) as Record<string, unknown>[];

  const names: Record<string, number> = {};
  for (const inv of invoices) {
    const emp = inv.employeeInfo as Record<string, unknown> | null;
    const name = (emp?.name as string) || "";
    if (name) names[name] = (names[name] || 0) + 1;
  }

  return NextResponse.json({
    total: invoices.length,
    period: range.label,
    names: Object.entries(names).sort((a,b) => b[1]-a[1]).map(([name, count]) => ({ name, count }))
  });
}
