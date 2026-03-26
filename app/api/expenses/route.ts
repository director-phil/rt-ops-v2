import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const XERO_TENANT_ID = "854c7ae0-43b7-415d-85b3-728a9a3da702";

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
      url: "https://api.xero.com/api.xro/2.0/Invoices?Type=ACCPAY&Status=AUTHORISED",
      method: "GET",
      headers: {
        "Xero-tenant-id": XERO_TENANT_ID,
        Accept: "application/json, text/event-stream",
      },
    });

    let invoices: Record<string, unknown>[] = [];
    const content = result?.result?.content || result?.content || [];
    const textBlock = content.find((c: Record<string, unknown>) => c.type === "text");
    if (textBlock?.text) {
      try {
        const parsed = JSON.parse(textBlock.text as string);
        invoices = parsed.Invoices || parsed.invoices || [];
      } catch {
        const match = (textBlock.text as string).match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          invoices = parsed.Invoices || parsed.invoices || [];
        }
      }
    }

    const now = new Date();

    const expenses = invoices.map((inv: Record<string, unknown>) => {
      const contact = (inv.Contact as Record<string, unknown>) || {};
      const supplier = (contact.Name as string) || (contact.name as string) || "Unknown Supplier";
      const amountDue = (inv.AmountDue as number) || (inv.amountDue as number) || 0;
      const dueDateStr = (inv.DueDate as string) || (inv.dueDate as string) || "";
      
      let daysUntilDue: number | null = null;
      let dueDate: string | null = null;
      
      if (dueDateStr) {
        // Xero dates come as /Date(timestamp)/
        const tsMatch = dueDateStr.match(/\/Date\((\d+)\)\//);
        let due: Date;
        if (tsMatch) {
          due = new Date(parseInt(tsMatch[1]));
        } else {
          due = new Date(dueDateStr);
        }
        dueDate = due.toISOString().split("T")[0];
        daysUntilDue = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        invoiceId: inv.InvoiceID || inv.invoiceId,
        invoiceNumber: inv.InvoiceNumber || inv.invoiceNumber || "",
        supplier,
        amountDue: typeof amountDue === "number" ? amountDue : parseFloat(String(amountDue)) || 0,
        dueDate,
        daysUntilDue,
        currency: (inv.CurrencyCode as string) || "AUD",
        status: (inv.Status as string) || "AUTHORISED",
      };
    });

    // Sort by due date (soonest first), nulls last
    expenses.sort((a, b) => {
      if (a.dueDate === null && b.dueDate === null) return 0;
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });

    const totalOwed = expenses.reduce((s, e) => s + e.amountDue, 0);

    return NextResponse.json({
      ok: true,
      expenses,
      totalOwed: Math.round(totalOwed),
      count: expenses.length,
      updatedAt: new Date().toISOString(),
      source: "Xero via Zapier",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/expenses]", msg);
    return NextResponse.json({
      ok: false,
      error: msg,
      expenses: [],
      updatedAt: new Date().toISOString(),
    }, { status: 500 });
  }
}
