import type { Insight } from "@shared/api";

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className="rounded-xl border border-border bg-secondary/40 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
            {insight.potentialSavingKgCo2e > 0 && (
              <span className="whitespace-nowrap rounded-full bg-primary/15 px-2 py-0.5 text-xs font-mono-data text-primary">
                −{insight.potentialSavingKgCo2e.toFixed(1)} kg
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
        </div>
      ))}
    </div>
  );
}
