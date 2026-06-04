import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { WeightEntry } from '../types';
import './WeightGraph.css';

interface ChartData {
  week: string;
  weight?: number;
  date: string;
}

interface WeightGraphProps {
  weights: WeightEntry[];
}

export const WeightGraph = ({ weights }: WeightGraphProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const weekMap = new Map<string, ChartData>();

    weights.forEach((weight) => {
      const key = `${weight.year}-W${weight.week}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, {
          week: `W${weight.week}`,
          date: weight.date,
        });
      }
      const entry = weekMap.get(key)!;
      entry.weight = weight.weight;
    });

    const sorted = Array.from(weekMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setChartData(sorted);
  }, [weights]);

  if (chartData.length === 0) {
    return (
      <div className="weight-graph">
        <div className="chart-container">
          <p className="empty-state">No data to display yet. Add weights to see charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weight-graph">
      <h2>Weight Loss Progress</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return value.toFixed(1);
                }
                return value;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#aa3bff"
              dot={{ fill: '#aa3bff', r: 5 }}
              activeDot={{ r: 7 }}
              name="Weight (kg)"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
