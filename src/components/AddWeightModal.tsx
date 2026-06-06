import { type FormEvent, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { useProfile } from '../context/ProfileContext';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { CreateWeightInput } from '../types';
import {
  createDateTimeFromDateAndTimeValue,
  getCurrentTimeValue,
  getIsoWeekInfo,
  getTodayDateValue,
} from '../utils/dateHelpers';
import './AddWeightModal.css';
import { DateField } from './DateField';

interface AddWeightModalProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
}

export const AddWeightModal = ({
  open,
  isSubmitting = false,
  error,
  onClose,
  onWeightAdded,
}: AddWeightModalProps) => {
  const { unitSystem } = useProfile();
  const { weightUnit, normalizeWeightToKg } = useUnitSettings(unitSystem);

  const [date, setDate] = useState<string>(getTodayDateValue());
  const [time, setTime] = useState<string>(getCurrentTimeValue());
  const [weight, setWeight] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setDate(getTodayDateValue());
    setTime(getCurrentTimeValue());
    setWeight('');
    setLocalError(null);
  };

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

    if (!date || !time || !weight) {
      setLocalError('Please enter date, time and weight.');
      return;
    }

    const parsedWeight = Number(weight);

    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setLocalError('Please enter a valid weight.');
      return;
    }

    const weightInKg = normalizeWeightToKg(parsedWeight);

    if (!weightInKg || weightInKg <= 0) {
      setLocalError('Please enter a valid weight.');
      return;
    }

    const dateTime = createDateTimeFromDateAndTimeValue(date, time);
    const { week, year } = getIsoWeekInfo(dateTime);

    const newWeight: CreateWeightInput = {
      date,
      dateTime,
      weight: weightInKg,
      week,
      year,
    };

    await onWeightAdded(newWeight);

    resetForm();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: cba
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
            <DateField
              id='weight-date'
              label='Date'
              value={date}
              onChange={setDate}
              disabled={isSubmitting}
            />

            <label className='add-weight-modal__field' htmlFor='weight-time'>
              <span className='add-weight-modal__label'>Time</span>

              <input
                id='weight-time'
                className='add-weight-modal__input'
                type='time'
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </label>
          </div>

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
                placeholder={unitSystem === 'metric' ? '88.3' : '194.7'}
                disabled={isSubmitting}
                required
              />

              <span className='add-weight-modal__unit'>{weightUnit}</span>
            </div>
          </label>

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
