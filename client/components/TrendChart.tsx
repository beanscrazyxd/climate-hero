import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTotal } from "@shared/api";

interface TrendChartProps {
  data: DailyTotal[];
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatDayLabel(d.date) }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFillHero" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(160 70% 55%)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="hsl(160 70% 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(220 20% 65%)" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(220 20% 65%)" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} kg CO2e`, ""]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid hsl(230 25% 22%)",
              background: "hsl(230 38% 13%)",
              color: "hsl(210 40% 96%)",
            }}
          />
          <Area
            type="monotone"
            dataKey="kgCo2e"
            stroke="hsl(160 70% 55%)"
            strokeWidth={2}
            fill="url(#trendFillHero)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
