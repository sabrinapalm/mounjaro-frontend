import { LuPlus } from 'react-icons/lu';
import { CheckInNotesList } from '../components/CheckInNotesList';
import { CheckInStatsCards } from '../components/cards/CheckInStatsCards';
import { Button } from '../components/general/Button';
import { PageHeader } from '../components/PageHeader';
import { CheckInTracker } from '../components/trackers/CheckInTracker';
import { useAddCheckInModal } from '../hooks/useAddCheckInModal';
import type { CheckInEntry, CreateCheckInInput } from '../types';
import './CheckInsPage.css';

interface CheckInsPageProps {
  checkIns: CheckInEntry[];
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
  onDeleteCheckIn: (id: string, dateTime: string) => Promise<void>;
}

export const CheckInsPage = ({ checkIns, onCheckInAdded, onDeleteCheckIn }: CheckInsPageProps) => {
  const addCheckInModal = useAddCheckInModal({ onCheckInAdded });

  return (
    <section className='check-ins-page'>
      <PageHeader
        title='All Check-ins'
        description='View your daily check-in history and log how you feel over time.'
        action={
          <Button
            variant='outline'
            color='secondary'
            icon={<LuPlus />}
            onClick={addCheckInModal.openModal}
          >
            Add check-in
          </Button>
        }
      />

      <CheckInStatsCards checkIns={checkIns} />

      <CheckInNotesList checkIns={checkIns} />

      <CheckInTracker
        checkIns={checkIns}
        title='All Check-ins'
        summaryLabel='Total check-ins'
        variant='full'
        showAddButton={false}
        onCheckInAdded={onCheckInAdded}
        onDeleteCheckIn={onDeleteCheckIn}
      />

      {addCheckInModal.modal}
    </section>
  );
};
