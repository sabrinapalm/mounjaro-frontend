import type { ShotEntry, WeightEntry } from '../types';
import { getTimestamp as getDateTimestamp } from './dateHelpers';

export type InjectionSite = NonNullable<ShotEntry['injectionSite']>;

export type InjectionSiteStat = {
  injectionSite: InjectionSite;
  label: string;
  completedPeriods: number;
  totalWeightLoss: number;
  averageWeightLoss: number;
  bestPeriodLoss: number;
};

export type InjectionPeriod = {
  shotId: string;
  injectionSite: InjectionSite;
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

export const formatWeightChange = (value: number) => {
  return `${value.toFixed(1)} kg`;
};

export const getInjectionSiteLabel = (injectionSite: string) => {
  return injectionSiteLabels[injectionSite] ?? injectionSite;
};

const getSafeTimestamp = (dateTime: string) => {
  const timestamp = getDateTimestamp(dateTime);

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortShotsByDateTimeAscending = (shots: ShotEntry[]) => {
  return [...shots].sort((a, b) => getSafeTimestamp(a.dateTime) - getSafeTimestamp(b.dateTime));
};

const sortWeightsByDateTimeAscending = (weights: WeightEntry[]) => {
  return [...weights].sort((a, b) => getSafeTimestamp(a.dateTime) - getSafeTimestamp(b.dateTime));
};

const findLatestWeightAtOrBefore = (
  weights: WeightEntry[],
  timestamp: number
): WeightEntry | null => {
  for (let index = weights.length - 1; index >= 0; index -= 1) {
    const weight = weights[index];

    if (getSafeTimestamp(weight.dateTime) <= timestamp) {
      return weight;
    }
  }

  return null;
};

const findLatestWeightBetween = ({
  weights,
  startTimestamp,
  endTimestamp,
}: {
  weights: WeightEntry[];
  startTimestamp: number;
  endTimestamp: number | null;
}): WeightEntry | null => {
  for (let index = weights.length - 1; index >= 0; index -= 1) {
    const weight = weights[index];
    const weightTimestamp = getSafeTimestamp(weight.dateTime);

    if (weightTimestamp <= startTimestamp) {
      continue;
    }

    if (endTimestamp !== null && weightTimestamp >= endTimestamp) {
      continue;
    }

    return weight;
  }

  return null;
};

export const buildInjectionPeriods = (
  shots: ShotEntry[],
  weights: WeightEntry[]
): InjectionPeriod[] => {
  const sortedShots = sortShotsByDateTimeAscending(shots);
  const sortedWeights = sortWeightsByDateTimeAscending(weights);

  return sortedShots.flatMap((shot, shotIndex) => {
    if (!shot.injectionSite) {
      return [];
    }

    const shotTimestamp = getSafeTimestamp(shot.dateTime);
    const nextShot = sortedShots[shotIndex + 1] ?? null;
    const nextShotTimestamp = nextShot ? getSafeTimestamp(nextShot.dateTime) : null;

    const weightBeforeShot = findLatestWeightAtOrBefore(sortedWeights, shotTimestamp);

    const weightAfterShot = findLatestWeightBetween({
      weights: sortedWeights,
      startTimestamp: shotTimestamp,
      endTimestamp: nextShotTimestamp,
    });

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

export const buildInjectionSiteStats = (periods: InjectionPeriod[]): InjectionSiteStat[] => {
  const groupedPeriods = periods.reduce<Partial<Record<InjectionSite, InjectionPeriod[]>>>(
    (acc, period) => {
      acc[period.injectionSite] = [...(acc[period.injectionSite] ?? []), period];

      return acc;
    },
    {}
  );

  return Object.entries(groupedPeriods)
    .flatMap(([injectionSite, sitePeriods]) => {
      if (!sitePeriods?.length) {
        return [];
      }

      const totalWeightLoss = sitePeriods.reduce((sum, period) => sum + period.weightLoss, 0);
      const averageWeightLoss = totalWeightLoss / sitePeriods.length;
      const bestPeriodLoss = Math.max(...sitePeriods.map((period) => period.weightLoss));

      return [
        {
          injectionSite: injectionSite as InjectionSite,
          label: getInjectionSiteLabel(injectionSite),
          completedPeriods: sitePeriods.length,
          totalWeightLoss,
          averageWeightLoss,
          bestPeriodLoss,
        },
      ];
    })
    .sort((a, b) => b.averageWeightLoss - a.averageWeightLoss);
};
