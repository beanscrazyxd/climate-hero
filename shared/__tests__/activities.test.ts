import { describe, it, expect } from "vitest";
import { ACTIVITY_OPTIONS, getActivityById, DAILY_BUDGET_KG_CO2E } from "../activities";

describe("activities", () => {
  it("getActivityById returns the matching activity", () => {
    const activity = getActivityById("car-petrol-km");
    expect(activity).toBeDefined();
    expect(activity?.label).toBe("Drove a petrol car");
    expect(activity?.category).toBe("travel");
    expect(activity?.unit).toBe("km");
  });

  it("getActivityById returns undefined for an unknown id", () => {
    expect(getActivityById("not-a-real-activity")).toBeUndefined();
  });

  it("every activity has a non-negative emission factor", () => {
    for (const activity of ACTIVITY_OPTIONS) {
      expect(activity.kgCo2ePerUnit).toBeGreaterThanOrEqual(0);
    }
  });

  it("every activity belongs to one of the four known categories", () => {
    const validCategories = ["travel", "home", "food", "shopping"];
    for (const activity of ACTIVITY_OPTIONS) {
      expect(validCategories).toContain(activity.category);
    }
  });

  it("walking/cycling has zero emissions", () => {
    const activity = getActivityById("bike-walk-km");
    expect(activity?.kgCo2ePerUnit).toBe(0);
  });

  it("exposes a positive daily budget", () => {
    expect(DAILY_BUDGET_KG_CO2E).toBeGreaterThan(0);
  });

  it("activity ids are unique", () => {
    const ids = ACTIVITY_OPTIONS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
