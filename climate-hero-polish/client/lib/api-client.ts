import { ACTIVITY_OPTIONS, DAILY_BUDGET_KG_CO2E, getActivityById } from "@shared/activities";
import { ACTION_DEFINITIONS, getActionById } from "@shared/actions";
import type {
  ActivityCategory,
  CategoryTotal,
  CompletedAction,
  DailyTotal,
  GameState,
  Insight,
  LogEntry,
  SummaryResponse,
} from "@shared/api";

/**
 * localStorage-backed data layer for the whole app. There's no backend —
 * every "fetch" here is synchronous local storage access wrapped in a
 * Promise so the calling React Query code doesn't need to change if a real
 * API is added later.
 */

const ENTRIES_KEY = "climate-hero:entries";
const GAME_KEY = "climate-hero:game";

const DAYS_IN_TREND = 14;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH_WINDOW = 30;
const DAYS_PER_YEAR = 365;

/**
 * Estimated fraction of an activity's footprint that's realistically
 * avoidable by following the paired insight. These are rough, illustrative
 * multipliers (not derived from a model) — e.g. swapping ~60% of petrol-car
 * trips to transit, or diverting ~70% of new purchases to secondhand.
 */
const INSIGHT_SAVINGS_FACTOR = {
  carToTransit: 0.6,
  beefToPlantBased: 0.5,
  ledLighting: 0.12,
  buySecondhand: 0.7,
} as const;

/** Minimum accumulated kg CO2e in the last 30 days before an insight is worth surfacing. */
const INSIGHT_THRESHOLD_KG = {
  carPetrol: 5,
  beef: 6,
  electricity: 10,
  newClothing: 8,
} as const;

