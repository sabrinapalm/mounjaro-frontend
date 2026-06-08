import { ShotStatsCards } from '../components/cards/ShotStatsCards';
import { ShotTracker } from '../components/trackers/ShotTracker';
import type { CreateShotInput, ShotEntry } from '../types';
import './ShotsPage.css';

interface ShotsPageProps {
  shots: ShotEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
}

export const ShotsPage = ({ shots, onShotAdded, onDeleteShot }: ShotsPageProps) => {
  return (
    <section className='shots-page'>
      <header className='shots-page__header'>
        <div>
          <h1>All Shots</h1>
          <p>View your full injection history and add new shots when needed.</p>
        </div>
      </header>
      <ShotStatsCards shots={shots} />
      <ShotTracker
        shots={shots}
        title='All Shots'
        summaryLabel='Total shots'
        variant='full'
        onShotAdded={onShotAdded}
        onDeleteShot={onDeleteShot}
      />
    </section>
  );
};
