import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useMemo } from 'react';
import type { ShotEntry, UserProfile, WeightEntry } from '../../../shared/types';

dayjs.extend(isoWeek);

export type DailyCheckInEntry = {
  id: string;
  dateTime: string;
  hungerLevel?: number | null;
  energyLevel?: number | null;
  moodLevel?: number | null;
  sideEffects?: string[];
  notes?: string | null;
};

export type InsightTone = 'primary' | 'accent' | 'warning' | 'danger';

export type ShotCycleDay = {
  day: number;
  checkInCount: number;
  averageHunger: number | null;
  averageEnergy: number | null;
  averageMood: number | null;
  sideEffectCount: number;
};

export type WeightTrendPoint = {
  label: string;
  value: number;
};

export type ShotDayPattern = {
  day: number;
  score: number;
};

export type SideEffectSummary = {
  label: string;
  count: number;
};

export type ComeBackNudge = {
  title: string;
  description: string;
};

export type UseInsightsParams = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  checkIns: DailyCheckInEntry[];
  profile: UserProfile | null;
};

export type UseInsightsResult = {
  currentWeight: number | null;
  totalLost: number | null;
  averageLossPerWeek: number | null;
  trendDescription: string;
  goalProgress: number | null;

  checkInsThisWeek: DailyCheckInEntry[];
  checkInsPreviousWeek: DailyCheckInEntry[];
  checkInStreak: number;

  averageHungerThisWeek: number | null;
  averageEnergyThisWeek: number | null;
  averageMoodThisWeek: number | null;
  appetiteInsight: string;

  sideEffectDaysThisWeek: number;
  sideEffectDaysPreviousWeek: number;
  sideEffectTrendLabel: string;
  sideEffectTone: InsightTone;
  mostCommonSideEffects: SideEffectSummary[];

  shotCycleDays: ShotCycleDay[];
  mostSensitiveShotDay: ShotDayPattern | null;
  bestFeelingShotDay: ShotDayPattern | null;

  weightCheckInDays: number;
  weightTrendPoints: WeightTrendPoint[];

  daysSinceLatestShot: number | null;
  daysUntilNextShot: number | null;

  comeBackNudge: ComeBackNudge;
};

const SHOT_CYCLE_DAYS = [0, 1, 2, 3, 4, 5, 6];

