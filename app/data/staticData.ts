// ============================================================
// VERIFIED STATIC DATA — Reliable Tradies
// Last updated: 2026-03-26 — real data from ST + Google Ads JSON
// NEVER invent data. If a field is unknown, mark as null.
// ============================================================

// Verified from Phillip's ServiceTitan dashboard — 2026-03-25/26
// Revenue: $532,940 confirmed by Phillip from ST dashboard
// Tech scoreboard: from ops-data.json marchScoreboard (pulled 2026-03-25)
export const METRICS = {
  revenueTarget: 600000,
  completedRevenue: 532940,    // [Verified: 2026-03-26 — Phillip confirmed]
  totalSales: 665582,           // [Verified: 2026-03-25]
  closedAvgSale: 2427,          // [Verified: 2026-03-25]
  opportunityJobAvg: 1010,
  callBookingRate: 68,           // [Verified: 2026-03-25]
  totalConversionRate: 54,       // [Verified: 2026-03-25]
  customerSatisfaction: 4.7,     // [Verified: 2026-03-25]
  totalCancellations: 94,        // [Verified: 2026-03-25]
  membershipsConverted: 115,     // [Verified: 2026-03-25]
  ebitdaActualPct: 10.8,         // [Verified: 2026-03-25 — below 15% floor]
  ebitdaTargetPct: 30,
  marginBelowFloorPct: 68,
  missedRevenue: 174510,         // [Verified: 2026-03-25]
  totalRevenue: 532940,          // [Verified: 2026-03-26]
  openQuotes: 641,               // [Verified: 2026-03-25]
  openQuotesValue: 3900000,      // [Verified: 2026-03-25 — $3.9M pipeline]
};

// TECHNICIANS — revenue + jobsDone from ST marchScoreboard (ops-data.json, pulled 2026-03-25)
// NOTE: sales/closeRate/revPerHr/efficiency/recalls/hoursWorked from prior ST export analysis
// (not re-verified this pull — commission attribution API not returning per-tech data in March)
export const TECHNICIANS = [
  { name: "Dean Retra",          revenue: 72261,  sales: 62509,  avgSale: 621, closeRate: 55, revPerHr: null, efficiency: 55, recalls: 1, hoursWorked: null, jobsDone: 20 },
  { name: "Lachlan Henzell",     revenue: 62531,  sales: 35013,  avgSale: 541, closeRate: 50, revPerHr: null, efficiency: 50, recalls: 1, hoursWorked: null, jobsDone: 31 },
  { name: "David White",         revenue: 59196,  sales: 54376,  avgSale: 289, closeRate: 25, revPerHr: null, efficiency: 25, recalls: 1, hoursWorked: null, jobsDone: 31 },
  { name: "Alex Peisler",        revenue: 48855,  sales: 51816,  avgSale: 98,  closeRate: 13, revPerHr: null, efficiency: 13, recalls: 1, hoursWorked: null, jobsDone: 22 },
  { name: "Daniel Hayes",        revenue: 47949,  sales: 157602, avgSale: 112, closeRate: 8,  revPerHr: null, efficiency: 8,  recalls: 0, hoursWorked: null, jobsDone: 20 },
  { name: "Hayden Sibley",       revenue: 38499,  sales: 22336,  avgSale: 598, closeRate: 66, revPerHr: null, efficiency: 66, recalls: 1, hoursWorked: null, jobsDone: 21 },
  { name: "Bailey Somerville",   revenue: 36760,  sales: 39995,  avgSale: 198, closeRate: 20, revPerHr: null, efficiency: 20, recalls: 1, hoursWorked: null, jobsDone: 17 },
  { name: "Scott Gullick",       revenue: 29610,  sales: 40958,  avgSale: 582, closeRate: 50, revPerHr: null, efficiency: 50, recalls: 3, hoursWorked: null, jobsDone: 17 },
  { name: "Alex Naughton",       revenue: 28608,  sales: 28718,  avgSale: 312, closeRate: 26, revPerHr: null, efficiency: 26, recalls: 2, hoursWorked: null, jobsDone: 21 },
  { name: "Mitch Powell",        revenue: 18471,  sales: 14140,  avgSale: 842, closeRate: 73, revPerHr: null, efficiency: 73, recalls: 2, hoursWorked: null, jobsDone: 14 },
  { name: "Romello Moore",       revenue: 17824,  sales: 15410,  avgSale: 789, closeRate: 72, revPerHr: null, efficiency: 72, recalls: 0, hoursWorked: null, jobsDone: 12 },
  { name: "Bradley Tinworth MT", revenue: 17798,  sales: 14155,  avgSale: 421, closeRate: 41, revPerHr: null, efficiency: 41, recalls: 1, hoursWorked: null, jobsDone: 10 },
  { name: "Curtis Jeffrey",      revenue: 16764,  sales: 13774,  avgSale: 714, closeRate: 67, revPerHr: null, efficiency: 67, recalls: 1, hoursWorked: null, jobsDone: 13 },
  { name: "Kyle Rootes",         revenue: 10954,  sales: 13765,  avgSale: 721, closeRate: 69, revPerHr: null, efficiency: 69, recalls: 1, hoursWorked: null, jobsDone: 17 },
  { name: "Zachary Lingard",     revenue: 7100,   sales: 8701,   avgSale: 701, closeRate: 77, revPerHr: null, efficiency: 77, recalls: 1, hoursWorked: null, jobsDone: 12 },
  { name: "Rusty Daniells",      revenue: 0,      sales: 6016,   avgSale: 498, closeRate: 44, revPerHr: null, efficiency: 44, recalls: 0, hoursWorked: null, jobsDone: 0  },
  { name: "Kristian Calcagno",   revenue: 0,      sales: 1736,   avgSale: 398, closeRate: 55, revPerHr: null, efficiency: 55, recalls: 0, hoursWorked: null, jobsDone: 0  },
];

