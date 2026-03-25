// ServiceTitan Auth — client credentials token cache

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getSTToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 30000) {
    return cachedToken;
  }

  const res = await fetch("https://auth.servicetitan.io/connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.ST_CLIENT_ID!,
      client_secret: process.env.ST_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`ST auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return cachedToken!;
}

export async function stFetch(path: string, params?: Record<string, string>) {
  const token = await getSTToken();
  const tenantId = process.env.ST_TENANT_ID!;
  const appKey = process.env.ST_APP_KEY!;

  const url = new URL(`https://api.servicetitan.io${path.replace("{tenant}", tenantId)}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "ST-App-Key": appKey,
    },
    next: { revalidate: 300 }, // 5-min cache
  });

  if (!res.ok) {
    throw new Error(`ST API error ${res.status} on ${url}: ${await res.text()}`);
  }

  return res.json();
}
