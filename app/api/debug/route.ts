import { NextRequest, NextResponse } from "next/server";
import { getSTToken } from "@/app/lib/st-auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const token = await getSTToken();
  const tenantId = process.env.ST_TENANT_ID!;
  const appKey = process.env.ST_APP_KEY!;
  const headers = { Authorization: `Bearer ${token}`, "ST-App-Key": appKey };

  // Check invoices for tech data
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const invUrl = new URL(`https://api.servicetitan.io/accounting/v2/tenant/${tenantId}/invoices`);
  invUrl.searchParams.set("pageSize", "1");
  invUrl.searchParams.set("createdOnOrAfter", from);
  const invRes = await fetch(invUrl.toString(), { headers, cache: "no-store" });
  const invData = await invRes.json();
  const inv = (invData.data || [])[0] || {};

  // Try v2 employees
  const empUrl = new URL(`https://api.servicetitan.io/hrm/v2/tenant/${tenantId}/employees`);
  empUrl.searchParams.set("pageSize", "2");
  const empRes = await fetch(empUrl.toString(), { headers, cache: "no-store" });
  const empData = empRes.ok ? await empRes.json() : { status: empRes.status, err: await empRes.text() };

  return NextResponse.json({
    invoice: {
      keys: Object.keys(inv),
      techFields: {
        technicianId: inv.technicianId,
        technician: inv.technician,
        installedById: inv.installedById,
        soldById: inv.soldById,
        createdById: inv.createdById,
        employeeInfo: inv.employeeInfo,
        items: (inv.items || []).slice(0,1),
      }
    },
    employees: {
      status: empRes.status,
      data: empData.data?.slice(0,1) || empData.err?.slice(0,200),
    }
  });
}
