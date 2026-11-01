import { type ReactNode, useMemo } from 'react';
import { LuCalendarCheck, LuFlame, LuHeartPulse, LuTrendingDown } from 'react-icons/lu';
import type { MetricCardTone } from '../../../shared/components/MetricCard';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import { useProfile } from '../../profile/ProfileContext';
import type { useInsights } from './useInsights';

export type SummaryCard = {
  label: string;
  value: ReactNode;
  meta: ReactNode;
  icon: ReactNode;
  tone: MetricCardTone;
  highlightValue?: boolean;
};

type UseInsightsSummaryCardsParams = {
  insights: ReturnType<typeof useInsights>;
};

export const useInsightsSummaryCards = ({ insights }: UseInsightsSummaryCardsParams) => {
  const { unitSystem } = useProfile();
  const { displayWeightFromKg, weightUnit } = useUnitSettings(unitSystem);

  return useMemo<SummaryCard[]>(() => {
    return [
      {
        label: 'This Week',
        value: `${insights.checkInsThisWeek.length}/7`,
        meta:
          insights.checkInsThisWeek.length >= 4
            ? 'Enough data for weekly patterns'
            : 'More check-ins unlock better insights',
        icon: <LuCalendarCheck aria-hidden='true' />,
        tone: 'info',
      },
      {
        label: 'Current Streak',
        value: `${insights.checkInStreak} day${insights.checkInStreak === 1 ? '' : 's'}`,
        meta:
          insights.checkInStreak >= 3
            ? 'Your pattern data is getting stronger'
            : 'Small daily logs matter most',
        icon: <LuFlame aria-hidden='true' />,
        tone: 'warning',
      },
      {
        label: 'Weight Trend',
        value:
          insights.averageLossPerWeek !== null && Number.isFinite(insights.averageLossPerWeek)
            ? `${displayWeightFromKg(Math.abs(insights.averageLossPerWeek))}${weightUnit}/week`
            : '—',
        meta: insights.trendDescription,
        icon: <LuTrendingDown aria-hidden='true' />,
        tone: 'accent',
        highlightValue: true,
      },
      {
        label: 'Side Effects',
        value: `${insights.sideEffectDaysThisWeek} day${
          insights.sideEffectDaysThisWeek === 1 ? '' : 's'
        }`,
        meta: insights.sideEffectTrendLabel,
        icon: <LuHeartPulse aria-hidden='true' />,
        tone: insights.sideEffectTone,
      },
    ];
  }, [displayWeightFromKg, weightUnit, insights]);
};
