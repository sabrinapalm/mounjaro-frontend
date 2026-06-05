import { type FormEvent, useState } from 'react';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { PiSyringeBold } from 'react-icons/pi';
import type { ShotEntry } from '../types';
import './AddShotModal.css';

interface AddShotModalProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onShotAdded: (shot: ShotEntry) => Promise<void>;
}

const doseOptions = ['2.5', '5', '7.5', '10', '12.5', '15'];

const injectionSiteOptions = ['Stomach', 'Left thigh', 'Right thigh', 'Left arm', 'Right arm'];

const getTodayDateValue = () => new Date().toISOString().split('T')[0];

const getWeekNumber = (date: Date): { week: number; year: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { week, year: d.getUTCFullYear() };
};

export const AddShotModal = ({
  open,
  isSubmitting = false,
  error,
  onClose,
  onShotAdded,
}: AddShotModalProps) => {
  const [date, setDate] = useState<string>(getTodayDateValue());
  const [dosage, setDosage] = useState<string>('2.5');
  const [injectionSite, setInjectionSite] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setLocalError(null);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!date || !dosage) {
      setLocalError('Please select both date and dose.');
      return;
    }

    const parsedDosage = Number(dosage);

    if (Number.isNaN(parsedDosage) || parsedDosage <= 0) {
      setLocalError('Please select a valid dose.');
      return;
    }

    const selectedDate = new Date(date);
    const { week, year } = getWeekNumber(selectedDate);

    const newShot: ShotEntry = {
      id: `shot_${Date.now()}`,
      date,
      dosage: parsedDosage,
      week,
      year,
      injectionSite: injectionSite || undefined,
    };

    await onShotAdded(newShot);

    setDate(getTodayDateValue());
    setDosage('2.5');
    setInjectionSite('');
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className='add-shot-modal-backdrop' role='presentation' onMouseDown={handleClose}>
      <section
        className='add-shot-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='add-shot-modal-title'
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          className='add-shot-modal__close'
          aria-label='Close add shot modal'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>

        <header className='add-shot-modal__header'>
          <div className='add-shot-modal__icon'>
            <PiSyringeBold size={32} />
          </div>

          <h2 id='add-shot-modal-title' className='add-shot-modal__title'>
            Add Shot
          </h2>

          <p className='add-shot-modal__description'>
            Log a new injection to keep your progress on track.
          </p>
        </header>

        <form className='add-shot-modal__form' onSubmit={handleSubmit}>
          <div className='add-shot-modal__row'>
            <label className='add-shot-modal__field' htmlFor='shot-date'>
              <span className='add-shot-modal__label'>Date</span>

              <div className='add-shot-modal__input-icon-wrapper'>
                <FiCalendar className='add-shot-modal__field-icon' size={20} />
                <input
                  id='shot-date'
                  className='add-shot-modal__input add-shot-modal__input--with-icon'
                  type='date'
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>

            <label className='add-shot-modal__field' htmlFor='shot-dosage'>
              <span className='add-shot-modal__label'>Dose (mg)</span>

              <div className='add-shot-modal__select-with-unit'>
                <select
                  id='shot-dosage'
                  className='add-shot-modal__select add-shot-modal__select--with-unit'
                  value={dosage}
                  onChange={(event) => setDosage(event.target.value)}
                  disabled={isSubmitting}
                  required
                >
                  {doseOptions.map((dose) => (
                    <option key={dose} value={dose}>
                      {dose}
                    </option>
                  ))}
                </select>

                <span className='add-shot-modal__unit'>mg</span>
              </div>
            </label>
          </div>

          <label className='add-shot-modal__field' htmlFor='shot-injection-site'>
            <span className='add-shot-modal__label'>Injection Site (optional)</span>

            <select
              id='shot-injection-site'
              className='add-shot-modal__select'
              value={injectionSite}
              onChange={(event) => setInjectionSite(event.target.value)}
              disabled={isSubmitting}
            >
              <option value=''>Select injection site</option>

              {injectionSiteOptions.map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </label>

          {(localError || error) && <p className='add-shot-modal__error'>{localError || error}</p>}

          <footer className='add-shot-modal__footer'>
            <button type='submit' className='add-shot-modal__submit' disabled={isSubmitting}>
              <FiCheckCircle size={20} />
              {isSubmitting ? 'Adding...' : 'Add Shot'}
            </button>

            <button
              type='button'
              className='add-shot-modal__cancel'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};