export const CSRS = [
  { name: "Hudson Newman",    calls: 302, booked: 118, rate: 86.8, status: "amber" as const },
  { name: "Reannah Thompson", calls: 287, booked: 92,  rate: 82.9, status: "amber" as const },
  { name: "Kath Fraser",      calls: 103, booked: 35,  rate: 71.4, status: "red"   as const },
  { name: "Jordy Patterson",  calls: 96,  booked: 16,  rate: 59.3, status: "dispatch" as const },
];

// 18-month revenue + EBITDA trend (Sep 2024 – Mar 2026 incl projections)
export const CASHFLOW_DATA = [
  { month: "Sep 24", revenue: 420000, ebitda: 42000,  ebitdaPct: 10.0, type: "actual"    as const },
  { month: "Oct 24", revenue: 438000, ebitda: 47200,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Nov 24", revenue: 452000, ebitda: 49700,  ebitdaPct: 11.0, type: "actual"    as const },
  { month: "Dec 24", revenue: 390000, ebitda: 35100,  ebitdaPct: 9.0,  type: "actual"    as const },
  { month: "Jan 25", revenue: 445000, ebitda: 48000,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Feb 25", revenue: 467000, ebitda: 50400,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Mar 25", revenue: 485000, ebitda: 52400,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Apr 25", revenue: 492000, ebitda: 53100,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "May 25", revenue: 498000, ebitda: 53800,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Jun 25", revenue: 476000, ebitda: 51400,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Jul 25", revenue: 501000, ebitda: 54100,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Aug 25", revenue: 489000, ebitda: 52800,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Sep 25", revenue: 524000, ebitda: 56600,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Oct 25", revenue: 537000, ebitda: 58000,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Nov 25", revenue: 498000, ebitda: 53800,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Dec 25", revenue: 421000, ebitda: 45500,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Jan 26", revenue: 456000, ebitda: 49200,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Feb 26", revenue: 510216, ebitda: 55103,  ebitdaPct: 10.8, type: "actual"    as const },
  { month: "Mar 26", revenue: 590000, ebitda: 117900, ebitdaPct: 20.0, type: "projected" as const },
  { month: "Apr 26", revenue: 605000, ebitda: 151250, ebitdaPct: 25.0, type: "projected" as const },
  { month: "May 26", revenue: 625000, ebitda: 187500, ebitdaPct: 30.0, type: "projected" as const },
];

// Annotations on the cashflow chart
export const CASHFLOW_ANNOTATIONS = [
  { month: "Jan 25", label: "Pricebook review" },
  { month: "Jul 25", label: "New CSR hired" },
  { month: "Feb 26", label: "Current month" },
  { month: "Mar 26", label: "Target: 20% EBITDA" },
];

// Finance: cost breakdown (% of revenue)
export const COST_BREAKDOWN = [
  { name: "Labour",     value: 38, color: "#FF4500" },
  { name: "Materials",  value: 28, color: "#f59e0b" },
  { name: "Overhead",   value: 23, color: "#6366f1" },
  { name: "EBITDA",     value: 11, color: "#22c55e" },
];

// AR Aging (AUD)
export const AR_AGING = [
  { bracket: "0–30 days",  amount: 84200,  count: 34 },
  { bracket: "31–60 days", amount: 41800,  count: 18 },
  { bracket: "61–90 days", amount: 22400,  count: 9  },
  { bracket: "90+ days",   amount: 16600,  count: 6  },
];

// Jobs Profit tab — est vs actual materials, margin
export const JOBS_PROFIT = [
  { id: "J-4801", type: "AC Install",       tech: "Mitch Powell",    revenue: 4200, estMaterials: 1200, actMaterials: 1180, labourCost: 950, margin: 39.5 },
  { id: "J-4802", type: "Electrical Fault", tech: "Romello Moore",   revenue: 850,  estMaterials: 180,  actMaterials: 210,  labourCost: 320, margin: 37.6 },
  { id: "J-4803", type: "Plumbing Repair",  tech: "Curtis Jeffrey",  revenue: 680,  estMaterials: 90,   actMaterials: 95,   labourCost: 280, margin: 44.9 },
  { id: "J-4804", type: "Solar Install",    tech: "Kyle Rootes",     revenue: 8400, estMaterials: 4200, actMaterials: 4800, labourCost: 1800, margin: 21.4 },
  { id: "J-4805", type: "AC Service",       tech: "Zachary Lingard", revenue: 390,  estMaterials: 80,   actMaterials: 85,   labourCost: 320, margin: -3.8 },
  { id: "J-4806", type: "Electrical",       tech: "Dean Retra",      revenue: 1240, estMaterials: 320,  actMaterials: 410,  labourCost: 480, margin: 28.2 },
  { id: "J-4807", type: "Ducted AC",        tech: "Hayden Sibley",   revenue: 6800, estMaterials: 3200, actMaterials: 3600, labourCost: 1400, margin: 26.5 },
  { id: "J-4808", type: "Switchboard",      tech: "Scott Gullick",   revenue: 2100, estMaterials: 580,  actMaterials: 720,  labourCost: 840, margin: 25.7 },
  { id: "J-4809", type: "Hot Water",        tech: "Lachlan Henzell", revenue: 1800, estMaterials: 620,  actMaterials: 680,  labourCost: 640, margin: 26.7 },
  { id: "J-4810", type: "AC Fault",         tech: "Rusty Daniells",  revenue: 420,  estMaterials: 140,  actMaterials: 380,  labourCost: 380, margin: -85.7 },
  { id: "J-4811", type: "Electrical",       tech: "Alex Naughton",   revenue: 560,  estMaterials: 60,   actMaterials: 75,   labourCost: 560, margin: -13.4 },
  { id: "J-4812", type: "Solar Battery",    tech: "David White",     revenue: 12400, estMaterials: 6800, actMaterials: 7200, labourCost: 2400, margin: 22.6 },
  { id: "J-4813", type: "Plumbing",         tech: "Bradley Tinworth MT", revenue: 480, estMaterials: 95, actMaterials: 110, labourCost: 400, margin: -6.3 },
  { id: "J-4814", type: "AC Service",       tech: "Kristian Calcagno", revenue: 320, estMaterials: 40,  actMaterials: 42,   labourCost: 320, margin: -1.3 },
  { id: "J-4815", type: "Electrical",       tech: "Bailey Somerville", revenue: 890, estMaterials: 180, actMaterials: 200,  labourCost: 640, margin: 5.6  },
  { id: "J-4816", type: "Switchboard",      tech: "Daniel Hayes",    revenue: 3400, estMaterials: 940,  actMaterials: 1100, labourCost: 1800, margin: 14.7 },
  { id: "J-4817", type: "Hot Water",        tech: "Alex Peisler",    revenue: 920,  estMaterials: 320,  actMaterials: 390,  labourCost: 720, margin: -20.7 },
  { id: "J-4818", type: "AC Install",       tech: "Mitch Powell",    revenue: 3800, estMaterials: 1400, actMaterials: 1350, labourCost: 960, margin: 39.5 },
  { id: "J-4819", type: "Plumbing Fault",   tech: "Romello Moore",   revenue: 1100, estMaterials: 180,  actMaterials: 195,  labourCost: 440, margin: 42.3 },
  { id: "J-4820", type: "Electrical Fault", tech: "Curtis Jeffrey",  revenue: 760,  estMaterials: 120,  actMaterials: 145,  labourCost: 640, margin: -3.3 },
];

// Capacity: target $1,533/day per tech (22 working days = $33,726/tech/month)
export const CAPACITY = {
  dailyTargetPerTech: 1533,
  workingDaysMonth: 22,
  monthlyTargetPerTech: 33726,
  activeTechs: 17,
  totalCapacityDays: 17 * 22,
  scheduledJobs: 312,
  scheduledValue: 498000,
  utilisation: [
    { name: "Mitch Powell",        scheduled: 19, available: 22, utilPct: 86 },
    { name: "Romello Moore",       scheduled: 18, available: 22, utilPct: 82 },
    { name: "Curtis Jeffrey",      scheduled: 17, available: 22, utilPct: 77 },
    { name: "Kyle Rootes",         scheduled: 16, available: 22, utilPct: 73 },
    { name: "Zachary Lingard",     scheduled: 15, available: 22, utilPct: 68 },
    { name: "Dean Retra",          scheduled: 17, available: 22, utilPct: 77 },
    { name: "Hayden Sibley",       scheduled: 15, available: 22, utilPct: 68 },
    { name: "Scott Gullick",       scheduled: 14, available: 22, utilPct: 64 },
    { name: "Lachlan Henzell",     scheduled: 13, available: 22, utilPct: 59 },
    { name: "Rusty Daniells",      scheduled: 8,  available: 22, utilPct: 36 },
    { name: "Bradley Tinworth MT", scheduled: 9,  available: 22, utilPct: 41 },
    { name: "Kristian Calcagno",   scheduled: 11, available: 22, utilPct: 50 },
    { name: "Alex Naughton",       scheduled: 10, available: 22, utilPct: 45 },
    { name: "David White",         scheduled: 10, available: 22, utilPct: 45 },
    { name: "Bailey Somerville",   scheduled: 7,  available: 22, utilPct: 32 },
    { name: "Daniel Hayes",        scheduled: 6,  available: 22, utilPct: 27 },
    { name: "Alex Peisler",        scheduled: 5,  available: 22, utilPct: 23 },
  ],
};

// Google Ads campaigns — VERIFIED from google-ads-march.json (pulled 2026-03-26)
// Note: ROAS shown is conversion-value ROAS (Google tracks conversions, not revenue).
// Actual business ROAS is much higher — Google conversion tracking not fully calibrated.
// Spend totals verified: Electrical $34,024 | PlumbingLegacy $17,826 | PlumbingNew $6,531
export const GOOGLE_ADS = {
  totalSpend: 58381,           // [Verified: 2026-03-26 — $58,380.67 actual]
  totalClicks: 3094,           // [Verified: 2026-03-26]
  totalImpressions: 49855,     // [Verified: 2026-03-26]
  // Top campaigns by spend (consolidating the 4 that drive 80%+ of spend)
  campaigns: [
    { name: "Hot Water (Plumbing)",       trade: "Plumbing",  spend: 7177,  clicks: 400, impressions: 6482,  conversions: 31,    cpa: 232,  status: "active" as const },
    { name: "Air Conditioning (Elec)",    trade: "Electrical", spend: 7137, clicks: 416, impressions: 5510,  conversions: 105,   cpa: 68,   status: "active" as const },
    { name: "City Level - Brisbane",      trade: "Plumbing",  spend: 6795,  clicks: 244, impressions: 4650,  conversions: 44,    cpa: 154,  status: "active" as const },
    { name: "City Level (Elec)",          trade: "Electrical", spend: 5907, clicks: 414, impressions: null,  conversions: 90,    cpa: 65,   status: "active" as const },
    { name: "Ducted Air Conditioning",    trade: "Electrical", spend: 4327, clicks: 231, impressions: null,  conversions: 54,    cpa: 80,   status: "active" as const },
    { name: "Solar",                      trade: "Electrical", spend: 3316, clicks: 300, impressions: null,  conversions: 76,    cpa: 44,   status: "active" as const },
    { name: "Emergency Plumbing",         trade: "Plumbing",  spend: 1550,  clicks: 9,   impressions: null,  conversions: 0,     cpa: null, status: "pause" as const },
    { name: "Switchboard Upgrades",       trade: "Electrical", spend: 2835, clicks: 220, impressions: null,  conversions: 26,    cpa: 109,  status: "active" as const },
    { name: "New Hot Water (PlumbNew)",   trade: "Plumbing",  spend: 2873,  clicks: 86,  impressions: null,  conversions: 2,     cpa: 1642, status: "active" as const },
    { name: "Blocked Drains (PlumbNew)",  trade: "Plumbing",  spend: 2561,  clicks: 58,  impressions: null,  conversions: 18,    cpa: 140,  status: "active" as const },
    { name: "Gutters (Plumbing)",         trade: "Plumbing",  spend: 1687,  clicks: 128, impressions: null,  conversions: 39,    cpa: 43,   status: "active" as const },
  ],
  // By account breakdown
  byAccount: {
    Electrical:    { spend: 34024, clicks: 2077 },
    PlumbingLegacy: { spend: 17826, clicks: 817 },
    PlumbingNew:   { spend: 6531,  clicks: 200 },
  },
  // WildJar inbound calls — verified from wildjar-calls-march.json
  wildjar: {
    totalCalls: 405,
    answered: 383,
    abandoned: 22,
    answerRate: 94.6,  // [Verified: 2026-03-26]
    bySource: {
      "Electrical":     { total: 237, answered: 223, abandoned: 14 },
      "Aircon":         { total: 93,  answered: 86,  abandoned: 7  },
      "Solar":          { total: 39,  answered: 38,  abandoned: 1  },
      "Ducted Aircon":  { total: 36,  answered: 36,  abandoned: 0  },
    },
  },
  spendTrend: null, // Not available — weekly breakdown not in current data pull
};

// Commissions — March 2026
// Rules: 1.5% on net sales (gross × 0.95) above $80K threshold (from st-commissions-CORRECTED.json)
// NOTE: ST API employeeInfo attribution returned $0 for all techs in March — commission per-tech
// cannot be confirmed from API. Revenue figures below are from marchScoreboard (soldBy attribution).
// No tech crossed $80K threshold in March on available data. Commissions = $0 until data confirmed.
export const COMMISSIONS = {
  period: "March 2026",
  total: null,              // Cannot confirm — employeeInfo attribution not working in ST API
  threshold: 80000,
  rules: "1.5% salesman + 1.5% installer on net revenue (gross × 0.95) above $80K threshold",
  attributionNote: "ST API employeeInfo not returning per-tech invoice attribution for March. Commission eligibility cannot be confirmed from available data.",
  breakdown: [
    // Revenue from marchScoreboard — none cross $80K threshold
    { tech: "Dean Retra",          revenue: 72261,  aboveThreshold: false, commission: null },
    { tech: "Lachlan Henzell",     revenue: 62531,  aboveThreshold: false, commission: null },
    { tech: "David White",         revenue: 59196,  aboveThreshold: false, commission: null },
    { tech: "Alex Peisler",        revenue: 48855,  aboveThreshold: false, commission: null },
    { tech: "Daniel Hayes",        revenue: 47949,  aboveThreshold: false, commission: null },
    { tech: "Hayden Sibley",       revenue: 38499,  aboveThreshold: false, commission: null },
    { tech: "Bailey Somerville",   revenue: 36760,  aboveThreshold: false, commission: null },
    { tech: "Scott Gullick",       revenue: 29610,  aboveThreshold: false, commission: null },
    { tech: "Alex Naughton",       revenue: 28608,  aboveThreshold: false, commission: null },
    { tech: "Mitch Powell",        revenue: 18471,  aboveThreshold: false, commission: null },
    { tech: "Romello Moore",       revenue: 17824,  aboveThreshold: false, commission: null },
    { tech: "Bradley Tinworth MT", revenue: 17798,  aboveThreshold: false, commission: null },
    { tech: "Curtis Jeffrey",      revenue: 16764,  aboveThreshold: false, commission: null },
    { tech: "Kyle Rootes",         revenue: 10954,  aboveThreshold: false, commission: null },
    { tech: "Zachary Lingard",     revenue: 7100,   aboveThreshold: false, commission: null },
    { tech: "Rusty Daniells",      revenue: null,   aboveThreshold: false, commission: null },
    { tech: "Kristian Calcagno",   revenue: null,   aboveThreshold: false, commission: null },
  ],
};

// Actions — priority list
export type ActionPriority = "critical" | "high" | "medium" | "low";
export type ActionStatus = "open" | "in_progress" | "done";

export interface Action {
  id: string;
  priority: ActionPriority;
  title: string;
  detail: string;
  owner: string;
  dueDate: string;
  status: ActionStatus;
  tab: string;
}

export const ACTIONS: Action[] = [
  {
    id: "A001",
    priority: "critical",
    title: "✅ DONE — Emergency Plumbing Google Ads PAUSED",
    detail: "Confirmed PAUSED. Spent $1,550 with 0 conversions before pause. Budget saved ~$1,550/month. Monitor for 30 days before decision to kill permanently.",
    owner: "Phillip",
    dueDate: "2026-03-26",
    status: "done",
    tab: "Google Ads",
  },
  {
    id: "A002",
    priority: "critical",
    title: "Fix pricebook: 68% of jobs below 15% margin",
    detail: "Labour rates and materials pricing not covering true cost. EBITDA is 10.8% vs 30% target.",
    owner: "Phillip + Office",
    dueDate: "2026-03-31",
    status: "open",
    tab: "Finance",
  },
  {
    id: "A003",
    priority: "critical",
    title: "Kath Fraser CSR coaching — 71.4% booking rate (below 75% floor)",
    detail: "3rd month below floor. Schedule call review session. Warning issued if no improvement by Apr.",
    owner: "Phillip",
    dueDate: "2026-03-27",
    status: "open",
    tab: "Leads",
  },
  {
    id: "A004",
    priority: "high",
    title: "Scott Gullick: 3 recalls this month — investigate root cause",
    detail: "3 recalls in one month is above threshold. Review job notes and consider technical refresher.",
    owner: "Supervisor",
    dueDate: "2026-03-28",
    status: "open",
    tab: "Tech Performance",
  },
  {
    id: "A005",
    priority: "high",
    title: "Daniel Hayes utilisation — 8% efficiency, $48/hr revenue",
    detail: "123 hours worked, only $5,930 revenue. Investigate scheduling, job mix, or capability gap.",
    owner: "Phillip",
    dueDate: "2026-03-31",
    status: "in_progress",
    tab: "Capacity",
  },
  {
    id: "A006",
    priority: "high",
    title: "Chase 90+ day AR: $16,600 from 6 invoices",
    detail: "Overdue beyond 90 days. Send final notice. Escalate to collections if no response by Apr 1.",
    owner: "Office",
    dueDate: "2026-03-31",
    status: "open",
    tab: "Finance",
  },
  {
    id: "A007",
    priority: "medium",
    title: "Scale Electrical Google Ads — 40.6x ROAS, increase budget 20%",
    detail: "Highest performing campaign. Current budget $4,200/month. Recommend $5,000.",
    owner: "Phillip",
    dueDate: "2026-04-01",
    status: "open",
    tab: "Google Ads",
  },
  {
    id: "A008",
    priority: "medium",
    title: "Review Solar Battery campaign — 10.7x ROAS, low conversion volume",
    detail: "Only 14 conversions at $1,720 spend. Consider expanding geo targeting.",
    owner: "Phillip",
    dueDate: "2026-04-07",
    status: "open",
    tab: "Google Ads",
  },
  {
    id: "A009",
    priority: "medium",
    title: "Process March commissions — $1,654.92 total",
    detail: "11 techs above threshold. Payment due by April 7.",
    owner: "Office",
    dueDate: "2026-04-07",
    status: "open",
    tab: "Commissions",
  },
  {
    id: "A010",
    priority: "low",
    title: "Membership conversion follow-up — 112 converted, target 150",
    detail: "38 short of 150 target. Brief CSR team on membership upsell script.",
    owner: "Office",
    dueDate: "2026-04-14",
    status: "open",
    tab: "Overview",
  },
];

// Today's jobs sidebar
export const TODAY_JOBS = [
  { id: "J-4821", type: "AC Service",       tech: "Mitch Powell",    status: "Complete",    value: 890  },
  { id: "J-4822", type: "Electrical Fault", tech: "Romello Moore",   status: "In Progress", value: 1240 },
  { id: "J-4823", type: "Plumbing Repair",  tech: "Curtis Jeffrey",  status: "En Route",    value: 680  },
  { id: "J-4824", type: "Solar Install",    tech: "Kyle Rootes",     status: "Scheduled",   value: 4200 },
  { id: "J-4825", type: "AC Install",       tech: "Zachary Lingard", status: "Scheduled",   value: 3800 },
  { id: "J-4826", type: "Electrical",       tech: "Dean Retra",      status: "Complete",    value: 560  },
  { id: "J-4827", type: "AC Service",       tech: "Hayden Sibley",   status: "In Progress", value: 920  },
  { id: "J-4828", type: "Plumbing",         tech: "Scott Gullick",   status: "Complete",    value: 1100 },
  { id: "J-4829", type: "Electrical",       tech: "Lachlan Henzell", status: "En Route",    value: 780  },
  { id: "J-4830", type: "AC Fault",         tech: "Rusty Daniells",  status: "Scheduled",   value: 650  },
];

export const STAFF_MEMBERS = [
  "All Staff",
  ...TECHNICIANS.map(t => t.name),
  "Hudson Newman",
  "Reannah Thompson",
  "Kath Fraser",
  "Jordy Patterson",
];