function readEntries(): LogEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeEntries(entries: LogEntry[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function readGame(): GameState {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return { totalPoints: 0, completedActions: [] };
    return JSON.parse(raw) as GameState;
  } catch {
    return { totalPoints: 0, completedActions: [] };
  }
}

function writeGame(state: GameState) {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Rounds to 3 decimal places — enough precision for kg CO2e without float noise. */
function roundKg(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Rounds to 1 decimal place — used for the rougher "potential savings" estimates. */
function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function uuid() {
  return crypto.randomUUID();
}

// ---- Entries ----

/** Returns logged entries from the last `days` days, newest first. */
export async function fetchEntries(days = 60): Promise<{ entries: LogEntry[] }> {
  const sinceStr = isoDate(daysAgo(days));
  const entries = readEntries()
    .filter((e) => e.loggedAt >= sinceStr)
    .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1) || (a.createdAt < b.createdAt ? 1 : -1));
  return { entries };
}

/** Looks up the activity's emission factor, computes kg CO2e, and persists the entry. */
export async function createEntry(payload: {
  activityId: string;
  quantity: number;
  loggedAt?: string;
}): Promise<{ entry: LogEntry }> {
  const activity = getActivityById(payload.activityId);
  if (!activity) throw new Error(`Unknown activity: ${payload.activityId}`);

  const entry: LogEntry = {
    id: uuid(),
    activityId: activity.id,
    category: activity.category,
    label: activity.label,
    quantity: payload.quantity,
    unit: activity.unit,
    kgCo2e: roundKg(activity.kgCo2ePerUnit * payload.quantity),
    loggedAt: payload.loggedAt ?? isoDate(new Date()),
    createdAt: new Date().toISOString(),
  };

  writeEntries([...readEntries(), entry]);
  return { entry };
}

export async function deleteEntry(id: string): Promise<void> {
  writeEntries(readEntries().filter((e) => e.id !== id));
}

// ---- Summary ----

/**
 * Aggregates logged entries into the dashboard's headline numbers: today's
 * total, rolling week/month totals, a 14-day daily trend (zero-filled for
 * days with no entries), and a per-category breakdown.
 */
export async function fetchSummary(): Promise<SummaryResponse> {
  const today = isoDate(new Date());
  const weekAgoStr = isoDate(daysAgo(DAYS_IN_WEEK));
  const monthAgoStr = isoDate(daysAgo(DAYS_IN_MONTH_WINDOW));
  const trendStartStr = isoDate(daysAgo(DAYS_IN_TREND - 1));

  const entriesInMonth = readEntries().filter((e) => e.loggedAt >= monthAgoStr);
  const entriesInTrendWindow = readEntries().filter((e) => e.loggedAt >= trendStartStr);

  let todayKgCo2e = 0;
  let weekKgCo2e = 0;
  let monthKgCo2e = 0;

  const dailyTotals = new Map<string, number>();
  const categoryTotals = new Map<ActivityCategory, number>();

  for (const entry of entriesInMonth) {
    if (entry.loggedAt === today) todayKgCo2e += entry.kgCo2e;
    if (entry.loggedAt >= weekAgoStr) weekKgCo2e += entry.kgCo2e;
    monthKgCo2e += entry.kgCo2e;
    categoryTotals.set(entry.category, (categoryTotals.get(entry.category) ?? 0) + entry.kgCo2e);
  }

  for (const entry of entriesInTrendWindow) {
    dailyTotals.set(entry.loggedAt, (dailyTotals.get(entry.loggedAt) ?? 0) + entry.kgCo2e);
  }

  const dailyTrend: DailyTotal[] = [];
  for (let i = DAYS_IN_TREND - 1; i >= 0; i--) {
    const key = isoDate(daysAgo(i));
    dailyTrend.push({ date: key, kgCo2e: roundKg(dailyTotals.get(key) ?? 0) });
  }

  const byCategory: CategoryTotal[] = Array.from(categoryTotals.entries()).map(
    ([category, kgCo2e]) => ({ category, kgCo2e: roundKg(kgCo2e) }),
  );

  // Project an annual total by extrapolating the last 30 days of data out
  // to a full year, then convert kg -> tonnes (divide by 1000).
  const annualProjectedTonnes =
    Math.round(((monthKgCo2e * (DAYS_PER_YEAR / DAYS_IN_MONTH_WINDOW)) / 1000) * 10) / 10;

  return {
    todayKgCo2e: roundKg(todayKgCo2e),
    weekKgCo2e: roundKg(weekKgCo2e),
    monthKgCo2e: roundKg(monthKgCo2e),
    annualProjectedTonnes,
    dailyTrend,
    byCategory,
    dailyBudgetKgCo2e: DAILY_BUDGET_KG_CO2E,
  };
}

// ---- Insights ----

/**
 * Simple rule-based insights: each rule checks whether a specific activity's
 * accumulated footprint over the last 30 days crosses a threshold, and if
 * so, suggests a concrete swap with an estimated savings. This is
 * intentionally not a general model — it's a small, readable set of checks
 * tied to the activities defined in shared/activities.ts.
 */
export async function fetchInsights(): Promise<{ insights: Insight[] }> {
  const monthAgoStr = isoDate(daysAgo(DAYS_IN_MONTH_WINDOW));
  const recentEntries = readEntries().filter((e) => e.loggedAt >= monthAgoStr);

  const totalsByActivity = new Map<string, { kgCo2e: number; category: ActivityCategory }>();
  for (const entry of recentEntries) {
    const prev = totalsByActivity.get(entry.activityId);
    totalsByActivity.set(entry.activityId, {
      kgCo2e: (prev?.kgCo2e ?? 0) + entry.kgCo2e,
      category: entry.category,
    });
  }

  const insights: Insight[] = [];

  const carPetrol = totalsByActivity.get("car-petrol-km");
  if (carPetrol && carPetrol.kgCo2e > INSIGHT_THRESHOLD_KG.carPetrol) {
    insights.push({
      id: "swap-car-for-train",
      title: "Reduce travel footprint",
      body: "Use public transit for a few of your regular drives — rail and bus both cut emissions per km substantially compared to solo driving.",
      category: "travel",
      potentialSavingKgCo2e: roundToOneDecimal(
        carPetrol.kgCo2e * INSIGHT_SAVINGS_FACTOR.carToTransit,
      ),
    });
  }

  const beef = totalsByActivity.get("meal-beef");
  if (beef && beef.kgCo2e > INSIGHT_THRESHOLD_KG.beef) {
    insights.push({
      id: "reduce-beef-meals",
      title: "Swap a beef meal for plant-based",
      body: "Beef has one of the highest emission factors of any common food. Replacing a few meals a week adds up fast.",
      category: "food",
      potentialSavingKgCo2e: roundToOneDecimal(
        beef.kgCo2e * INSIGHT_SAVINGS_FACTOR.beefToPlantBased,
      ),
    });
  }

  const electricity = totalsByActivity.get("electricity-kwh");
  if (electricity && electricity.kgCo2e > INSIGHT_THRESHOLD_KG.electricity) {
    insights.push({
      id: "switch-to-led",
      title: "Switch to LED lighting",
      body: "LED bulbs use a fraction of the energy of incandescent lighting — an easy way to trim home energy use.",
      category: "home",
      potentialSavingKgCo2e: roundToOneDecimal(
        electricity.kgCo2e * INSIGHT_SAVINGS_FACTOR.ledLighting,
      ),
    });
  }

  const newClothing = totalsByActivity.get("new-clothing-item");
  if (newClothing && newClothing.kgCo2e > INSIGHT_THRESHOLD_KG.newClothing) {
    insights.push({
      id: "buy-secondhand",
      title: "Try secondhand for your next purchase",
      body: "New clothing and goods carry a heavy manufacturing footprint. Buying pre-owned avoids most of that impact.",
      category: "shopping",
      potentialSavingKgCo2e: roundToOneDecimal(
        newClothing.kgCo2e * INSIGHT_SAVINGS_FACTOR.buySecondhand,
      ),
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "log-more-to-unlock-insights",
      title: "Log a few more days to unlock insights",
      body: "Track activity across travel, home, food, and shopping for a week or so, and this panel will surface the highest-impact changes for you.",
      category: "travel",
      potentialSavingKgCo2e: 0,
    });
  }

  return { insights };
}

// ---- Gamification ----

export async function fetchGameState(): Promise<GameState> {
  return readGame();
}

/**
 * Marks an action as completed for today, awarding its points exactly once
 * per calendar day. If the action is configured to also log a real
 * activity (via `logsActivityId`), that entry is created too, so points and
 * footprint data stay consistent with each other.
 */
export async function completeAction(actionId: string): Promise<{
  game: GameState;
  loggedEntry: LogEntry | null;
}> {
  const action = getActionById(actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);

  const game = readGame();
  const alreadyCompletedToday = isActionCompletedToday(game, actionId);

  let loggedEntry: LogEntry | null = null;

  if (!alreadyCompletedToday) {
    const completed: CompletedAction = { actionId, completedAt: new Date().toISOString() };
    game.completedActions.push(completed);
    game.totalPoints += action.points;
    writeGame(game);

    if (action.logsActivityId) {
      const { entry } = await createEntry({
        activityId: action.logsActivityId,
        quantity: action.logsQuantity ?? 1,
      });
      loggedEntry = entry;
    }
  }

  return { game: readGame(), loggedEntry };
}

export function isActionCompletedToday(game: GameState, actionId: string): boolean {
  const today = isoDate(new Date());
  return game.completedActions.some(
    (c) => c.actionId === actionId && c.completedAt.slice(0, 10) === today,
  );
}

export { ACTIVITY_OPTIONS, ACTION_DEFINITIONS };
