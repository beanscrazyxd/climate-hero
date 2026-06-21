import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Home as HomeIcon, Zap, Lightbulb, Users } from "lucide-react";
import { fetchSummary, fetchInsights, fetchEntries } from "@/lib/api-client";
import { HeroHeader } from "@/components/HeroHeader";
import { JourneyStrip } from "@/components/JourneyStrip";
import { FootprintGauge } from "@/components/FootprintGauge";
import { CategoryDonut } from "@/components/CategoryDonut";
import { TrendChart } from "@/components/TrendChart";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ActionPlan } from "@/components/ActionPlan";
import { LogEntryForm } from "@/components/LogEntryForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Fetch window (days) used purely to check whether the user logged anything today. */
const TODAY_ONLY_WINDOW = 1;

/** Returns today's date as an ISO string (YYYY-MM-DD) in local time. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Index() {
  const summaryQuery = useQuery({ queryKey: ["summary"], queryFn: fetchSummary });
  const insightsQuery = useQuery({ queryKey: ["insights"], queryFn: fetchInsights });
  const entriesQuery = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(TODAY_ONLY_WINDOW),
  });

  const today = todayIso();
  const hasLoggedToday = (entriesQuery.data?.entries ?? []).some((e) => e.loggedAt === today);

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="border-b border-border/60">
        <div className="container flex items-center justify-between py-4">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            🌍 Climate Hero
          </span>
          <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground">
            History
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl py-10">
        <HeroHeader />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: gauge + journey */}
          <Card className="panel">
            <CardContent className="flex flex-col items-center gap-8 pt-8">
              {summaryQuery.data && (
                <FootprintGauge
                  annualProjectedTonnes={summaryQuery.data.annualProjectedTonnes}
                  todayKgCo2e={summaryQuery.data.todayKgCo2e}
                  budgetKgCo2e={summaryQuery.data.dailyBudgetKgCo2e}
                />
              )}
              <div className="w-full">
                <JourneyStrip hasLoggedToday={hasLoggedToday} />
              </div>
            </CardContent>
          </Card>

          {/* Right: donut + insights */}
          <div className="flex flex-col gap-6">
            <Card className="panel">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
                  Your Footprint Brew
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryQuery.data && <CategoryDonut data={summaryQuery.data.byCategory} />}
              </CardContent>
            </Card>

            <Card className="panel">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
                  Personalized Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insightsQuery.data && <InsightsPanel insights={insightsQuery.data.insights} />}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
                Last 14 Days
              </CardTitle>
              <CardDescription>
                Week {summaryQuery.data?.weekKgCo2e.toFixed(1) ?? "—"} kg · Month{" "}
                {summaryQuery.data?.monthKgCo2e.toFixed(1) ?? "—"} kg
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summaryQuery.data && <TrendChart data={summaryQuery.data.dailyTrend} />}
            </CardContent>
          </Card>

          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
                Log an Activity
              </CardTitle>
              <CardDescription>Add something you did today.</CardDescription>
            </CardHeader>
            <CardContent>
              <LogEntryForm />
            </CardContent>
          </Card>
        </div>

        <Card className="panel mt-6">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-[0.15em] text-muted-foreground">
              My Action Plan
            </CardTitle>
            <CardDescription>Complete actions to earn points and level up.</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionPlan />
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}

/**
 * Bottom navigation matching the original mockup. "Dashboard" and "History"
 * are real routes; "Actions" and "Community" aren't built yet, so they're
 * rendered as disabled buttons rather than fake-clickable divs — this keeps
 * the visual layout from the mockup without misleading users or assistive
 * tech into thinking they navigate anywhere.
 */
function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur-sm"
    >
      <div className="container flex max-w-6xl items-center justify-between py-3">
        <NavLink to="/" icon={<HomeIcon className="h-5 w-5" />} label="Dashboard" current={location.pathname === "/"} />
        <NavLink to="/history" icon={<Lightbulb className="h-5 w-5" />} label="Insights" current={location.pathname === "/history"} />
        <NavPlaceholder icon={<Zap className="h-5 w-5" />} label="Actions" />
        <NavPlaceholder icon={<Users className="h-5 w-5" />} label="Community" />
      </div>
    </nav>
  );
}

function NavLink({
  to,
  icon,
  label,
  current,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  current: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={current ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 text-xs ${
        current ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function NavPlaceholder({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      disabled
      aria-label={`${label} (coming soon)`}
      className="flex flex-1 flex-col items-center gap-1 text-xs text-muted-foreground/40"
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
