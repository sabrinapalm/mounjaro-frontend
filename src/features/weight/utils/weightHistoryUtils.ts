import type { WeightEntry } from '../../../shared/types';
import { getTimestamp } from '../../../shared/utils/dateHelpers';

export type WeightMonthGroup = {
  key: string;
  label: string;
  weights: WeightEntry[];
};

export const getWeightHistoryTimestamp = (entry: WeightEntry) => {
  const timestamp = getTimestamp(entry.dateTime);

  if (!Number.isNaN(timestamp)) {
    return timestamp;
  }

  const timestampFromId = entry.id?.split('_')[1];

  return timestampFromId ? Number(timestampFromId) : 0;
};

export const sortWeightsNewestFirst = (weights: WeightEntry[]) =>
  [...weights].sort(
    (firstWeight, secondWeight) =>
      getWeightHistoryTimestamp(secondWeight) - getWeightHistoryTimestamp(firstWeight)
  );

export const getNextWeightHistoryCount = (
  visibleCount: number,
  totalCount: number,
  pageSize: number
) => Math.min(visibleCount + pageSize, totalCount);

export const getWeightChangeInDisplayUnits = (
  currentWeightKg: number,
  previousWeightKg: number,
  convertWeightFromKg: (weightInKg: number) => number
) => convertWeightFromKg(currentWeightKg - previousWeightKg);

export const groupWeightsByMonth = (weights: WeightEntry[]): WeightMonthGroup[] => {
  const groups = new Map<string, WeightMonthGroup>();

  for (const weight of weights) {
    const date = new Date(weight.dateTime);
    const isValidDate = Number.isFinite(date.getTime());
    const key = isValidDate
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      : 'unknown-date';
    const label = isValidDate
      ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'Date unavailable';
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.weights.push(weight);
    } else {
      groups.set(key, { key, label, weights: [weight] });
    }
  }

  return [...groups.values()];
};
