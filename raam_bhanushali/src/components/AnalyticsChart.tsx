"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalyticsChart({
  data,
}: {
  data: {
    name: string;
    views: number;
  }[];
}) {
  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border border-cyan-500">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">
        Portfolio Views Trend
      </h2>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#333" />

            <XAxis dataKey="name" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="views"
              stroke="#22d3ee"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}