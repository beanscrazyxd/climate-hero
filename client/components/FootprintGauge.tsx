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
  const ratio = budgetKgCo2e > 0 ? Math.min(todayKgCo2e / budgetKgCo2e, 1.4) : 0;
  const overBudget = todayKgCo2e > budgetKgCo2e;

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(ratio, 1);
  const dashOffset = circumference * (1 - pct);

  const ringColor = overBudget ? "#FB923C" : "hsl(var(--primary))";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-[200px] w-[200px] items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute h-full w-full -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              filter: `drop-shadow(0 0 8px ${ringColor})`,
              transition: "stroke-dashoffset 0.6s ease",
            }}
          />
        </svg>
        <div className="flex flex-col items-center">
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
