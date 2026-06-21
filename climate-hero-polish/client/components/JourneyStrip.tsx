import { Globe2, BarChart3, Zap, Check } from "lucide-react";

interface JourneyStripProps {
  hasLoggedToday: boolean;
}

export function JourneyStrip({ hasLoggedToday }: JourneyStripProps) {
  return (
    <div className="relative flex items-start justify-between px-2 sm:px-8">
      <div className="absolute left-[15%] right-[15%] top-7 h-px border-t-2 border-dashed border-primary/40" />

      <Step
        icon={<Globe2 className="h-6 w-6" />}
        label="UNDERSTAND"
        sub="Know your impact"
        color="border-sky-400/60 text-sky-300"
        active
      />
      <Step
        icon={<BarChart3 className="h-6 w-6" />}
        label="TRACK"
        sub={hasLoggedToday ? "Logged today" : "Log an action"}
        color="border-amber-400/60 text-amber-300"
        active={hasLoggedToday}
        checked={hasLoggedToday}
      />
      <Step
        icon={<Zap className="h-6 w-6" />}
        label="REDUCE"
        sub="Mindful choices"
        color="border-violet-400/60 text-violet-300"
      />
    </div>
  );
}

function Step({
  icon,
  label,
  sub,
  color,
  active,
  checked,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  active?: boolean;
  checked?: boolean;
}) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 text-center">
      <div
        aria-hidden="true"
        className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 bg-card ${color} ${
          active ? "glow-ring" : "opacity-70"
        }`}
      >
        {icon}
        {checked && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sky-400 text-card">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold tracking-wide text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
