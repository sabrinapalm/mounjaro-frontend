import dayjs from 'dayjs';
import type { CreateWeightInput, WeightEntry } from '../types';
import { WeightStatsCards } from './WeightStatsCards';
import { WeightTracker } from './WeightTracker';
import './WeightPage.css';

interface WeightPageProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
}

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = dayjs(entry.dateTime ?? entry.date).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const WeightPage = ({ weights, onWeightAdded, onDeleteWeight }: WeightPageProps) => {
  const sortedWeights = [...weights].sort((a, b) => getWeightTimestamp(a) - getWeightTimestamp(b));

  const firstWeight = sortedWeights[0];
  const latestWeight = sortedWeights[sortedWeights.length - 1];

  const trackingWeeks =
    firstWeight && latestWeight
      ? Math.max(
          Math.ceil(
            dayjs(latestWeight.dateTime ?? latestWeight.date).diff(
              dayjs(firstWeight.dateTime ?? firstWeight.date),
              'day'
            ) / 7
          ),
          1
        )
      : 0;

  const weekLabel =
    trackingWeeks > 0
      ? `Your weight journey is in week ${trackingWeeks}`
      : 'Your weight journey starts with your first check-in';

  const checkInLabel =
    weights.length === 1 ? '1 check-in logged' : `${weights.length} check-ins logged`;

  return (
    <section className='weight-page'>
      <header className='weight-page__header'>
        <div>
          <p className='weight-page__eyebrow'>Weight</p>
          <h1>All Weight Entries</h1>
          <p>View your full weight history and add new check-ins when needed.</p>

          {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: cba */}
          <div className='weight-page__meta' aria-label='Weight journey summary'>
            <span className='weight-page__meta-pill weight-page__meta-pill--primary'>
              {weekLabel}
            </span>

            <span className='weight-page__meta-pill weight-page__meta-pill--accent'>
              {checkInLabel}
            </span>
          </div>
        </div>
      </header>

      <WeightStatsCards weights={weights} />

      <WeightTracker
        weights={weights}
        title='All Weight Entries'
        summaryLabel='Total weight loss'
        variant='full'
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />
    </section>
  );
};
