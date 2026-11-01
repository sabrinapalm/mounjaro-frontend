import { LuChevronDown, LuScale, LuTrendingDown, LuTrendingUp } from 'react-icons/lu';
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

          <details className='weight-overview__details'>
            <summary>
              <span>Additional statistics</span>
              <LuChevronDown size={18} aria-hidden='true' />
            </summary>
            <dl className='weight-overview__metrics'>
              <div>
                <dt>Average per week</dt>
                <dd>{stats.averagePerWeek.value}</dd>
                <small>{stats.averagePerWeek.meta}</small>
              </div>
              <div>
                <dt>Average per month</dt>
                <dd>{stats.averagePerMonth.value}</dd>
                <small>{stats.averagePerMonth.meta}</small>
              </div>
              <div>
                <dt>Journey week</dt>
                <dd>{stats.journeyWeek.value}</dd>
                <small>{stats.journeyWeek.meta}</small>
              </div>
              <div>
                <dt>Weight entries</dt>
                <dd>{stats.weightEntries.value}</dd>
                <small>{stats.weightEntries.meta}</small>
              </div>
            </dl>
          </details>
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
