import { useMemo } from 'react';

import type { CheckInEntry } from '../../../shared/types';
import {
  getAverageStats,
  getCheckInAverages,
  getCurrentStreakStats,
  getLatestCheckIn,
  getLatestCheckInStats,
  getNotesStats,
  getSideEffectStats,
  getTotalCheckInsStats,
} from '../utils/checkInStatsUtils';

interface UseCheckInStatsCardsParams {
  checkIns: CheckInEntry[];
}

export const useCheckInStatsCards = ({ checkIns }: UseCheckInStatsCardsParams) => {
  return useMemo(() => {
    const latestCheckIn = getLatestCheckIn(checkIns);
    const averages = getCheckInAverages(checkIns);

    return {
      hasCheckIns: Boolean(latestCheckIn),
      latestCheckIn,
      totalCheckIns: getTotalCheckInsStats(checkIns),
      currentStreak: getCurrentStreakStats(checkIns),
      averageEnergy: getAverageStats(averages.energy),
      averageHunger: getAverageStats(averages.hunger),
      averageMood: getAverageStats(averages.mood),
      sideEffects: getSideEffectStats(checkIns),
      notes: getNotesStats(checkIns),
      latestCheckInStats: getLatestCheckInStats(checkIns),
    };
  }, [checkIns]);
};
