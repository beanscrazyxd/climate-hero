# Carbon Tracker (Ledger)

A client-only React app for tracking personal carbon footprint. No backend, no database — everything lives in the browser via `localStorage`.

## Tech Stack

- **PNPM**: Prefer pnpm
- **Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3
- **Data**: `localStorage`, accessed through `client/lib/api-client.ts`
- **UI**: Radix UI + TailwindCSS 3 + Lucide React icons + Recharts

## Project Structure

```
client/
├── pages/
│   ├── Index.tsx          # home: log form, today's meter, trend, breakdown, insights
│   ├── History.tsx        # full ledger of past entries, deletable
│   └── NotFound.tsx
├── components/
│   ├── LogEntryForm.tsx
│   ├── LedgerMeter.tsx
│   ├── TrendChart.tsx
│   ├── CategoryBreakdown.tsx
│   ├── InsightsPanel.tsx
│   └── ui/                # shadcn-style primitives (button, card, select, input, sonner)
├── lib/
│   ├── api-client.ts       # all data logic: reads/writes localStorage, computes summaries
│   └── utils.ts             # cn() helper
├── App.tsx                  # router + react-query provider
└── global.css                # design tokens (the "Ledger" theme)

shared/
├── api.ts                    # shared TypeScript types (incl. gamification types)
├── activities.ts               # emission factor reference data (travel/home/food/shopping)
└── actions.ts                   # action plan definitions + level/points curve
```

## Theme: "Climate Hero"

Dark navy/indigo background, mint-green primary accent, category colors (travel=amber, home=violet, food=emerald, shopping=orange). Points and levels persist in `localStorage` under `climate-hero:game`; entries persist under `climate-hero:entries`.

## Data model

All entries are stored under one `localStorage` key (`carbon-tracker:entries`) as a JSON array of `LogEntry` objects (see `shared/api.ts`). `client/lib/api-client.ts` exposes the same function names a server API would (`fetchSummary`, `fetchInsights`, `fetchEntries`, `createEntry`, `deleteEntry`), so pages don't know or care that there's no network involved — they just call these like they were async API calls.

If a real backend is wanted later, swap the internals of `api-client.ts` for real `fetch()` calls — the page components shouldn't need to change.

## Development Commands

```bash
pnpm install
pnpm dev         # start dev server at localhost:8080
pnpm build       # production build to dist/spa
pnpm typecheck   # TypeScript validation
pnpm test        # run Vitest tests
```

## Adding Features

### Add a new loggable activity
Edit `shared/activities.ts` — add an entry to `ACTIVITY_OPTIONS` with its category, label, unit, and `kgCo2ePerUnit`.

### Add new colors to the theme
Edit `client/global.css` (CSS variables) and `tailwind.config.ts` (Tailwind color mappings).

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Deployment

Since this is a static SPA with no backend, it deploys anywhere that serves static files: Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc. Just run `pnpm build` and deploy the `dist/spa` folder.

## Known limitation

Data lives only in the browser that logged it — clearing browser storage, using a different browser, or a different device means a fresh/empty ledger. There's no sync across devices in this version.
