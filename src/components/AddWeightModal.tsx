import { type FormEvent, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import type { WeightEntry } from '../types';
import './AddWeightModal.css';

interface AddWeightModalProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onWeightAdded: (weight: WeightEntry) => Promise<void>;
}

const getTodayDateValue = () => new Date().toISOString().split('T')[0];

const getWeekNumber = (date: Date): { week: number; year: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;

  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { week, year: d.getUTCFullYear() };
};

export const AddWeightModal = ({
  open,
  isSubmitting = false,
  error,
  onClose,
  onWeightAdded,
}: AddWeightModalProps) => {
  const [date, setDate] = useState<string>(getTodayDateValue());
  const [weight, setWeight] = useState<string>('');
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

    if (!date || !weight) {
      setLocalError('Please enter both date and weight.');
      return;
    }

    const parsedWeight = Number(weight);

    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setLocalError('Please enter a valid weight.');
      return;
    }

    const selectedDate = new Date(date);
    const { week, year } = getWeekNumber(selectedDate);

    const newWeight: WeightEntry = {
      id: `weight_${Date.now()}`,
      date,
      weight: parsedWeight,
      week,
      year,
    };

    await onWeightAdded(newWeight);

    setDate(getTodayDateValue());
    setWeight('');
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div className='add-weight-modal-backdrop' role='presentation' onMouseDown={handleClose}>
      <section
        className='add-weight-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='add-weight-modal-title'
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          className='add-weight-modal__close'
          aria-label='Close add weight modal'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>

        <header className='add-weight-modal__header'>
          <div className='add-weight-modal__icon'>
            <FiActivity size={30} />
          </div>

          <h2 id='add-weight-modal-title' className='add-weight-modal__title'>
            Add Weight
          </h2>

          <p className='add-weight-modal__description'>
            Log your current weight to track your progress.
          </p>
        </header>

        <form className='add-weight-modal__form' onSubmit={handleSubmit}>
          <div className='add-weight-modal__row'>
            <label className='add-weight-modal__field' htmlFor='weight-date'>
              <span className='add-weight-modal__label'>Date</span>
              <input
                id='weight-date'
                className='add-weight-modal__input'
                type='date'
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className='add-weight-modal__field' htmlFor='weight-input'>
              <span className='add-weight-modal__label'>Weight</span>

              <div className='add-weight-modal__input-with-unit'>
                <input
                  id='weight-input'
                  className='add-weight-modal__input add-weight-modal__input--with-unit'
                  type='number'
                  min='0'
                  step='0.1'
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder='88.3'
                  disabled={isSubmitting}
                  required
                />
                <span className='add-weight-modal__unit'>kg</span>
              </div>
            </label>
          </div>

          {(localError || error) && (
            <p className='add-weight-modal__error'>{localError || error}</p>
          )}

          <footer className='add-weight-modal__footer'>
            <button type='submit' className='add-weight-modal__submit' disabled={isSubmitting}>
              <FiActivity size={20} />
              {isSubmitting ? 'Adding...' : 'Add Weight'}
            </button>

            <button
              type='button'
              className='add-weight-modal__cancel'
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
