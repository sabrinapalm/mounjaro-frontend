import { useMemo } from 'react';

import type { ShotEntry, WeightEntry } from '../types';
import {
  buildInjectionPeriods,
  buildInjectionSiteStats,
} from '../utils/injectionSiteWeightLossUtils';

interface UseInjectionSiteWeightLossStatsParams {
  shots: ShotEntry[];
  weights: WeightEntry[];
}

export const useInjectionSiteWeightLossStats = ({
  shots,
  weights,
}: UseInjectionSiteWeightLossStatsParams) => {
  const periods = useMemo(() => buildInjectionPeriods(shots, weights), [shots, weights]);

  const stats = useMemo(() => buildInjectionSiteStats(periods), [periods]);

  return {
    periods,
    stats,
    bestSite: stats[0] ?? null,
    hasStats: stats.length > 0,
  };
};
