import { describe, it, expect, beforeEach, vi } from "vitest";

// In-memory localStorage mock for the test environment (vitest's default
// environment is Node, which has no localStorage/crypto.randomUUID by default).
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemoryStorage());
  if (!globalThis.crypto?.randomUUID) {
    vi.stubGlobal("crypto", {
      randomUUID: () => Math.random().toString(36).slice(2),
    });
  }
});

describe("api-client: entries", () => {
  it("createEntry computes kgCo2e correctly and persists it", async () => {
    const { createEntry, fetchEntries } = await import("../api-client");
    const { entry } = await createEntry({ activityId: "car-petrol-km", quantity: 10 });

    expect(entry.kgCo2e).toBeCloseTo(1.92, 3); // 0.192 * 10
    expect(entry.category).toBe("travel");

    const { entries } = await fetchEntries(7);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(entry.id);
  });

  it("createEntry throws for an unknown activity id", async () => {
    const { createEntry } = await import("../api-client");
    await expect(
      createEntry({ activityId: "does-not-exist", quantity: 1 }),
    ).rejects.toThrow();
  });

  it("deleteEntry removes the entry from storage", async () => {
    const { createEntry, deleteEntry, fetchEntries } = await import("../api-client");
    const { entry } = await createEntry({ activityId: "meal-beef", quantity: 1 });
    await deleteEntry(entry.id);

    const { entries } = await fetchEntries(7);
    expect(entries.find((e) => e.id === entry.id)).toBeUndefined();
  });

  it("fetchEntries excludes entries older than the requested window", async () => {
    const { createEntry, fetchEntries } = await import("../api-client");
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 90);

    await createEntry({
      activityId: "meal-vegan",
      quantity: 1,
      loggedAt: oldDate.toISOString().slice(0, 10),
    });

    const { entries } = await fetchEntries(30);
    expect(entries).toHaveLength(0);
  });
});

describe("api-client: summary", () => {
  it("aggregates today's total correctly across multiple entries", async () => {
    const { createEntry, fetchSummary } = await import("../api-client");
    await createEntry({ activityId: "car-petrol-km", quantity: 10 }); // 1.92
    await createEntry({ activityId: "meal-vegan", quantity: 2 }); // 1.2

    const summary = await fetchSummary();
    expect(summary.todayKgCo2e).toBeCloseTo(3.12, 2);
  });

  it("returns a 14-day trend with no gaps", async () => {
    const { fetchSummary } = await import("../api-client");
    const summary = await fetchSummary();
    expect(summary.dailyTrend).toHaveLength(14);
  });

  it("breaks down totals by category", async () => {
    const { createEntry, fetchSummary } = await import("../api-client");
    await createEntry({ activityId: "electricity-kwh", quantity: 5 });

    const summary = await fetchSummary();
    const homeCategory = summary.byCategory.find((c) => c.category === "home");
    expect(homeCategory).toBeDefined();
    expect(homeCategory!.kgCo2e).toBeGreaterThan(0);
  });
});

describe("api-client: gamification", () => {
  it("completeAction awards points exactly once per day", async () => {
    const { completeAction, fetchGameState } = await import("../api-client");

    await completeAction("walk-to-work");
    const afterFirst = await fetchGameState();
    expect(afterFirst.totalPoints).toBe(40);

    // Completing the same action again the same day should not double-award.
    await completeAction("walk-to-work");
    const afterSecond = await fetchGameState();
    expect(afterSecond.totalPoints).toBe(40);
  });

  it("completeAction logs a real activity entry when configured to", async () => {
    const { completeAction } = await import("../api-client");
    const { loggedEntry } = await completeAction("mindful-meal");
    expect(loggedEntry).not.toBeNull();
    expect(loggedEntry?.activityId).toBe("meal-vegetarian");
  });

  it("completeAction throws for an unknown action id", async () => {
    const { completeAction } = await import("../api-client");
    await expect(completeAction("not-a-real-action")).rejects.toThrow();
  });
});
