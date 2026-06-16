import {
  LuActivity,
  LuCalendarCheck,
  LuFlame,
  LuHeartPulse,
  LuMessageSquareText,
  LuSparkles,
} from 'react-icons/lu';

import { useCheckInStatsCards } from '../../hooks/useCheckInStatsCards';
import type { CheckInEntry } from '../../types';
import { MetricCard } from '../general/MetricCard';
import './CheckInStatsCards.css';

type CheckInStatsCardsProps = {
  checkIns: CheckInEntry[];
};

export const CheckInStatsCards = ({ checkIns }: CheckInStatsCardsProps) => {
  const {
    hasCheckIns,
    totalCheckIns,
    currentStreak,
    averageEnergy,
    averageMood,
    averageHunger,
    sideEffects,
    notes,
    latestCheckInStats,
  } = useCheckInStatsCards({ checkIns });

  if (!hasCheckIns) {
    return (
      <div className='dashboard-summary-cards check-in-summary-cards'>
        <MetricCard
          label='Check-in Insights'
          value='No data yet'
          meta='Log your first daily check-in to see patterns'
          icon={<LuHeartPulse aria-hidden='true' />}
          tone='primary'
          className='check-in-summary-card check-in-summary-card--empty'
        />
      </div>
    );
  }

  return (
    <div className='dashboard-summary-cards check-in-summary-cards'>
      <MetricCard
        label='Total Check-ins'
        value={totalCheckIns.value}
        meta={totalCheckIns.meta}
        icon={<LuCalendarCheck aria-hidden='true' />}
        tone='info'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Current Streak'
        value={currentStreak.value}
        meta={currentStreak.meta}
        icon={<LuFlame aria-hidden='true' />}
        tone='warning'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Energy'
        value={averageEnergy.value}
        meta={averageEnergy.meta}
        icon={<LuSparkles aria-hidden='true' />}
        tone='accent'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Mood'
        value={averageMood.value}
        meta={averageMood.meta}
        icon={<LuHeartPulse aria-hidden='true' />}
        tone='primary'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Hunger'
        value={averageHunger.value}
        meta={averageHunger.meta}
        icon={<LuActivity aria-hidden='true' />}
        tone='secondary'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Side Effects'
        value={sideEffects.value}
        meta={sideEffects.meta}
        icon={<LuActivity aria-hidden='true' />}
        tone='warning'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Notes'
        value={notes.value}
        meta={notes.meta}
        icon={<LuMessageSquareText aria-hidden='true' />}
        tone='neutral'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Latest Check-in'
        value={latestCheckInStats.value}
        meta={latestCheckInStats.meta}
        icon={<LuHeartPulse aria-hidden='true' />}
        tone='success'
        className='check-in-summary-card'
      />
    </div>
  );
};
