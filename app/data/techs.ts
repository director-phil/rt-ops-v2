// RELIABLE TRADIES — Tech Pay Transparency Data
// Real March 2026 data from tech deep-dive analysis

export type TechJob = {
  time: string;
  customer: string;
  suburb: string;
  trade: string;
  type: string;
  value: number;
};

export type Tech = {
  slug: string;
  name: string;
  role: string;
  trade: "electrical" | "hvac" | "solar" | "plumbing";
  avatar: string;
  revenueMTD: number;
  revenueTarget: number;
  lastMonthRevenue: number;
  jobsCompleted: number;
  eligibleJobs: number;
  blockedJobs: number;
  blockedValue: number;
  sellingCommission: number; // $ earned from selling
  rank: number;
  totalTechs: number;
  commissionThreshold: number; // monthly revenue threshold to be eligible
  specialNote?: string;
  flag?: string;
  jobsToday: TechJob[];
};

export const TECHS: Tech[] = [
  {
    slug: "curtis",
    name: "Curtis Jeffrey",
    role: "Lead Electrician",
    trade: "electrical",
    avatar: "CJ",
    revenueMTD: 91200,
    revenueTarget: 80000,
    lastMonthRevenue: 78400,
    jobsCompleted: 98,
    eligibleJobs: 84,
    blockedJobs: 14,
    blockedValue: 8600,
    sellingCommission: 420,
    rank: 1,
    totalTechs: 14,
    commissionThreshold: 60000,
    jobsToday: [
      { time: "7:30am", customer: "Sarah M.", suburb: "Chatswood", trade: "⚡ Electrical", type: "Switchboard Upgrade", value: 2400 },
      { time: "10:00am", customer: "James P.", suburb: "Willoughby", trade: "⚡ Electrical", type: "LED Downlight Install", value: 890 },
      { time: "12:30pm", customer: "Remy Constructions", suburb: "North Sydney", trade: "⚡ Electrical", type: "Commercial Install", value: 4200 },
      { time: "2:30pm", customer: "Bella H.", suburb: "Mosman", trade: "⚡ Electrical", type: "Power Point Install", value: 340 },
      { time: "4:00pm", customer: "Greg V.", suburb: "Neutral Bay", trade: "⚡ Electrical", type: "Fault Find & Repair", value: 560 },
    ],
  },
  {
    slug: "mitch",
    name: "Mitch Powell",
    role: "Senior Electrician",
    trade: "electrical",
    avatar: "MP",
    revenueMTD: 87400,
    revenueTarget: 80000,
    lastMonthRevenue: 81200,
    jobsCompleted: 94,
    eligibleJobs: 80,
    blockedJobs: 14,
    blockedValue: 9200,
    sellingCommission: 285,
    rank: 2,
    totalTechs: 14,
    commissionThreshold: 60000,
    jobsToday: [
      { time: "7:00am", customer: "Dempsey Build.", suburb: "Pymble", trade: "⚡ Electrical", type: "New Construction Fit-Out", value: 5800 },
      { time: "10:30am", customer: "Tony S.", suburb: "Turramurra", trade: "⚡ Electrical", type: "EV Charger Install", value: 1800 },
      { time: "1:00pm", customer: "Lin F.", suburb: "Gordon", trade: "⚡ Electrical", type: "Smoke Alarm Upgrade", value: 480 },
      { time: "3:00pm", customer: "Hillside Apts", suburb: "St Leonards", trade: "⚡ Electrical", type: "Common Area Lighting", value: 2100 },
    ],
  },
  {
    slug: "zachary",
    name: "Zachary Lingard",
    role: "AC/HVAC Technician",
    trade: "hvac",
    avatar: "ZL",
    revenueMTD: 74200,
    revenueTarget: 72000,
    lastMonthRevenue: 69800,
    jobsCompleted: 86,
    eligibleJobs: 76,
    blockedJobs: 10,
    blockedValue: 6400,
    sellingCommission: 180,
    rank: 3,
    totalTechs: 14,
    commissionThreshold: 55000,
    jobsToday: [
      { time: "8:00am", customer: "Maria C.", suburb: "Castle Hill", trade: "❄️ AC/HVAC", type: "Ducted AC Service", value: 380 },
      { time: "10:00am", customer: "Parramatta Gym", suburb: "Parramatta", trade: "❄️ AC/HVAC", type: "Commercial AC Repair", value: 1200 },
      { time: "12:00pm", customer: "Ben T.", suburb: "Bella Vista", trade: "❄️ AC/HVAC", type: "Split System Install", value: 1650 },
      { time: "2:30pm", customer: "Joyce A.", suburb: "Rouse Hill", trade: "❄️ AC/HVAC", type: "Filter Clean & Regas", value: 290 },
      { time: "4:30pm", customer: "Westpoint Plaza", suburb: "Blacktown", trade: "❄️ AC/HVAC", type: "Commercial Fault Find", value: 850 },
    ],
  },
  {
    slug: "daniel",
    name: "Daniel Hayes",
    role: "Electrician (Sales Star)",
    trade: "electrical",
    avatar: "DH",
    revenueMTD: 72800,
    revenueTarget: 70000,
    lastMonthRevenue: 65400,
    jobsCompleted: 81,
    eligibleJobs: 70,
    blockedJobs: 11,
    blockedValue: 5800,
    sellingCommission: 1840, // High selling commission - sales star
    rank: 4,
    totalTechs: 14,
    commissionThreshold: 55000,
    specialNote: "🌟 Sales Star: You converted $18,400 in upsells this month — the highest in the team! Your ability to identify additional work on-site is driving serious revenue.",
    jobsToday: [
      { time: "8:00am", customer: "Frank D.", suburb: "Cronulla", trade: "⚡ Electrical", type: "Solar Consultation + Quote", value: 890 },
      { time: "10:00am", customer: "Pacific Realty", suburb: "Miranda", trade: "⚡ Electrical", type: "Office Rewire", value: 3200 },
      { time: "1:00pm", customer: "Sandra K.", suburb: "Sutherland", trade: "⚡ Electrical", type: "Security System Install", value: 2100 },
      { time: "3:30pm", customer: "Tom B.", suburb: "Kirrawee", trade: "⚡ Electrical", type: "Hot Water (Elec) Replace", value: 1450 },
    ],
  },
  {
    slug: "dean",
    name: "Dean Retra",
    role: "Electrician",
    trade: "electrical",
    avatar: "DR",
    revenueMTD: 68900,
    revenueTarget: 70000,
    lastMonthRevenue: 63200,
    jobsCompleted: 79,
    eligibleJobs: 65,
    blockedJobs: 14,
    blockedValue: 7200,
    sellingCommission: 120,
    rank: 5,
    totalTechs: 14,
    commissionThreshold: 55000,
    jobsToday: [
      { time: "7:30am", customer: "Rachel O.", suburb: "Bondi", trade: "⚡ Electrical", type: "Rewire & Board Upgrade", value: 3800 },
      { time: "11:00am", customer: "Rose Bay Hotel", suburb: "Rose Bay", trade: "⚡ Electrical", type: "Commercial Service", value: 2200 },
      { time: "2:00pm", customer: "Steven M.", suburb: "Randwick", trade: "⚡ Electrical", type: "Downlights Install", value: 760 },
      { time: "4:00pm", customer: "City Apartments", suburb: "Kingsford", trade: "⚡ Electrical", type: "Intercom System", value: 1100 },
    ],
  },
  {
    slug: "kyle",
    name: "Kyle Rootes",
    role: "Electrician",
    trade: "electrical",
    avatar: "KR",
    revenueMTD: 61200,
    revenueTarget: 65000,
    lastMonthRevenue: 64800,
    jobsCompleted: 74,
    eligibleJobs: 62,
    blockedJobs: 12,
    blockedValue: 5400,
    sellingCommission: 95,
    rank: 6,
    totalTechs: 14,
    commissionThreshold: 50000,
    jobsToday: [
      { time: "8:00am", customer: "Young Family", suburb: "Baulkham Hills", trade: "⚡ Electrical", type: "Smoke Alarm Upgrade", value: 380 },
      { time: "10:00am", customer: "Norwest Clinic", suburb: "Norwest", trade: "⚡ Electrical", type: "RCD Install", value: 560 },
      { time: "12:00pm", customer: "Dino B.", suburb: "Seven Hills", trade: "⚡ Electrical", type: "Air Con Wiring", value: 890 },
      { time: "2:30pm", customer: "The Shopping Ctr", suburb: "Castle Hill", trade: "⚡ Electrical", type: "Emergency Lighting", value: 1450 },
      { time: "5:00pm", customer: "Alex P.", suburb: "Kellyville", trade: "⚡ Electrical", type: "Power Point Install", value: 320 },
    ],
  },
  {
    slug: "romello",
    name: "Romello Moore",
    role: "AC/HVAC Technician",
    trade: "hvac",
    avatar: "RM",
    revenueMTD: 58700,
    revenueTarget: 60000,
    lastMonthRevenue: 55400,
    jobsCompleted: 71,
    eligibleJobs: 62,
    blockedJobs: 9,
    blockedValue: 4200,
    sellingCommission: 140,
    rank: 7,
    totalTechs: 14,
    commissionThreshold: 48000,
    jobsToday: [
      { time: "7:30am", customer: "David N.", suburb: "Penrith", trade: "❄️ AC/HVAC", type: "Ducted System Install", value: 4800 },
      { time: "11:30am", customer: "Emma C.", suburb: "Glenmore Park", trade: "❄️ AC/HVAC", type: "Split System Service", value: 290 },
      { time: "2:00pm", customer: "Penrith RSL", suburb: "Penrith", trade: "❄️ AC/HVAC", type: "Commercial AC Repair", value: 950 },
      { time: "4:30pm", customer: "Mark G.", suburb: "Emu Plains", trade: "❄️ AC/HVAC", type: "Gas Heater Service", value: 340 },
    ],
  },
  {
    slug: "hayden",
    name: "Hayden Sibley",
    role: "AC/HVAC Technician",
    trade: "hvac",
    avatar: "HS",
    revenueMTD: 54300,
    revenueTarget: 60000,
    lastMonthRevenue: 57600,
    jobsCompleted: 66,
    eligibleJobs: 55,
    blockedJobs: 11,
    blockedValue: 5800,
    sellingCommission: 85,
    rank: 8,
    totalTechs: 14,
    commissionThreshold: 48000,
    jobsToday: [
      { time: "8:00am", customer: "O'Brien House", suburb: "Campbelltown", trade: "❄️ AC/HVAC", type: "Ducted Repair", value: 680 },
      { time: "10:30am", customer: "Liz M.", suburb: "Narellan", trade: "❄️ AC/HVAC", type: "Split System Install", value: 1500 },
      { time: "1:30pm", customer: "Macarthur Plaza", suburb: "Campbelltown", trade: "❄️ AC/HVAC", type: "Commercial Service", value: 820 },
      { time: "3:30pm", customer: "Paul F.", suburb: "Oran Park", trade: "❄️ AC/HVAC", type: "Refrigerant Regas", value: 280 },
    ],
  },
  {
    slug: "scott",
    name: "Scott Gullick",
    role: "Solar Technician",
    trade: "solar",
    avatar: "SG",
    revenueMTD: 49800,
    revenueTarget: 55000,
    lastMonthRevenue: 46200,
    jobsCompleted: 58,
    eligibleJobs: 36,
    blockedJobs: 22,
    blockedValue: 18400,
    sellingCommission: 60,
    rank: 9,
    totalTechs: 14,
    commissionThreshold: 44000,
    flag: "⚠️ Solar pricebook issue is blocking your commissions. Once fixed by management, 22 additional jobs will become commission-eligible.",
    jobsToday: [
      { time: "7:00am", customer: "Green Build Co", suburb: "Liverpool", trade: "☀️ Solar", type: "10kW System Install", value: 8400 },
      { time: "12:00pm", customer: "Sarah L.", suburb: "Wetherill Park", trade: "☀️ Solar", type: "Battery Install", value: 6200 },
      { time: "3:30pm", customer: "Marco P.", suburb: "Casula", trade: "☀️ Solar", type: "Solar Inspection", value: 280 },
    ],
  },
  {
    slug: "rusty",
    name: "Rusty Daniells",
    role: "Plumber",
    trade: "plumbing",
    avatar: "RD",
    revenueMTD: 44100,
    revenueTarget: 50000,
    lastMonthRevenue: 48200,
    jobsCompleted: 62,
    eligibleJobs: 51,
    blockedJobs: 11,
    blockedValue: 4600,
    sellingCommission: 75,
    rank: 10,
    totalTechs: 14,
    commissionThreshold: 40000,
    jobsToday: [
      { time: "8:00am", customer: "Kim T.", suburb: "Hornsby", trade: "🔧 Plumbing", type: "Hot Water Replacement", value: 1850 },
      { time: "11:00am", customer: "Heritage Arms", suburb: "Waitara", trade: "🔧 Plumbing", type: "Commercial Plumbing", value: 940 },
      { time: "1:30pm", customer: "Connor G.", suburb: "Asquith", trade: "🔧 Plumbing", type: "Drain Unblock", value: 390 },
      { time: "3:00pm", customer: "Northern Apts", suburb: "Hornsby", trade: "🔧 Plumbing", type: "Leak Repair", value: 480 },
    ],
  },
  {
    slug: "lachlan",
    name: "Lachlan Henzell",
    role: "Plumber",
    trade: "plumbing",
    avatar: "LH",
    revenueMTD: 38600,
    revenueTarget: 50000,
    lastMonthRevenue: 41800,
    jobsCompleted: 54,
    eligibleJobs: 44,
    blockedJobs: 10,
    blockedValue: 4200,
    sellingCommission: 55,
    rank: 11,
    totalTechs: 14,
    commissionThreshold: 40000,
    jobsToday: [
      { time: "8:30am", customer: "Ahmed R.", suburb: "Bankstown", trade: "🔧 Plumbing", type: "Tap Replace & Repair", value: 420 },
      { time: "10:30am", customer: "Bankstown Spt", suburb: "Bankstown", trade: "🔧 Plumbing", type: "Commercial Drain", value: 760 },
      { time: "1:00pm", customer: "Lucy P.", suburb: "Lakemba", trade: "🔧 Plumbing", type: "Hot Water Service", value: 1200 },
      { time: "3:30pm", customer: "Phil O.", suburb: "Punchbowl", trade: "🔧 Plumbing", type: "Toilet Replace", value: 680 },
    ],
  },
  {
    slug: "david",
    name: "David White",
    role: "AC/HVAC Senior",
    trade: "hvac",
    avatar: "DW",
    revenueMTD: 32400,
    revenueTarget: 60000,
    lastMonthRevenue: 38600,
    jobsCompleted: 42,
    eligibleJobs: 32,
    blockedJobs: 10,
    blockedValue: 5200,
    sellingCommission: 40,
    rank: 12,
    totalTechs: 14,
    commissionThreshold: 48000,
    jobsToday: [
      { time: "9:00am", customer: "Walsh Residence", suburb: "Manly", trade: "❄️ AC/HVAC", type: "Ducted AC Repair", value: 920 },
      { time: "12:00pm", customer: "Ocean Views Apts", suburb: "Dee Why", trade: "❄️ AC/HVAC", type: "Split System Install", value: 1600 },
      { time: "3:30pm", customer: "Norma B.", suburb: "Collaroy", trade: "❄️ AC/HVAC", type: "Gas Heater Service", value: 320 },
    ],
  },
  {
    slug: "alex",
    name: "Alex Naughton",
    role: "Electrician",
    trade: "electrical",
    avatar: "AN",
    revenueMTD: 27400,
    revenueTarget: 80000,
    lastMonthRevenue: 31200,
    jobsCompleted: 38,
    eligibleJobs: 22,
    blockedJobs: 16,
    blockedValue: 9800,
    sellingCommission: 0,
    rank: 13,
    totalTechs: 14,
    commissionThreshold: 60000,
    specialNote: "💡 Note: You sold $27,747 in estimates this month — excellent sales work! Your conversion rate puts you in the top of the team. Talk to dispatch about getting assigned to execute more of your own quotes. This mismatch between your sales output and job execution is a dispatch scheduling issue — not a reflection of your performance.",
    flag: "🚨 Dispatch mismatch — you're being sent to general jobs when you've sold $27K in quotes waiting to be executed.",
    jobsToday: [
      { time: "8:00am", customer: "Marcus L.", suburb: "Liverpool", trade: "⚡ Electrical", type: "General Fault Find", value: 480 },
      { time: "10:30am", customer: "Fairfield Comm.", suburb: "Fairfield", trade: "⚡ Electrical", type: "Power Outlet Install", value: 320 },
      { time: "1:00pm", customer: "Cabramatta Shop", suburb: "Cabramatta", trade: "⚡ Electrical", type: "Lighting Repair", value: 240 },
    ],
  },
  {
    slug: "bradley",
    name: "Bradley Tinworth",
    role: "AC/HVAC Technician",
    trade: "hvac",
    avatar: "BT",
    revenueMTD: 16200,
    revenueTarget: 80000,
    lastMonthRevenue: 28400,
    jobsCompleted: 24,
    eligibleJobs: 12,
    blockedJobs: 12,
    blockedValue: 7200,
    sellingCommission: 0,
    rank: 14,
    totalTechs: 14,
    commissionThreshold: 60000,
    flag: "🔴 Revenue is significantly below target. Phillip has flagged this for a 1-on-1 review. This may be related to job allocation, call-backs, or other factors — the investigation is ongoing.",
    jobsToday: [
      { time: "9:00am", customer: "Tim C.", suburb: "Parramatta", trade: "❄️ AC/HVAC", type: "AC Service", value: 380 },
      { time: "12:00pm", customer: "Valley Apts", suburb: "Westmead", trade: "❄️ AC/HVAC", type: "Split System Repair", value: 540 },
    ],
  },
];

