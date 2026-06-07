import { useMemo } from 'react';
import dayjs from 'dayjs';
import type { DailyCheckInEntry } from './useInsights';
import type { ShotEntry } from '../types';

export type CurrentCycleDay = {
  day: number;
  date: dayjs.Dayjs | null;
  checkInCount: number;
  averageHunger: number | null;
  averageEnergy: number | null;
  averageMood: number | null;
  dailySideEffectCount: number;
  shotSideEffectCount: number;
  hasShot: boolean;
  isFuture: boolean;
};

type DaySummaryParams = {
  day: number;
  averageHunger: number | null;
  averageEnergy: number | null;
  averageMood: number | null;
  dailySideEffectCount: number;
  shotSideEffectCount: number;
  checkInCount: number;
  hasShot: boolean;
  isFuture: boolean;
};

type UseCurrentShotCycleParams = {
  shots: ShotEntry[];
  checkIns: DailyCheckInEntry[];
};

const SHOT_CYCLE_DAYS = [0, 1, 2, 3, 4, 5, 6];

const emptyCycleDays = (): CurrentCycleDay[] => {
  return SHOT_CYCLE_DAYS.map((day) => ({
    day,
    date: null,
    checkInCount: 0,
    averageHunger: null,
    averageEnergy: null,
    averageMood: null,
    dailySideEffectCount: 0,
    shotSideEffectCount: 0,
    hasShot: false,
    isFuture: false,
  }));
};

const getTimestamp = (dateTime: string) => {
  const timestamp = dayjs(dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getLatestShot = (shots: ShotEntry[]) => {
  return [...shots].sort((a, b) => getTimestamp(a.dateTime) - getTimestamp(b.dateTime)).at(-1) ?? null;
};

const getAverage = (values: Array<number | null | undefined>) => {
  const validValues = values.filter((value): value is number => typeof value === 'number');

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return total / validValues.length;
};

const isSameLocalDay = (dateTime: string, date: dayjs.Dayjs) => {
  const parsedDate = dayjs(dateTime);

  return parsedDate.isValid() && parsedDate.isSame(date, 'day');
};

const getCheckInsForDay = (checkIns: DailyCheckInEntry[], date: dayjs.Dayjs) => {
  return checkIns.filter((checkIn) => isSameLocalDay(checkIn.dateTime, date));
};

export const getShotCycleDayLabel = (day: number) => {
  return `Day ${day + 1}`;
};

export const getAverageScoreLabel = (value: number | null) => {
  if (value === null) {
    return '—';
  }

  return value.toFixed(1);
};

export const getDaySummaryLabel = ({
  day,
  averageHunger,
  averageEnergy,
  averageMood,
  dailySideEffectCount,
  shotSideEffectCount,
  checkInCount,
  hasShot,
  isFuture,
}: DaySummaryParams) => {
  if (isFuture) {
    return 'Upcoming';
  }

  if (hasShot && checkInCount === 0) {
    return 'Shot logged';
  }

  if (checkInCount === 0) {
    return day === 0 ? 'Shot day' : 'No check-in yet';
  }

  if (dailySideEffectCount > 0) {
    return dailySideEffectCount === 1
      ? '1 check-in signal'
      : `${dailySideEffectCount} check-in signals`;
  }

  if (shotSideEffectCount > 0 && hasShot) {
    return shotSideEffectCount === 1 ? '1 shot signal' : `${shotSideEffectCount} shot signals`;
  }

  if (averageHunger !== null && averageHunger <= 2) {
    return 'Low hunger';
  }

  if (averageEnergy !== null && averageEnergy <= 2) {
    return 'Lower energy';
  }

  if (averageMood !== null && averageMood >= 4 && averageEnergy !== null && averageEnergy >= 4) {
    return 'Stable day';
  }

  return 'Logged day';
};

export const getDayMetaLabel = ({
  checkInCount,
  hasShot,
  isFuture,
}: {
  checkInCount: number;
  hasShot: boolean;
  isFuture: boolean;
}) => {
  if (isFuture) {
    return 'Not started yet';
  }

  if (hasShot && checkInCount === 0) {
    return 'No daily check-in yet';
  }

  if (checkInCount === 0) {
    return 'No log yet';
  }

  return `${checkInCount} daily check-in${checkInCount === 1 ? '' : 's'}`;
};

export const useCurrentShotCycle = ({ shots, checkIns }: UseCurrentShotCycleParams) => {
  return useMemo(() => {
    const latestShot = getLatestShot(shots);
    const today = dayjs().startOf('day');

    if (!latestShot) {
      return emptyCycleDays();
    }

    const latestShotDate = dayjs(latestShot.dateTime);

    if (!latestShotDate.isValid()) {
      return emptyCycleDays();
    }

    const cycleStartDate = latestShotDate.startOf('day');

    return SHOT_CYCLE_DAYS.map((day) => {
      const date = cycleStartDate.add(day, 'day');
      const checkInsForDay = getCheckInsForDay(checkIns, date);
      const hasShot = day === 0;

      return {
        day,
        date,
        checkInCount: checkInsForDay.length,
        averageHunger: getAverage(checkInsForDay.map((checkIn) => checkIn.hungerLevel)),
        averageEnergy: getAverage(checkInsForDay.map((checkIn) => checkIn.energyLevel)),
        averageMood: getAverage(checkInsForDay.map((checkIn) => checkIn.moodLevel)),
        dailySideEffectCount: checkInsForDay.reduce((total, checkIn) => {
          return total + (checkIn.sideEffects?.length ?? 0);
        }, 0),
        shotSideEffectCount: hasShot ? (latestShot.sideEffects?.length ?? 0) : 0,
        hasShot,
        isFuture: date.isAfter(today, 'day'),
      };
    });
  }, [shots, checkIns]);
};