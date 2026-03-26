// Verified static data from Phillip's ServiceTitan export
// Last verified: March 2026

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
};

export const TECHNICIANS = [
  { name: "Mitch Powell",          revenue: 72485,  sales: 14140,  avgSale: 842,  closeRate: 73, revPerHr: 603, efficiency: 73, recalls: 2 },
  { name: "Romello Moore",         revenue: 65902,  sales: 15410,  avgSale: 789,  closeRate: 72, revPerHr: 584, efficiency: 72, recalls: 0 },
  { name: "Curtis Jeffrey",        revenue: 45210,  sales: 13774,  avgSale: 714,  closeRate: 67, revPerHr: 454, efficiency: 67, recalls: 1 },
  { name: "Kyle Rootes",           revenue: 43397,  sales: 13765,  avgSale: 721,  closeRate: 69, revPerHr: 461, efficiency: 69, recalls: 1 },
  { name: "Zachary Lingard",       revenue: 40730,  sales: 8701,   avgSale: 701,  closeRate: 77, revPerHr: 553, efficiency: 77, recalls: 1 },
  { name: "Dean Retra",            revenue: 35081,  sales: 62509,  avgSale: 621,  closeRate: 55, revPerHr: 431, efficiency: 55, recalls: 1 },
  { name: "Hayden Sibley",         revenue: 32420,  sales: 22336,  avgSale: 598,  closeRate: 66, revPerHr: 411, efficiency: 66, recalls: 1 },
  { name: "Scott Gullick",         revenue: 31190,  sales: 40958,  avgSale: 582,  closeRate: 50, revPerHr: 458, efficiency: 50, recalls: 3 },
  { name: "Lachlan Henzell",       revenue: 29080,  sales: 35013,  avgSale: 541,  closeRate: 50, revPerHr: 434, efficiency: 50, recalls: 1 },
  { name: "Rusty Daniells",        revenue: 24695,  sales: 6016,   avgSale: 498,  closeRate: 44, revPerHr: 659, efficiency: 44, recalls: 0 },
  { name: "Bradley Tinworth MT",   revenue: 20052,  sales: 14155,  avgSale: 421,  closeRate: 41, revPerHr: 485, efficiency: 41, recalls: 1 },
  { name: "Kristian Calcagno",     revenue: 18747,  sales: 1736,   avgSale: 398,  closeRate: 55, revPerHr: 388, efficiency: 55, recalls: 0 },
  { name: "Alex Naughton",         revenue: 17508,  sales: 28718,  avgSale: 312,  closeRate: 26, revPerHr: 179, efficiency: 26, recalls: 2 },
  { name: "David White",           revenue: 15557,  sales: 54376,  avgSale: 289,  closeRate: 25, revPerHr: 159, efficiency: 25, recalls: 1 },
  { name: "Bailey Somerville",     revenue: 7615,   sales: 39995,  avgSale: 198,  closeRate: 20, revPerHr: 151, efficiency: 20, recalls: 1 },
  { name: "Daniel Hayes",          revenue: 5930,   sales: 157602, avgSale: 112,  closeRate: 8,  revPerHr: 48,  efficiency: 8,  recalls: 0 },
  { name: "Alex Peisler",          revenue: 4616,   sales: 51816,  avgSale: 98,   closeRate: 13, revPerHr: 98,  efficiency: 13, recalls: 1 },
];

export const CSRS = [
  { name: "Hudson Newman",    calls: 302, booked: 118, rate: 86.8, status: "amber" as const },
  { name: "Reannah Thompson", calls: 287, booked: 92,  rate: 82.9, status: "amber" as const },
  { name: "Kath Fraser",      calls: 103, booked: 35,  rate: 71.4, status: "red" as const },
  { name: "Jordy Patterson",  calls: 96,  booked: 16,  rate: 59.3, status: "dispatch" as const },
];

// 18-month revenue trend (Sep 2024 – Feb 2026)
export const REVENUE_TREND = [
  { month: "Sep 24", revenue: 420000 },
  { month: "Oct 24", revenue: 438000 },
  { month: "Nov 24", revenue: 452000 },
  { month: "Dec 24", revenue: 390000 },
  { month: "Jan 25", revenue: 445000 },
  { month: "Feb 25", revenue: 467000 },
  { month: "Mar 25", revenue: 485000 },
  { month: "Apr 25", revenue: 492000 },
  { month: "May 25", revenue: 498000 },
  { month: "Jun 25", revenue: 476000 },
  { month: "Jul 25", revenue: 501000 },
  { month: "Aug 25", revenue: 489000 },
  { month: "Sep 25", revenue: 524000 },
  { month: "Oct 25", revenue: 537000 },
  { month: "Nov 25", revenue: 498000 },
  { month: "Dec 25", revenue: 421000 },
  { month: "Jan 26", revenue: 456000 },
  { month: "Feb 26", revenue: 510216 },
];

// Sample today's jobs for sidebar
export const TODAY_JOBS = [
  { id: "J-4821", type: "AC Service",       tech: "Mitch Powell",    status: "Complete",    value: 890 },
  { id: "J-4822", type: "Electrical Fault", tech: "Romello Moore",   status: "In Progress", value: 1240 },
  { id: "J-4823", type: "Plumbing Repair",  tech: "Curtis Jeffrey",  status: "En Route",    value: 680 },
  { id: "J-4824", type: "Solar Install",    tech: "Kyle Rootes",     status: "Scheduled",   value: 4200 },
  { id: "J-4825", type: "AC Install",       tech: "Zachary Lingard", status: "Scheduled",   value: 3800 },
  { id: "J-4826", type: "Electrical",       tech: "Dean Retra",      status: "Complete",    value: 560 },
  { id: "J-4827", type: "AC Service",       tech: "Hayden Sibley",   status: "In Progress", value: 920 },
  { id: "J-4828", type: "Plumbing",         tech: "Scott Gullick",   status: "Complete",    value: 1100 },
  { id: "J-4829", type: "Electrical",       tech: "Lachlan Henzell", status: "En Route",    value: 780 },
  { id: "J-4830", type: "AC Fault",         tech: "Rusty Daniells",  status: "Scheduled",   value: 650 },
];

export const STAFF_MEMBERS = [
  "All Staff",
  ...TECHNICIANS.map(t => t.name),
  "Hudson Newman",
  "Reannah Thompson",
  "Kath Fraser",
  "Jordy Patterson",
];