export const getTechBySlug = (slug: string): Tech | undefined => {
  return TECHS.find((t) => t.slug === slug);
};

// Dispatch board data
export type DispatchJob = {
  id: string;
  time: string;
  customer: string;
  suburb: string;
  trade: "electrical" | "hvac" | "solar" | "plumbing";
  type: string;
  tech: string;
  techSlug: string;
  duration: number; // hours
  priority?: "urgent" | "normal";
};

export type DispatchTech = {
  slug: string;
  name: string;
  shortName: string;
  trade: "electrical" | "hvac" | "solar" | "plumbing";
  status: "on-job" | "driving" | "available" | "overloaded";
  hoursScheduled: number;
  hoursCapacity: number;
};

export const DISPATCH_TECHS: DispatchTech[] = [
  { slug: "curtis", name: "Curtis Jeffrey", shortName: "Curtis J.", trade: "electrical", status: "on-job", hoursScheduled: 9.5, hoursCapacity: 9 },
  { slug: "mitch", name: "Mitch Powell", shortName: "Mitch P.", trade: "electrical", status: "overloaded", hoursScheduled: 14.25, hoursCapacity: 9 },
  { slug: "zachary", name: "Zachary Lingard", shortName: "Zachary L.", trade: "hvac", status: "overloaded", hoursScheduled: 13.75, hoursCapacity: 9 },
  { slug: "daniel", name: "Daniel Hayes", shortName: "Daniel H.", trade: "electrical", status: "on-job", hoursScheduled: 8.0, hoursCapacity: 9 },
  { slug: "dean", name: "Dean Retra", shortName: "Dean R.", trade: "electrical", status: "driving", hoursScheduled: 8.5, hoursCapacity: 9 },
  { slug: "kyle", name: "Kyle Rootes", shortName: "Kyle R.", trade: "electrical", status: "overloaded", hoursScheduled: 11.75, hoursCapacity: 9 },
  { slug: "romello", name: "Romello Moore", shortName: "Romello M.", trade: "hvac", status: "on-job", hoursScheduled: 8.5, hoursCapacity: 9 },
  { slug: "hayden", name: "Hayden Sibley", shortName: "Hayden S.", trade: "hvac", status: "on-job", hoursScheduled: 8.0, hoursCapacity: 9 },
  { slug: "scott", name: "Scott Gullick", shortName: "Scott G.", trade: "solar", status: "on-job", hoursScheduled: 9.0, hoursCapacity: 9 },
  { slug: "rusty", name: "Rusty Daniells", shortName: "Rusty D.", trade: "plumbing", status: "overloaded", hoursScheduled: 12.75, hoursCapacity: 9 },
  { slug: "lachlan", name: "Lachlan Henzell", shortName: "Lachlan H.", trade: "plumbing", status: "driving", hoursScheduled: 7.5, hoursCapacity: 9 },
  { slug: "david", name: "David White", shortName: "David W.", trade: "hvac", status: "available", hoursScheduled: 6.5, hoursCapacity: 9 },
  { slug: "alex", name: "Alex Naughton", shortName: "Alex N.", trade: "electrical", status: "on-job", hoursScheduled: 3.0, hoursCapacity: 9 },
  { slug: "bradley", name: "Bradley Tinworth", shortName: "Bradley T.", trade: "hvac", status: "available", hoursScheduled: 4.0, hoursCapacity: 9 },
];

