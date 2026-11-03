import {
  LuCalendarClock,
  LuCalendarDays,
  LuCalendarRange,
  LuListOrdered,
  LuScale,
  LuTrendingDown,
  LuTrendingUp,
} from 'react-icons/lu';
import { OverviewStatistic } from '../../../../shared/components/overviewStatistic';
import type { WeightEntry } from '../../../../shared/types';
import { useWeightStatsCards } from '../../hooks/useWeightStatsCards';
import './WeightStatsCards.css';

type WeightStatsCardsProps = {
  weights: WeightEntry[];
};

export const WeightStatsCards = ({ weights }: WeightStatsCardsProps) => {
  const stats = useWeightStatsCards({ weights });

  return (
    <section className='weight-overview'>
      {stats.hasWeights ? (
        <>
          <div className='weight-overview__primary'>
            <div className='weight-overview__current'>
              <p className='weight-overview__eyebrow'>
                <LuScale size={17} aria-hidden='true' />
                Latest recorded weight
              </p>
              <p className='weight-overview__value'>{stats.currentWeight.value}</p>
              <p className='weight-overview__date'>{stats.currentWeight.meta}</p>
            </div>
            <div
              className={`weight-overview__change weight-overview__change--${stats.totalWeightLoss.tone}`}
            >
              <span className='weight-overview__change-label'>Total change</span>
              <strong>
                {stats.totalWeightLoss.trendDirection === 'down' ? (
                  <LuTrendingDown size={19} aria-hidden='true' />
                ) : (
                  <LuTrendingUp size={19} aria-hidden='true' />
                )}
                {stats.totalWeightLoss.value}
              </strong>
              <small>{stats.totalWeightLoss.meta}</small>
            </div>
          </div>

          <div className='weight-overview__statistics'>
            <dl className='weight-overview__metrics'>
              <OverviewStatistic
                label='Average per week'
                value={stats.averagePerWeek.value}
                meta={stats.averagePerWeek.meta}
                icon={<LuCalendarDays />}
              />
              <OverviewStatistic
                label='Average per month'
                value={stats.averagePerMonth.value}
                meta={stats.averagePerMonth.meta}
                icon={<LuCalendarRange />}
              />
              <OverviewStatistic
                label='Journey week'
                value={stats.journeyWeek.value}
                meta={stats.journeyWeek.meta}
                icon={<LuCalendarClock />}
              />
              <OverviewStatistic
                label='Weight entries'
                value={stats.weightEntries.value}
                meta={stats.weightEntries.meta}
                icon={<LuListOrdered />}
              />
            </dl>
          </div>
        </>
      ) : (
        <div className='weight-overview__empty'>
          <div className='weight-overview__empty-icon'>
            <LuScale size={21} aria-hidden='true' />
          </div>
          <div>
            <p className='weight-overview__eyebrow'>Your weight overview</p>
            <p className='weight-overview__empty-message'>
              Add your first weight entry to see your progress over time.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
