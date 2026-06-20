/**
 * Shared types between app modules.
 */

export type ActivityCategory = "travel" | "home" | "food" | "shopping";

export interface ActivityOption {
  id: string;
  category: ActivityCategory;
  label: string;
  unit: string;
  kgCo2ePerUnit: number;
  hint?: string;
}

export interface LogEntry {
  id: string;
  activityId: string;
  category: ActivityCategory;
  label: string;
  quantity: number;
  unit: string;
  kgCo2e: number;
  loggedAt: string; // ISO date, e.g. 2026-06-19
  createdAt: string; // ISO timestamp
}

export interface DailyTotal {
  date: string;
  kgCo2e: number;
}

export interface CategoryTotal {
  category: ActivityCategory;
  kgCo2e: number;
}

export interface SummaryResponse {
  todayKgCo2e: number;
  weekKgCo2e: number;
  monthKgCo2e: number;
  annualProjectedTonnes: number; // month average annualized, in tonnes
  dailyTrend: DailyTotal[];
  byCategory: CategoryTotal[];
  dailyBudgetKgCo2e: number;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  category: ActivityCategory;
  potentialSavingKgCo2e: number;
}

// ---- Gamification ----

export type ActionStatus = "available" | "completed";

export interface ActionDefinition {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string; // lucide icon name
  /** Optional: completing this action also logs a real activity entry */
  logsActivityId?: string;
  logsQuantity?: number;
}

export interface CompletedAction {
  actionId: string;
  completedAt: string;
}

export interface GameState {
  totalPoints: number;
  completedActions: CompletedAction[];
}

export interface LevelInfo {
  level: number;
  title: string;
  pointsIntoLevel: number;
  pointsForNextLevel: number;
}
