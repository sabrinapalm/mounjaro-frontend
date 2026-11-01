import dayjs from 'dayjs';
import { useMemo } from 'react';

import type { ShotEntry } from '../../../shared/types';
import {
  getLatestDoseStats,
  getLatestShot,
  getMostUsedInjectionSiteStats,
  getNextShotStats,
  getNotesStats,
  getSideEffectStats,
  getTotalShotsStats,
} from '../utils/shotStatsUtils';

interface UseShotStatsCardsParams {
  shots: ShotEntry[];
}

export const useShotStatsCards = ({ shots }: UseShotStatsCardsParams) => {
  return useMemo(() => {
    const latestShot = getLatestShot(shots);

    if (!latestShot) {
      return {
        hasShots: false,
        latestShot: null,
        latestShotDate: null,
        nextShotDate: null,
        totalShots: null,
        latestDose: null,
        nextShot: null,
        mostUsedSite: null,
        sideEffects: null,
        notes: null,
      };
    }

    const latestShotDate = dayjs(latestShot.dateTime).startOf('day');
    const nextShot = getNextShotStats(latestShotDate);

    return {
      hasShots: true,
      latestShot,
      latestShotDate,
      nextShotDate: nextShot.date,
      totalShots: getTotalShotsStats(shots),
      latestDose: getLatestDoseStats(latestShot),
      nextShot,
      mostUsedSite: getMostUsedInjectionSiteStats(shots),
      sideEffects: getSideEffectStats(shots),
      notes: getNotesStats(shots),
    };
  }, [shots]);
};
