import type { WeightEntry } from '../types';
import { WeightTracker } from './WeightTracker';
import './WeightPage.css';

type WeightPageProps = {
  weights: WeightEntry[];
  onWeightAdded: (weight: WeightEntry) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
};

export const WeightPage = ({ weights, onWeightAdded, onDeleteWeight }: WeightPageProps) => {
  return (
    <section className='weight-page'>
      <header className='weight-page__header'>
        <div>
          <p className='weight-page__eyebrow'>Weight</p>
          <h1>All Weight Entries</h1>
          <p>View your full weight history and add new check-ins when needed.</p>
        </div>
      </header>

      <WeightTracker
        weights={weights}
        title='All Weight Entries'
        summaryLabel='Total weightloss'
        variant='full'
        onWeightAdded={onWeightAdded}
        onDeleteWeight={onDeleteWeight}
      />
    </section>
  );
};
