import dayjs from 'dayjs';
import { useMemo } from 'react';
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
import type { ShotEntry, WeightEntry } from '../types';
import './InjectionSiteWeightLossStats.css';

type InjectionSiteWeightLossStatsProps = {
  shots: ShotEntry[];
  weights: WeightEntry[];
};

type InjectionSiteStat = {
  injectionSite: string;
  label: string;
  completedPeriods: number;
  totalWeightLoss: number;
  averageWeightLoss: number;
  bestPeriodLoss: number;
};

type InjectionPeriod = {
  shotId: string;
  injectionSite: string;
  shotDateTime: string;
  startWeight: number;
  endWeight: number;
  weightLoss: number;
  startWeightDateTime: string;
  endWeightDateTime: string;
};

const injectionSiteLabels: Record<string, string> = {
  abdomen_left: 'Left abdomen',
  abdomen_right: 'Right abdomen',
  left_thigh: 'Left thigh',
  right_thigh: 'Right thigh',
  left_upper_arm: 'Left upper arm',
  right_upper_arm: 'Right upper arm',
  other: 'Other',
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

const formatWeight = (value: number) => {
  return `${value.toFixed(1)} kg`;
};

const getTimestamp = (dateTime: string) => {
  const timestamp = dayjs(dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getInjectionSiteLabel = (injectionSite: string) => {
  return injectionSiteLabels[injectionSite] ?? injectionSite;
};

const buildInjectionPeriods = (shots: ShotEntry[], weights: WeightEntry[]): InjectionPeriod[] => {
  const sortedShots = [...shots].sort(
    (a, b) => getTimestamp(a.dateTime) - getTimestamp(b.dateTime)
  );

  const sortedWeights = [...weights].sort(
    (a, b) => getTimestamp(a.dateTime) - getTimestamp(b.dateTime)
  );

  return sortedShots.flatMap((shot, shotIndex) => {
    if (!shot.injectionSite) {
      return [];
    }

    const shotTimestamp = getTimestamp(shot.dateTime);
    const nextShot = sortedShots[shotIndex + 1];
    const nextShotTimestamp = nextShot ? getTimestamp(nextShot.dateTime) : null;

    const weightBeforeShot = [...sortedWeights]
      .reverse()
      .find((weight) => getTimestamp(weight.dateTime) <= shotTimestamp);

    const weightsAfterShot = sortedWeights.filter((weight) => {
      const weightTimestamp = getTimestamp(weight.dateTime);

      if (weightTimestamp <= shotTimestamp) {
        return false;
      }

      if (nextShotTimestamp && weightTimestamp >= nextShotTimestamp) {
        return false;
      }

      return true;
    });

    const weightAfterShot = weightsAfterShot.at(-1);

    if (!weightBeforeShot || !weightAfterShot) {
      return [];
    }

    const weightLoss = weightBeforeShot.weight - weightAfterShot.weight;

    return [
      {
        shotId: shot.id,
        injectionSite: shot.injectionSite,
        shotDateTime: shot.dateTime,
        startWeight: weightBeforeShot.weight,
        endWeight: weightAfterShot.weight,
        weightLoss,
        startWeightDateTime: weightBeforeShot.dateTime,
        endWeightDateTime: weightAfterShot.dateTime,
      },
    ];
  });
};

const buildInjectionSiteStats = (periods: InjectionPeriod[]): InjectionSiteStat[] => {
  const groupedPeriods = periods.reduce<Record<string, InjectionPeriod[]>>((acc, period) => {
    if (!acc[period.injectionSite]) {
      acc[period.injectionSite] = [];
    }

    acc[period.injectionSite].push(period);

    return acc;
  }, {});

  return Object.entries(groupedPeriods)
    .map(([injectionSite, sitePeriods]) => {
      const totalWeightLoss = sitePeriods.reduce((sum, period) => sum + period.weightLoss, 0);
      const averageWeightLoss = totalWeightLoss / sitePeriods.length;
      const bestPeriodLoss = Math.max(...sitePeriods.map((period) => period.weightLoss));

      return {
        injectionSite,
        label: getInjectionSiteLabel(injectionSite),
        completedPeriods: sitePeriods.length,
        totalWeightLoss,
        averageWeightLoss,
        bestPeriodLoss,
      };
    })
    .sort((a, b) => b.averageWeightLoss - a.averageWeightLoss);
};

export const InjectionSiteWeightLossStats = ({
  shots,
  weights,
}: InjectionSiteWeightLossStatsProps) => {
  const periods = useMemo(() => buildInjectionPeriods(shots, weights), [shots, weights]);

  const stats = useMemo(() => buildInjectionSiteStats(periods), [periods]);

  const bestSite = stats[0];

  if (stats.length === 0) {
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
            <small>{formatWeight(bestSite.averageWeightLoss)} per completed period</small>
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
                  return [formatWeight(Number(value)), 'Average loss'];
                }

                return [formatWeight(Number(value)), String(name)];
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

              <strong>{formatWeight(stat.averageWeightLoss)}</strong>
            </div>

            <dl>
              <div>
                <dt>Total loss</dt>
                <dd>{formatWeight(stat.totalWeightLoss)}</dd>
              </div>

              <div>
                <dt>Average loss</dt>
                <dd>{formatWeight(stat.averageWeightLoss)}</dd>
              </div>

              <div>
                <dt>Best period</dt>
                <dd>{formatWeight(stat.bestPeriodLoss)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
};
