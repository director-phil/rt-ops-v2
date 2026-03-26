// Shared date range utility — respects the "date" filter param

export interface DateRange {
  from: string;  // ISO
  to: string;    // ISO
  prevFrom: string;
  prevTo: string;
  label: string;
}

function startOfWeek(d: Date): Date {
  // Monday-based week
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0);
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
      from = startOfWeek(now);
      to = new Date(from); to.setDate(to.getDate() + 6); to.setHours(23, 59, 59);
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "This Week";
      break;
    }
    case "last_week": {
      const thisWeekStart = startOfWeek(now);
      to = new Date(thisWeekStart); to.setDate(to.getDate() - 1); to.setHours(23, 59, 59);
      from = new Date(to); from.setDate(from.getDate() - 6); from.setHours(0, 0, 0);
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "Last Week";
      break;
    }
    case "week_2": {
      // 2 weeks ago
      const thisWeekStart = startOfWeek(now);
      const w2end = new Date(thisWeekStart); w2end.setDate(w2end.getDate() - 7); w2end.setHours(23, 59, 59);
      const w2start = new Date(w2end); w2start.setDate(w2start.getDate() - 6); w2start.setHours(0, 0, 0);
      from = w2start; to = w2end;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "2 Weeks Ago";
      break;
    }
    case "week_3": {
      // 3 weeks ago
      const thisWeekStart = startOfWeek(now);
      const w3end = new Date(thisWeekStart); w3end.setDate(w3end.getDate() - 14); w3end.setHours(23, 59, 59);
      const w3start = new Date(w3end); w3start.setDate(w3start.getDate() - 6); w3start.setHours(0, 0, 0);
      from = w3start; to = w3end;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "3 Weeks Ago";
      break;
    }
    case "week_4": {
      // 4 weeks ago
      const thisWeekStart = startOfWeek(now);
      const w4end = new Date(thisWeekStart); w4end.setDate(w4end.getDate() - 21); w4end.setHours(23, 59, 59);
      const w4start = new Date(w4end); w4start.setDate(w4start.getDate() - 6); w4start.setHours(0, 0, 0);
      from = w4start; to = w4end;
      prevFrom = new Date(from); prevFrom.setDate(prevFrom.getDate() - 7);
      prevTo = new Date(to); prevTo.setDate(prevTo.getDate() - 7);
      label = "4 Weeks Ago";
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
    case "month_2": {
      const m2 = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      from = new Date(m2.getFullYear(), m2.getMonth(), 1, 0, 0, 0);
      to = new Date(m2.getFullYear(), m2.getMonth() + 1, 0, 23, 59, 59);
      prevFrom = new Date(from); prevFrom.setMonth(prevFrom.getMonth() - 1);
      prevTo = new Date(to); prevTo.setMonth(prevTo.getMonth() - 1);
      label = m2.toLocaleString("en-AU", { month: "long", year: "numeric" });
      break;
    }
    case "month_3": {
      const m3 = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      from = new Date(m3.getFullYear(), m3.getMonth(), 1, 0, 0, 0);
      to = new Date(m3.getFullYear(), m3.getMonth() + 1, 0, 23, 59, 59);
      prevFrom = new Date(from); prevFrom.setMonth(prevFrom.getMonth() - 1);
      prevTo = new Date(to); prevTo.setMonth(prevTo.getMonth() - 1);
      label = m3.toLocaleString("en-AU", { month: "long", year: "numeric" });
      break;
    }
    case "mtd":
    default: {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      to = now;
      const currentDayOfMonth = now.getDate();
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      const prevDayOfMonth = Math.min(currentDayOfMonth, prevMonthLastDay);
      const prevMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, prevDayOfMonth, 23, 59, 59);
      prevFrom = prevMonthStart;
      prevTo = prevMonthSameDay;
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
