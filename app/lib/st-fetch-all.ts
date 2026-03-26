import { getSTToken } from "@/app/lib/st-auth";

export async function stFetchAll(
  path: string,
  params: Record<string, string> = {},
  maxPages = 20
): Promise<unknown[]> {
  const token = await getSTToken();
  const tenantId = process.env.ST_TENANT_ID!;
  const appKey = process.env.ST_APP_KEY!;

  const allItems: unknown[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    const url = new URL(`https://api.servicetitan.io${path.replace("{tenant}", tenantId)}`);
    Object.entries({ ...params, page: String(page), pageSize: params.pageSize || "500" }).forEach(
      ([k, v]) => url.searchParams.set(k, v)
    );

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, "ST-App-Key": appKey },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`ST API ${res.status} on ${url}: ${await res.text()}`);
    }

    const data = await res.json();
    const items = data.data || [];
    allItems.push(...items);

    // Check pagination — ST uses hasMore or totalCount/page
    hasMore = data.hasMore === true || (data.data && data.data.length === Number(params.pageSize || 500));
    page++;
  }

  return allItems;
}
