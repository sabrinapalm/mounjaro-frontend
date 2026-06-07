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
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { WeightEntry } from '../types';
import { formatShortDateLabel, getStartDateForMonthsAgo, getTimestamp } from '../utils/dateHelpers';
import './WeightGraph.css';

type Period = '1m' | '3m' | '6m' | 'all';

interface ChartData {
  label: string;
  weight?: number;
  dateTime: string;
}

interface WeightGraphProps {
  weights: WeightEntry[];
}

const periodOptions: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
];

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.dateTime;
};

const getPeriodStartDateTime = (period: Period) => {
  if (period === 'all') {
    return null;
  }

  const periodMonths: Record<Exclude<Period, 'all'>, number> = {
    '1m': 1,
    '3m': 3,
    '6m': 6,
  };

  return getStartDateForMonthsAgo(periodMonths[period]);
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

  const { unitSystem } = useProfile();
  const { weightUnit, convertWeightFromKg } = useUnitSettings(unitSystem);

  const chartData = useMemo(() => {
    const periodStartDateTime = getPeriodStartDateTime(period);
    const periodStartTimestamp = periodStartDateTime ? getTimestamp(periodStartDateTime) : null;

    return [...weights]
      .filter((entry) => {
        if (!periodStartTimestamp) {
          return true;
        }

        return getTimestamp(getWeightDateTime(entry)) >= periodStartTimestamp;
      })
      .sort((a, b) => getTimestamp(getWeightDateTime(a)) - getTimestamp(getWeightDateTime(b)))
      .map((entry) => {
        const dateTime = getWeightDateTime(entry);

        return {
          label: formatShortDateLabel(dateTime),
          dateTime,
          weight: convertWeightFromKg(entry.weight),
        };
      });
  }, [convertWeightFromKg, weights, period]);

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
                        {typeof value === 'number' ? `${value.toFixed(1)} ${weightUnit}` : value}
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
