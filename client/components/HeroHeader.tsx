import { useQuery } from "@tanstack/react-query";
import { fetchGameState } from "@/lib/api-client";
import { getLevelInfo } from "@shared/actions";

export function HeroHeader() {
  const gameQuery = useQuery({ queryKey: ["game"], queryFn: fetchGameState });
  const totalPoints = gameQuery.data?.totalPoints ?? 0;
  const level = getLevelInfo(totalPoints);
  const pct = Math.min((level.pointsIntoLevel / level.pointsForNextLevel) * 100, 100);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        User Dashboard
      </span>
      <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        <span className="bg-gradient-to-r from-sky-300 via-primary to-violet-300 bg-clip-text text-transparent">
          CLIMATE HERO
        </span>
      </h1>
      <p className="text-sm text-muted-foreground">Your Carbon Journey</p>

      <div className="mt-3 flex w-full max-w-xs flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary">
            Level {level.level} · {level.title}
          </span>
          <span className="font-mono-data text-muted-foreground">
            {totalPoints} pts
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-sky-400"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
