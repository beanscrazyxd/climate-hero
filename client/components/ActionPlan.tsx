import * as Icons from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACTION_DEFINITIONS } from "@shared/actions";
import { completeAction, fetchGameState, isActionCompletedToday } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export function ActionPlan() {
  const queryClient = useQueryClient();
  const gameQuery = useQuery({ queryKey: ["game"], queryFn: fetchGameState });

  const mutation = useMutation({
    mutationFn: completeAction,
    onSuccess: (data, actionId) => {
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

  return (
    <div className="flex flex-col gap-3">
      {ACTION_DEFINITIONS.slice(0, 5).map((action) => {
        const Icon = (Icons as any)[action.icon] ?? Icons.Sparkles;
        const done = game ? isActionCompletedToday(game, action.id) : false;

        return (
          <div
            key={action.id}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
              done
                ? "border-primary/40 bg-primary/10"
                : "border-border bg-secondary/40 hover:bg-secondary/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
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
              <span className="font-mono-data text-sm text-primary">+{action.points} pts</span>
              <Button
                size="sm"
                variant={done ? "secondary" : "default"}
                disabled={done || mutation.isPending}
                onClick={() => mutation.mutate(action.id)}
              >
                {done ? "Done" : "Do it"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
