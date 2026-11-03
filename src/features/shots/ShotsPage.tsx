import { LuPlus } from 'react-icons/lu';
import { OverviewGrid } from '../../shared/components/overviewGrid';
import { PageHeader } from '../../shared/components/PageHeader';
import { PageActionButton } from '../../shared/components/pageActionButton';
import type { CreateShotInput, ShotEntry, WeightEntry } from '../../shared/types';
import { formatDateLabel, getTodayStartOfDay } from '../../shared/utils/dateHelpers';
import { ShotStatsCards } from './components/cards/ShotStatsCards';
import { InjectionSiteWeightLossStats } from './components/InjectionSiteWeightLossStats';
import { InjectionSiteStatistics } from './components/injectionSiteStatistics';
import { ShotTracker } from './components/ShotTracker';
import { useAddShotModal } from './hooks/useAddShotModal';

interface ShotsPageProps {
  shots: ShotEntry[];
  weights: WeightEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
}

export const ShotsPage = ({ shots, weights, onShotAdded, onDeleteShot }: ShotsPageProps) => {
  const addShotModal = useAddShotModal({ onShotAdded });

  return (
    <section className='dashboard-page shots-page'>
      <PageHeader
        title='Your injections'
        description='Track your treatment and injection history.'
        actionMeta={`Today · ${formatDateLabel(getTodayStartOfDay())}`}
        action={
          <PageActionButton icon={<LuPlus />} onClick={addShotModal.openModal}>
            Add shot
          </PageActionButton>
        }
      />

      <OverviewGrid>
        <ShotStatsCards shots={shots} />
        <InjectionSiteStatistics shots={shots} />
      </OverviewGrid>

      <InjectionSiteWeightLossStats shots={shots} weights={weights} />

      <ShotTracker
        shots={shots}
        title='Injection history'
        summaryLabel='Total shots'
        variant='full'
        showAddButton={false}
        onShotAdded={onShotAdded}
        onDeleteShot={onDeleteShot}
      />

      {addShotModal.modal}
    </section>
  );
};
