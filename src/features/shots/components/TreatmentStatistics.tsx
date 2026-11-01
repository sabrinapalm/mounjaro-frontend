import { LuChevronDown } from 'react-icons/lu';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import { useShotStatsCards } from '../hooks/useShotStatsCards';
import { InjectionSiteWeightLossStats } from './InjectionSiteWeightLossStats';
import './TreatmentStatistics.css';

type TreatmentStatisticsProps = {
  shots: ShotEntry[];
  weights: WeightEntry[];
};

export const TreatmentStatistics = ({ shots, weights }: TreatmentStatisticsProps) => {
  const { hasShots, mostUsedSite, sideEffects, notes } = useShotStatsCards({ shots });

  return (
    <details className='treatment-statistics'>
      <summary className='treatment-statistics__summary'>
        <span>
          <strong>Treatment statistics</strong>
          <small>Explore patterns in your logged treatment data</small>
        </span>
        <LuChevronDown size={20} aria-hidden='true' />
      </summary>
      <div className='treatment-statistics__content'>
        <dl className='treatment-statistics__metrics'>
          <div>
            <dt>Most frequently used site</dt>
            <dd>{mostUsedSite?.value ?? 'No data yet'}</dd>
            <small>{mostUsedSite?.meta ?? 'Log an injection to see site statistics'}</small>
          </div>
          <div>
            <dt>Side effects</dt>
            <dd>{hasShots ? sideEffects?.value : 'No data yet'}</dd>
            <small>{hasShots ? sideEffects?.meta : 'Log side effects to see patterns'}</small>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{hasShots ? notes?.value : 'No data yet'}</dd>
            <small>{hasShots ? notes?.meta : 'Add notes to remember context'}</small>
          </div>
        </dl>
        <InjectionSiteWeightLossStats shots={shots} weights={weights} />
      </div>
    </details>
  );
};
