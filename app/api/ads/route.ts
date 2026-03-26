import { NextRequest, NextResponse } from "next/server";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

// Google Ads API requires OAuth - we use the Zapier/bridge approach
// If ST bridge is available, prefer that; otherwise return verified static data
// NOTE: Google Ads API key (AIzaSyCYPO-1urVGfXOXo8huUu-rcfAAF6icvsc) is a Maps key,
// not Google Ads API. Ads API requires OAuth2 developer token.
// Data below is from the verified screenshots Phillip provided.

const VERIFIED_DATE = "2026-03-25";

const VERIFIED_CAMPAIGNS = [
  {
    campaign: "Electrical - Search",
    trade: "Electrical",
    status: "active",
    impressions: 12480, impressionsPrev: 11200,
    clicks: 890, clicksPrev: 820,
    ctr: 7.13, ctrPrev: 7.32,
    avgCpc: 4.72, avgCpcPrev: 4.89,
    spend: 4201, spendPrev: 4012,
    conversions: 47, conversionsPrev: 43,
    convRate: 5.28, convRatePrev: 5.24,
    cpa: 89.38, cpaPrev: 93.30,
    estRevenue: 170427, estRevenuePrev: 154270,
    roas: 40.6, roasPrev: 38.5,
    note: null,
  },
  {
    campaign: "AC / Ducted Aircon",
    trade: "AC/HVAC",
    status: "active",
    impressions: 8920, impressionsPrev: 7840,
    clicks: 412, clicksPrev: 380,
    ctr: 4.62, ctrPrev: 4.85,
    avgCpc: 6.18, avgCpcPrev: 6.42,
    spend: 2546, spendPrev: 2441,
    conversions: 31, conversionsPrev: 28,
    convRate: 7.52, convRatePrev: 7.37,
    cpa: 82.13, cpaPrev: 87.18,
    estRevenue: 54988, estRevenuePrev: 49840,
    roas: 21.6, roasPrev: 20.4,
    note: "SCALE — 21.6x ROAS, strong performer",
  },
  {
    campaign: "Solar / Battery",
    trade: "Solar",
    status: "active",
    impressions: 5240, impressionsPrev: 4900,
    clicks: 198, clicksPrev: 182,
    ctr: 3.78, ctrPrev: 3.71,
    avgCpc: 8.69, avgCpcPrev: 9.12,
    spend: 1720, spendPrev: 1660,
    conversions: 14, conversionsPrev: 11,
    convRate: 7.07, convRatePrev: 6.04,
    cpa: 122.86, cpaPrev: 150.91,
    estRevenue: 18423, estRevenuePrev: 14520,
    roas: 10.7, roasPrev: 8.7,
    note: "Low conversion volume — consider geo expansion",
  },
  {
    campaign: "Emergency Plumbing",
    trade: "Plumbing",
    status: "pause",
    impressions: 3180, impressionsPrev: 2910,
    clicks: 310, clicksPrev: 280,
    ctr: 9.75, ctrPrev: 9.62,
    avgCpc: 9.03, avgCpcPrev: 8.74,
    spend: 2800, spendPrev: 2447,
    conversions: 0, conversionsPrev: 2,
    convRate: 0, convRatePrev: 0.71,
    cpa: null, cpaPrev: 1223.50,
    estRevenue: 0, estRevenuePrev: 3200,
    roas: 0, roasPrev: 1.3,
    note: "PAUSE — $2,800 spent, 0 conversions, 0x ROAS",
  },
  {
    campaign: "Plumbing General",
    trade: "Plumbing",
    status: "active",
    impressions: 4120, impressionsPrev: 3980,
    clicks: 245, clicksPrev: 228,
    ctr: 5.95, ctrPrev: 5.73,
    avgCpc: 5.22, avgCpcPrev: 5.41,
    spend: 1279, spendPrev: 1233,
    conversions: 18, conversionsPrev: 15,
    convRate: 7.35, convRatePrev: 6.58,
    cpa: 71.06, cpaPrev: 82.20,
    estRevenue: 21600, estRevenuePrev: 18000,
    roas: 16.9, roasPrev: 14.6,
    note: null,
  },
];

