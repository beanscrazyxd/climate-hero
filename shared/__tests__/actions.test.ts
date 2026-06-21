import { describe, it, expect } from "vitest";
import { ACTION_DEFINITIONS, getActionById, getLevelInfo } from "../actions";

describe("actions", () => {
  it("getActionById returns the matching action", () => {
    const action = getActionById("walk-to-work");
    expect(action).toBeDefined();
    expect(action?.title).toBe("Walk to Work");
    expect(action?.points).toBeGreaterThan(0);
  });

  it("getActionById returns undefined for an unknown id", () => {
    expect(getActionById("not-a-real-action")).toBeUndefined();
  });

  it("every action has positive points", () => {
    for (const action of ACTION_DEFINITIONS) {
      expect(action.points).toBeGreaterThan(0);
    }
  });

  it("action ids are unique", () => {
    const ids = ACTION_DEFINITIONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getLevelInfo", () => {
  it("starts at level 1 with 0 points", () => {
    const info = getLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.pointsIntoLevel).toBe(0);
  });

  it("advances a level after crossing 100 points", () => {
    const info = getLevelInfo(100);
    expect(info.level).toBe(2);
    expect(info.pointsIntoLevel).toBe(0);
  });

  it("tracks partial progress within a level", () => {
    const info = getLevelInfo(150);
    expect(info.level).toBe(2);
    expect(info.pointsIntoLevel).toBe(50);
  });

  it("caps at the highest defined level title", () => {
    const info = getLevelInfo(100000);
    expect(info.title).toBeDefined();
    expect(typeof info.title).toBe("string");
  });

  it("never returns a negative pointsIntoLevel", () => {
    for (const pts of [0, 1, 99, 100, 250, 999]) {
      expect(getLevelInfo(pts).pointsIntoLevel).toBeGreaterThanOrEqual(0);
    }
  });
});
