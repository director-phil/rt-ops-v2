// RELIABLE TRADIES — Live Business Data
// All figures verified from deep-dive analysis

export const BUSINESS_DATA = {
  date: "Tue 24 Mar 2026",
  healthScore: 67,
  healthTrend: "IMPROVING",

  cash: {
    inBank: 284500,
    dueIn7Days: 98400,
    dueOut7Days: 71200,
    net7Day: 27200,
  },

  bookings: {
    jobsToday: 200,
    revenueTarget: 82000,
    revenuePace: 61500,
    onTrack: false,
    tomorrowHoursOpen: 63.8,
    tomorrowAlert: true,
  },

  scorecard: [
    { metric: "Revenue MTD", current: "$443K", target: "$782K", pct: 57, status: "red", owner: "Phillip" },
    { metric: "Booking Rate", current: "32%", target: "45%", pct: 71, status: "amber", owner: "Hudson/Rhi" },
    { metric: "ROAS", current: "8.6x", target: "5x+", pct: 172, status: "green", owner: "Marketing" },
    { metric: "Capacity Util", current: "78%", target: "85%", pct: 92, status: "amber", owner: "Dispatch" },
    { metric: "Avg Job Value", current: "$829", target: "$1,200", pct: 69, status: "red", owner: "Techs" },
    { metric: "EBITDA est", current: "17%", target: "30%", pct: 57, status: "red", owner: "Phillip" },
    { metric: "Open Quotes", current: "641", target: "< 50", pct: 0, status: "critical", owner: "Sales", note: "$3.9M" },
  ],

  liabilities: [
    {
      id: 1,
      severity: "critical",
      title: "Emergency Plumbing: $1,550 WASTED",
      action: "PAUSE NOW. Zero conversions in 4 weeks.",
      impact: "$1,550/month",
      owner: "Marketing",
    },
    {
      id: 2,
      severity: "critical",
      title: "Solar pricebook: PRICED BELOW COST",
      action: "Fix before next job dispatched. Losing money on every solar job.",
      impact: "Margin -ve",
      owner: "Operations",
    },
    {
      id: 3,
      severity: "high",
      title: "Alex Naughton: wrong dispatch",
      action: "He sold $27K in quotes. Let him execute — move to sales dispatch.",
      impact: "+$30K/month",
      owner: "Dispatch",
    },
    {
      id: 4,
      severity: "high",
      title: "Bradley Tinworth: $16K vs $80K target",
      action: "Requires urgent 1-on-1. Either fix or re-assign his jobs.",
      impact: "-$64K/month",
      owner: "Phillip",
    },
    {
      id: 5,
      severity: "high",
      title: "641 open quotes: $3.9M sitting idle",
      action: "Assign follow-up team TODAY. 30% conversion = $1.2M pipeline.",
      impact: "$3.9M at risk",
      owner: "Sales",
    },
  ],

  cashForecast: [
    { week: "Week 1 (now)", inflow: 443654, outflow: 312000 },
    { week: "Week 2", inflow: 187000, outflow: 145000 },
    { week: "Week 3", inflow: 142000, outflow: 118000 },
    { week: "Week 4", inflow: 95000, outflow: 87000 },
  ],

  dispatch: {
    today: {
      status: "OVERLOADED",
      techsAtCapacity: 12,
      totalTechs: 17,
      overloaded: [
        { name: "Mitch H", hours: -5.25, trade: "electrical" },
        { name: "Zachary L", hours: -4.75, trade: "hvac" },
        { name: "Rusty M", hours: -3.75, trade: "electrical" },
        { name: "Jay T", hours: -2.5, trade: "plumbing" },
        { name: "Tom K", hours: -1.75, trade: "electrical" },
      ],
    },
    tomorrow: {
      hoursOpen: 63.8,
      available: [
        { name: "Alex N", hours: 6.5, trade: "electrical" },
        { name: "David W", hours: 6.5, trade: "hvac" },
        { name: "Dean R", hours: 6.5, trade: "electrical" },
        { name: "Chris P", hours: 5.0, trade: "solar" },
        { name: "Liam B", hours: 5.5, trade: "plumbing" },
        { name: "Jack F", hours: 6.0, trade: "electrical" },
        { name: "Sam V", hours: 5.75, trade: "hvac" },
        { name: "Ryan O", hours: 4.75, trade: "electrical" },
        { name: "Nathan C", hours: 6.0, trade: "solar" },
        { name: "Cooper D", hours: 5.5, trade: "plumbing" },
        { name: "Tyler M", hours: 5.75, trade: "hvac" },
      ],
    },
    byTrade: [
      { trade: "Electrical", emoji: "⚡", jobs: 86, capacity: 86, pct: 100 },
      { trade: "AC/HVAC", emoji: "❄️", jobs: 83, capacity: 83, pct: 100 },
      { trade: "Solar", emoji: "☀️", jobs: 21, capacity: 31, pct: 67 },
      { trade: "Plumbing", emoji: "🔧", jobs: 10, capacity: 21, pct: 47 },
    ],
  },

  technicians: [
    { name: "Mitch Hannigan", role: "Lead Electrician", revenueMTD: 87400, target: 80000, trend: "up", commissionEligible: 14, commissionBlocked: 2, flag: null },
    { name: "Zachary Lewis", role: "AC/HVAC Tech", revenueMTD: 74200, target: 72000, trend: "up", commissionEligible: 12, commissionBlocked: 1, flag: null },
    { name: "Dean Roberts", role: "Electrician", revenueMTD: 68900, target: 70000, trend: "up", commissionEligible: 11, commissionBlocked: 3, flag: null },
    { name: "Tom Kearns", role: "Electrician", revenueMTD: 61200, target: 65000, trend: "down", commissionEligible: 9, commissionBlocked: 4, flag: null },
    { name: "Jay Turner", role: "Plumber", revenueMTD: 58700, target: 60000, trend: "up", commissionEligible: 10, commissionBlocked: 2, flag: null },
    { name: "David Walsh", role: "AC/HVAC Senior", revenueMTD: 54300, target: 60000, trend: "down", commissionEligible: 8, commissionBlocked: 3, flag: null },
    { name: "Chris Park", role: "Solar Tech", revenueMTD: 49800, target: 55000, trend: "up", commissionEligible: 6, commissionBlocked: 7, flag: "⚠️ Pricebook issue blocking commissions" },
    { name: "Liam Brown", role: "Plumber", revenueMTD: 44100, target: 50000, trend: "down", commissionEligible: 7, commissionBlocked: 4, flag: null },
    { name: "Alex Naughton", role: "Electrician → Sales", revenueMTD: 27400, target: 80000, trend: "up", commissionEligible: 3, commissionBlocked: 11, flag: "🚨 Wrong dispatch — should be in sales. Quoted $27K." },
    { name: "Bradley Tinworth", role: "AC/HVAC Tech", revenueMTD: 16200, target: 80000, trend: "down", commissionEligible: 2, commissionBlocked: 8, flag: "🔴 URGENT: $16K vs $80K target. 1-on-1 required." },
  ],

  csr: {
    today: { calls: 34, booked: 11, rate: 32 },
    monthly: [
      {
        name: "Hudson",
        bookingRate: 76.4,
        callsHandled: 412,
        callsBooked: 315,
        commissionEarned: 148,
        commissionTarget: 200,
        bonus: 200,
      },
      {
        name: "Rhi",
        bookingRate: 84.5,
        callsHandled: 422,
        callsBooked: 357,
        commissionEarned: 176,
        commissionTarget: 200,
        bonus: 200,
      },
    ],
    unbookedCalls: 59,
    recoverableRevenue: 140000,
  },

  finance: {
    phantomAR: 233000,
    invoiceBalances: 406000,
    overdueTop10: [
      { client: "Greenfield Commercial", amount: 48200, daysOverdue: 67 },
      { client: "Sunrise Property Group", amount: 34700, daysOverdue: 45 },
      { client: "Metro Constructions", amount: 28900, daysOverdue: 38 },
      { client: "Pacific Developments", amount: 22400, daysOverdue: 31 },
      { client: "Harbour Building Co", amount: 19800, daysOverdue: 29 },
      { client: "Apex Real Estate", amount: 17200, daysOverdue: 24 },
      { client: "Central Builders", amount: 14600, daysOverdue: 21 },
      { client: "Northern Constructions", amount: 11900, daysOverdue: 18 },
      { client: "Coastal Projects", amount: 9400, daysOverdue: 15 },
      { client: "Eastern Developments", amount: 8100, daysOverdue: 12 },
    ],
    cashFlow13Week: [
      { week: "W1", net: 131654 },
      { week: "W2", net: 42000 },
      { week: "W3", net: 24000 },
      { week: "W4", net: 8000 },
      { week: "W5", net: 55000 },
      { week: "W6", net: 38000 },
      { week: "W7", net: 29000 },
      { week: "W8", net: 44000 },
      { week: "W9", net: 18000 },
      { week: "W10", net: 31000 },
      { week: "W11", net: 22000 },
      { week: "W12", net: 41000 },
      { week: "W13", net: 35000 },
    ],
    pnl: {
      revenue: 443654,
      cogs: 245000,
      grossProfit: 198654,
      grossMargin: 44.8,
      operatingExpenses: 123000,
      ebitda: 75654,
      ebitdaMargin: 17.1,
    },
  },

  marketing: {
    totalSpend: 42687,
    totalBudget: 48000,
    overallROAS: 8.6,
    campaigns: [
      { name: "Ducted AC Installation", spend: 8420, budget: 12000, conversions: 87, revenue: 181962, roas: 21.6, status: "green", action: "SCALE — underfunded at 21.6x ROAS" },
      { name: "Split AC Service", spend: 6180, budget: 7000, conversions: 64, revenue: 89344, roas: 14.4, status: "green", action: "Increase budget 20%" },
      { name: "Hot Water Systems", spend: 5940, budget: 7000, conversions: 41, revenue: 62730, roas: 10.6, status: "green", action: "Steady — maintain" },
      { name: "General Electrical", spend: 7820, budget: 8000, conversions: 58, revenue: 72546, roas: 9.3, status: "green", action: "Performing well" },
      { name: "Solar Panels", spend: 6240, budget: 6500, conversions: 18, revenue: 43200, roas: 6.9, status: "green", action: "Fix pricebook first" },
      { name: "Plumbing General", spend: 4840, budget: 5000, conversions: 31, revenue: 27556, roas: 5.7, status: "green", action: "Steady" },
      { name: "Drain & Blocked", spend: 1697, budget: 2000, conversions: 16, revenue: 7182, roas: 4.2, status: "amber", action: "Watch — declining conversions" },
      { name: "Emergency Plumbing", spend: 1550, budget: 1500, conversions: 0, revenue: 0, roas: 0, status: "red", action: "PAUSE NOW — $1,550 wasted, zero conversions" },
    ],
  },

  actions: {
    critical: [
      { id: 1, done: false, title: "Pause Emergency Plumbing campaign", impact: "$1,550/month saved", owner: "Marketing", due: "TODAY", category: "critical" },
      { id: 2, done: false, title: "Fix Solar inspection pricebook", impact: "Immediate margin recovery", owner: "Operations", due: "TODAY", category: "critical" },
      { id: 3, done: false, title: "Assign Alex Naughton to execute his own quotes", impact: "+$30K/month", owner: "Phillip", due: "TODAY", category: "critical" },
    ],
    high: [
      { id: 4, done: false, title: "Follow up 641 open quotes — assign to team", impact: "$3.9M pipeline", owner: "Sales", due: "This Week", category: "high" },
      { id: 5, done: false, title: "Investigate Bradley Tinworth performance", impact: "$64K/month gap", owner: "Phillip", due: "This Week", category: "high" },
      { id: 6, done: false, title: "Fix Xero→ST payment sync", impact: "$233K phantom AR resolved", owner: "IT/Finance", due: "This Week", category: "high" },
    ],
    growth: [
      { id: 7, done: false, title: "Scale Ducted AC campaigns", impact: "+$XX revenue at 21.6x ROAS", owner: "Marketing", due: "This Month", category: "growth" },
      { id: 8, done: false, title: "Fix Sunday call abandonment (42% loss)", impact: "+$140K/month", owner: "Operations", due: "This Month", category: "growth" },
    ],
  },
};
