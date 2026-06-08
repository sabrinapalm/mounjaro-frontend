import { WeightStatsCards } from '../components/cards/WeightStatsCards';
import { WeightTracker } from '../components/trackers/WeightTracker';
import type { CreateWeightInput, WeightEntry } from '../types';
import './WeightPage.css';

interface WeightPageProps {
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
}

export const WeightPage = ({ weights, onWeightAdded, onDeleteWeight }: WeightPageProps) => {
  return (
    <section className='weight-page'>
      <header className='weight-page__header'>
        <div>
          <h1>All Weight Entries</h1>
          <p>View your full weight history and add new check-ins when needed.</p>
        </div>
      </header>
      <WeightStatsCards weights={weights} />
      <WeightTracker
        weights={weights}
        title='All Weight Entries'
        summaryLabel='Total weight loss'
        variant='full'
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />
    </section>
  );
};
