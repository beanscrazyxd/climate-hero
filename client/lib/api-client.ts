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

const ENTRIES_KEY = "climate-hero:entries";
const GAME_KEY = "climate-hero:game";

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

function uuid() {
  return crypto.randomUUID();
}

// ---- Entries ----

export async function fetchEntries(days = 60): Promise<{ entries: LogEntry[] }> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = isoDate(since);
  const entries = readEntries()
    .filter((e) => e.loggedAt >= sinceStr)
    .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1) || (a.createdAt < b.createdAt ? 1 : -1));
  return { entries };
}

export async function createEntry(payload: {
  activityId: string;
  quantity: number;
  loggedAt?: string;
}): Promise<{ entry: LogEntry }> {
  const activity = getActivityById(payload.activityId);
  if (!activity) throw new Error(`Unknown activity: ${payload.activityId}`);

  const kgCo2e = Math.round(activity.kgCo2ePerUnit * payload.quantity * 1000) / 1000;
  const entry: LogEntry = {
    id: uuid(),
    activityId: activity.id,
    category: activity.category,
    label: activity.label,
    quantity: payload.quantity,
    unit: activity.unit,
    kgCo2e,
    loggedAt: payload.loggedAt ?? isoDate(new Date()),
    createdAt: new Date().toISOString(),
  };

  const all = readEntries();
  all.push(entry);
  writeEntries(all);

  return { entry };
}

export async function deleteEntry(id: string): Promise<void> {
  writeEntries(readEntries().filter((e) => e.id !== id));
}

// ---- Summary ----

export async function fetchSummary(): Promise<SummaryResponse> {
  const today = isoDate(new Date());
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = isoDate(weekAgo);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = isoDate(monthAgo);
  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - 13);
  const trendStartStr = isoDate(trendStart);

  const allForMonth = readEntries().filter((e) => e.loggedAt >= monthAgoStr);
  const allForTrend = readEntries().filter((e) => e.loggedAt >= trendStartStr);

  let todayKgCo2e = 0;
  let weekKgCo2e = 0;
  let monthKgCo2e = 0;

  const dailyMap = new Map<string, number>();
  const categoryMap = new Map<ActivityCategory, number>();

  for (const e of allForMonth) {
    if (e.loggedAt === today) todayKgCo2e += e.kgCo2e;
    if (e.loggedAt >= weekAgoStr) weekKgCo2e += e.kgCo2e;
    monthKgCo2e += e.kgCo2e;
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + e.kgCo2e);
  }

  for (const e of allForTrend) {
    dailyMap.set(e.loggedAt, (dailyMap.get(e.loggedAt) ?? 0) + e.kgCo2e);
  }

  const dailyTrend: DailyTotal[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = isoDate(d);
    dailyTrend.push({ date: key, kgCo2e: Math.round((dailyMap.get(key) ?? 0) * 1000) / 1000 });
  }

  const byCategory: CategoryTotal[] = Array.from(categoryMap.entries()).map(
    ([category, kgCo2e]) => ({ category, kgCo2e: Math.round(kgCo2e * 1000) / 1000 }),
  );

  // Annualize from the last 30 days of data (falls back to 0 if no data yet)
  const annualProjectedTonnes = Math.round((monthKgCo2e * (365 / 30)) / 100) / 10;

  return {
    todayKgCo2e: Math.round(todayKgCo2e * 1000) / 1000,
    weekKgCo2e: Math.round(weekKgCo2e * 1000) / 1000,
    monthKgCo2e: Math.round(monthKgCo2e * 1000) / 1000,
    annualProjectedTonnes,
    dailyTrend,
    byCategory,
    dailyBudgetKgCo2e: DAILY_BUDGET_KG_CO2E,
  };
}

// ---- Insights ----

export async function fetchInsights(): Promise<{ insights: Insight[] }> {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoStr = isoDate(monthAgo);

  const all = readEntries().filter((e) => e.loggedAt >= monthAgoStr);

  const byActivity = new Map<string, { kgCo2e: number; category: ActivityCategory }>();
  for (const e of all) {
    const prev = byActivity.get(e.activityId);
    byActivity.set(e.activityId, {
      kgCo2e: (prev?.kgCo2e ?? 0) + e.kgCo2e,
      category: e.category,
    });
  }

  const insights: Insight[] = [];

  const carPetrol = byActivity.get("car-petrol-km");
  if (carPetrol && carPetrol.kgCo2e > 5) {
    insights.push({
      id: "swap-car-for-train",
      title: "Reduce travel footprint",
      body: "Use public transit for a few of your regular drives — rail and bus both cut emissions per km substantially compared to solo driving.",
      category: "travel",
      potentialSavingKgCo2e: Math.round(carPetrol.kgCo2e * 0.6 * 10) / 10,
    });
  }

  const beef = byActivity.get("meal-beef");
  if (beef && beef.kgCo2e > 6) {
    insights.push({
      id: "reduce-beef-meals",
      title: "Swap a beef meal for plant-based",
      body: "Beef has one of the highest emission factors of any common food. Replacing a few meals a week adds up fast.",
      category: "food",
      potentialSavingKgCo2e: Math.round(beef.kgCo2e * 0.5 * 10) / 10,
    });
  }

  const electricity = byActivity.get("electricity-kwh");
  if (electricity && electricity.kgCo2e > 10) {
    insights.push({
      id: "switch-to-led",
      title: "Switch to LED lighting",
      body: "LED bulbs use a fraction of the energy of incandescent lighting — an easy way to trim home energy use.",
      category: "home",
      potentialSavingKgCo2e: Math.round(electricity.kgCo2e * 0.12 * 10) / 10,
    });
  }

  const shopping = byActivity.get("new-clothing-item");
  if (shopping && shopping.kgCo2e > 8) {
    insights.push({
      id: "buy-secondhand",
      title: "Try secondhand for your next purchase",
      body: "New clothing and goods carry a heavy manufacturing footprint. Buying pre-owned avoids most of that impact.",
      category: "shopping",
      potentialSavingKgCo2e: Math.round(shopping.kgCo2e * 0.7 * 10) / 10,
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

export async function completeAction(actionId: string): Promise<{
  game: GameState;
  loggedEntry: LogEntry | null;
}> {
  const action = getActionById(actionId);
  if (!action) throw new Error(`Unknown action: ${actionId}`);

  const game = readGame();
  const already = game.completedActions.some(
    (c) => c.actionId === actionId && c.completedAt.slice(0, 10) === isoDate(new Date()),
  );

  let loggedEntry: LogEntry | null = null;

  if (!already) {
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

export function isActionCompletedToday(game: GameState, actionId: string) {
  const today = isoDate(new Date());
  return game.completedActions.some(
    (c) => c.actionId === actionId && c.completedAt.slice(0, 10) === today,
  );
}

export { ACTIVITY_OPTIONS, ACTION_DEFINITIONS };
