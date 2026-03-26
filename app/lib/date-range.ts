// Shared date range utility — respects the "date" filter param

export interface DateRange {
  from: string;  // ISO
  to: string;    // ISO
  prevFrom: string;
  prevTo: string;
  label: string;
}

export function getDateRange(dateParam?: string | null): DateRange {
  const now = new Date();

  let from: Date, to: Date, prevFrom: Date, prevTo: Date, label: string;

  switch (dateParam) {
    case "today": {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 1);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 1);
      label = "Today";
      break;
    }
    case "week": {
      const day = now.getDay(); // 0=Sun
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Mon
      from = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
      to = new Date(now.getFullYear(), now.getMonth(), diff + 6, 23, 59, 59);
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "This Week";
      break;
    }
    case "last_month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      from = new Date(lm.getFullYear(), lm.getMonth(), 1, 0, 0, 0);
      to = new Date(lm.getFullYear(), lm.getMonth() + 1, 0, 23, 59, 59);
      prevFrom = new Date(from); prevFrom.setMonth(prevFrom.getMonth() - 1);
      prevTo = new Date(to); prevTo.setMonth(prevTo.getMonth() - 1);
      label = lm.toLocaleString("en-AU", { month: "long", year: "numeric" });
      break;
    }
    case "mtd":
    default: {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      to = now;
      // Previous month same day range
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const prevMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate(), 23, 59, 59);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      prevFrom = prevMonthStart;
      prevTo = prevMonthSameDay < prevMonthEnd ? prevMonthSameDay : prevMonthEnd;
      label = now.toLocaleString("en-AU", { month: "long", year: "numeric" });
      break;
    }
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    prevFrom: prevFrom.toISOString(),
    prevTo: prevTo.toISOString(),
    label,
  };
}

export function parseTrade(tradeParam?: string | null): string | null {
  if (!tradeParam || tradeParam === "all") return null;
  return tradeParam.toLowerCase();
}
