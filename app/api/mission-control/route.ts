import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  emoji: string;
  channel: string;
}

const AGENTS: AgentConfig[] = [
  { id: "main",            name: "main",            role: "CEO / Orchestrator",      model: "Claude Sonnet", emoji: "🧠", channel: "Direct" },
  { id: "dataanalystbot",  name: "dataanalystbot",  role: "Data & BigQuery",          model: "Claude Sonnet", emoji: "📊", channel: "#dataanalystbot" },
  { id: "googleoptimiser", name: "googleoptimiser", role: "Google Ads",               model: "Claude Sonnet", emoji: "🎯", channel: "#googleoptimiser" },
  { id: "dashboardbot",    name: "dashboardbot",    role: "Dashboards & Vercel",      model: "Claude Sonnet", emoji: "🚀", channel: "#dashboardbot" },
  { id: "bookkeeperbot",   name: "bookkeeperbot",   role: "Xero & Finance",           model: "Claude Sonnet", emoji: "💰", channel: "#bookkeeperbot" },
  { id: "marketresearchbot",name:"marketresearchbot",role: "Competitor Research",     model: "Claude Haiku",  emoji: "🔍", channel: "#marketresearchbot" },
  { id: "scraperbot",      name: "scraperbot",      role: "Web Scraping",             model: "Claude Haiku",  emoji: "🕷️", channel: "#scraperbot" },
  { id: "metabot",         name: "metabot",         role: "Meta / Facebook Ads",      model: "Claude Haiku",  emoji: "📱", channel: "#metaagent" },
  { id: "spendbot",        name: "spendbot",        role: "Spend Monitoring",         model: "Claude Haiku",  emoji: "🔒", channel: "#spendbot" },
  { id: "securitybot",     name: "securitybot",     role: "Security & Credentials",   model: "Claude Haiku",  emoji: "🛡️", channel: "#securitybot" },
  { id: "reviewbot",       name: "reviewbot",       role: "Data Review & QA",         model: "Claude Sonnet", emoji: "✅", channel: "-" },
];

async function getAgentLastActivity(agentId: string): Promise<{ lastActive: number | null; sessionCount: number }> {
  try {
    const sessionsPath = path.join(os.homedir(), ".openclaw", "agents", agentId, "sessions", "sessions.json");
    const raw = await fs.readFile(sessionsPath, "utf-8");
    const data = JSON.parse(raw) as Record<string, { updatedAt?: number; createdAt?: number }>;
    const sessions = Object.values(data);
    if (!sessions.length) return { lastActive: null, sessionCount: 0 };
    sessions.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    const lastActive = sessions[0].updatedAt ?? sessions[0].createdAt ?? null;
    return { lastActive, sessionCount: sessions.length };
  } catch {
    return { lastActive: null, sessionCount: 0 };
  }
}

function formatAge(ms: number | null): string {
  if (!ms) return "Never";
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 2) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function getStatus(lastActive: number | null): "active" | "idle" | "offline" {
  if (!lastActive) return "offline";
  const diff = Date.now() - lastActive;
  if (diff < 2 * 3600000) return "active";   // active in last 2h
  if (diff < 24 * 3600000) return "idle";    // active in last 24h
  return "offline";
}

export async function GET() {
  const agentData = await Promise.all(
    AGENTS.map(async (a) => {
      const { lastActive, sessionCount } = await getAgentLastActivity(a.id);
      return {
        ...a,
        lastActive,
        lastActiveLabel: formatAge(lastActive),
        status: getStatus(lastActive),
        sessionCount,
      };
    })
  );

  const activeCount = agentData.filter(a => a.status === "active").length;
  const sonnetCount = agentData.filter(a => a.model.includes("Sonnet")).length;
  const haikuCount = agentData.filter(a => a.model.includes("Haiku")).length;

  return NextResponse.json({
    ok: true,
    agents: agentData,
    summary: {
      total: agentData.length,
      active: activeCount,
      idle: agentData.filter(a => a.status === "idle").length,
      offline: agentData.filter(a => a.status === "offline").length,
      sonnet: sonnetCount,
      haiku: haikuCount,
    },
    updatedAt: new Date().toISOString(),
  });
}
