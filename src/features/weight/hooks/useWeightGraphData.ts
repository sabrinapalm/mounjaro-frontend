import { useMemo, useState } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { WeightEntry } from '../../../shared/types';
import { useProfile } from '../../profile/ProfileContext';
import {
  createWeightGraphChartData,
  getWeightGraphPeriodLabel,
  getWeightGraphPeriodMeta,
  getWeightGraphXAxisTicks,
  getWeightGraphYAxisDomain,
  type WeightGraphPeriod,
} from '../utils/weightGraphUtils';

interface UseWeightGraphDataParams {
  weights: WeightEntry[];
}

export const useWeightGraphData = ({ weights }: UseWeightGraphDataParams) => {
  const [period, setPeriod] = useState<WeightGraphPeriod>('all');

  const { unitSystem } = useProfile();
  const { weightUnit, convertWeightFromKg } = useUnitSettings(unitSystem);

  const chartData = useMemo(() => {
    return createWeightGraphChartData({
      weights,
      period,
      convertWeightFromKg,
    });
  }, [convertWeightFromKg, period, weights]);

  const yAxisDomain = useMemo(() => getWeightGraphYAxisDomain(chartData), [chartData]);

  const xAxisTicks = useMemo(() => getWeightGraphXAxisTicks(chartData), [chartData]);

  const selectedPeriodLabel = useMemo(() => getWeightGraphPeriodLabel(period), [period]);

  const periodMeta = useMemo(() => {
    return getWeightGraphPeriodMeta(period, chartData.length, weights.length);
  }, [chartData.length, period, weights.length]);

  return {
    period,
    setPeriod,
    chartData,
    yAxisDomain,
    xAxisTicks,
    selectedPeriodLabel,
    periodMeta,
    weightUnit,
  };
};
