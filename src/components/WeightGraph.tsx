import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

const getYAxisDomain = (data: ChartData[]) => {
  const weightValues = data
    .map((entry) => entry.weight)
    .filter((weight): weight is number => typeof weight === 'number');

  if (weightValues.length === 0) {
    return ['auto', 'auto'] as const;
  }

  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);

  const padding = Math.max((maxWeight - minWeight) * 0.25, 1);

  return [Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)] as const;
};

export const WeightGraph = ({ weights }: WeightGraphProps) => {
  const chartData = useMemo(() => {
    const weekMap = new Map<string, ChartData>();

    weights.forEach((weight) => {
      const key = `${weight.year}-W${weight.week}`;
      const existingEntry = weekMap.get(key);

      if (!existingEntry) {
        weekMap.set(key, {
          week: `W${weight.week}`,
          date: weight.date,
          weight: weight.weight,
        });

        return;
      }

      const existingDate = new Date(existingEntry.date).getTime();
      const currentDate = new Date(weight.date).getTime();

      if (currentDate >= existingDate) {
        weekMap.set(key, {
          week: `W${weight.week}`,
          date: weight.date,
          weight: weight.weight,
        });
      }
    });

    return Array.from(weekMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [weights]);

  const yAxisDomain = useMemo(() => getYAxisDomain(chartData), [chartData]);

  if (chartData.length === 0) {
    return (
      <div className='weight-graph'>
        <div className='chart-container'>
          <p className='empty-state'>No data to display yet. Add weights to see charts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='weight-graph'>
      <h2>Weight Loss Progress</h2>

      <div className='chart-container'>
        <ResponsiveContainer width='100%' height={400}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />

            <XAxis dataKey='week' angle={-45} textAnchor='end' height={80} />

            <YAxis
              domain={yAxisDomain}
              allowDecimals={false}
              label={{
                value: 'Weight (kg)',
                angle: -90,
                position: 'insideLeft',
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8e2f7',
                borderRadius: 12,
              }}
              formatter={(value) => {
                if (typeof value === 'number') {
                  return [`${value.toFixed(1)} kg`, 'Weight'];
                }

                return value;
              }}
            />

            <Legend />

            <Line
              type='monotone'
              dataKey='weight'
              stroke='#6f4df6'
              strokeWidth={4}
              dot={{
                fill: '#24c7a5',
                stroke: '#ffffff',
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 8,
              }}
              name='Weight'
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
