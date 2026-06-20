import { ActivityOption } from "./api";

/**
 * Simplified, illustrative emission factors (kg CO2e per unit).
 * Loosely based on public averages (EPA / DEFRA / Our World in Data style figures).
 * Approximations for personal awareness, not audit-grade accounting.
 */
export const ACTIVITY_OPTIONS: ActivityOption[] = [
  // Travel
  { id: "car-petrol-km", category: "travel", label: "Drove a petrol car", unit: "km", kgCo2ePerUnit: 0.192 },
  { id: "car-diesel-km", category: "travel", label: "Drove a diesel car", unit: "km", kgCo2ePerUnit: 0.171 },
  { id: "car-ev-km", category: "travel", label: "Drove an electric car", unit: "km", kgCo2ePerUnit: 0.053 },
  { id: "bus-km", category: "travel", label: "Rode the bus", unit: "km", kgCo2ePerUnit: 0.105 },
  { id: "train-km", category: "travel", label: "Rode the train", unit: "km", kgCo2ePerUnit: 0.041 },
  { id: "flight-short-km", category: "travel", label: "Flew (short-haul)", unit: "km", kgCo2ePerUnit: 0.255 },
  { id: "bike-walk-km", category: "travel", label: "Walked or cycled", unit: "km", kgCo2ePerUnit: 0, hint: "Zero tailpipe emissions" },

  // Home (energy)
  { id: "electricity-kwh", category: "home", label: "Home electricity used", unit: "kWh", kgCo2ePerUnit: 0.39 },
  { id: "gas-kwh", category: "home", label: "Natural gas heating used", unit: "kWh", kgCo2ePerUnit: 0.18 },
  { id: "hot-water-shower", category: "home", label: "Hot shower", unit: "shower", kgCo2ePerUnit: 0.5 },
  { id: "led-bulb-day", category: "home", label: "Day using LED lighting", unit: "day", kgCo2ePerUnit: 0.02, hint: "vs incandescent" },

  // Food
  { id: "meal-beef", category: "food", label: "Beef-based meal", unit: "meal", kgCo2ePerUnit: 6.6 },
  { id: "meal-chicken", category: "food", label: "Chicken-based meal", unit: "meal", kgCo2ePerUnit: 1.6 },
  { id: "meal-vegetarian", category: "food", label: "Vegetarian meal", unit: "meal", kgCo2ePerUnit: 0.9 },
  { id: "meal-vegan", category: "food", label: "Vegan meal", unit: "meal", kgCo2ePerUnit: 0.6 },
  { id: "dairy-glass", category: "food", label: "Glass of dairy milk", unit: "glass", kgCo2ePerUnit: 0.4 },

  // Shopping (incl. waste folded in here to match the 4-category mockup)
  { id: "online-package", category: "shopping", label: "Online order delivered", unit: "package", kgCo2ePerUnit: 1.0 },
  { id: "new-clothing-item", category: "shopping", label: "Bought a new clothing item", unit: "item", kgCo2ePerUnit: 8.0 },
  { id: "waste-landfill-bag", category: "shopping", label: "Bag of landfill trash", unit: "bag", kgCo2ePerUnit: 1.2 },
  { id: "waste-recycled-bag", category: "shopping", label: "Bag of recycling", unit: "bag", kgCo2ePerUnit: 0.3 },
  { id: "secondhand-item", category: "shopping", label: "Bought secondhand instead of new", unit: "item", kgCo2ePerUnit: 0.5, hint: "Avoided footprint vs new" },
];

export function getActivityById(id: string): ActivityOption | undefined {
  return ACTIVITY_OPTIONS.find((a) => a.id === id);
}

/** Reasonable personal daily budget, based on global 2050 net-zero pathways (~2 tons/year). */
export const DAILY_BUDGET_KG_CO2E = 5.5;
