import * as Icons from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACTION_DEFINITIONS } from "@shared/actions";
import { completeAction, fetchGameState, isActionCompletedToday } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

/** Only the first N actions are shown on the dashboard to keep the list scannable. */
const ACTIONS_SHOWN_ON_DASHBOARD = 5;

export function ActionPlan() {
  const queryClient = useQueryClient();
  const gameQuery = useQuery({ queryKey: ["game"], queryFn: fetchGameState });

  const mutation = useMutation({
    mutationFn: completeAction,
    onSuccess: (_data, actionId) => {
      // Completing an action can change points, today's log, and insights —
      // invalidate everything that derives from logged activity.
      queryClient.invalidateQueries({ queryKey: ["game"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      const action = ACTION_DEFINITIONS.find((a) => a.id === actionId);
      if (action) toast.success(`+${action.points} pts — ${action.title} complete`);
    },
    onError: () => toast.error("Couldn't complete that action."),
  });

  const game = gameQuery.data;
  const visibleActions = ACTION_DEFINITIONS.slice(0, ACTIONS_SHOWN_ON_DASHBOARD);

  return (
    <ul className="flex flex-col gap-3" aria-label="Today's action plan">
      {visibleActions.map((action) => {
        const Icon = (Icons as Record<string, typeof Icons.Sparkles>)[action.icon] ?? Icons.Sparkles;
        const done = game ? isActionCompletedToday(game, action.id) : false;

        return (
          <li
            key={action.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              done
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-secondary/40 hover:bg-secondary/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  done ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono-data text-sm text-primary" aria-hidden="true">
                +{action.points} pts
              </span>
              <Button
                size="sm"
                variant={done ? "secondary" : "default"}
                disabled={done || mutation.isPending}
                onClick={() => mutation.mutate(action.id)}
                aria-label={
                  done
                    ? `${action.title} already completed today`
                    : `Complete ${action.title} for ${action.points} points`
                }
              >
                {done ? "Done" : "Do it"}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
