import {
  formatShortDateLabel,
  getStartDateForMonthsAgo,
  getTimestamp,
} from '../../../shared/utils/dateHelpers';

export type WeightGraphPeriod = '1m' | '3m' | '6m' | 'all';

export interface WeightGraphChartData {
  label: string;
  weight: number;
  dateTime: string;
}

export const weightGraphPeriodOptions: { value: WeightGraphPeriod; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
];

const periodMonths: Record<Exclude<WeightGraphPeriod, 'all'>, number> = {
  '1m': 1,
  '3m': 3,
  '6m': 6,
};

export const getWeightGraphPeriodStartDateTime = (period: WeightGraphPeriod) => {
  if (period === 'all') {
    return null;
  }

  return getStartDateForMonthsAgo(periodMonths[period]);
};

export const getWeightGraphYAxisDomain = (data: WeightGraphChartData[]) => {
  if (data.length === 0) {
    return ['auto', 'auto'] as const;
  }

  const weightValues = data.map((entry) => entry.weight);
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  const range = maxWeight - minWeight;
  const padding = Math.max(range * 0.2, 2);

  return [Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)] as const;
};

export const getWeightGraphXAxisTicks = (data: WeightGraphChartData[]) => {
  if (data.length <= 6) {
    return data.map((entry) => entry.dateTime);
  }

  const first = data[0]?.dateTime;
  const last = data[data.length - 1]?.dateTime;

  const middleTicks = [
    data[Math.floor(data.length * 0.25)]?.dateTime,
    data[Math.floor(data.length * 0.5)]?.dateTime,
    data[Math.floor(data.length * 0.75)]?.dateTime,
  ];

  return Array.from(new Set([first, ...middleTicks, last].filter(Boolean)));
};

export const getWeightGraphPeriodMeta = (
  period: WeightGraphPeriod,
  visibleCount: number,
  totalCount: number
) => {
  if (totalCount === 0) {
    return 'No weight entries yet';
  }

  if (period === 'all') {
    return `${totalCount} total ${totalCount === 1 ? 'entry' : 'entries'}`;
  }

  return `${visibleCount} of ${totalCount} ${totalCount === 1 ? 'entry' : 'entries'} shown`;
};

export const getWeightGraphPeriodLabel = (period: WeightGraphPeriod) => {
  return weightGraphPeriodOptions.find((option) => option.value === period)?.label ?? 'All Time';
};

export const createWeightGraphChartData = <TWeight extends { dateTime: string; weight: number }>({
  weights,
  period,
  convertWeightFromKg,
}: {
  weights: TWeight[];
  period: WeightGraphPeriod;
  convertWeightFromKg: (weightInKg: number) => number;
}): WeightGraphChartData[] => {
  const periodStartDateTime = getWeightGraphPeriodStartDateTime(period);
  const periodStartTimestamp = periodStartDateTime ? getTimestamp(periodStartDateTime) : null;

  return [...weights]
    .filter((entry) => {
      if (!periodStartTimestamp) {
        return true;
      }

      return getTimestamp(entry.dateTime) >= periodStartTimestamp;
    })
    .sort((a, b) => getTimestamp(a.dateTime) - getTimestamp(b.dateTime))
    .map((entry) => ({
      label: formatShortDateLabel(entry.dateTime),
      dateTime: entry.dateTime,
      weight: convertWeightFromKg(entry.weight),
    }));
};
