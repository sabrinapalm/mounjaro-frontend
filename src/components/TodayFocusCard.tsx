import dayjs from 'dayjs';
import { useMemo } from 'react';
import { FiActivity, FiPlus, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { LuCalendarClock, LuHeartPulse, LuScale } from 'react-icons/lu';
import type { CheckInEntry, ShotEntry, WeightEntry } from '../types';
import { formatDateLabel, getTimestamp } from '../utils/dateHelpers';
import './TodayFocusCard.css';

interface TodayFocusCardProps {
  shots: ShotEntry[];
  weights: WeightEntry[];
  checkIns: CheckInEntry[];
  onAddCheckIn: () => void;
  onAddWeight: () => void;
}

const SHOT_INTERVAL_DAYS = 7;

const getLatestByDateTime = <T extends { dateTime: string; id: string }>(entries: T[]) => {
  return [...entries].sort((firstEntry, secondEntry) => {
    const dateDifference = getTimestamp(secondEntry.dateTime) - getTimestamp(firstEntry.dateTime);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return secondEntry.id.localeCompare(firstEntry.id);
  })[0];
};

const getSortedWeights = (weights: WeightEntry[]) => {
  return [...weights].sort((firstWeight, secondWeight) => {
    const dateDifference = getTimestamp(secondWeight.dateTime) - getTimestamp(firstWeight.dateTime);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return secondWeight.id.localeCompare(firstWeight.id);
  });
};

const getShotFocusLabel = (shots: ShotEntry[]) => {
  const latestShot = getLatestByDateTime(shots);

  if (!latestShot) {
    return 'No shot logged yet';
  }

  const latestShotDate = dayjs(latestShot.dateTime);

  if (!latestShotDate.isValid()) {
    return 'Next shot date unavailable';
  }

  const today = dayjs().startOf('day');
  const nextShotDate = latestShotDate.startOf('day').add(SHOT_INTERVAL_DAYS, 'day');
  const daysUntilShot = nextShotDate.diff(today, 'day');

  if (daysUntilShot < 0) {
    const overdueDays = Math.abs(daysUntilShot);

    return `Shot overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  }

  if (daysUntilShot === 0) {
    return 'Shot due today';
  }

  if (daysUntilShot === 1) {
    return 'Next shot tomorrow';
  }

  return `Next shot in ${daysUntilShot} days`;
};

const getCheckInFocusLabel = (checkIns: CheckInEntry[]) => {
  const latestCheckIn = getLatestByDateTime(checkIns);

  if (!latestCheckIn) {
    return 'No check-in yet today';
  }

  const latestCheckInDate = dayjs(latestCheckIn.dateTime);

  if (!latestCheckInDate.isValid()) {
    return 'Last check-in date unavailable';
  }

  if (latestCheckInDate.isSame(dayjs(), 'day')) {
    return 'Last check-in today';
  }

  return `Last check-in ${formatDateLabel(latestCheckIn.dateTime)}`;
};

const getWeightTrendLabel = (weights: WeightEntry[]) => {
  const sortedWeights = getSortedWeights(weights);
  const latestWeight = sortedWeights[0];
  const previousWeight = sortedWeights[1];

  if (!latestWeight) {
    return 'No weight logged yet';
  }

  if (!previousWeight) {
    return 'First weight logged';
  }

  const difference = latestWeight.weight - previousWeight.weight;

  if (difference < 0) {
    return 'Weight trending down';
  }

  if (difference > 0) {
    return 'Weight trending up';
  }

  return 'Weight stable';
};

const getWeightTrendIcon = (weights: WeightEntry[]) => {
  const sortedWeights = getSortedWeights(weights);
  const latestWeight = sortedWeights[0];
  const previousWeight = sortedWeights[1];

  if (!latestWeight || !previousWeight) {
    return <LuScale size={18} />;
  }

  if (latestWeight.weight < previousWeight.weight) {
    return <FiTrendingDown size={18} />;
  }

  if (latestWeight.weight > previousWeight.weight) {
    return <FiTrendingUp size={18} />;
  }

  return <LuScale size={18} />;
};

export const TodayFocusCard = ({
  shots,
  weights,
  checkIns,
  onAddCheckIn,
  onAddWeight,
}: TodayFocusCardProps) => {
  const focusItems = useMemo(
    () => [
      {
        id: 'shot',
        icon: <LuCalendarClock size={18} />,
        label: getShotFocusLabel(shots),
      },
      {
        id: 'check-in',
        icon: <LuHeartPulse size={18} />,
        label: getCheckInFocusLabel(checkIns),
      },
      {
        id: 'weight',
        icon: getWeightTrendIcon(weights),
        label: getWeightTrendLabel(weights),
      },
    ],
    [checkIns, shots, weights]
  );

  return (
    <section className='today-focus-card'>
      <div className='today-focus-card__main'>
        <div className='today-focus-card__icon'>
          <FiActivity size={24} />
        </div>

        <div className='today-focus-card__content'>
          <p className='today-focus-card__eyebrow'>Today&apos;s focus</p>

          <ul className='today-focus-card__list' aria-label="Today's focus summary">
            {focusItems.map((item) => (
              <li key={item.id} className='today-focus-card__item'>
                <span className='today-focus-card__item-icon'>{item.icon}</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='today-focus-card__actions'>
        <button type='button' className='today-focus-card__button' onClick={onAddCheckIn}>
          <FiPlus size={18} />
          Add check-in
        </button>

        <button
          type='button'
          className='today-focus-card__button today-focus-card__button--secondary'
          onClick={onAddWeight}
        >
          <FiPlus size={18} />
          Add weight
        </button>
      </div>
    </section>
  );
};