const getTimestamp = (dateTime: string) => {
  const timestamp = dayjs(dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const getLocalDate = (dateTime: string) => {
  return dayjs(dateTime).format('YYYY-MM-DD');
};

const sortByDateTimeAsc = <T extends { dateTime: string }>(items: T[]) => {
  return [...items].sort((a, b) => getTimestamp(a.dateTime) - getTimestamp(b.dateTime));
};

const sortByDateTimeDesc = <T extends { dateTime: string }>(items: T[]) => {
  return [...items].sort((a, b) => getTimestamp(b.dateTime) - getTimestamp(a.dateTime));
};

const getAverage = (values: Array<number | null | undefined>) => {
  const validValues = values.filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value)
  );

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const getEntriesThisWeek = <T extends { dateTime: string }>(entries: T[]) => {
  const startOfWeek = dayjs().startOf('isoWeek');
  const endOfWeek = dayjs().endOf('isoWeek');

  return entries.filter((entry) => {
    const date = dayjs(entry.dateTime);

    return date.isAfter(startOfWeek) && date.isBefore(endOfWeek);
  });
};

const getEntriesPreviousWeek = <T extends { dateTime: string }>(entries: T[]) => {
  const startOfPreviousWeek = dayjs().subtract(1, 'week').startOf('isoWeek');
  const endOfPreviousWeek = dayjs().subtract(1, 'week').endOf('isoWeek');

  return entries.filter((entry) => {
    const date = dayjs(entry.dateTime);

    return date.isAfter(startOfPreviousWeek) && date.isBefore(endOfPreviousWeek);
  });
};

const getCurrentStreak = (entries: Array<{ dateTime: string }>) => {
  const uniqueDates = Array.from(
    new Set(entries.map((entry) => getLocalDate(entry.dateTime)))
  ).sort((a, b) => dayjs(b).valueOf() - dayjs(a).valueOf());

  if (uniqueDates.length === 0) {
    return 0;
  }

  const today = dayjs().startOf('day');
  const latestDate = dayjs(uniqueDates[0]).startOf('day');
  const daysSinceLatestLog = today.diff(latestDate, 'day');

  if (daysSinceLatestLog > 1) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previousDate = dayjs(uniqueDates[index - 1]).startOf('day');
    const currentDate = dayjs(uniqueDates[index]).startOf('day');

    if (previousDate.diff(currentDate, 'day') === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
};

const getUniqueDateCount = (entries: Array<{ dateTime: string }>) => {
  return new Set(entries.map((entry) => getLocalDate(entry.dateTime))).size;
};

const getLatestShotBeforeCheckIn = (checkIn: DailyCheckInEntry, shots: ShotEntry[]) => {
  return sortByDateTimeDesc(shots).find((shot) => {
    const shotDate = dayjs(shot.dateTime);
    const checkInDate = dayjs(checkIn.dateTime);

    return shotDate.isSame(checkInDate) || shotDate.isBefore(checkInDate);
  });
};

const getDaysSinceShot = (checkIn: DailyCheckInEntry, shots: ShotEntry[]) => {
  const latestShot = getLatestShotBeforeCheckIn(checkIn, shots);

  if (!latestShot) {
    return null;
  }

  const daysSinceShot = dayjs(checkIn.dateTime)
    .startOf('day')
    .diff(dayjs(latestShot.dateTime).startOf('day'), 'day');

  if (daysSinceShot < 0 || daysSinceShot > 6) {
    return null;
  }

  return daysSinceShot;
};

const getShotCycleDays = (checkIns: DailyCheckInEntry[], shots: ShotEntry[]): ShotCycleDay[] => {
  return SHOT_CYCLE_DAYS.map((day) => {
    const checkInsForDay = checkIns.filter((checkIn) => getDaysSinceShot(checkIn, shots) === day);

    return {
      day,
      checkInCount: checkInsForDay.length,
      averageHunger: getAverage(checkInsForDay.map((checkIn) => checkIn.hungerLevel)),
      averageEnergy: getAverage(checkInsForDay.map((checkIn) => checkIn.energyLevel)),
      averageMood: getAverage(checkInsForDay.map((checkIn) => checkIn.moodLevel)),
      sideEffectCount: checkInsForDay.reduce(
        (sum, checkIn) => sum + (checkIn.sideEffects?.length ?? 0),
        0
      ),
    };
  });
};

const getMostCommonSideEffects = (checkIns: DailyCheckInEntry[]) => {
  const counts = checkIns.reduce<Record<string, number>>((acc, checkIn) => {
    for (const sideEffect of checkIn.sideEffects ?? []) {
      acc[sideEffect] = (acc[sideEffect] ?? 0) + 1;
    }

    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
};

const getSideEffectDaysCount = (checkIns: DailyCheckInEntry[]) => {
  return checkIns.filter((checkIn) => (checkIn.sideEffects?.length ?? 0) > 0).length;
};

const getMostSensitiveShotDay = (shotCycleDays: ShotCycleDay[]) => {
  return (
    shotCycleDays
      .filter((day) => day.checkInCount > 0)
      .map((day) => {
        const hungerScore = day.averageHunger ?? 0;
        const lowEnergyScore = day.averageEnergy !== null ? 5 - day.averageEnergy : 0;
        const lowMoodScore = day.averageMood !== null ? 5 - day.averageMood : 0;

        return {
          day: day.day,
          score: hungerScore + lowEnergyScore + lowMoodScore + day.sideEffectCount,
        };
      })
      .sort((a, b) => b.score - a.score)[0] ?? null
  );
};

const getBestFeelingShotDay = (shotCycleDays: ShotCycleDay[]) => {
  return (
    shotCycleDays
      .filter((day) => day.checkInCount > 0)
      .map((day) => {
        const energyScore = day.averageEnergy ?? 0;
        const moodScore = day.averageMood ?? 0;
        const lowSideEffectScore = Math.max(0, 5 - day.sideEffectCount);

        return {
          day: day.day,
          score: energyScore + moodScore + lowSideEffectScore,
        };
      })
      .sort((a, b) => b.score - a.score)[0] ?? null
  );
};

const getWeightTrendPoints = (weights: WeightEntry[]): WeightTrendPoint[] => {
  return sortByDateTimeAsc(weights)
    .slice(-8)
    .map((weight) => ({
      label: dayjs(weight.dateTime).format('MMM D'),
      value: weight.weight,
    }));
};

const getComeBackNudge = ({
  checkInsThisWeek,
  checkIns,
  shots,
  mostSensitiveShotDay,
  daysUntilNextShot,
}: {
  checkInsThisWeek: number;
  checkIns: DailyCheckInEntry[];
  shots: ShotEntry[];
  mostSensitiveShotDay: ShotDayPattern | null;
  daysUntilNextShot: number | null;
}) => {
  if (checkIns.length < 3) {
    return {
      title: 'Unlock your first pattern',
      description:
        'Log a few more daily check-ins so Tracksy can start connecting your shots, hunger, energy and side effects.',
    };
  }

  if (checkInsThisWeek < 4) {
    return {
      title: `${4 - checkInsThisWeek} check-in${4 - checkInsThisWeek === 1 ? '' : 's'} away`,
      description:
        'Reach 4 check-ins this week to make your weekly insights more reliable and personal.',
    };
  }

  if (shots.length < 2) {
    return {
      title: 'One more shot unlocks better rhythm insights',
      description:
        'With at least two shots, Tracksy can compare how your body usually behaves after injection day.',
    };
  }

  if (daysUntilNextShot !== null && daysUntilNextShot <= 1) {
    return {
      title: 'Shot day is close',
      description:
        'Log the next two days after your shot. That is usually where the most useful pattern data appears.',
    };
  }

  if (mostSensitiveShotDay) {
    return {
      title: `Watch day ${mostSensitiveShotDay.day} after your next shot`,
      description:
        'Your logs suggest this may be a more sensitive day. Keep an eye on hunger, energy and side effects.',
    };
  }

  return {
    title: 'Your pattern is getting clearer',
    description:
      'Keep logging daily check-ins after each shot to make your insights feel more like you.',
  };
};

const getTrendDescription = (averageLossPerWeek: number | null) => {
  if (averageLossPerWeek === null || !Number.isFinite(averageLossPerWeek)) {
    return 'Add more weight entries to unlock your trend.';
  }

  if (averageLossPerWeek > 0) {
    return 'Your longer trend is moving downward.';
  }

  if (averageLossPerWeek < 0) {
    return 'Your longer trend is currently moving upward.';
  }

  return 'Your longer trend is currently stable.';
};

const getSideEffectTrendLabel = (
  sideEffectDaysThisWeek: number,
  sideEffectDaysPreviousWeek: number
) => {
  if (sideEffectDaysThisWeek < sideEffectDaysPreviousWeek) {
    return 'Fewer days than last week';
  }

  if (sideEffectDaysThisWeek > sideEffectDaysPreviousWeek) {
    return 'More days than last week';
  }

  return 'Same as last week';
};

const getSideEffectTone = (
  sideEffectDaysThisWeek: number,
  sideEffectDaysPreviousWeek: number
): InsightTone => {
  return sideEffectDaysThisWeek > sideEffectDaysPreviousWeek ? 'warning' : 'accent';
};

const getAppetiteInsight = (averageHungerThisWeek: number | null) => {
  if (averageHungerThisWeek !== null && averageHungerThisWeek <= 2) {
    return 'Your appetite looks low this week.';
  }

  if (averageHungerThisWeek !== null && averageHungerThisWeek >= 4) {
    return 'Hunger looks higher this week.';
  }

  return 'Your appetite looks moderate this week.';
};

export const useInsights = ({
  weights,
  shots,
  checkIns,
  profile,
}: UseInsightsParams): UseInsightsResult => {
  return useMemo(() => {
    const sortedWeightsAsc = sortByDateTimeAsc(weights);
    const sortedWeightsDesc = sortByDateTimeDesc(weights);
    const sortedShotsDesc = sortByDateTimeDesc(shots);

    const firstWeight = sortedWeightsAsc[0] ?? null;
    const latestWeight = sortedWeightsDesc[0] ?? null;
    const latestShot = sortedShotsDesc[0] ?? null;

    const startWeight = profile?.startWeight ?? firstWeight?.weight ?? null;
    const currentWeight = latestWeight?.weight ?? null;
    const goalWeight = profile?.goalWeight ?? null;

    const totalLost =
      startWeight !== null && currentWeight !== null
        ? Number((startWeight - currentWeight).toFixed(1))
        : null;

    const daysTracked =
      firstWeight && latestWeight
        ? Math.max(1, dayjs(latestWeight.dateTime).diff(dayjs(firstWeight.dateTime), 'day'))
        : 0;

    const averageLossPerWeek =
      totalLost !== null && daysTracked > 0
        ? Number((totalLost / (daysTracked / 7)).toFixed(1))
        : null;

    const goalProgress =
      startWeight !== null &&
      currentWeight !== null &&
      goalWeight !== null &&
      startWeight !== goalWeight
        ? Math.min(
            100,
            Math.max(0, ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100)
          )
        : null;

    const checkInsThisWeek = getEntriesThisWeek(checkIns);
    const checkInsPreviousWeek = getEntriesPreviousWeek(checkIns);

    const averageHungerThisWeek = getAverage(
      checkInsThisWeek.map((checkIn) => checkIn.hungerLevel)
    );
    const averageEnergyThisWeek = getAverage(
      checkInsThisWeek.map((checkIn) => checkIn.energyLevel)
    );
    const averageMoodThisWeek = getAverage(checkInsThisWeek.map((checkIn) => checkIn.moodLevel));

    const sideEffectDaysThisWeek = getSideEffectDaysCount(checkInsThisWeek);
    const sideEffectDaysPreviousWeek = getSideEffectDaysCount(checkInsPreviousWeek);

    const shotCycleDays = getShotCycleDays(checkIns, shots);
    const mostSensitiveShotDay = getMostSensitiveShotDay(shotCycleDays);
    const bestFeelingShotDay = getBestFeelingShotDay(shotCycleDays);

    const daysSinceLatestShot = latestShot
      ? dayjs().startOf('day').diff(dayjs(latestShot.dateTime).startOf('day'), 'day')
      : null;

    const nextShotDate = latestShot ? dayjs(latestShot.dateTime).add(7, 'day') : null;
    const daysUntilNextShot = nextShotDate
      ? nextShotDate.startOf('day').diff(dayjs().startOf('day'), 'day')
      : null;

    return {
      currentWeight,
      totalLost,
      averageLossPerWeek,
      trendDescription: getTrendDescription(averageLossPerWeek),
      goalProgress,

      checkInsThisWeek,
      checkInsPreviousWeek,
      checkInStreak: getCurrentStreak(checkIns),

      averageHungerThisWeek,
      averageEnergyThisWeek,
      averageMoodThisWeek,
      appetiteInsight: getAppetiteInsight(averageHungerThisWeek),

      sideEffectDaysThisWeek,
      sideEffectDaysPreviousWeek,
      sideEffectTrendLabel: getSideEffectTrendLabel(
        sideEffectDaysThisWeek,
        sideEffectDaysPreviousWeek
      ),
      sideEffectTone: getSideEffectTone(sideEffectDaysThisWeek, sideEffectDaysPreviousWeek),
      mostCommonSideEffects: getMostCommonSideEffects(checkIns),

      shotCycleDays,
      mostSensitiveShotDay,
      bestFeelingShotDay,

      weightCheckInDays: getUniqueDateCount(weights),
      weightTrendPoints: getWeightTrendPoints(weights),

      daysSinceLatestShot,
      daysUntilNextShot,

      comeBackNudge: getComeBackNudge({
        checkInsThisWeek: checkInsThisWeek.length,
        checkIns,
        shots,
        mostSensitiveShotDay,
        daysUntilNextShot,
      }),
    };
  }, [checkIns, profile?.goalWeight, profile?.startWeight, shots, weights]);
};

export const formatInsightScore = (value: number | null) => {
  return value === null ? '—' : value.toFixed(1);
};

export const formatSideEffectLabel = (label: string) => {
  return label
    .replaceAll('_', ' ')
    .split(' ')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

export const getWeightTrendLinePath = (
  points: WeightTrendPoint[],
  width: number,
  height: number
) => {
  if (points.length < 2) {
    return '';
  }

  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const step = width / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = index * step;
      const y = height - ((point.value - minValue) / range) * height;
      const command = index === 0 ? 'M' : 'L';

      return `${command} ${x} ${y}`;
    })
    .join(' ');
};

export const getWeightTrendPointPosition = (
  point: WeightTrendPoint,
  index: number,
  points: WeightTrendPoint[],
  width: number,
  height: number
) => {
  const values = points.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const step = width / Math.max(points.length - 1, 1);

  return {
    x: index * step,
    y: height - ((point.value - minValue) / range) * height,
  };
};
