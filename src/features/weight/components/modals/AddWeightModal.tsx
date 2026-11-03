import '../../../../shared/components/modals/entryDialog.css';
import { type FormEvent, useState } from 'react';
import { FiActivity } from 'react-icons/fi';
import { Input } from '../../../../shared/components/ui/input';
import { Label } from '../../../../shared/components/ui/label';
import { useUnitSettings } from '../../../../shared/hooks/useUnitSettings';
import type { CreateWeightInput } from '../../../../shared/types';
import {
  createDateTimeFromDateAndTimeValue,
  getCurrentTimeValue,
  getTodayDateValue,
} from '../../../../shared/utils/dateHelpers';
import { useProfile } from '../../../profile/ProfileContext';
import './AddWeightModal.css';
import { Button } from '../../../../shared/components/Button';
import { DateField } from '../../../../shared/components/DateField';
import { TimeField } from '../../../../shared/components/TimeField';

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

    const newWeight: CreateWeightInput = {
      dateTime: createDateTimeFromDateAndTimeValue(date, time),
      weight: weightInKg,
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
          className='entry-dialog__close add-weight-modal__close'
          aria-label='Close add weight modal'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>

        <header className='entry-dialog__header add-weight-modal__header'>
          <div className='add-weight-modal__icon'>
            <FiActivity size={30} />
          </div>

          <h2 id='add-weight-modal-title' className='entry-dialog__title add-weight-modal__title'>
            Add weight
          </h2>

          <p className='entry-dialog__description add-weight-modal__description'>
            Log your current weight to track your progress.
          </p>
        </header>

        <form className='entry-dialog__form add-weight-modal__form' onSubmit={handleSubmit}>
          <div className='entry-dialog__row add-weight-modal__row'>
            <DateField
              id='weight-date'
              label='Date'
              value={date}
              onChange={setDate}
              disabled={isSubmitting}
            />

            <TimeField
              id='weight-time'
              label='Time'
              value={time}
              onChange={setTime}
              disabled={isSubmitting}
            />
          </div>

          <Label className='entry-dialog__field add-weight-modal__field' htmlFor='weight-input'>
            <span className='entry-dialog__label add-weight-modal__label'>Weight</span>

            <div className='add-weight-modal__input-with-unit'>
              <Input
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
          </Label>

          {(localError || error) && (
            <p className='entry-dialog__error add-weight-modal__error'>{localError || error}</p>
          )}

          <footer className='entry-dialog__footer add-weight-modal__footer'>
            <Button
              size='lg'
              icon={<FiActivity size={20} />}
              variant='solid'
              color='secondary'
              type='submit'
            >
              {isSubmitting ? 'Adding...' : 'Add weight'}
            </Button>

            <Button onClick={handleClose} disabled={isSubmitting} variant='text' color='muted'>
              Cancel
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
};
