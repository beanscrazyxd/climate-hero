import { ActionDefinition, LevelInfo } from "./api";

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    id: "walk-to-work",
    title: "Walk to Work",
    description: "Skip the car for one commute today.",
    points: 40,
    icon: "Footprints",
    logsActivityId: "bike-walk-km",
    logsQuantity: 5,
  },
  {
    id: "mindful-meal",
    title: "Mindful Meals",
    description: "Choose a vegetarian or vegan meal today.",
    points: 30,
    icon: "Salad",
    logsActivityId: "meal-vegetarian",
    logsQuantity: 1,
  },
  {
    id: "energy-save",
    title: "Energy Save",
    description: "Switch off devices and lights you're not using.",
    points: 20,
    icon: "Lightbulb",
  },
  {
    id: "zero-waste",
    title: "Zero Waste",
    description: "Recycle or compost instead of landfill today.",
    points: 20,
    icon: "Recycle",
    logsActivityId: "waste-recycled-bag",
    logsQuantity: 1,
  },
  {
    id: "green-transit",
    title: "Green Transit",
    description: "Take the bus or train instead of driving.",
    points: 35,
    icon: "Bus",
    logsActivityId: "bus-km",
    logsQuantity: 8,
  },
  {
    id: "plant-power",
    title: "Plant Power",
    description: "Go fully plant-based for one meal.",
    points: 30,
    icon: "Sprout",
    logsActivityId: "meal-vegan",
    logsQuantity: 1,
  },
  {
    id: "secondhand-find",
    title: "Buy Secondhand",
    description: "Choose pre-owned over new for one purchase.",
    points: 25,
    icon: "ShoppingBag",
    logsActivityId: "secondhand-item",
    logsQuantity: 1,
  },
  {
    id: "led-switch",
    title: "Switch to LED",
    description: "Swap one bulb at home to LED.",
    points: 15,
    icon: "Lightbulb",
    logsActivityId: "led-bulb-day",
    logsQuantity: 1,
  },
];

/** Finds an action definition by id, or undefined if it doesn't exist. */
export function getActionById(id: string): ActionDefinition | undefined {
  return ACTION_DEFINITIONS.find((a) => a.id === id);
}

/** Points required to advance from one level to the next. */
const POINTS_PER_LEVEL = 100;

/**
 * Rank titles in ascending order. Once a user reaches the last title they
 * remain "Planet Guardian" regardless of further point accumulation — the
 * level number still increments, but the displayed rank caps here.
 */
const LEVEL_TITLES = [
  "Newcomer",
  "Eco Apprentice",
  "Green Scout",
  "Climate Hero",
  "Carbon Slayer",
  "Planet Guardian",
] as const;

/** Index of the highest-titled level (zero-based). */
const MAX_TITLE_INDEX = LEVEL_TITLES.length - 1;

/**
 * Converts total accumulated points into a level number, title, and
 * progress toward the next level.
 *
 * Once the user reaches the final title tier, `pointsIntoLevel` continues
 * to accumulate indefinitely (no artificial cap on displayed progress),
 * while `pointsForNextLevel` signals "no next level" by returning `null`.
 *
 * @param totalPoints - Lifetime accumulated points; must be >= 0.
 */
export function getLevelInfo(totalPoints: number): LevelInfo {
  const rawLevelIndex = Math.floor(totalPoints / POINTS_PER_LEVEL);
  const isCapped = rawLevelIndex >= LEVEL_TITLES.length;
  const titleIndex = Math.min(rawLevelIndex, MAX_TITLE_INDEX);

  // When capped, points keep accumulating from the start of the final tier.
  const tierStart = isCapped
    ? MAX_TITLE_INDEX * POINTS_PER_LEVEL
    : titleIndex * POINTS_PER_LEVEL;
  const pointsIntoLevel = totalPoints - tierStart;

  return {
    level: rawLevelIndex + 1,
    title: LEVEL_TITLES[titleIndex],
    pointsIntoLevel,
    pointsForNextLevel: POINTS_PER_LEVEL,
  };
}
