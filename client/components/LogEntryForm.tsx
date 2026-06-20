import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ACTIVITY_OPTIONS } from "@shared/activities";
import type { ActivityCategory } from "@shared/api";
import { createEntry } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  travel: "Travel",
  home: "Home",
  food: "Food",
  shopping: "Shopping",
};

const CATEGORIES: ActivityCategory[] = ["travel", "home", "food", "shopping"];

export function LogEntryForm() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<ActivityCategory>("travel");
  const [activityId, setActivityId] = useState<string>(
    ACTIVITY_OPTIONS.find((a) => a.category === "travel")?.id ?? "",
  );
  const [quantity, setQuantity] = useState<string>("1");

  const optionsForCategory = ACTIVITY_OPTIONS.filter((a) => a.category === category);
  const selected = optionsForCategory.find((a) => a.id === activityId);

  const mutation = useMutation({
    mutationFn: createEntry,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
      toast.success(`Logged ${data.entry.kgCo2e.toFixed(2)} kg CO2e — ${data.entry.label}`);
      setQuantity("1");
    },
    onError: () => toast.error("Couldn't save that entry."),
  });

  function handleCategoryChange(next: ActivityCategory) {
    setCategory(next);
    setActivityId(ACTIVITY_OPTIONS.find((a) => a.category === next)?.id ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!activityId || !Number.isFinite(qty) || qty <= 0) {
      toast.error("Enter a quantity greater than zero.");
      return;
    }
    mutation.mutate({ activityId, quantity: qty });
  }

  const estimate = selected ? selected.kgCo2ePerUnit * (Number(quantity) || 0) : 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCategoryChange(c)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 text-foreground hover:bg-secondary/70"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">Activity</label>
        <Select value={activityId} onValueChange={setActivityId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an activity" />
          </SelectTrigger>
          <SelectContent>
            {optionsForCategory.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-muted-foreground">
          Quantity {selected ? `(${selected.unit})` : ""}
        </label>
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {selected?.hint && <p className="text-xs text-muted-foreground">{selected.hint}</p>}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">Estimated</span>
        <span className="font-mono-data text-sm font-semibold text-primary">
          {estimate.toFixed(2)} kg CO2e
        </span>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving…" : "Log activity"}
      </Button>
    </form>
  );
}
