import { LuPlus } from 'react-icons/lu';
import { PageHeader } from '../../shared/components/PageHeader';
import { PageActionButton } from '../../shared/components/pageActionButton';
import type { CreateShotInput, ShotEntry, WeightEntry } from '../../shared/types';
import { ShotStatsCards } from './components/cards/ShotStatsCards';
import { ShotTracker } from './components/ShotTracker';
import { TreatmentStatistics } from './components/TreatmentStatistics';
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
    <section className='shots-page mx-auto grid min-w-0 w-[min(100%,1120px)] gap-[20px] [@media(max-width:760px)]:gap-[16px]'>
      <PageHeader
        title='Your injections'
        description='Track your treatment and injection history.'
        action={
          <PageActionButton icon={<LuPlus />} onClick={addShotModal.openModal}>
            Add shot
          </PageActionButton>
        }
      />

      <ShotStatsCards shots={shots} />

      <ShotTracker
        shots={shots}
        title='Injection history'
        summaryLabel='Total shots'
        variant='full'
        showAddButton={false}
        onShotAdded={onShotAdded}
        onDeleteShot={onDeleteShot}
      />

      <TreatmentStatistics shots={shots} weights={weights} />

      {addShotModal.modal}
    </section>
  );
};
