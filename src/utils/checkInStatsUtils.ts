import dayjs, { type Dayjs } from 'dayjs';

import type { CheckInEntry, CheckInLevel, SideEffect } from '../types';

export type CheckInStatDisplay = {
  value: string | number;
  meta: string;
};

export type CheckInAverages = {
  energy: number | null;
  hunger: number | null;
  mood: number | null;
};

export const sideEffectLabels: Record<SideEffect, string> = {
  nausea: 'Nausea',
  fatigue: 'Fatigue',
  headache: 'Headache',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  stomach_pain: 'Stomach pain',
  injection_site_reaction: 'Injection site reaction',
  reduced_appetite: 'Reduced appetite',
  heartburn: 'Heartburn',
  other: 'Other',
};

export const getCheckInTimestamp = (checkIn: CheckInEntry) => {
  const timestamp = dayjs(checkIn.dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortCheckInsByDateTimeAscending = (checkIns: CheckInEntry[]) => {
  return [...checkIns].sort(
    (firstCheckIn, secondCheckIn) =>
      getCheckInTimestamp(firstCheckIn) - getCheckInTimestamp(secondCheckIn)
  );
};

export const getLatestCheckIn = (checkIns: CheckInEntry[]) => {
  const sortedCheckIns = sortCheckInsByDateTimeAscending(checkIns);

  return sortedCheckIns[sortedCheckIns.length - 1] ?? null;
};

export const formatAverage = (value: number | null) => {
  if (value === null) {
    return 'No data';
  }

  return value.toFixed(1);
};

export const getAverage = (values: Array<CheckInLevel | undefined>) => {
  const validValues = values.filter((value): value is CheckInLevel => typeof value === 'number');

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return total / validValues.length;
};

export const getCheckInAverages = (checkIns: CheckInEntry[]): CheckInAverages => {
  return {
    energy: getAverage(checkIns.map((checkIn) => checkIn.energyLevel)),
    hunger: getAverage(checkIns.map((checkIn) => checkIn.hungerLevel)),
    mood: getAverage(checkIns.map((checkIn) => checkIn.moodLevel)),
  };
};

const getCheckInDateKey = (checkIn: CheckInEntry) => {
  const parsedDate = dayjs(checkIn.dateTime);

  return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
};

export const getCurrentStreak = (checkIns: CheckInEntry[], today: Dayjs = dayjs()) => {
  const loggedDays = new Set(
    checkIns.map(getCheckInDateKey).filter((dateKey): dateKey is string => Boolean(dateKey))
  );

  if (loggedDays.size === 0) {
    return 0;
  }

  let streak = 0;
  let currentDay = today.startOf('day');

  while (loggedDays.has(currentDay.format('YYYY-MM-DD'))) {
    streak += 1;
    currentDay = currentDay.subtract(1, 'day');
  }

  return streak;
};

const getSideEffectCounts = (checkIns: CheckInEntry[]) => {
  return checkIns.reduce<Partial<Record<SideEffect, number>>>((counts, checkIn) => {
    checkIn.sideEffects?.forEach((sideEffect) => {
      counts[sideEffect] = (counts[sideEffect] ?? 0) + 1;
    });

    return counts;
  }, {});
};

const getMostCommonSideEffect = (checkIns: CheckInEntry[]) => {
  const sideEffectCounts = getSideEffectCounts(checkIns);

  const sortedSideEffects = Object.entries(sideEffectCounts)
    .flatMap(([sideEffect, count]) => {
      if (typeof count !== 'number') {
        return [];
      }

      return [
        {
          sideEffect: sideEffect as SideEffect,
          count,
        },
      ];
    })
    .sort((firstSideEffect, secondSideEffect) => secondSideEffect.count - firstSideEffect.count);

  return sortedSideEffects[0] ?? null;
};

export const getSideEffectStats = (checkIns: CheckInEntry[]): CheckInStatDisplay => {
  const checkInsWithSideEffects = checkIns.filter((checkIn) => {
    return (checkIn.sideEffects?.length ?? 0) > 0;
  });

  if (!checkIns.length) {
    return {
      value: 'No data yet',
      meta: 'Log side effects to see patterns',
    };
  }

  if (!checkInsWithSideEffects.length) {
    return {
      value: 'None logged',
      meta: 'No side effects recorded',
    };
  }

  const mostCommonSideEffect = getMostCommonSideEffect(checkIns);

  return {
    value: `${checkInsWithSideEffects.length}/${checkIns.length}`,
    meta: mostCommonSideEffect
      ? `Most common: ${sideEffectLabels[mostCommonSideEffect.sideEffect]}`
      : 'Side effects recorded',
  };
};

export const getNotesStats = (checkIns: CheckInEntry[]): CheckInStatDisplay => {
  const notesCount = checkIns.filter((checkIn) => checkIn.notes?.trim()).length;

  if (!checkIns.length) {
    return {
      value: 'No data yet',
      meta: 'Add notes to remember context',
    };
  }

  if (!notesCount) {
    return {
      value: 'No notes',
      meta: 'Add notes to remember context',
    };
  }

  return {
    value: String(notesCount),
    meta: notesCount === 1 ? '1 check-in has notes' : `${notesCount} check-ins have notes`,
  };
};

export const getLatestCheckInStats = (
  checkIns: CheckInEntry[],
  today: Dayjs = dayjs()
): CheckInStatDisplay => {
  const latestCheckIn = getLatestCheckIn(checkIns);

  if (!latestCheckIn) {
    return {
      value: 'No data yet',
      meta: 'Log your first daily check-in',
    };
  }

  const latestDate = dayjs(latestCheckIn.dateTime);
  const daysSinceLatest = today.startOf('day').diff(latestDate.startOf('day'), 'day');

  if (daysSinceLatest === 0) {
    return {
      value: 'Today',
      meta: latestDate.format('MMM D'),
    };
  }

  if (daysSinceLatest === 1) {
    return {
      value: 'Yesterday',
      meta: latestDate.format('MMM D'),
    };
  }

  return {
    value: `${daysSinceLatest} days ago`,
    meta: latestDate.format('MMM D'),
  };
};

export const getTotalCheckInsStats = (checkIns: CheckInEntry[]): CheckInStatDisplay => {
  return {
    value: checkIns.length,
    meta: checkIns.length === 1 ? '1 check-in logged' : `${checkIns.length} check-ins logged`,
  };
};

export const getCurrentStreakStats = (checkIns: CheckInEntry[]): CheckInStatDisplay => {
  const currentStreak = getCurrentStreak(checkIns);

  return {
    value: currentStreak,
    meta: currentStreak === 1 ? '1 day in a row' : `${currentStreak} days in a row`,
  };
};

export const getAverageStats = (average: number | null): CheckInStatDisplay => {
  return {
    value: formatAverage(average),
    meta: 'Out of 5',
  };
};
