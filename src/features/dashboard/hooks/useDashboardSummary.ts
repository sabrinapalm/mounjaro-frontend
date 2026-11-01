import { useMemo } from 'react';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import {
  addDays,
  formatDateLabel,
  getDueLabel,
  getLocalDate,
  getTimestamp,
  getTodayStartOfDay,
} from '../../../shared/utils/dateHelpers';

export interface UseDashboardSummaryParams {
  shots: ShotEntry[];
  weights: WeightEntry[];
}

export interface DashboardSummary {
  todayLabel: string;

  currentWeight: number | null;
  currentWeightDate: string | null;
  totalWeightLoss: number | null;

  nextShotDate: Date | null;
  nextShotLabel: string;
  nextShotMeta: string;

  currentDose: string;
  currentDoseMeta: string;
}

const getWeightDateTime = (entry: WeightEntry) => {
  return entry.dateTime ?? entry.dateTime;
};

const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = getTimestamp(getWeightDateTime(entry));

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

const getShotTimestamp = (entry: ShotEntry) => {
  return getTimestamp(getLocalDate(entry.dateTime));
};

const getDoseWeek = (sortedShots: ShotEntry[], latestShot: ShotEntry | null) => {
  if (!latestShot || sortedShots.length === 0) {
    return null;
  }

  const latestShotIndex = sortedShots.findIndex((shot) => shot.id === latestShot.id);

  if (latestShotIndex === -1) {
    return sortedShots.length;
  }

  return latestShotIndex + 1;
};

export const useDashboardSummary = ({
  shots,
  weights,
}: UseDashboardSummaryParams): DashboardSummary => {
  return useMemo(() => {
    const today = getTodayStartOfDay();

    const sortedWeights = [...weights].sort((a, b) => {
      return getWeightTimestamp(a) - getWeightTimestamp(b);
    });

    const sortedShots = [...shots].sort((a, b) => {
      return getShotTimestamp(a) - getShotTimestamp(b);
    });

    const latestWeight = sortedWeights.length ? sortedWeights[sortedWeights.length - 1] : null;
    const firstWeight = sortedWeights.length ? sortedWeights[0] : null;

    const currentWeight = latestWeight?.weight ?? null;
    const currentWeightDate = latestWeight ? getWeightDateTime(latestWeight) : null;
    const totalWeightLoss =
      firstWeight && latestWeight ? firstWeight.weight - latestWeight.weight : null;

    const latestShot = sortedShots.length > 0 ? sortedShots[sortedShots.length - 1] : null;

    const nextShotDate = latestShot ? addDays(getLocalDate(latestShot.dateTime), 7) : null;
    const nextShotLabel = nextShotDate ? formatDateLabel(nextShotDate) : '—';
    const nextShotMeta = nextShotDate ? getDueLabel(nextShotDate, today) : 'No shots yet';

    const currentDose = latestShot ? `${latestShot.dosage.toFixed(1)} mg` : '—';

    const doseWeek = getDoseWeek(sortedShots, latestShot);

    const currentDoseMeta = doseWeek ? `Week ${doseWeek}` : 'No dose recorded';

    return {
      todayLabel: formatDateLabel(today),
      currentWeight,
      currentWeightDate,
      totalWeightLoss,
      nextShotDate,
      nextShotLabel,
      nextShotMeta,
      currentDose,
      currentDoseMeta,
    };
  }, [shots, weights]);
};
