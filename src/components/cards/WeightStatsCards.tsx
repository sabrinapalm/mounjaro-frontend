import dayjs from 'dayjs';
import {
  LuCalendarCheck,
  LuCalendarDays,
  LuClipboardList,
  LuScale,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu';
import './WeightStatsCards.css';
import { useProfile } from '../../context/ProfileContext';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import type { WeightEntry } from '../../types';
import { MetricCard } from '../general/MetricCard';

type WeightStatsCardsProps = {
  weights: WeightEntry[];
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = dayjs(entry.dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatSignedWeightFromKg = (
  valueInKg: number,
  unit: string,
  displayWeightFromKg: (weightInKg: number) => string
) => {
  const displayValue = displayWeightFromKg(Math.abs(valueInKg));

  if (valueInKg > 0) {
    return `+${displayValue} ${unit}`;
  }

  if (valueInKg < 0) {
    return `-${displayValue} ${unit}`;
  }

  return `${displayWeightFromKg(0)} ${unit}`;
};

export const WeightStatsCards = ({ weights }: WeightStatsCardsProps) => {
  const { profile } = useProfile();
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile?.unitSystem ?? 'metric');

  const sortedWeights = [...weights].sort((a, b) => getWeightTimestamp(a) - getWeightTimestamp(b));

  const firstWeight = sortedWeights[0];
  const latestWeight = sortedWeights[sortedWeights.length - 1];

  if (!firstWeight || !latestWeight) {
    return (
      <div className='dashboard-summary-cards weight-summary-cards'>
        <MetricCard
          label='Weight Insights'
          value='No data yet'
          meta='Add your first check-in to see trends'
          icon={<LuScale aria-hidden='true' />}
          tone='primary'
          className='weight-summary-card weight-summary-card--empty'
        />
      </div>
    );
  }

  const firstDate = dayjs(firstWeight.dateTime).startOf('day');
  const latestDate = dayjs(latestWeight.dateTime).startOf('day');

  const daysBetween = Math.max(latestDate.diff(firstDate, 'day'), 1);
  const weeksBetween = daysBetween / 7;
  const monthsBetween = daysBetween / 30.44;

  const trackingWeeks = Math.max(Math.ceil(daysBetween / 7), 1);

  const totalChangeKg = latestWeight.weight - firstWeight.weight;
  const totalLossKg = firstWeight.weight - latestWeight.weight;

  const averageChangePerWeekKg = totalChangeKg / weeksBetween;
  const averageChangePerMonthKg = totalChangeKg / monthsBetween;

  const totalWeightLossTone = totalLossKg >= 0 ? 'accent' : 'danger';
  const totalWeightLossValue =
    totalLossKg >= 0
      ? `${displayWeightFromKg(totalLossKg)} ${weightUnit}`
      : formatSignedWeightFromKg(totalChangeKg, weightUnit, displayWeightFromKg);

  const checkInMeta =
    weights.length === 1 ? '1 check-in logged' : `${weights.length} check-ins logged`;

  return (
    <div className='dashboard-summary-cards weight-summary-cards'>
      <MetricCard
        label='Current Weight'
        value={`${displayWeightFromKg(latestWeight.weight)} ${weightUnit}`}
        meta={`Latest check-in ${latestDate.format('MMM D')}`}
        icon={<LuScale aria-hidden='true' />}
        tone='primary'
        className='weight-summary-card'
      />

      <MetricCard
        label='Total Weight Loss'
        value={totalWeightLossValue}
        meta='Since start'
        icon={
          totalLossKg >= 0 ? (
            <LuTrendingDown aria-hidden='true' />
          ) : (
            <LuTrendingUp aria-hidden='true' />
          )
        }
        tone={totalWeightLossTone}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Average / Week'
        value={formatSignedWeightFromKg(averageChangePerWeekKg, weightUnit, displayWeightFromKg)}
        meta='Based on full history'
        icon={<LuCalendarDays aria-hidden='true' />}
        tone={averageChangePerWeekKg <= 0 ? 'accent' : 'warning'}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Average / Month'
        value={formatSignedWeightFromKg(averageChangePerMonthKg, weightUnit, displayWeightFromKg)}
        meta={`Since ${firstDate.format('MMM D')}`}
        icon={<LuCalendarDays aria-hidden='true' />}
        tone={averageChangePerMonthKg <= 0 ? 'accent' : 'warning'}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Journey Week'
        value={`Week ${trackingWeeks}`}
        meta='Your current monjourney week'
        icon={<LuCalendarCheck aria-hidden='true' />}
        tone='info'
        className='weight-summary-card'
      />

      <MetricCard
        label='Check-ins'
        value={weights.length}
        meta={checkInMeta}
        icon={<LuClipboardList aria-hidden='true' />}
        tone='neutral'
        className='weight-summary-card'
      />
    </div>
  );
};
