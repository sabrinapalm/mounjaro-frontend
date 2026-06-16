import { LuPlus } from 'react-icons/lu';
import { WeightStatsCards } from '../components/cards/WeightStatsCards';
import { Button } from '../components/general/Button';
import { PageHeader } from '../components/PageHeader';
import { WeightTracker } from '../components/trackers/WeightTracker';
import { useAddWeightModal } from '../hooks/useAddWeightModal';
import type { CreateWeightInput, WeightEntry } from '../types';
import './WeightPage.css';
import { BmiRangeChart } from '../components/BmiRangeChart';

interface WeightPageProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, dateTime: string) => Promise<void>;
}

export const WeightPage = ({ weights, onWeightAdded, onDeleteWeight }: WeightPageProps) => {
  const addWeightModal = useAddWeightModal({ onWeightAdded });

  return (
    <section className='weight-page'>
      <PageHeader
        title='All Weight Entries'
        description='View your full weight history and add new weight entries when needed.'
        action={
          <Button
            icon={<LuPlus />}
            variant='outline'
            color='secondary'
            onClick={addWeightModal.openModal}
          >
            Add Weight
          </Button>
        }
      />

      <WeightStatsCards weights={weights} />
      <BmiRangeChart weights={weights} />

      <WeightTracker
        weights={weights}
        title='All Weight Entries'
        summaryLabel='Total weight loss'
        variant='full'
        showAddButton={false}
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />

      {addWeightModal.modal}
    </section>
  );
};
