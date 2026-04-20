import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./loginChart.module.css";

export default function LoginChart() {
  const data = [
    { date: "2024-09-01", value: 2 },
    { date: "2024-09-02", value: 5 },
    { date: "2024-09-03", value: 10 },
  ];

  return (
    <>
      <div className={styles.loginChartContainer}>
        <div className={styles.loginChartHeader}>
          <div>
            <h3 className={styles.loginChartTitle}>User Registration Growth</h3>
            <p className={styles.loginChartSubtitle}>Monthly new user registrations</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            {/* Gradient must be inside the chart */}
            <defs>
              <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5594F5" />
                <stop offset="95%" stopColor="#8072F9" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(0,0,0,0.1)" vertical={false} />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: "#adb5bd75" }} />
            <Bar
              dataKey="value"
              radius={[10, 10, 0, 0]}
              fill="url(#barColor)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