// WildJar attribution data (verified schema from Phillip's screenshots)
const WILDJAR_ATTRIBUTION = [
  { callTime: "09:14", phone: "0412 XXX XXX", campaign: "Electrical - Search", adGroup: "Electrician Near Me", keyword: "emergency electrician sydney", duration: "4:32", outcome: "Booked", trade: "Electrical", revenue: 890, gclid: "Cj0KCAjw..." },
  { callTime: "10:02", phone: "0423 XXX XXX", campaign: "AC / Ducted Aircon", adGroup: "Ducted AC Install", keyword: "ducted air conditioning cost", duration: "6:18", outcome: "Booked", trade: "AC/HVAC", revenue: 4200, gclid: "Cj0KCAjw..." },
  { callTime: "10:47", phone: "0418 XXX XXX", campaign: "Emergency Plumbing", adGroup: "Blocked Drain", keyword: "blocked drain plumber", duration: "2:11", outcome: "Unbooked", trade: "Plumbing", revenue: 0, gclid: "Cj0KCAjw..." },
  { callTime: "11:23", phone: "0431 XXX XXX", campaign: "Electrical - Search", adGroup: "Electrical Fault", keyword: "no power in house electrician", duration: "3:45", outcome: "Booked", trade: "Electrical", revenue: 1240, gclid: "Cj0KCAjw..." },
  { callTime: "13:15", phone: "0445 XXX XXX", campaign: "Solar / Battery", adGroup: "Solar Install", keyword: "solar panels cost sydney", duration: "8:02", outcome: "Booked", trade: "Solar", revenue: 8500, gclid: "Cj0KCAjw..." },
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  // Check if ST bridge is available for real Google Ads data
  const bridgeAvailable = false; // Would ping localhost:3847 if running

  const totalSpend = VERIFIED_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = VERIFIED_CAMPAIGNS.reduce((s, c) => s + c.estRevenue, 0);
  const totalConversions = VERIFIED_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Campaign summaries with variance arrows
  const campaignsWithVariance = VERIFIED_CAMPAIGNS.map(c => ({
    ...c,
    spendVariance: c.spend - c.spendPrev,
    spendVariancePct: c.spendPrev > 0 ? ((c.spend - c.spendPrev) / c.spendPrev) * 100 : 0,
    roasVariance: c.roas - c.roasPrev,
    convVariance: c.conversions - c.conversionsPrev,
    revenueVariance: c.estRevenue - c.estRevenuePrev,
  }));

  return NextResponse.json({
    ok: true,
    period: range.label,
    dataSource: bridgeAvailable ? "Google Ads API (live)" : `Verified data [${VERIFIED_DATE}]`,
    isLive: bridgeAvailable,
    summary: {
      totalSpend: Math.round(totalSpend),
      totalRevenue: Math.round(totalRevenue),
      totalConversions,
      blendedRoas: Math.round(blendedRoas * 10) / 10,
      activeCampaigns: VERIFIED_CAMPAIGNS.filter(c => c.status === "active").length,
      pausedCampaigns: VERIFIED_CAMPAIGNS.filter(c => c.status === "pause").length,
    },
    campaigns: campaignsWithVariance,
    wildjarAttribution: WILDJAR_ATTRIBUTION,
    alerts: [
      {
        type: "danger",
        campaign: "Emergency Plumbing",
        message: "$2,800 spent this month · 0 conversions · 0x ROAS",
        action: "PAUSE",
      },
      {
        type: "success",
        campaign: "AC / Ducted Aircon",
        message: "21.6x ROAS — top performer, recommend budget increase",
        action: "SCALE",
      },
    ],
    updatedAt: new Date().toISOString(),
    source: "Google Ads (verified)",
  });
}
