import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, ArrowLeft } from "lucide-react";
import { fetchEntries, deleteEntry } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** How many days of history to fetch and display on this page. */
const HISTORY_WINDOW_DAYS = 60;

/** Formats an ISO date string (YYYY-MM-DD) into a human-readable label. */
function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function History() {
  const queryClient = useQueryClient();
  const entriesQuery = useQuery({
    queryKey: ["entries"],
    queryFn: () => fetchEntries(HISTORY_WINDOW_DAYS),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => {
      // Removing an entry changes totals and insights elsewhere in the app too.
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success("Entry removed");
    },
    onError: () => toast.error("Couldn't remove that entry."),
  });

  const entries = entriesQuery.data?.entries ?? [];
  const groupedByDay = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    (acc[entry.loggedAt] ??= []).push(entry);
    return acc;
  }, {});
  const days = Object.keys(groupedByDay).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container flex items-center gap-3 py-4">
          <Link
            to="/"
            aria-label="Back to dashboard"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <span className="font-display text-lg font-bold tracking-tight">History</span>
        </div>
      </header>

      <main className="container max-w-2xl py-8">
        <p className="text-sm text-muted-foreground">
          Everything you've logged over the last {HISTORY_WINDOW_DAYS} days.
        </p>

        <div className="mt-6 flex flex-col gap-6" aria-live="polite">
          {entriesQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {entriesQuery.isError && (
            <Card className="panel">
              <CardContent className="py-10 text-center text-sm text-destructive">
                Something went wrong loading your history. Please refresh to try again.
              </CardContent>
            </Card>
          )}

          {!entriesQuery.isLoading && !entriesQuery.isError && entries.length === 0 && (
            <Card className="panel">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nothing logged yet. Head back to{" "}
                <Link to="/" className="text-primary underline-offset-4 hover:underline">
                  the dashboard
                </Link>{" "}
                to add your first entry.
              </CardContent>
            </Card>
          )}

          {days.map((day) => {
            const dayEntries = groupedByDay[day];
            const dayTotal = dayEntries.reduce((sum, e) => sum + e.kgCo2e, 0);
            return (
              <Card key={day} className="panel">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {formatDate(day)}
                  </CardTitle>
                  <span className="font-mono-data text-sm font-semibold text-primary">
                    {dayTotal.toFixed(2)} kg
                  </span>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul>
                    {dayEntries.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between border-t border-border/60 py-2.5 first:border-t-0"
                      >
                        <div>
                          <p className="text-sm">{entry.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.quantity} {entry.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono-data text-sm">
                            {entry.kgCo2e.toFixed(2)} kg
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(entry.id)}
                            aria-label={`Delete ${entry.label} entry from ${formatDate(day)}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
