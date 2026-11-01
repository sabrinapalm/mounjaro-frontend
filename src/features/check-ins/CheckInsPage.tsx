import { LuPlus } from 'react-icons/lu';
import { Button } from '../../shared/components/Button';
import { PageHeader } from '../../shared/components/PageHeader';
import type { CheckInEntry, CreateCheckInInput } from '../../shared/types';
import { CheckInNotesList } from './components/CheckInNotesList';
import { CheckInTracker } from './components/CheckInTracker';
import { CheckInStatsCards } from './components/cards/CheckInStatsCards';
import { useAddCheckInModal } from './hooks/useAddCheckInModal';
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
