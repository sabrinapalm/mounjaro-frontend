import { LuPlus } from 'react-icons/lu';
import { PageHeader } from '../../shared/components/PageHeader';
import { PageActionButton } from '../../shared/components/pageActionButton';
import type { CreateWeightInput, WeightEntry } from '../../shared/types';
import { WeightStatsCards } from './components/cards/WeightStatsCards';
import { WeightTracker } from './components/WeightTracker';
import { useAddWeightModal } from './hooks/useAddWeightModal';
import './WeightPage.css';
import { BmiRangeChart } from './components/BmiRangeChart';

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
        title='Your weight'
        description='Track your progress over time.'
        action={
          <PageActionButton icon={<LuPlus />} onClick={addWeightModal.openModal}>
            Add Weight
          </PageActionButton>
        }
      />

      <WeightStatsCards weights={weights} />
      <WeightTracker
        weights={weights}
        title='Weight history'
        summaryLabel='Total weight loss'
        variant='full'
        showAddButton={false}
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />

      <BmiRangeChart weights={weights} />

      {addWeightModal.modal}
    </section>
  );
};
