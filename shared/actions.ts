import { ActionDefinition } from "./api";

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

export function getActionById(id: string) {
  return ACTION_DEFINITIONS.find((a) => a.id === id);
}

/** Simple level curve: level n requires n * 100 cumulative points. */
const LEVEL_TITLES = [
  "Newcomer",
  "Eco Apprentice",
  "Green Scout",
  "Climate Hero",
  "Carbon Slayer",
  "Planet Guardian",
];

export function getLevelInfo(totalPoints: number) {
  const pointsPerLevel = 100;
  const level = Math.min(
    Math.floor(totalPoints / pointsPerLevel),
    LEVEL_TITLES.length - 1,
  );
  const pointsIntoLevel = totalPoints - level * pointsPerLevel;
  return {
    level: level + 1,
    title: LEVEL_TITLES[level],
    pointsIntoLevel,
    pointsForNextLevel: pointsPerLevel,
  };
}
