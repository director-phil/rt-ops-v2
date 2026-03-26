import { NextRequest, NextResponse } from "next/server";
import { stFetchAll } from "@/app/lib/st-fetch-all";
import { getDateRange } from "@/app/lib/date-range";

export const dynamic = "force-dynamic";

const COMMISSION_THRESHOLD = 80000;
const NET_SALE_FACTOR = 0.95;
const COMMISSION_RATE = 0.015;

const parseNum = (v: unknown): number => {
  const n = typeof v === "string" ? parseFloat(v as string) : Number(v);
  return isNaN(n) ? 0 : n;
};

async function fetchTechMetrics(from: string, to: string) {
  const tenantId = process.env.ST_TENANT_ID!;

  const jobs = await stFetchAll(`/jpm/v2/tenant/${tenantId}/jobs`, {
    createdOnOrAfter: from,
    createdBefore: to,
    jobStatus: "Completed",
    pageSize: "500",
  }) as Record<string, unknown>[];

  const techMap: Record<string, {
    id: number | string;
    name: string;
    revenue: number;
    jobs: number;
    hours: number;
    recalls: number;
  }> = {};

  for (const job of jobs) {
    const jobRevenue = parseNum(job.total);

    // ST v2 jobs can have assignedTechnicians (array) or assignments
    const assignedTechs = (job.assignedTechnicians as Record<string, unknown>[])
      || (job.assignments as Record<string, unknown>[])
      || [];

    // Also check direct tech fields
    const directTechId = job.technicianId || (job.technician as Record<string, unknown>)?.id;
    const directTechName = (job.technician as Record<string, unknown>)?.name as string
      || (job.assignedTo as Record<string, unknown>)?.name as string;

    let processed = false;

    if (assignedTechs.length > 0) {
      for (const a of assignedTechs) {
        // Try multiple field name patterns
        const techObj = (a.technician as Record<string, unknown>) || a;
        const id = String(techObj.id || a.id || a.technicianId || "unknown");
        const name = (techObj.name as string) || (a.name as string) || (a.technicianName as string) || "Unknown";

        if (id === "unknown" || id === "undefined") continue;

        if (!techMap[id]) {
          techMap[id] = { id, name, revenue: 0, jobs: 0, hours: 0, recalls: 0 };
        }
        techMap[id].revenue += jobRevenue;
        techMap[id].jobs++;
        techMap[id].hours += parseNum(job.duration);
        if (((job.jobTypeName as string) || "").toLowerCase().includes("recall")) {
          techMap[id].recalls++;
        }
        processed = true;
      }
    }

    if (!processed && directTechId) {
      const id = String(directTechId);
      const name = directTechName || "Unknown";
      if (!techMap[id]) {
        techMap[id] = { id, name, revenue: 0, jobs: 0, hours: 0, recalls: 0 };
      }
      techMap[id].revenue += jobRevenue;
      techMap[id].jobs++;
      techMap[id].hours += parseNum(job.duration);
    }
  }

  return Object.values(techMap);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const range = getDateRange(dateParam);

  try {
    const [current, previous] = await Promise.all([
      fetchTechMetrics(range.from, range.to),
      fetchTechMetrics(range.prevFrom, range.prevTo),
    ]);

    const prevMap = new Map(previous.map(t => [t.name, t]));

    const technicians = current.map(tech => {
      const prev = prevMap.get(tech.name);
      const revChange = prev ? tech.revenue - prev.revenue : null;
      const revChangePct = prev && prev.revenue > 0 ? ((tech.revenue - prev.revenue) / prev.revenue) * 100 : null;

      const netSale = tech.revenue * NET_SALE_FACTOR;
      const meetsThreshold = tech.revenue >= COMMISSION_THRESHOLD;
      const commission = meetsThreshold ? netSale * COMMISSION_RATE : 0;
      const progressPct = Math.min(100, Math.round((tech.revenue / COMMISSION_THRESHOLD) * 100));
      const revPerHr = tech.hours > 0 ? Math.round(tech.revenue / tech.hours) : null;

      return {
        id: tech.id,
        name: tech.name,
        revenueMTD: Math.round(tech.revenue),
        prevRevenue: prev ? Math.round(prev.revenue) : null,
        revChange: revChange !== null ? Math.round(revChange) : null,
        revChangePct: revChangePct !== null ? Math.round(revChangePct * 10) / 10 : null,
        jobCount: tech.jobs,
        hoursWorked: Math.round(tech.hours * 10) / 10,
        revPerHr,
        recalls: tech.recalls,
        commission: Math.round(commission * 100) / 100,
        meetsThreshold,
        progressPct,
        thresholdGap: Math.max(0, Math.round(COMMISSION_THRESHOLD - tech.revenue)),
      };
    }).sort((a, b) => b.revenueMTD - a.revenueMTD);

    if (technicians.length === 0) {
      return NextResponse.json({
        ok: true,
        period: range.label,
        commissionThreshold: COMMISSION_THRESHOLD,
        technicians: [],
        noData: true,
        message: "No technician assignment data found in ServiceTitan for this period",
        updatedAt: new Date().toISOString(),
        source: "ServiceTitan",
      });
    }

    return NextResponse.json({
      ok: true,
      period: range.label,
      commissionThreshold: COMMISSION_THRESHOLD,
      technicians,
      updatedAt: new Date().toISOString(),
      source: "ServiceTitan",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/technicians]", msg);
    return NextResponse.json({ ok: false, error: msg, updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
