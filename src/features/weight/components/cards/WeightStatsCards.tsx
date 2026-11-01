import {
  LuCalendarCheck,
  LuCalendarDays,
  LuClipboardList,
  LuScale,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu';
import { MetricCard } from '../../../../shared/components/MetricCard';
import type { WeightEntry } from '../../../../shared/types';
import { useWeightStatsCards } from '../../hooks/useWeightStatsCards';
import './WeightStatsCards.css';

type WeightStatsCardsProps = {
  weights: WeightEntry[];
};

export const WeightStatsCards = ({ weights }: WeightStatsCardsProps) => {
  const stats = useWeightStatsCards({ weights });

  if (!stats.hasWeights) {
    return (
      <div className='dashboard-summary-cards weight-summary-cards'>
        <MetricCard
          label='Weight Insights'
          value='No data yet'
          meta='Add your first check-in to see trends'
          icon={<LuScale aria-hidden='true' />}
          tone='primary'
          className='weight-summary-card weight-summary-card--empty'
        />
      </div>
    );
  }

  return (
    <div className='dashboard-summary-cards weight-summary-cards'>
      <MetricCard
        label='Current Weight'
        value={stats.currentWeight.value}
        meta={stats.currentWeight.meta}
        icon={<LuScale aria-hidden='true' />}
        tone='primary'
        className='weight-summary-card'
      />

      <MetricCard
        label='Total Weight Loss'
        value={stats.totalWeightLoss.value}
        meta={stats.totalWeightLoss.meta}
        icon={
          stats.totalWeightLoss.trendDirection === 'down' ? (
            <LuTrendingDown aria-hidden='true' />
          ) : (
            <LuTrendingUp aria-hidden='true' />
          )
        }
        tone={stats.totalWeightLoss.tone}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Average / Week'
        value={stats.averagePerWeek.value}
        meta={stats.averagePerWeek.meta}
        icon={<LuCalendarDays aria-hidden='true' />}
        tone={stats.averagePerWeek.tone}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Average / Month'
        value={stats.averagePerMonth.value}
        meta={stats.averagePerMonth.meta}
        icon={<LuCalendarDays aria-hidden='true' />}
        tone={stats.averagePerMonth.tone}
        highlightValue
        className='weight-summary-card'
      />

      <MetricCard
        label='Journey Week'
        value={stats.journeyWeek.value}
        meta={stats.journeyWeek.meta}
        icon={<LuCalendarCheck aria-hidden='true' />}
        tone='info'
        className='weight-summary-card'
      />

      <MetricCard
        label='Check-ins'
        value={stats.checkIns.value}
        meta={stats.checkIns.meta}
        icon={<LuClipboardList aria-hidden='true' />}
        tone='neutral'
        className='weight-summary-card'
      />
    </div>
  );
};
