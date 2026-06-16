import {
  LuCalendarHeart,
  LuClock3,
  LuMapPin,
  LuMessageSquareText,
  LuSyringe,
} from 'react-icons/lu';

import { useShotStatsCards } from '../../hooks/useShotStatsCards';
import type { ShotEntry } from '../../types';
import { MetricCard } from '../general/MetricCard';
import './ShotStatsCards.css';

type ShotStatsCardsProps = {
  shots: ShotEntry[];
};

export const ShotStatsCards = ({ shots }: ShotStatsCardsProps) => {
  const { hasShots, totalShots, latestDose, nextShot, mostUsedSite, sideEffects, notes } =
    useShotStatsCards({ shots });

  if (
    !hasShots ||
    !totalShots ||
    !latestDose ||
    !nextShot ||
    !mostUsedSite ||
    !sideEffects ||
    !notes
  ) {
    return (
      <div className='dashboard-summary-cards shot-summary-cards'>
        <MetricCard
          label='Shot Insights'
          value='No data yet'
          meta='Log your first shot to see your rhythm'
          icon={<LuSyringe aria-hidden='true' />}
          tone='primary'
          className='shot-summary-card shot-summary-card--empty'
        />
      </div>
    );
  }

  return (
    <div className='dashboard-summary-cards shot-summary-cards'>
      <MetricCard
        label='Total Shots'
        value={totalShots.value}
        meta={totalShots.meta}
        icon={<LuSyringe aria-hidden='true' />}
        tone='primary'
        className='shot-summary-card'
      />

      <MetricCard
        label='Latest Dose'
        value={latestDose.value}
        meta={latestDose.meta}
        icon={<LuCalendarHeart aria-hidden='true' />}
        tone='success'
        className='shot-summary-card'
      />

      <MetricCard
        label='Next Shot'
        value={nextShot.value}
        meta={nextShot.meta}
        icon={<LuClock3 aria-hidden='true' />}
        tone={nextShot.tone}
        highlightValue={nextShot.tone === 'danger' || nextShot.tone === 'warning'}
        className='shot-summary-card'
      />

      <MetricCard
        label='Most Used Site'
        value={mostUsedSite.value}
        meta={mostUsedSite.meta}
        icon={<LuMapPin aria-hidden='true' />}
        tone='info'
        className='shot-summary-card'
      />

      <MetricCard
        label='Side Effects'
        value={sideEffects.value}
        meta={sideEffects.meta}
        icon={<LuCalendarHeart aria-hidden='true' />}
        tone='warning'
        className='shot-summary-card'
      />

      <MetricCard
        label='Notes'
        value={notes.value}
        meta={notes.meta}
        icon={<LuMessageSquareText aria-hidden='true' />}
        tone='neutral'
        className='shot-summary-card'
      />
    </div>
  );
};
