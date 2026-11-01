import dayjs, { type Dayjs } from 'dayjs';

import type { WeightEntry } from '../../../shared/types';
import { getTimestamp as getDateTimestamp } from '../../../shared/utils/dateHelpers';

export type WeightStatTone = 'primary' | 'accent' | 'danger' | 'warning' | 'info' | 'neutral';

export type WeightTrendDirection = 'down' | 'up';

export type WeightStatDisplay = {
  value: string | number;
  meta: string;
};

export type WeightTrendStatDisplay = WeightStatDisplay & {
  tone: WeightStatTone;
  trendDirection: WeightTrendDirection;
};

export type WeightAverageStatDisplay = WeightStatDisplay & {
  tone: WeightStatTone;
};

export type WeightStatsData = {
  firstWeight: WeightEntry;
  latestWeight: WeightEntry;
  firstDate: Dayjs;
  latestDate: Dayjs;
  trackingWeeks: number;
  totalChangeKg: number;
  totalLossKg: number;
  averageChangePerWeekKg: number;
  averageChangePerMonthKg: number;
};

type FormatSignedWeightFromKgParams = {
  valueInKg: number;
  unit: string;
  displayWeightFromKg: (weightInKg: number) => string;
};

export const getWeightTimestamp = (entry: WeightEntry) => {
  const timestamp = getDateTimestamp(entry.dateTime);

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const sortWeightsByDateTimeAscending = (weights: WeightEntry[]) => {
  return [...weights].sort(
    (firstWeight, secondWeight) =>
      getWeightTimestamp(firstWeight) - getWeightTimestamp(secondWeight)
  );
};

export const getWeightStatsData = (weights: WeightEntry[]): WeightStatsData | null => {
  const sortedWeights = sortWeightsByDateTimeAscending(weights);

  const firstWeight = sortedWeights[0] ?? null;
  const latestWeight = sortedWeights[sortedWeights.length - 1] ?? null;

  if (!firstWeight || !latestWeight) {
    return null;
  }

  const firstDate = dayjs(firstWeight.dateTime).startOf('day');
  const latestDate = dayjs(latestWeight.dateTime).startOf('day');

  const daysBetween = Math.max(latestDate.diff(firstDate, 'day'), 1);
  const weeksBetween = daysBetween / 7;
  const monthsBetween = daysBetween / 30.44;

  const trackingWeeks = Math.max(Math.ceil(daysBetween / 7), 1);

  const totalChangeKg = latestWeight.weight - firstWeight.weight;
  const totalLossKg = firstWeight.weight - latestWeight.weight;

  return {
    firstWeight,
    latestWeight,
    firstDate,
    latestDate,
    trackingWeeks,
    totalChangeKg,
    totalLossKg,
    averageChangePerWeekKg: totalChangeKg / weeksBetween,
    averageChangePerMonthKg: totalChangeKg / monthsBetween,
  };
};

export const formatSignedWeightFromKg = ({
  valueInKg,
  unit,
  displayWeightFromKg,
}: FormatSignedWeightFromKgParams) => {
  const displayValue = displayWeightFromKg(Math.abs(valueInKg));

  if (valueInKg > 0) {
    return `+${displayValue} ${unit}`;
  }

  if (valueInKg < 0) {
    return `-${displayValue} ${unit}`;
  }

  return `${displayWeightFromKg(0)} ${unit}`;
};

export const getAverageWeightChangeTone = (changeInKg: number): WeightStatTone => {
  return changeInKg <= 0 ? 'accent' : 'warning';
};

export const getTotalWeightLossTone = (totalLossKg: number): WeightStatTone => {
  return totalLossKg >= 0 ? 'accent' : 'danger';
};

export const getTotalWeightLossTrendDirection = (totalLossKg: number): WeightTrendDirection => {
  return totalLossKg >= 0 ? 'down' : 'up';
};

export const getWeightEntryMeta = (entryCount: number) => {
  return entryCount === 1 ? '1 weight entry logged' : `${entryCount} weight entries logged`;
};
