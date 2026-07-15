import React from 'react';
import { Card } from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const SGPALineChart = ({ semesterSGPAs }) => {
  const chartData = Object.entries(semesterSGPAs || {})
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sem, sgpa]) => ({
      name: `Sem ${sem}`,
      SGPA: Number(sgpa),
    }));

  if (chartData.length === 0) {
    return (
      <Card className="p-8 text-center bg-card/60 backdrop-blur-md border border-border">
        <h3 className="text-base font-semibold text-foreground">No SGPA Data Available Yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Enter subject grades in the Grades tab to visualize your academic trajectory across semesters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border border-border shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground">SGPA Trajectory</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Semester-by-semester grade point performance
          </p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.2} />
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="SGPA"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SGPALineChart;
export { SGPALineChart };
