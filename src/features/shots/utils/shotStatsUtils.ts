import dayjs, { type Dayjs } from 'dayjs';

import type { ShotEntry } from '../../../shared/types';
import { getTimestamp as getDateTimestamp } from '../../../shared/utils/dateHelpers';

export type ShotStatDisplay = {
  value: string | number;
  meta: string;
};

export type NextShotStatDisplay = ShotStatDisplay & {
  tone: 'danger' | 'warning' | 'info';
  date: Dayjs;
};

type InjectionSite = NonNullable<ShotEntry['injectionSite']>;
type ShotSideEffect = NonNullable<ShotEntry['sideEffects']>[number];

const sideEffectLabels: Partial<Record<ShotSideEffect, string>> = {
  fatigue: 'Fatigue',
  nausea: 'Nausea',
  headache: 'Headache',
  stomach_pain: 'Stomach pain',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  injection_site_reaction: 'Injection site reaction',
  reduced_appetite: 'Reduced appetite',
  heartburn: 'Heartburn',
  other: 'Other',
};

const injectionSiteLabels: Partial<Record<InjectionSite, string>> = {
  abdomen_left: 'Left abdomen',
  abdomen_right: 'Right abdomen',
  left_thigh: 'Left thigh',
  right_thigh: 'Right thigh',
  left_upper_arm: 'Left upper arm',
  right_upper_arm: 'Right upper arm',
  other: 'Other',
};

export const getShotTimestamp = (shot: ShotEntry) => {
  const timestamp = getDateTimestamp(shot.dateTime);

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortShotsByDateTimeAscending = (shots: ShotEntry[]) => {
  return [...shots].sort(
    (firstShot, secondShot) => getShotTimestamp(firstShot) - getShotTimestamp(secondShot)
  );
};

export const getLatestShot = (shots: ShotEntry[]) => {
  const sortedShots = sortShotsByDateTimeAscending(shots);

  return sortedShots[sortedShots.length - 1] ?? null;
};

export const formatDosage = (dosage: ShotEntry['dosage']) => {
  return `${dosage} mg`;
};

export const formatFallbackLabel = (value: string) => {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const formatInjectionSite = (site?: InjectionSite | string | null) => {
  if (!site) {
    return 'Not set';
  }

  return injectionSiteLabels[site as InjectionSite] ?? formatFallbackLabel(site);
};

export const formatSideEffect = (sideEffect?: ShotSideEffect | string | null) => {
  if (!sideEffect) {
    return 'None';
  }

  return sideEffectLabels[sideEffect as ShotSideEffect] ?? formatFallbackLabel(sideEffect);
};

export const getTotalShotsStats = (shots: ShotEntry[]): ShotStatDisplay => {
  return {
    value: shots.length,
    meta: shots.length === 1 ? '1 shot logged' : `${shots.length} shots logged`,
  };
};

export const getLatestDoseStats = (latestShot: ShotEntry): ShotStatDisplay => {
  const latestShotDate = dayjs(latestShot.dateTime);

  return {
    value: formatDosage(latestShot.dosage),
    meta: `Logged ${latestShotDate.format('MMM D')}`,
  };
};

export const getMostUsedInjectionSiteStats = (shots: ShotEntry[]): ShotStatDisplay => {
  const counts = shots.reduce<Partial<Record<InjectionSite, number>>>((acc, shot) => {
    if (!shot.injectionSite) {
      return acc;
    }

    acc[shot.injectionSite] = (acc[shot.injectionSite] ?? 0) + 1;

    return acc;
  }, {});

  const mostUsedSite = Object.entries(counts)
    .flatMap(([site, count]) => {
      if (typeof count !== 'number') {
        return [];
      }

      return [
        {
          site,
          count,
        },
      ];
    })
    .sort((firstSite, secondSite) => secondSite.count - firstSite.count)[0];

  if (!mostUsedSite) {
    return {
      value: 'Not set',
      meta: 'No injection sites logged yet',
    };
  }

  return {
    value: formatInjectionSite(mostUsedSite.site),
    meta: mostUsedSite.count === 1 ? 'Used once' : `Used ${mostUsedSite.count} times`,
  };
};

const getSideEffectCounts = (shots: ShotEntry[]) => {
  return shots.reduce<Partial<Record<ShotSideEffect, number>>>((acc, shot) => {
    shot.sideEffects?.forEach((sideEffect) => {
      acc[sideEffect] = (acc[sideEffect] ?? 0) + 1;
    });

    return acc;
  }, {});
};

const getMostCommonSideEffect = (shots: ShotEntry[]) => {
  const sideEffectCounts = getSideEffectCounts(shots);

  return Object.entries(sideEffectCounts)
    .flatMap(([sideEffect, count]) => {
      if (typeof count !== 'number') {
        return [];
      }

      return [
        {
          sideEffect,
          count,
        },
      ];
    })
    .sort((firstSideEffect, secondSideEffect) => secondSideEffect.count - firstSideEffect.count)[0];
};

export const getSideEffectStats = (shots: ShotEntry[]): ShotStatDisplay => {
  const shotsWithSideEffects = shots.filter((shot) => (shot.sideEffects?.length ?? 0) > 0);

  if (!shots.length) {
    return {
      value: 'No data yet',
      meta: 'Log side effects to see patterns',
    };
  }

  if (!shotsWithSideEffects.length) {
    return {
      value: 'None logged',
      meta: 'No side effects recorded',
    };
  }

  const mostCommonSideEffect = getMostCommonSideEffect(shots);

  return {
    value: `${shotsWithSideEffects.length}/${shots.length}`,
    meta: mostCommonSideEffect
      ? `Most common: ${formatSideEffect(mostCommonSideEffect.sideEffect)}`
      : 'Side effects recorded',
  };
};

export const getNotesStats = (shots: ShotEntry[]): ShotStatDisplay => {
  const notesCount = shots.filter((shot) => shot.notes?.trim()).length;

  if (!shots.length) {
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
    value: notesCount,
    meta: notesCount === 1 ? '1 shot has notes' : `${notesCount} shots have notes`,
  };
};

export const getNextShotStats = (
  latestShotDate: Dayjs,
  today: Dayjs = dayjs()
): NextShotStatDisplay => {
  const nextShotDate = latestShotDate.add(7, 'day').startOf('day');
  const daysUntilNextShot = nextShotDate.diff(today.startOf('day'), 'day');

  if (daysUntilNextShot < 0) {
    const overdueDays = Math.abs(daysUntilNextShot);

    return {
      value: 'Overdue',
      meta: `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} late`,
      tone: 'danger',
      date: nextShotDate,
    };
  }

  if (daysUntilNextShot === 0) {
    return {
      value: 'Today',
      meta: 'Your next shot is due today',
      tone: 'warning',
      date: nextShotDate,
    };
  }

  if (daysUntilNextShot === 1) {
    return {
      value: 'Tomorrow',
      meta: nextShotDate.format('MMM D'),
      tone: 'info',
      date: nextShotDate,
    };
  }

  return {
    value: `In ${daysUntilNextShot} days`,
    meta: nextShotDate.format('MMM D'),
    tone: 'info',
    date: nextShotDate,
  };
};
