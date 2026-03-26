import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const CSR_BONUS_THRESHOLD = 0.90; // 90% booking rate
const CSR_BONUS_AMOUNT = 200;      // $200/month bonus

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const tenantId = process.env.ST_TENANT_ID!;

    // Fetch calls from ST
    const calls = await stFetchAll(`/crm/v2/tenant/${tenantId}/booking-provider/bookings`, {
      createdOnOrAfter: range.from,
      createdBefore: range.to,
      pageSize: "500",
    }) as Record<string, unknown>[];

    // Aggregate per CSR (agent/employee)
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
      const agentName = (call.agent as string) || (call.createdBy as string) || "Unknown";
      if (!csrMap[agentName]) {
        csrMap[agentName] = { name: agentName, inboundCalls: 0, outboundCalls: 0, booked: 0, unbooked: 0, excused: 0, abandoned: 0, notLead: 0 };
      }

      const isOutbound = (call.callType as string || "").toLowerCase() === "outbound"
        || (call.direction as string || "").toLowerCase() === "outbound";
      if (isOutbound) {
        csrMap[agentName].outboundCalls++;
      } else {
        csrMap[agentName].inboundCalls++;
      }

      const outcome = (call.outcome as string || call.status as string || "").toLowerCase();
      if (outcome.includes("book") || outcome === "booked") csrMap[agentName].booked++;
      else if (outcome.includes("excus")) csrMap[agentName].excused++;
      else if (outcome.includes("abandon")) csrMap[agentName].abandoned++;
      else if (outcome.includes("not") && outcome.includes("lead")) csrMap[agentName].notLead++;
      else csrMap[agentName].unbooked++;
    }

    const csrResults = Object.values(csrMap).map(csr => {
      const totalCallable = csr.inboundCalls - csr.excused - csr.abandoned - csr.notLead;
      const bookingRate = totalCallable > 0 ? (csr.booked / totalCallable) * 100 : 0;
      const meetsBonus = bookingRate >= CSR_BONUS_THRESHOLD * 100;

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
        bonusThreshold: CSR_BONUS_THRESHOLD * 100,
        commissionStatus: meetsBonus ? "earned" : "pending",
        bonusAmount: meetsBonus ? CSR_BONUS_AMOUNT : 0,
        rateToThreshold: Math.round((CSR_BONUS_THRESHOLD * 100 - bookingRate) * 10) / 10,
      };
    }).sort((a, b) => b.bookingRate - a.bookingRate);

    const totalBonus = csrResults.reduce((s, c) => s + c.bonusAmount, 0);

    // If no data returned from ST, return the error clearly
    if (csrResults.length === 0) {
      return NextResponse.json({
        ok: true,
        period: range.label,
        csrs: [],
        totalBonus: 0,
        noData: true,
        message: "No CSR booking data found in ServiceTitan for this period",
        updatedAt: new Date().toISOString(),
        source: "ServiceTitan",
      });
    }

    return NextResponse.json({
      ok: true,
      period: range.label,
      csrs: csrResults,
      totalBonus,
      bonusThreshold: CSR_BONUS_THRESHOLD * 100,
      bonusAmount: CSR_BONUS_AMOUNT,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/csrs]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
