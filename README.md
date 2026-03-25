# RT Ops v2 — Reliable Tradies Operations Platform

Live dashboard for Phillip at Reliable Tradies. Covers Finance, Dispatch, Technicians, People, Marketing, Commissions, and Actions.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL (empty = relative paths) |
| `NEXT_PUBLIC_ST_BRIDGE_URL` | ServiceTitan bridge (default: http://localhost:3847) |
| `XERO_CLIENT_ID` | Xero API client ID |
| `XERO_CLIENT_SECRET` | Xero API client secret |
| `XERO_TENANT_ID` | Xero tenant/org ID |

## Deploy to Railway

1. Push to GitHub
2. Connect repo to Railway project
3. Set env vars in Railway dashboard
4. Railway uses `railway.toml` — builder: NIXPACKS, start: `npm start`

## Deploy to Vercel

```bash
vercel --prod
```

## Data Sources

- **Finance:** Xero API (March 2026 P&L verified)
- **Commissions:** ServiceTitan job data (apprentices excluded)
- **Marketing:** Google Ads API
- **Dispatch:** ServiceTitan live data

## Apprentices (no commission)
Sam Liska, Gnoor Singh, Luke Coates, Kyan Davis, Lincoln Boyd
