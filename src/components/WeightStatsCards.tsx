import dayjs from 'dayjs';
import { LuCalendarDays, LuScale, LuTrendingDown, LuTrendingUp } from 'react-icons/lu';
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { WeightEntry } from '../types';
import './WeightStatsCards.css';

type WeightStatsCardsProps = {
  weights: WeightEntry[];
};

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.date;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = dayjs(getWeightDateTime(entry)).valueOf();

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
        <div className='dashboard-card weight-summary-card weight-summary-card--empty'>
          <div className='dashboard-card-icon dashboard-card-icon-weight'>
            <LuScale size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Weight Insights</span>
            <span className='dashboard-card-value'>No data yet</span>
            <span className='dashboard-card-meta'>Add your first check-in to see trends</span>
          </div>
        </div>
      </div>
    );
  }

  const firstDate = dayjs(getWeightDateTime(firstWeight)).startOf('day');
  const latestDate = dayjs(getWeightDateTime(latestWeight)).startOf('day');

  const daysBetween = Math.max(latestDate.diff(firstDate, 'day'), 1);
  const weeksBetween = daysBetween / 7;
  const monthsBetween = daysBetween / 30.44;

  const totalChangeKg = latestWeight.weight - firstWeight.weight;
  const totalLossKg = firstWeight.weight - latestWeight.weight;

  const averageChangePerWeekKg = totalChangeKg / weeksBetween;
  const averageChangePerMonthKg = totalChangeKg / monthsBetween;

  const totalWeightLossClassName =
    totalLossKg >= 0 ? 'total-weight-loss' : 'total-weight-loss weight-gain';

  return (
    <div className='dashboard-summary-cards weight-summary-cards'>
      <div className='dashboard-card weight-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-weight'>
          <LuScale size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Current Weight</span>
          <span className='dashboard-card-value'>
            {displayWeightFromKg(latestWeight.weight)} {weightUnit}
          </span>
          <span className='dashboard-card-meta'>Latest check-in {latestDate.format('MMM D')}</span>
        </div>
      </div>

      <div className='dashboard-card weight-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-loss'>
          {totalLossKg >= 0 ? (
            <LuTrendingDown size={38} color='currentColor' aria-hidden='true' />
          ) : (
            <LuTrendingUp size={38} color='currentColor' aria-hidden='true' />
          )}
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Total Weight Loss</span>
          <span className={`dashboard-card-value ${totalWeightLossClassName}`}>
            {totalLossKg >= 0
              ? `${displayWeightFromKg(totalLossKg)} ${weightUnit}`
              : formatSignedWeightFromKg(totalChangeKg, weightUnit, displayWeightFromKg)}
          </span>
          <span className='dashboard-card-meta'>Since first entry</span>
        </div>
      </div>

      <div className='dashboard-card weight-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-calendar'>
          <LuCalendarDays size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Average / Week</span>
          <span className='dashboard-card-value'>
            {formatSignedWeightFromKg(averageChangePerWeekKg, weightUnit, displayWeightFromKg)}
          </span>
          <span className='dashboard-card-meta'>Based on full history</span>
        </div>
      </div>

      <div className='dashboard-card weight-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-dose'>
          <LuCalendarDays size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Average / Month</span>
          <span className='dashboard-card-value'>
            {formatSignedWeightFromKg(averageChangePerMonthKg, weightUnit, displayWeightFromKg)}
          </span>
          <span className='dashboard-card-meta'>Since {firstDate.format('MMM D')}</span>
        </div>
      </div>
    </div>
  );
};
