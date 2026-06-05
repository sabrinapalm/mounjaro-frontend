import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WeightEntry } from '../types';
import './WeightGraph.css';

type Period = '1m' | '3m' | '6m' | 'all';

interface ChartData {
  label: string;
  weight?: number;
  date: string;
}

interface WeightGraphProps {
  weights: WeightEntry[];
}

const periodOptions: { value: Period; label: string }[] = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: 'all', label: 'All Time' },
];

const getDateLabel = (dateValue: string) => {
  const date = new Date(dateValue);

  return date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });
};

const getPeriodStartDate = (period: Period) => {
  if (period === 'all') {
    return null;
  }

  const date = new Date();

  if (period === '1m') {
    date.setMonth(date.getMonth() - 1);
  }

  if (period === '3m') {
    date.setMonth(date.getMonth() - 3);
  }

  if (period === '6m') {
    date.setMonth(date.getMonth() - 6);
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

const getYAxisDomain = (data: ChartData[]) => {
  const weightValues = data
    .map((entry) => entry.weight)
    .filter((weight): weight is number => typeof weight === 'number');

  if (weightValues.length === 0) {
    return ['auto', 'auto'] as const;
  }

  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  const range = maxWeight - minWeight;
  const padding = Math.max(range * 0.2, 2);

  return [Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)] as const;
};

const getTicks = (data: ChartData[]) => {
  if (data.length <= 6) {
    return data.map((entry) => entry.label);
  }

  const first = data[0]?.label;
  const last = data[data.length - 1]?.label;
  const middleIndexes = [
    Math.floor(data.length * 0.25),
    Math.floor(data.length * 0.5),
    Math.floor(data.length * 0.75),
  ];

  return Array.from(
    new Set([first, ...middleIndexes.map((index) => data[index]?.label), last].filter(Boolean))
  );
};

export const WeightGraph = ({ weights }: WeightGraphProps) => {
  const [period, setPeriod] = useState<Period>('all');

  const chartData = useMemo(() => {
    const periodStartDate = getPeriodStartDate(period);

    return [...weights]
      .filter((entry) => {
        if (!periodStartDate) {
          return true;
        }

        return new Date(entry.date).getTime() >= periodStartDate.getTime();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((entry) => ({
        label: getDateLabel(entry.date),
        date: entry.date,
        weight: entry.weight,
      }));
  }, [weights, period]);

  const yAxisDomain = useMemo(() => getYAxisDomain(chartData), [chartData]);
  const xAxisTicks = useMemo(() => getTicks(chartData), [chartData]);

  return (
    <section className='weight-graph-card'>
      <header className='weight-graph-card__header'>
        <h2 className='weight-graph-card__title'>Weight Over Time</h2>

        <label className='weight-graph-card__period'>
          <span className='weight-graph-card__period-label'>Period</span>

          <select
            className='weight-graph-card__select'
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            aria-label='Select weight graph period'
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {chartData.length === 0 ? (
        <div className='weight-graph-card__empty-state'>
          <p>No data to display yet. Add weights to see your progress chart.</p>
        </div>
      ) : (
        <div className='weight-graph-card__chart'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={chartData}
              margin={{
                top: 14,
                right: 12,
                left: -18,
                bottom: 4,
              }}
            >
              <defs>
                <linearGradient id='weightGraphArea' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='var(--color-primary)' stopOpacity={0.42} />
                  <stop offset='55%' stopColor='var(--color-primary)' stopOpacity={0.18} />
                  <stop offset='100%' stopColor='var(--color-primary)' stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke='var(--color-border)' strokeOpacity={0.36} />

              <XAxis
                dataKey='label'
                ticks={xAxisTicks}
                axisLine={false}
                tickLine={false}
                tickMargin={18}
                interval={0}
                stroke='var(--color-text-muted)'
                tick={{
                  fill: 'var(--color-text-muted)',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              />

              <YAxis
                domain={yAxisDomain}
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tickMargin={14}
                stroke='var(--color-text-muted)'
                tick={{
                  fill: 'var(--color-text-muted)',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              />

              <Tooltip
                cursor={{
                  stroke: 'var(--color-primary)',
                  strokeWidth: 1,
                  strokeOpacity: 0.35,
                }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const value = payload[0]?.value;

                  return (
                    <div className='weight-graph-card__tooltip'>
                      <span className='weight-graph-card__tooltip-label'>{label}</span>

                      <strong className='weight-graph-card__tooltip-value'>
                        {typeof value === 'number' ? `${value.toFixed(1)} kg` : value}
                      </strong>
                    </div>
                  );
                }}
              />

              <Area
                type='monotone'
                dataKey='weight'
                stroke='var(--color-primary)'
                strokeWidth={3}
                fill='url(#weightGraphArea)'
                dot={{
                  r: 4,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-primary)',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: 'var(--color-primary)',
                  stroke: 'var(--color-surface)',
                  strokeWidth: 3,
                }}
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
