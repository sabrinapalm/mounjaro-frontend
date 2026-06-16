import { useMemo } from 'react';

import { useProfile } from '../context/ProfileContext';
import type { WeightEntry } from '../types';
import {
  formatSignedWeightFromKg,
  getAverageWeightChangeTone,
  getCheckInMeta,
  getTotalWeightLossTone,
  getTotalWeightLossTrendDirection,
  getWeightStatsData,
  type WeightAverageStatDisplay,
  type WeightStatDisplay,
  type WeightTrendStatDisplay,
} from '../utils/weightStatsUtils';
import { useUnitSettings } from './useUnitSettings';

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
      checkIns: WeightStatDisplay;
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
        meta: `Latest check-in ${latestDate.format('MMM D')}`,
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
      checkIns: {
        value: weights.length,
        meta: getCheckInMeta(weights.length),
      },
    };
  }, [weights, displayWeightFromKg, weightUnit]);
};
