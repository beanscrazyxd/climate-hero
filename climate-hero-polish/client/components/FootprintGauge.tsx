interface FootprintGaugeProps {
  annualProjectedTonnes: number;
  todayKgCo2e: number;
  budgetKgCo2e: number;
}

export function FootprintGauge({
  annualProjectedTonnes,
  todayKgCo2e,
  budgetKgCo2e,
}: FootprintGaugeProps) {
  const RING_RADIUS = 84;
  const RING_STROKE_WIDTH = 10;
  // Ratio can exceed 1 when over budget, but the ring itself maxes out at a
  // full circle — anything past 100% is communicated via color, not overflow.
  const MAX_VISUAL_RATIO = 1.4;

  const ratio = budgetKgCo2e > 0 ? Math.min(todayKgCo2e / budgetKgCo2e, MAX_VISUAL_RATIO) : 0;
  const overBudget = todayKgCo2e > budgetKgCo2e;

  const circumference = 2 * Math.PI * RING_RADIUS;
  const filledFraction = Math.min(ratio, 1);
  const dashOffset = circumference * (1 - filledFraction);

  const ringColor = overBudget ? "#FB923C" : "hsl(var(--primary))";

  const accessibleSummary = `Projected annual footprint: ${annualProjectedTonnes.toFixed(1)} tonnes CO2. Today's usage is ${
    overBudget ? "over" : "within"
  } the ${budgetKgCo2e.toFixed(1)} kg daily budget.`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative flex h-[200px] w-[200px] items-center justify-center"
        role="img"
        aria-label={accessibleSummary}
      >
        <svg
          viewBox="0 0 200 200"
          className="absolute h-full w-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={RING_STROKE_WIDTH}
          />
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${ringColor})`,
              transition: "stroke-dashoffset 0.6s ease",
            }}
          />
        </svg>
        <div className="flex flex-col items-center" aria-hidden="true">
          <span className="font-display text-5xl font-bold tabular-nums text-foreground">
            {annualProjectedTonnes.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">tonnes CO2</span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Annual Footprint
      </span>
    </div>
  );
}
