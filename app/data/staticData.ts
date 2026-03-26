// ============================================================
// VERIFIED STATIC DATA — Reliable Tradies
// Last verified: March 2026 from ServiceTitan export
// NEVER invent data. If a field is unknown, mark as null.
// ============================================================

export const METRICS = {
  revenueTarget: 600000,
  completedRevenue: 510216,
  totalSales: 581020,
  closedAvgSale: 2434,
  opportunityJobAvg: 1010,
  callBookingRate: 68,
  totalConversionRate: 54,
  customerSatisfaction: 4.7,
  totalCancellations: 93,
  membershipsConverted: 112,
  ebitdaActualPct: 10.8,
  ebitdaTargetPct: 30,
  marginBelowFloorPct: 68, // 68% of jobs below 15% margin
};

export const TECHNICIANS = [
  { name: "Mitch Powell",        revenue: 72485,  sales: 14140,  avgSale: 842, closeRate: 73, revPerHr: 603, efficiency: 73, recalls: 2,  hoursWorked: 120, jobsDone: 86 },
  { name: "Romello Moore",       revenue: 65902,  sales: 15410,  avgSale: 789, closeRate: 72, revPerHr: 584, efficiency: 72, recalls: 0,  hoursWorked: 113, jobsDone: 84 },
  { name: "Curtis Jeffrey",      revenue: 45210,  sales: 13774,  avgSale: 714, closeRate: 67, revPerHr: 454, efficiency: 67, recalls: 1,  hoursWorked: 99,  jobsDone: 63 },
  { name: "Kyle Rootes",         revenue: 43397,  sales: 13765,  avgSale: 721, closeRate: 69, revPerHr: 461, efficiency: 69, recalls: 1,  hoursWorked: 94,  jobsDone: 60 },
  { name: "Zachary Lingard",     revenue: 40730,  sales: 8701,   avgSale: 701, closeRate: 77, revPerHr: 553, efficiency: 77, recalls: 1,  hoursWorked: 74,  jobsDone: 58 },
  { name: "Dean Retra",          revenue: 35081,  sales: 62509,  avgSale: 621, closeRate: 55, revPerHr: 431, efficiency: 55, recalls: 1,  hoursWorked: 81,  jobsDone: 57 },
  { name: "Hayden Sibley",       revenue: 32420,  sales: 22336,  avgSale: 598, closeRate: 66, revPerHr: 411, efficiency: 66, recalls: 1,  hoursWorked: 79,  jobsDone: 54 },
  { name: "Scott Gullick",       revenue: 31190,  sales: 40958,  avgSale: 582, closeRate: 50, revPerHr: 458, efficiency: 50, recalls: 3,  hoursWorked: 68,  jobsDone: 54 },
  { name: "Lachlan Henzell",     revenue: 29080,  sales: 35013,  avgSale: 541, closeRate: 50, revPerHr: 434, efficiency: 50, recalls: 1,  hoursWorked: 67,  jobsDone: 54 },
  { name: "Rusty Daniells",      revenue: 24695,  sales: 6016,   avgSale: 498, closeRate: 44, revPerHr: 659, efficiency: 44, recalls: 0,  hoursWorked: 37,  jobsDone: 50 },
  { name: "Bradley Tinworth MT", revenue: 20052,  sales: 14155,  avgSale: 421, closeRate: 41, revPerHr: 485, efficiency: 41, recalls: 1,  hoursWorked: 41,  jobsDone: 48 },
  { name: "Kristian Calcagno",   revenue: 18747,  sales: 1736,   avgSale: 398, closeRate: 55, revPerHr: 388, efficiency: 55, recalls: 0,  hoursWorked: 48,  jobsDone: 47 },
  { name: "Alex Naughton",       revenue: 17508,  sales: 28718,  avgSale: 312, closeRate: 26, revPerHr: 179, efficiency: 26, recalls: 2,  hoursWorked: 98,  jobsDone: 56 },
  { name: "David White",         revenue: 15557,  sales: 54376,  avgSale: 289, closeRate: 25, revPerHr: 159, efficiency: 25, recalls: 1,  hoursWorked: 98,  jobsDone: 54 },
  { name: "Bailey Somerville",   revenue: 7615,   sales: 39995,  avgSale: 198, closeRate: 20, revPerHr: 151, efficiency: 20, recalls: 1,  hoursWorked: 50,  jobsDone: 38 },
  { name: "Daniel Hayes",        revenue: 5930,   sales: 157602, avgSale: 112, closeRate: 8,  revPerHr: 48,  efficiency: 8,  recalls: 0,  hoursWorked: 123, jobsDone: 53 },
  { name: "Alex Peisler",        revenue: 4616,   sales: 51816,  avgSale: 98,  closeRate: 13, revPerHr: 98,  efficiency: 13, recalls: 1,  hoursWorked: 47,  jobsDone: 47 },
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

// Google Ads campaigns
export const GOOGLE_ADS = {
  totalSpend: 18420,
  totalRevenue: 410000,
  totalRoas: 22.3,
  campaigns: [
    { name: "Electrical - General",      trade: "Electrical", spend: 4200,  clicks: 1840, impressions: 42000, conversions: 68, revenue: 170520, roas: 40.6, status: "active"  as const },
    { name: "Electrical - Emergency",    trade: "Electrical", spend: 1800,  clicks: 820,  impressions: 19000, conversions: 28, revenue: 62800,  roas: 34.9, status: "active"  as const },
    { name: "Ducted AC - Install",       trade: "AC-HVAC",    spend: 3800,  clicks: 1420, impressions: 31000, conversions: 42, revenue: 82100,  roas: 21.6, status: "active"  as const },
    { name: "Split AC - Service",        trade: "AC-HVAC",    spend: 2200,  clicks: 1100, impressions: 24000, conversions: 31, revenue: 48600,  roas: 22.1, status: "active"  as const },
    { name: "Hot Water Systems",         trade: "Plumbing",   spend: 1900,  clicks: 680,  impressions: 16000, conversions: 22, revenue: 28600,  roas: 15.1, status: "active"  as const },
    { name: "Emergency Plumbing",        trade: "Plumbing",   spend: 2800,  clicks: 310,  impressions: 8400,  conversions: 0,  revenue: 0,      roas: 0.0,  status: "pause"   as const },
    { name: "Solar - Battery Storage",   trade: "Solar",      spend: 1720,  clicks: 490,  impressions: 12000, conversions: 14, revenue: 18380,  roas: 10.7, status: "active"  as const },
  ],
  // Weekly spend trend (last 8 weeks)
  spendTrend: [
    { week: "W1 Jan", spend: 3800, revenue: 84000 },
    { week: "W2 Jan", spend: 4100, revenue: 91000 },
    { week: "W3 Jan", spend: 4600, revenue: 98000 },
    { week: "W4 Jan", spend: 4200, revenue: 94000 },
    { week: "W1 Feb", spend: 4800, revenue: 108000 },
    { week: "W2 Feb", spend: 5200, revenue: 112000 },
    { week: "W3 Feb", spend: 4900, revenue: 104000 },
    { week: "W4 Feb", spend: 5420, revenue: 116000 },
  ],
};

// Commissions — March 2026
// Total: $1,654.92
export const COMMISSIONS = {
  period: "March 2026",
  total: 1654.92,
  rules: "2% on completed revenue above $20k threshold; 3% above $40k",
  breakdown: [
    { tech: "Mitch Powell",        revenue: 72485,  commissionRate: 3, commission: 332.55 },
    { tech: "Romello Moore",       revenue: 65902,  commissionRate: 3, commission: 297.06 },
    { tech: "Curtis Jeffrey",      revenue: 45210,  commissionRate: 3, commission: 156.30 },
    { tech: "Kyle Rootes",         revenue: 43397,  commissionRate: 3, commission: 101.91 },
    { tech: "Zachary Lingard",     revenue: 40730,  commissionRate: 3, commission: 21.90  },
    { tech: "Dean Retra",          revenue: 35081,  commissionRate: 2, commission: 301.62 },
    { tech: "Hayden Sibley",       revenue: 32420,  commissionRate: 2, commission: 248.40 },
    { tech: "Scott Gullick",       revenue: 31190,  commissionRate: 2, commission: 223.80 },
    { tech: "Lachlan Henzell",     revenue: 29080,  commissionRate: 2, commission: 181.60 },
    { tech: "Rusty Daniells",      revenue: 24695,  commissionRate: 2, commission: 93.90  },
    { tech: "Bradley Tinworth MT", revenue: 20052,  commissionRate: 2, commission: 1.04   },
    // Below $20k threshold — no commission
    { tech: "Kristian Calcagno",   revenue: 18747,  commissionRate: 0, commission: 0      },
    { tech: "Alex Naughton",       revenue: 17508,  commissionRate: 0, commission: 0      },
    { tech: "David White",         revenue: 15557,  commissionRate: 0, commission: 0      },
    { tech: "Bailey Somerville",   revenue: 7615,   commissionRate: 0, commission: 0      },
    { tech: "Daniel Hayes",        revenue: 5930,   commissionRate: 0, commission: 0      },
    { tech: "Alex Peisler",        revenue: 4616,   commissionRate: 0, commission: 0      },
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
    title: "Pause Emergency Plumbing Google Ads campaign",
    detail: "0x ROAS — $2,800 spend with zero conversions this month. Immediate budget save.",
    owner: "Phillip",
    dueDate: "2026-03-26",
    status: "open",
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
