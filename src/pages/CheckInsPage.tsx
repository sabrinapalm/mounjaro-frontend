import { CheckInNotesList } from '../components/CheckInNotesList';
import { CheckInStatsCards } from '../components/cards/CheckInStatsCards';
import { CheckInTracker } from '../components/trackers/CheckInTracker';
import type { CheckInEntry, CreateCheckInInput } from '../types';
import './CheckInsPage.css';

interface CheckInsPageProps {
  checkIns: CheckInEntry[];
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
  onDeleteCheckIn: (id: string, dateTime: string) => Promise<void>;
}

export const CheckInsPage = ({ checkIns, onCheckInAdded, onDeleteCheckIn }: CheckInsPageProps) => {
  return (
    <section className='check-ins-page'>
      <header className='check-ins-page__header'>
        <div>
          <h1>All Check-ins</h1>
          <p>View your daily check-in history and log how you feel over time.</p>
        </div>
      </header>

      <CheckInStatsCards checkIns={checkIns} />
      <CheckInNotesList checkIns={checkIns} />
      <CheckInTracker
        checkIns={checkIns}
        title='All Check-ins'
        summaryLabel='Total check-ins'
        variant='full'
        onCheckInAdded={onCheckInAdded}
        onDeleteCheckIn={onDeleteCheckIn}
      />
    </section>
  );
};
