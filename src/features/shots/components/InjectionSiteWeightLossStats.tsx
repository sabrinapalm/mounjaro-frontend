import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import { useInjectionSiteWeightLossStats } from '../hooks/useInjectionSiteWeightLossStats';
import { formatWeightChange } from '../utils/injectionSiteWeightLossUtils';
import './InjectionSiteWeightLossStats.css';

type InjectionSiteWeightLossStatsProps = {
  shots: ShotEntry[];
  weights: WeightEntry[];
};

const chartBars = [
  'var(--color-primary)',
  'var(--color-accent)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-primary-dark)',
  'var(--color-accent-dark)',
];

export const InjectionSiteWeightLossStats = ({
  shots,
  weights,
}: InjectionSiteWeightLossStatsProps) => {
  const { stats, bestSite, hasStats } = useInjectionSiteWeightLossStats({
    shots,
    weights,
  });

  if (!hasStats) {
    return (
      <section className='injection-site-stats-card'>
        <div className='injection-site-stats-card__header'>
          <div className='injection-site-stats-card__title-group'>
            <h2>Weight change by site</h2>
          </div>
        </div>

        <div className='injection-site-stats-card__empty'>
          <strong>Not enough data yet</strong>
          <p>
            Add shots with injection sites and weight entries before and after them to see this
            insight.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className='injection-site-stats-card'>
      <div className='injection-site-stats-card__header'>
        <div className='injection-site-stats-card__title-group'>
          <h2>Weight change by site</h2>
          <p>Shows weight-change patterns by injection site.</p>
        </div>

        {bestSite && (
          <div className='injection-site-stats-card__highlight'>
            <strong>{bestSite.label}</strong>
            <small>{formatWeightChange(bestSite.averageWeightLoss)} per completed period</small>
          </div>
        )}
      </div>

      <div className='injection-site-stats-card__chart'>
        <ResponsiveContainer width='100%' height={280}>
          <BarChart data={stats} margin={{ top: 10, right: 8, bottom: 4, left: 0 }}>
            <CartesianGrid stroke='var(--color-border)' strokeDasharray='3 3' vertical={false} />

            <XAxis
              dataKey='label'
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'var(--color-text-muted)',
                fontSize: 12,
                fontWeight: 700,
              }}
              interval={0}
              minTickGap={8}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'var(--color-text-muted)',
                fontSize: 12,
                fontWeight: 700,
              }}
              tickFormatter={(value) => `${value} kg`}
              width={50}
            />

            <Tooltip
              cursor={{
                fill: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
              }}
              contentStyle={{
                border: '1px solid var(--color-border)',
                borderRadius: 18,
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{
                color: 'var(--color-text)',
                fontWeight: 850,
              }}
              itemStyle={{
                color: 'var(--color-text)',
                fontWeight: 750,
              }}
              formatter={(value, name) => {
                if (name === 'averageWeightLoss') {
                  return [formatWeightChange(Number(value)), 'Average loss'];
                }

                return [formatWeightChange(Number(value)), String(name)];
              }}
              labelFormatter={(label) => `${label}`}
            />

            <Bar dataKey='averageWeightLoss' radius={[14, 14, 6, 6]}>
              {stats.map((entry, index) => (
                <Cell key={entry.injectionSite} fill={chartBars[index % chartBars.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className='injection-site-stats-card__grid'>
        {stats.map((stat) => (
          <article className='injection-site-stat' key={stat.injectionSite}>
            <div className='injection-site-stat__header'>
              <div>
                <h3>{stat.label}</h3>
                <p>{stat.completedPeriods} completed periods</p>
              </div>

              <strong>{formatWeightChange(stat.averageWeightLoss)}</strong>
            </div>

            <dl>
              <div>
                <dt>Total loss</dt>
                <dd>{formatWeightChange(stat.totalWeightLoss)}</dd>
              </div>

              <div>
                <dt>Average loss</dt>
                <dd>{formatWeightChange(stat.averageWeightLoss)}</dd>
              </div>

              <div>
                <dt>Best period</dt>
                <dd>{formatWeightChange(stat.bestPeriodLoss)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
};
