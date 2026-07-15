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
        <div className="text-xs font-semibold text-text-muted uppercase mb-1.5">{label}</div>
        {payload.map((item, idx) => {
          if (item.value === null || item.value === undefined) return null;
          return (
            <div key={idx} className="mono text-sm font-semibold text-foreground flex items-center justify-between gap-4">
              <span className="text-xs text-text-muted font-sans font-medium">
                {item.name === 'Actual' ? 'Completed SGPA:' : 'Simulated SGPA:'}
              </span>
              <span>{Number(item.value).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const PredictionChart = memo(({ trajectory = [] }) => {
  if (!trajectory || trajectory.length === 0) {
    return (
      <Card className="p-8 text-center bg-surface border border-border">
        <h3 className="text-base font-semibold text-foreground">No Trajectory Data</h3>
        <p className="text-sm text-text-muted mt-1">
          Run a simulation or log actual grades to view your projected SGPA path across semesters.
        </p>
      </Card>
    );
  }

  const chartData = useMemo(() => {
    const data = [...trajectory]
      .sort((a, b) => (a.semesterNo || a.semester || 0) - (b.semesterNo || b.semester || 0))
      .map((item) => {
        const semNum = item.semesterNo || item.semester || 1;
        return {
          name: `Sem ${semNum}`,
          Actual: item.type === 'actual' ? Number(item.sgpa) : null,
          Predicted: item.type === 'predicted' ? Number(item.sgpa) : null,
          totalCredits: item.totalCredits,
        };
      });

    const lastActualIdx = data.reduce((acc, curr, idx) => (curr.Actual !== null ? idx : acc), -1);
    if (lastActualIdx !== -1 && lastActualIdx < data.length - 1 && data[lastActualIdx + 1]?.Predicted !== null) {
      data[lastActualIdx].Predicted = data[lastActualIdx].Actual;
    }
    return data;
  }, [trajectory]);

  const isDark = document.documentElement.classList.contains('dark');
  const actualColor = isDark ? '#2E8B8B' : '#2B3A67';
  const predictedColor = isDark ? '#40B0B0' : '#0EA5E9';

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <CardLabel>Trajectory Forecast</CardLabel>
          <h3 className="text-lg font-semibold text-foreground leading-none">
            Completed vs Simulated SGPA Path
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ink dark:bg-chalk-teal inline-block" />
            <span>Completed Semesters</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-info inline-block bg-info-tint" />
            <span>Simulated Future</span>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
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
              dataKey="Actual"
              name="Actual"
              stroke={actualColor}
              strokeWidth={2.5}
              connectNulls={false}
              dot={{ r: 4.5, fill: actualColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6.5 }}
            />
            <Line
              type="monotone"
              dataKey="Predicted"
              name="Predicted"
              stroke={predictedColor}
              strokeWidth={2.5}
              strokeDasharray="5 5"
              connectNulls={false}
              dot={{ r: 4.5, fill: predictedColor, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

PredictionChart.displayName = 'PredictionChart';

export default PredictionChart;
export { PredictionChart };
