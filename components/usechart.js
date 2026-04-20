"use client";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
const data = [
  { name: "1", GPT4: 4000, Claude: 2400 },
  { name: "2", GPT4: 3000, Claude: 1398 },
  { name: "3", GPT4: 2000, Claude: 9800 },
  { name: "4", GPT4: 2780, Claude: 3908 },
  { name: "5", GPT4: 1890, Claude: 4800 },
  { name: "6", GPT4: 2390, Claude: 3800 },
  { name: "7", GPT4: 3490, Claude: 4300 },
  { name: "8", GPT4: 2100, Claude: 3200 },
];

export default function UseChart() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <ResponsiveContainer width="100%" minHeight={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGPT4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9ac6c5" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#9ac6c5" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorClaude" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="rgba(0,0,0,0.1)" vertical={false} />
          <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
          <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Area
            type="monotone"
            dataKey="GPT4"
            stroke="#9ac6c5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGPT4)"
          />
          <Area
            type="monotone"
            dataKey="Claude"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorClaude)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
