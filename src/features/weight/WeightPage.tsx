import { LuPlus } from 'react-icons/lu';
import { OverviewGrid } from '../../shared/components/overviewGrid';
import { PageHeader } from '../../shared/components/PageHeader';
import { PageActionButton } from '../../shared/components/pageActionButton';
import type { CreateWeightInput, WeightEntry } from '../../shared/types';
import { formatDateLabel, getTodayStartOfDay } from '../../shared/utils/dateHelpers';
import { BmiRangeChart } from './components/BmiRangeChart';
import { WeightStatsCards } from './components/cards/WeightStatsCards';
import { WeightTracker } from './components/WeightTracker';
import { useAddWeightModal } from './hooks/useAddWeightModal';

interface WeightPageProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, dateTime: string) => Promise<void>;
}

export const WeightPage = ({ weights, onWeightAdded, onDeleteWeight }: WeightPageProps) => {
  const addWeightModal = useAddWeightModal({ onWeightAdded });

  return (
    <section className='dashboard-page weight-page'>
      <PageHeader
        title='Your weight'
        description='Track your progress over time.'
        actionMeta={`Today · ${formatDateLabel(getTodayStartOfDay())}`}
        action={
          <PageActionButton icon={<LuPlus />} onClick={addWeightModal.openModal}>
            Add weight
          </PageActionButton>
        }
      />

      <OverviewGrid>
        <WeightStatsCards weights={weights} />
        <BmiRangeChart weights={weights} />
      </OverviewGrid>
      <WeightTracker
        weights={weights}
        title='Measurements'
        summaryLabel='Weight change'
        variant='full'
        showAddButton={false}
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />

      {addWeightModal.modal}
    </section>
  );
};
