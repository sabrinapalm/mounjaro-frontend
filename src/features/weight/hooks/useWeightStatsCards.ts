import { useMemo } from 'react';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { WeightEntry } from '../../../shared/types';
import { useProfile } from '../../profile/ProfileContext';
import {
  formatSignedWeightFromKg,
  getAverageWeightChangeTone,
  getTotalWeightLossTone,
  getTotalWeightLossTrendDirection,
  getWeightEntryMeta,
  getWeightStatsData,
  type WeightAverageStatDisplay,
  type WeightStatDisplay,
  type WeightTrendStatDisplay,
} from '../utils/weightStatsUtils';

interface UseWeightStatsCardsParams {
  weights: WeightEntry[];
}

type WeightStatsCardsData =
  | {
      hasWeights: false;
    }
  | {
      hasWeights: true;
      currentWeight: WeightStatDisplay;
      totalWeightLoss: WeightTrendStatDisplay;
      averagePerWeek: WeightAverageStatDisplay;
      averagePerMonth: WeightAverageStatDisplay;
      journeyWeek: WeightStatDisplay;
      weightEntries: WeightStatDisplay;
    };

export const useWeightStatsCards = ({
  weights,
}: UseWeightStatsCardsParams): WeightStatsCardsData => {
  const { profile } = useProfile();
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile?.unitSystem ?? 'metric');

  return useMemo(() => {
    const statsData = getWeightStatsData(weights);

    if (!statsData) {
      return {
        hasWeights: false,
      };
    }

    const {
      latestWeight,
      firstDate,
      latestDate,
      trackingWeeks,
      totalChangeKg,
      totalLossKg,
      averageChangePerWeekKg,
      averageChangePerMonthKg,
    } = statsData;

    const formatWeight = (weightInKg: number) => {
      return `${displayWeightFromKg(weightInKg)} ${weightUnit}`;
    };

    const formatSignedWeight = (valueInKg: number) => {
      return formatSignedWeightFromKg({
        valueInKg,
        unit: weightUnit,
        displayWeightFromKg,
      });
    };

    const totalWeightLossValue =
      totalLossKg >= 0 ? formatWeight(totalLossKg) : formatSignedWeight(totalChangeKg);

    return {
      hasWeights: true,
      currentWeight: {
        value: formatWeight(latestWeight.weight),
        meta: `Latest measurement ${latestDate.format('MMM D')}`,
      },
      totalWeightLoss: {
        value: totalWeightLossValue,
        meta: 'Since start',
        tone: getTotalWeightLossTone(totalLossKg),
        trendDirection: getTotalWeightLossTrendDirection(totalLossKg),
      },
      averagePerWeek: {
        value: formatSignedWeight(averageChangePerWeekKg),
        meta: 'Based on full history',
        tone: getAverageWeightChangeTone(averageChangePerWeekKg),
      },
      averagePerMonth: {
        value: formatSignedWeight(averageChangePerMonthKg),
        meta: `Since ${firstDate.format('MMM D')}`,
        tone: getAverageWeightChangeTone(averageChangePerMonthKg),
      },
      journeyWeek: {
        value: `Week ${trackingWeeks}`,
        meta: 'Your current journey week',
      },
      weightEntries: {
        value: weights.length,
        meta: getWeightEntryMeta(weights.length),
      },
    };
  }, [weights, displayWeightFromKg, weightUnit]);
};