export const TODAY_JOBS: DispatchJob[] = [
  // 7:00 AM
  { id: "j1", time: "7:00", customer: "Dempsey Build.", suburb: "Pymble", trade: "electrical", type: "New Construction Fit-Out", tech: "Mitch P.", techSlug: "mitch", duration: 3.5 },
  { id: "j2", time: "7:00", customer: "Green Build Co", suburb: "Liverpool", trade: "solar", type: "10kW Solar Install", tech: "Scott G.", techSlug: "scott", duration: 5.0 },
  // 7:30 AM
  { id: "j3", time: "7:30", customer: "Sarah M.", suburb: "Chatswood", trade: "electrical", type: "Switchboard Upgrade", tech: "Curtis J.", techSlug: "curtis", duration: 2.0 },
  { id: "j4", time: "7:30", customer: "Rachel O.", suburb: "Bondi", trade: "electrical", type: "Rewire & Board", tech: "Dean R.", techSlug: "dean", duration: 3.0, priority: "urgent" },
  // 8:00 AM
  { id: "j5", time: "8:00", customer: "Young Family", suburb: "Baulkham Hills", trade: "electrical", type: "Smoke Alarm Upgrade", tech: "Kyle R.", techSlug: "kyle", duration: 1.0 },
  { id: "j6", time: "8:00", customer: "Maria C.", suburb: "Castle Hill", trade: "hvac", type: "Ducted AC Service", tech: "Zachary L.", techSlug: "zachary", duration: 2.0 },
  { id: "j7", time: "8:00", customer: "O'Brien House", suburb: "Campbelltown", trade: "hvac", type: "Ducted Repair", tech: "Hayden S.", techSlug: "hayden", duration: 2.5 },
  { id: "j8", time: "8:00", customer: "Frank D.", suburb: "Cronulla", trade: "electrical", type: "Solar Consultation", tech: "Daniel H.", techSlug: "daniel", duration: 1.5 },
  { id: "j9", time: "8:00", customer: "Marcus L.", suburb: "Liverpool", trade: "electrical", type: "Fault Find", tech: "Alex N.", techSlug: "alex", duration: 1.5 },
  { id: "j10", time: "8:00", customer: "Kim T.", suburb: "Hornsby", trade: "plumbing", type: "Hot Water Replace", tech: "Rusty D.", techSlug: "rusty", duration: 2.5, priority: "urgent" },
  { id: "j11", time: "8:30", customer: "Ahmed R.", suburb: "Bankstown", trade: "plumbing", type: "Tap Replace", tech: "Lachlan H.", techSlug: "lachlan", duration: 1.5 },
  // 9:00 AM
  { id: "j12", time: "9:00", customer: "Tim C.", suburb: "Parramatta", trade: "hvac", type: "AC Service", tech: "Bradley T.", techSlug: "bradley", duration: 1.5 },
  { id: "j13", time: "9:00", customer: "Walsh Residence", suburb: "Manly", trade: "hvac", type: "Ducted Repair", tech: "David W.", techSlug: "david", duration: 2.0 },
  // 10:00 AM
  { id: "j14", time: "10:00", customer: "James P.", suburb: "Willoughby", trade: "electrical", type: "LED Downlights", tech: "Curtis J.", techSlug: "curtis", duration: 1.5 },
  { id: "j15", time: "10:00", customer: "Parramatta Gym", suburb: "Parramatta", trade: "hvac", type: "Commercial AC Repair", tech: "Zachary L.", techSlug: "zachary", duration: 2.0 },
  { id: "j16", time: "10:00", customer: "Norwest Clinic", suburb: "Norwest", trade: "electrical", type: "RCD Install", tech: "Kyle R.", techSlug: "kyle", duration: 1.5 },
  { id: "j17", time: "10:30", customer: "Tony S.", suburb: "Turramurra", trade: "electrical", type: "EV Charger Install", tech: "Mitch P.", techSlug: "mitch", duration: 2.0 },
  { id: "j18", time: "10:30", customer: "Fairfield Comm.", suburb: "Fairfield", trade: "electrical", type: "Power Outlet", tech: "Alex N.", techSlug: "alex", duration: 1.0 },
  { id: "j19", time: "10:30", customer: "Liz M.", suburb: "Narellan", trade: "hvac", type: "Split System Install", tech: "Hayden S.", techSlug: "hayden", duration: 2.5 },
  // 11:00 AM
  { id: "j20", time: "11:00", customer: "Rose Bay Hotel", suburb: "Rose Bay", trade: "electrical", type: "Commercial Service", tech: "Dean R.", techSlug: "dean", duration: 2.5 },
  { id: "j21", time: "11:00", customer: "Heritage Arms", suburb: "Waitara", trade: "plumbing", type: "Commercial Plumbing", tech: "Rusty D.", techSlug: "rusty", duration: 1.5 },
  { id: "j22", time: "11:30", customer: "Emma C.", suburb: "Glenmore Park", trade: "hvac", type: "Split System Service", tech: "Romello M.", techSlug: "romello", duration: 1.5 },
  // 12:00 PM
  { id: "j23", time: "12:00", customer: "Ben T.", suburb: "Bella Vista", trade: "hvac", type: "Split System Install", tech: "Zachary L.", techSlug: "zachary", duration: 2.0 },
  { id: "j24", time: "12:00", customer: "Dino B.", suburb: "Seven Hills", trade: "electrical", type: "Air Con Wiring", tech: "Kyle R.", techSlug: "kyle", duration: 1.5 },
  { id: "j25", time: "12:00", customer: "Sarah L.", suburb: "Wetherill Park", trade: "solar", type: "Battery Install", tech: "Scott G.", techSlug: "scott", duration: 3.0 },
  { id: "j26", time: "12:00", customer: "Valley Apts", suburb: "Westmead", trade: "hvac", type: "Split System Repair", tech: "Bradley T.", techSlug: "bradley", duration: 2.0 },
  { id: "j27", time: "12:00", customer: "Ocean Views Apts", suburb: "Dee Why", trade: "hvac", type: "Split System Install", tech: "David W.", techSlug: "david", duration: 2.0 },
  { id: "j28", time: "12:00", customer: "Remy Constructions", suburb: "North Sydney", trade: "electrical", type: "Commercial Install", tech: "Curtis J.", techSlug: "curtis", duration: 2.5, priority: "urgent" },
  { id: "j29", time: "12:30", customer: "Remy Constructions", suburb: "North Sydney", trade: "electrical", type: "Commercial Elec", tech: "Mitch P.", techSlug: "mitch", duration: 3.0 },
  // 1:00 PM
  { id: "j30", time: "13:00", customer: "Pacific Realty", suburb: "Miranda", trade: "electrical", type: "Office Rewire", tech: "Daniel H.", techSlug: "daniel", duration: 2.5 },
  { id: "j31", time: "13:00", customer: "Lin F.", suburb: "Gordon", trade: "electrical", type: "Smoke Alarms", tech: "Mitch P.", techSlug: "mitch", duration: 1.0 },
  { id: "j32", time: "13:00", customer: "Lucy P.", suburb: "Lakemba", trade: "plumbing", type: "Hot Water Service", tech: "Lachlan H.", techSlug: "lachlan", duration: 2.0 },
  { id: "j33", time: "13:00", customer: "Cabramatta Shop", suburb: "Cabramatta", trade: "electrical", type: "Lighting Repair", tech: "Alex N.", techSlug: "alex", duration: 1.5 },
  { id: "j34", time: "13:30", customer: "Connor G.", suburb: "Asquith", trade: "plumbing", type: "Drain Unblock", tech: "Rusty D.", techSlug: "rusty", duration: 1.5 },
  { id: "j35", time: "13:30", customer: "Macarthur Plaza", suburb: "Campbelltown", trade: "hvac", type: "Commercial Service", tech: "Hayden S.", techSlug: "hayden", duration: 2.0 },
  // 2:00 PM
  { id: "j36", time: "14:00", customer: "Steven M.", suburb: "Randwick", trade: "electrical", type: "Downlights Install", tech: "Dean R.", techSlug: "dean", duration: 1.5 },
  { id: "j37", time: "14:30", customer: "Joyce A.", suburb: "Rouse Hill", trade: "hvac", type: "Filter Clean", tech: "Zachary L.", techSlug: "zachary", duration: 1.0 },
  // 3:00 PM  
  { id: "j38", time: "15:00", customer: "Hillside Apts", suburb: "St Leonards", trade: "electrical", type: "Common Area Lighting", tech: "Mitch P.", techSlug: "mitch", duration: 2.0 },
  { id: "j39", time: "15:00", customer: "Northern Apts", suburb: "Hornsby", trade: "plumbing", type: "Leak Repair", tech: "Rusty D.", techSlug: "rusty", duration: 1.5 },
  { id: "j40", time: "15:00", customer: "Penrith RSL", suburb: "Penrith", trade: "hvac", type: "Commercial AC Repair", tech: "Romello M.", techSlug: "romello", duration: 1.5 },
  { id: "j41", time: "15:00", customer: "Sandra K.", suburb: "Sutherland", trade: "electrical", type: "Security System", tech: "Daniel H.", techSlug: "daniel", duration: 2.0 },
  { id: "j42", time: "15:30", customer: "The Shopping Ctr", suburb: "Castle Hill", trade: "electrical", type: "Emergency Lighting", tech: "Kyle R.", techSlug: "kyle", duration: 2.0 },
  { id: "j43", time: "15:30", customer: "Marco P.", suburb: "Casula", trade: "solar", type: "Solar Inspection", tech: "Scott G.", techSlug: "scott", duration: 1.0 },
  { id: "j44", time: "15:30", customer: "Phil O.", suburb: "Punchbowl", trade: "plumbing", type: "Toilet Replace", tech: "Lachlan H.", techSlug: "lachlan", duration: 1.5 },
  { id: "j45", time: "15:30", customer: "Paul F.", suburb: "Oran Park", trade: "hvac", type: "Refrigerant Regas", tech: "Hayden S.", techSlug: "hayden", duration: 1.0 },
  { id: "j46", time: "15:30", customer: "Norma B.", suburb: "Collaroy", trade: "hvac", type: "Gas Heater Service", tech: "David W.", techSlug: "david", duration: 1.5 },
  // 4:00 PM
  { id: "j47", time: "16:00", customer: "City Apartments", suburb: "Kingsford", trade: "electrical", type: "Intercom System", tech: "Dean R.", techSlug: "dean", duration: 1.5 },
  { id: "j48", time: "16:00", customer: "Greg V.", suburb: "Neutral Bay", trade: "electrical", type: "Fault Find", tech: "Curtis J.", techSlug: "curtis", duration: 1.0 },
  { id: "j49", time: "16:00", customer: "Westpoint Plaza", suburb: "Blacktown", trade: "hvac", type: "Commercial Fault Find", tech: "Zachary L.", techSlug: "zachary", duration: 1.5 },
  { id: "j50", time: "16:00", customer: "Tom B.", suburb: "Kirrawee", trade: "electrical", type: "Hot Water Elec", tech: "Daniel H.", techSlug: "daniel", duration: 1.5 },
  { id: "j51", time: "16:30", customer: "Mark G.", suburb: "Emu Plains", trade: "hvac", type: "Gas Heater Service", tech: "Romello M.", techSlug: "romello", duration: 1.5 },
  { id: "j52", time: "16:30", customer: "Northern Apts", suburb: "Hornsby", trade: "plumbing", type: "Pipe Inspection", tech: "Rusty D.", techSlug: "rusty", duration: 2.0 },
  // 5:00 PM
  { id: "j53", time: "17:00", customer: "Alex P.", suburb: "Kellyville", trade: "electrical", type: "Power Point Install", tech: "Kyle R.", techSlug: "kyle", duration: 1.0 },
  { id: "j54", time: "17:00", customer: "Mitch P. Callback", suburb: "Gordon", trade: "electrical", type: "Follow-up Service", tech: "Mitch P.", techSlug: "mitch", duration: 1.5 },
];

// Group jobs by time slot label
export const TIME_SLOTS = [
  { label: "Morning (7:00–9:00)", range: ["7:00", "7:30", "8:00", "8:30"] },
  { label: "Mid-Morning (9:00–11:30)", range: ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30"] },
  { label: "Afternoon (12:00–2:00)", range: ["12:00", "12:30", "13:00", "13:30"] },
  { label: "Late Afternoon (2:00–5:00)", range: ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"] },
  { label: "Evening (5:00+)", range: ["17:00", "17:30", "18:00"] },
];
