import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { ActivityCategory, CategoryTotal } from "@shared/api";

interface CategoryDonutProps {
  data: CategoryTotal[];
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  travel: "Travel",
  home: "Home",
  food: "Food",
  shopping: "Shopping",
};

const CATEGORY_HEX: Record<ActivityCategory, string> = {
  travel: "#F2A33C",
  home: "#8B7CF6",
  food: "#34D399",
  shopping: "#FB923C",
};

const ALL_CATEGORIES: ActivityCategory[] = ["travel", "home", "food", "shopping"];

export function CategoryDonut({ data }: CategoryDonutProps) {
  const total = data.reduce((s, d) => s + d.kgCo2e, 0);

  // Always show all 4 categories (even at 0) so legend stays stable.
  const merged = ALL_CATEGORIES.map((category) => {
    const found = data.find((d) => d.category === category);
    return { category, kgCo2e: found?.kgCo2e ?? 0 };
  });

  const chartData = merged.map((d) => ({
    name: CATEGORY_LABELS[d.category],
    value: total > 0 ? d.kgCo2e : 1, // even slices as placeholder when empty
    category: d.category,
  }));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={56}
              outerRadius={78}
              paddingAngle={total > 0 ? 3 : 0}
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_HEX[entry.category as ActivityCategory]}
                  opacity={total > 0 ? 1 : 0.25}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {merged.map((d) => {
          const pct = total > 0 ? Math.round((d.kgCo2e / total) * 100) : 0;
          return (
            <div key={d.category} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_HEX[d.category] }}
              />
              <span className="text-muted-foreground">{CATEGORY_LABELS[d.category]}</span>
              <span className="ml-auto font-mono-data text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
