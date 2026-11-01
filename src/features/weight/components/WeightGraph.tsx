import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { WeightEntry } from '../../../shared/types';
import { formatShortDateLabel } from '../../../shared/utils/dateHelpers';
import { useWeightGraphData } from '../hooks/useWeightGraphData';
import {
  type WeightGraphChartData,
  type WeightGraphPeriod,
  weightGraphPeriodOptions,
} from '../utils/weightGraphUtils';
import './WeightGraph.css';

interface WeightGraphProps {
  weights: WeightEntry[];
}

export const WeightGraph = ({ weights }: WeightGraphProps) => {
  const {
    period,
    setPeriod,
    chartData,
    yAxisDomain,
    xAxisTicks,
    selectedPeriodLabel,
    periodMeta,
    weightUnit,
  } = useWeightGraphData({ weights });

  return (
    <section className='weight-graph-card'>
      <header className='weight-graph-card__header'>
        <div>
          <h2 className='weight-graph-card__title'>Weight Over Time</h2>
          <p className='weight-graph-card__meta'>
            {selectedPeriodLabel} · {periodMeta}
          </p>
        </div>

        <label className='weight-graph-card__period'>
          <span className='weight-graph-card__period-label'>Period</span>

          <select
            className='weight-graph-card__select'
            value={period}
            onChange={(event) => setPeriod(event.target.value as WeightGraphPeriod)}
            aria-label='Select weight graph period'
          >
            {weightGraphPeriodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {chartData.length === 0 ? (
        <div className='weight-graph-card__empty-state'>
          <p>No data to display for this period.</p>
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
                dataKey='dateTime'
                ticks={xAxisTicks}
                tickFormatter={(value) => formatShortDateLabel(String(value))}
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
                labelFormatter={(value) => formatShortDateLabel(String(value))}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) {
                    return null;
                  }

                  const entry = payload[0]?.payload as WeightGraphChartData | undefined;
                  const value = payload[0]?.value;

                  return (
                    <div className='weight-graph-card__tooltip'>
                      <span className='weight-graph-card__tooltip-label'>
                        {entry?.dateTime ? formatShortDateLabel(entry.dateTime) : ''}
                      </span>

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
