import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const XERO_TENANT_ID = "854c7ae0-43b7-415d-85b3-728a9a3da702";

async function callZapierMCP(toolName: string, toolArgs: Record<string, unknown>) {
  const mcpUrl = process.env.ZAPIER_MCP_URL;
  if (!mcpUrl) throw new Error("ZAPIER_MCP_URL not configured");

  const args = { ...toolArgs };
  if (!args.instructions) args.instructions = `Call ${toolName}`;
  // Zapier needs headers as newline-delimited string
  if (args.headers && typeof args.headers === "object") {
    args.headers = Object.entries(args.headers as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }

  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: toolName, arguments: args } }),
    cache: "no-store",
  });

  const rawText = await res.text();
  if (!res.ok) throw new Error(`Zapier MCP error ${res.status}: ${rawText.slice(0, 300)}`);

  // Zapier returns SSE — extract last data line
  let jsonStr = rawText;
  if (rawText.startsWith("event:") || rawText.startsWith("data:") || rawText.includes("\ndata:")) {
    const lines = rawText.split("\n").filter(l => l.startsWith("data:"));
    jsonStr = lines[lines.length - 1]?.replace(/^data:\s*/, "") || "{}";
  }
  return JSON.parse(jsonStr);
}

function parseZapierResult(result: Record<string, unknown>): Record<string, unknown> {
  // Zapier MCP response structure:
  // result.result.content[0].text → JSON string → .results[0].response.body → Xero response
  const content = (result?.result as Record<string, unknown>)?.content
    || result?.content || [];
  const textBlock = (content as Record<string, unknown>[]).find(c => c.type === "text");
  if (!textBlock?.text) return {};

  const outer = JSON.parse(textBlock.text as string) as Record<string, unknown>;
  const results = (outer?.results as Record<string, unknown>[]) || [];
  const body = results[0]?.response as Record<string, unknown>;
  const rawBody = body?.body;
  if (!rawBody) return {};
  return typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody as Record<string, unknown>;
}

export async function GET(_req: NextRequest) {
  try {
    const result = await callZapierMCP("xero_api_request_beta", {
      instructions: "Get all bank accounts and their current balances from Xero",
      url: "https://api.xero.com/api.xro/2.0/Accounts?where=Type%3D%3D%22BANK%22",
      method: "GET",
      headers: {
        "Xero-tenant-id": XERO_TENANT_ID,
        Accept: "application/json",
      },
    });

    const xeroData = parseZapierResult(result);
    const rawAccounts = (xeroData.Accounts || xeroData.BankAccounts || []) as Record<string, unknown>[];

    const bankAccounts = rawAccounts.map(acc => ({
      id: acc.AccountID,
      name: acc.Name,
      code: acc.Code,
      balance: typeof acc.Balance === "number" ? acc.Balance : parseFloat(String(acc.Balance || "0")),
      currency: acc.CurrencyCode || "AUD",
      type: acc.Type || "BANK",
    }));

    return NextResponse.json({
      ok: true,
      bankAccounts,
      totalBalance: bankAccounts.reduce((s, a) => s + (a.balance || 0), 0),
      updatedAt: new Date().toISOString(),
      source: "Xero via Zapier",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, bankAccounts: [], updatedAt: new Date().toISOString() }, { status: 500 });
  }
}
