import { LuNotebookText } from 'react-icons/lu';
import './CheckInNotesList.css';
import type { CheckInEntry } from '../../../shared/types';
import { formatDateLabel, getTimestamp } from '../../../shared/utils/dateHelpers';

type CheckInNotesListProps = {
  checkIns: CheckInEntry[];
  maxVisible?: number;
};

const hasNote = (checkIn: CheckInEntry) => {
  return Boolean(checkIn.notes?.trim());
};

export const CheckInNotesList = ({ checkIns, maxVisible = 5 }: CheckInNotesListProps) => {
  const checkInsWithNotes = checkIns
    .filter(hasNote)
    .sort((a, b) => getTimestamp(b.dateTime) - getTimestamp(a.dateTime))
    .slice(0, maxVisible);

  return (
    <section className='check-in-notes-card'>
      <header className='check-in-notes-card__header'>
        <div>
          <h2>Recent notes</h2>
          <p>Your latest check-in notes, shown newest first.</p>
        </div>
      </header>

      {checkInsWithNotes.length > 0 ? (
        <div className='check-in-notes-card__list'>
          {checkInsWithNotes.map((checkIn) => (
            <article key={checkIn.id} className='check-in-notes-card__item'>
              <div className='check-in-notes-card__date'>{formatDateLabel(checkIn.dateTime)}</div>

              <p className='check-in-notes-card__note'>
                <LuNotebookText size={15} aria-hidden='true' />
                <span>{checkIn.notes}</span>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <div className='check-in-notes-card__empty'>
          <LuNotebookText size={18} aria-hidden='true' />
          <p>No notes logged yet.</p>
        </div>
      )}
    </section>
  );
};
