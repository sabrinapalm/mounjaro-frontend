import { useMemo } from 'react';
import type { ShotEntry, WeightEntry } from '../types';
import {
  getLocalDate,
  addDays,
  formatDateLabel,
  getDueLabel,
} from '../utils/dateHelpers';

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

export const useDashboardSummary = ({
  shots,
  weights,
}: UseDashboardSummaryParams): DashboardSummary => {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort weights by date
    const sortedWeights = [...weights].sort((a, b) => {
      const aTime = getLocalDate(a.date).getTime();
      const bTime = getLocalDate(b.date).getTime();
      return aTime - bTime;
    });

    // Sort shots by date
    const sortedShots = [...shots].sort((a, b) => {
      const aTime = getLocalDate(a.date).getTime();
      const bTime = getLocalDate(b.date).getTime();
      return aTime - bTime;
    });

    // Calculate weight summary
    const latestWeight = sortedWeights.length
      ? sortedWeights[sortedWeights.length - 1]
      : null;
    const firstWeight = sortedWeights.length ? sortedWeights[0] : null;

    const currentWeight = latestWeight?.weight ?? null;
    const currentWeightDate = latestWeight?.date ?? null;
    const totalWeightLoss =
      firstWeight && latestWeight
        ? firstWeight.weight - latestWeight.weight
        : null;

    // Calculate shot summary
    const latestShot = sortedShots.length > 0
      ? sortedShots[sortedShots.length - 1]
      : null;

    const nextShotDate = latestShot
      ? addDays(getLocalDate(latestShot.date), 7)
      : null;

    const nextShotLabel = nextShotDate ? formatDateLabel(nextShotDate) : '—';

    const nextShotMeta = nextShotDate
      ? getDueLabel(nextShotDate, today)
      : 'No shots yet';

    const currentDose = latestShot
      ? `${latestShot.dosage.toFixed(1)} mg`
      : '—';

    const currentDoseMeta = latestShot
      ? `Since ${formatDateLabel(latestShot.date)}`
      : 'No dose recorded';

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
