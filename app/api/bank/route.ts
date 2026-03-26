import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const XERO_TENANT_ID = "854c7ae0-43b7-415d-85b3-728a9a3da702";

interface ZapierMCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

async function callZapierMCP(toolName: string, toolArgs: Record<string, unknown>) {
  const mcpUrl = process.env.ZAPIER_MCP_URL;
  if (!mcpUrl) throw new Error("ZAPIER_MCP_URL not configured");

  // Zapier streamable HTTP MCP: requires jsonrpc 2.0, headers as string, instructions required
  const args = { ...toolArgs };
  if (!args.instructions) args.instructions = `Call ${toolName}`;
  // Convert headers object → newline-delimited string if needed
  if (args.headers && typeof args.headers === "object") {
    args.headers = Object.entries(args.headers as Record<string, string>)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  }

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: { name: toolName, arguments: args },
  };

  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const rawText = await res.text();
  if (!res.ok) {
    throw new Error(`Zapier MCP error ${res.status}: ${rawText.slice(0, 300)}`);
  }

  // Zapier returns SSE (event: message / data: {...}) — extract last data line
  let jsonStr = rawText;
  if (rawText.includes("\ndata:") || rawText.startsWith("event:") || rawText.startsWith("data:")) {
    const lines = rawText.split("\n").filter(l => l.startsWith("data:"));
    jsonStr = lines[lines.length - 1]?.replace(/^data:\s*/, "") || "{}";
  }
  return JSON.parse(jsonStr);
}

export async function GET(_req: NextRequest) {
  try {
    const result = await callZapierMCP("xero_api_request_beta", {
      url: "https://api.xero.com/api.xro/2.0/Accounts?Type=BANK",
      method: "GET",
      headers: {
        "Xero-tenant-id": XERO_TENANT_ID,
        Accept: "application/json",
      },
    });

    // Parse MCP result — content is usually in result.content[0].text
    let accounts: Record<string, unknown>[] = [];
    const content = result?.result?.content || result?.content || [];
    const textBlock = content.find((c: Record<string, unknown>) => c.type === "text");
    if (textBlock?.text) {
      try {
        const parsed = JSON.parse(textBlock.text as string);
        accounts = parsed.BankAccounts || parsed.bankAccounts || parsed || [];
      } catch {
        // Try to find JSON in text
        const match = (textBlock.text as string).match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          accounts = parsed.BankAccounts || parsed.bankAccounts || [];
        }
      }
    }

    const bankAccounts = accounts.map((acc: Record<string, unknown>) => ({
      id: acc.AccountID || acc.BankAccountID,
      name: acc.Name || acc.name,
      code: acc.Code || acc.code,
      balance: typeof acc.Balance === "number" ? acc.Balance :
               typeof acc.balance === "number" ? acc.balance :
               parseFloat(String(acc.Balance || acc.balance || "0")),
      currency: acc.CurrencyCode || acc.currencyCode || "AUD",
      type: acc.Type || acc.type || "BANK",
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
    console.error("[/api/bank]", msg);
    return NextResponse.json({
      ok: false,
      error: msg,
      bankAccounts: [],
      updatedAt: new Date().toISOString(),
    }, { status: 500 });
  }
}
