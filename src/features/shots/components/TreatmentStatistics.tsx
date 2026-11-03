import { CollapsibleCard } from '../../../shared/components/collapsibleCard';
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
    <CollapsibleCard
      className='treatment-statistics'
      title='Treatment statistics'
      description='Explore patterns in your logged treatment data'
    >
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
    </CollapsibleCard>
  );
};
