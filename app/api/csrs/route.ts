import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const CSR_BOOKING_RATE_THRESHOLD = 90;
const CSR_BONUS_AMOUNT = 200;

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const tenantId = process.env.SERVICETITAN_TENANT_ID!;

    // Try multiple ST endpoints for CSR call data
    let calls: Record<string, unknown>[] = [];
    let source = "ServiceTitan";

    // Try CRM calls endpoint
    try {
      const results = await stFetchAll(`/crm/v2/tenant/${tenantId}/calls`, {
        createdOnOrAfter: range.from,
        createdBefore: range.to,
        pageSize: "500",
      });
      calls = results as Record<string, unknown>[];
      source = "ServiceTitan CRM";
    } catch {
      // Try booking-providers endpoint
      try {
        const results = await stFetchAll(`/crm/v2/tenant/${tenantId}/booking-provider/bookings`, {
          createdOnOrAfter: range.from,
          createdBefore: range.to,
          pageSize: "500",
        });
        calls = results as Record<string, unknown>[];
        source = "ServiceTitan Bookings";
      } catch {
        // CSR data not available
      }
    }

    if (calls.length === 0) {
      return NextResponse.json({
        ok: true,
        period: range.label,
        csrs: [],
        totalBonus: 0,
        noData: true,
        message: "CSR call data endpoint not accessible in ServiceTitan for this account. Please contact support.",
        updatedAt: new Date().toISOString(),
        source,
      });
    }

    // Aggregate per CSR
    const csrMap: Record<string, {
      name: string;
      inboundCalls: number;
      outboundCalls: number;
      booked: number;
      unbooked: number;
      excused: number;
      abandoned: number;
      notLead: number;
    }> = {};

    for (const call of calls) {
      const agentName = (call.agent as string)
        || (call.createdBy as string)
        || (call.answeredBy as string)
        || (call.receivedBy as string)
        || "Unknown";

      if (!csrMap[agentName]) {
        csrMap[agentName] = { name: agentName, inboundCalls: 0, outboundCalls: 0, booked: 0, unbooked: 0, excused: 0, abandoned: 0, notLead: 0 };
      }

      const direction = (call.direction as string || call.callType as string || "").toLowerCase();
      if (direction.includes("out")) {
        csrMap[agentName].outboundCalls++;
      } else {
        csrMap[agentName].inboundCalls++;
      }

      const outcome = (call.outcome as string || call.status as string || call.bookingStatus as string || "").toLowerCase();
      if (outcome.includes("book") || outcome === "booked" || outcome === "scheduled") csrMap[agentName].booked++;
      else if (outcome.includes("excus")) csrMap[agentName].excused++;
      else if (outcome.includes("abandon") || outcome.includes("miss")) csrMap[agentName].abandoned++;
      else if (outcome.includes("not") || outcome === "notlead") csrMap[agentName].notLead++;
      else csrMap[agentName].unbooked++;
    }

    const csrResults = Object.values(csrMap).map(csr => {
      const callable = csr.inboundCalls - csr.excused - csr.abandoned - csr.notLead;
      const bookingRate = callable > 0 ? (csr.booked / callable) * 100 : 0;
      const meetsBonus = bookingRate >= CSR_BOOKING_RATE_THRESHOLD;

      return {
        name: csr.name,
        inboundCalls: csr.inboundCalls,
        outboundCalls: csr.outboundCalls,
        totalCalls: csr.inboundCalls + csr.outboundCalls,
        booked: csr.booked,
        unbooked: csr.unbooked,
        excused: csr.excused,
        abandoned: csr.abandoned,
        notLead: csr.notLead,
        bookingRate: Math.round(bookingRate * 10) / 10,
        bonusThreshold: CSR_BOOKING_RATE_THRESHOLD,
        commissionStatus: meetsBonus ? "earned" : "pending",
        bonusAmount: meetsBonus ? CSR_BONUS_AMOUNT : 0,
        rateToThreshold: Math.max(0, Math.round((CSR_BOOKING_RATE_THRESHOLD - bookingRate) * 10) / 10),
      };
    }).sort((a, b) => b.bookingRate - a.bookingRate);

    const totalBonus = csrResults.reduce((s, c) => s + c.bonusAmount, 0);

    return NextResponse.json({
      ok: true,
      period: range.label,
      csrs: csrResults,
      totalBonus,
      bonusThreshold: CSR_BOOKING_RATE_THRESHOLD,
      bonusAmount: CSR_BONUS_AMOUNT,
      updatedAt: new Date().toISOString(),
      source,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
