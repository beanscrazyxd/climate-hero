🌍 Climate Hero — Carbon Tracker

A personal carbon footprint tracker that helps you understand, track, and reduce your environmental impact through simple daily actions and personalized insights.

Live demo → (add your Netlify link here after deploying)

What it does


Track activities across four categories — Travel, Home, Food, and Shopping — and see their estimated CO2e impact instantly.
Visualize your footprint with an annual projection gauge, a 14-day trend chart, and a category breakdown donut.
Complete daily actions (Walk to Work, Mindful Meals, Zero Waste, and more) to earn points, level up, and build a real habit — not just look at a chart.
Get personalized insights based on your own logged activity, not generic tips — e.g. "you've logged a lot of beef meals, here's what swapping a few saves you."


Why it matters

Most people don't have a concrete sense of their carbon footprint or what changes actually move the number. Climate Hero closes that gap with:


Real, defensible emission factors (grounded in DEFRA/EPA-style averages), not made-up numbers.
Friction-free logging — pick a category, pick an activity, enter a quantity, done in two taps.
A trend you can see respond to your actions, so the habit sticks.
Light gamification (points, levels) to make tracking feel rewarding instead of like a chore.


Tech stack


React 18 + TypeScript + Vite
TailwindCSS + Radix UI primitives
Recharts for data visualization
localStorage for persistence (no backend, no database — fully client-side)


Running locally

bashpnpm install
pnpm dev

Open http://localhost:8080.

Project structure

client/
├── pages/           # Dashboard (Index) and History routes
├── components/      # Gauge, donut chart, action plan, log form, etc.
└── lib/              # localStorage-backed data layer

shared/
├── activities.ts      # Emission factor reference data
├── actions.ts          # Gamified action definitions + leveling curve
└── api.ts               # Shared TypeScript types

Known limitations


Data is stored per-browser via localStorage — it doesn't sync across devices.
Emission factors are simplified averages for awareness, not audit-grade carbon accounting.


License

MIT
