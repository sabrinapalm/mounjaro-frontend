import { PageHeader } from '../../shared/components/PageHeader';
import type { CreateShotInput, ShotEntry, WeightEntry } from '../../shared/types';
import { ShotStatsCards } from './components/cards/ShotStatsCards';
import { ShotTracker } from './components/ShotTracker';
import { TreatmentStatistics } from './components/TreatmentStatistics';
import { useAddShotModal } from './hooks/useAddShotModal';
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
        title='Your injections'
        description='Track your treatment and injection history.'
      />

      <ShotStatsCards shots={shots} onAddShot={addShotModal.openModal} />

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
