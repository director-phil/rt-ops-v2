import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const XERO_TENANT_ID = "854c7ae0-43b7-415d-85b3-728a9a3da702";

interface ZapierMCPRequest {
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

async function callZapierMCP(toolName: string, toolArgs: Record<string, unknown>) {
  const mcpUrl = process.env.ZAPIER_MCP_URL;
  if (!mcpUrl) throw new Error("ZAPIER_MCP_URL not configured");

  const body: ZapierMCPRequest = {
    method: "tools/call",
    params: {
      name: toolName,
      arguments: toolArgs,
    },
  };

  const res = await fetch(mcpUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Zapier MCP error ${res.status}: ${txt.slice(0, 300)}`);
  }

  return res.json();
}

export async function GET(_req: NextRequest) {
  try {
    const result = await callZapierMCP("xero_api_request_beta", {
      url: "https://api.xero.com/api.xro/2.0/BankAccounts",
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
