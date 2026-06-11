import { LuPlus } from 'react-icons/lu';
import { ShotStatsCards } from '../components/cards/ShotStatsCards';
import { Button } from '../components/general/Button';
import { InjectionSiteWeightLossStats } from '../components/InjectionSiteWeightLossStats';
import { PageHeader } from '../components/PageHeader';
import { ShotTracker } from '../components/trackers/ShotTracker';
import { useAddShotModal } from '../hooks/useAddShotModal';
import type { CreateShotInput, ShotEntry, WeightEntry } from '../types';
import './ShotsPage.css';

interface ShotsPageProps {
  shots: ShotEntry[];
  weights: WeightEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
}

export const ShotsPage = ({ shots, weights, onShotAdded, onDeleteShot }: ShotsPageProps) => {
  const addShotModal = useAddShotModal({ onShotAdded });

  return (
    <section className='shots-page'>
      <PageHeader
        title='All Shots'
        description='View your full injection history and add new shots when needed.'
        action={
          <Button icon={<LuPlus size={22} />} onClick={addShotModal.openModal}>
            Add shot
          </Button>
        }
      />

      <ShotStatsCards shots={shots} />

      <ShotTracker
        shots={shots}
        title='All Shots'
        summaryLabel='Total shots'
        variant='full'
        showAddButton={false}
        onShotAdded={onShotAdded}
        onDeleteShot={onDeleteShot}
      />

      <InjectionSiteWeightLossStats shots={shots} weights={weights} />

      {addShotModal.modal}
    </section>
  );
};
