import React, { useMemo, memo } from 'react';
import { Card, CardLabel } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg bg-surface border border-border p-3 shadow-md">
        <div className="text-xs font-semibold text-text-muted uppercase mb-1">{label}</div>
        <div className="mono text-lg font-bold text-foreground">
          SGPA: {Number(payload[0].value).toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

const SGPALineChart = memo(({ semesterSGPAs }) => {
  const chartData = useMemo(() => {
    return Object.entries(semesterSGPAs || {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([sem, sgpa]) => ({
        name: `Sem ${sem}`,
        SGPA: Number(sgpa),
      }));
  }, [semesterSGPAs]);

  if (chartData.length === 0) {
    return (
      <Card className="p-8 text-center bg-surface border border-border">
        <h3 className="text-base font-semibold text-foreground">No SGPA Data Available Yet</h3>
        <p className="text-sm text-text-muted mt-1">
          Enter subject grades in the Grades tab to visualize your academic trajectory across semesters.
        </p>
      </Card>
    );
  }

  const strokeColor = document.documentElement.classList.contains('dark') ? '#2E8B8B' : '#2B3A67';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <CardLabel>SGPA Trajectory</CardLabel>
          <h3 className="text-lg font-semibold text-foreground leading-none">
            Semester-by-Semester Progression
          </h3>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              fontFamily="Inter, sans-serif"
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              fontFamily="IBM Plex Mono, monospace"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="SGPA"
              stroke={strokeColor}
              strokeWidth={2.5}
              dot={{ r: 4.5, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

SGPALineChart.displayName = 'SGPALineChart';

export default SGPALineChart;
export { SGPALineChart };
