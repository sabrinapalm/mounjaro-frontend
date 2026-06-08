import { type FormEvent, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { PiSyringeBold } from 'react-icons/pi';
import type { CreateShotInput, InjectionSite, ShotSideEffect } from '../types';
import {
  createDateTimeFromDateAndTimeValue,
  getCurrentTimeValue,
  getTodayDateValue,
} from '../utils/dateHelpers';
import './AddShotModal.css';
import { DateField } from './DateField';
import { Button } from './general/Button';
import { TimeField } from './TimeField';

interface AddShotModalProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
}

const doseOptions = ['2.5', '5', '7.5', '10', '12.5', '15'];

const injectionSiteOptions: Array<{ value: InjectionSite; label: string }> = [
  { value: 'abdomen_left', label: 'Left abdomen' },
  { value: 'abdomen_right', label: 'Right abdomen' },
  { value: 'left_thigh', label: 'Left thigh' },
  { value: 'right_thigh', label: 'Right thigh' },
  { value: 'left_upper_arm', label: 'Left upper arm' },
  { value: 'right_upper_arm', label: 'Right upper arm' },
  { value: 'other', label: 'Other' },
];

const sideEffectOptions: Array<{ value: ShotSideEffect; label: string }> = [
  { value: 'nausea', label: 'Nausea' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'headache', label: 'Headache' },
  { value: 'constipation', label: 'Constipation' },
  { value: 'diarrhea', label: 'Diarrhea' },
  { value: 'stomach_pain', label: 'Stomach pain' },
  { value: 'injection_site_reaction', label: 'Injection site reaction' },
  { value: 'reduced_appetite', label: 'Reduced appetite' },
  { value: 'heartburn', label: 'Heartburn' },
  { value: 'other', label: 'Other' },
];

const defaultInjectionSite: InjectionSite = 'abdomen_left';

export const AddShotModal = ({
  open,
  isSubmitting = false,
  error,
  onClose,
  onShotAdded,
}: AddShotModalProps) => {
  const [date, setDate] = useState<string>(getTodayDateValue());
  const [time, setTime] = useState<string>(getCurrentTimeValue());
  const [dosage, setDosage] = useState<string>('2.5');
  const [injectionSite, setInjectionSite] = useState<InjectionSite>(defaultInjectionSite);
  const [sideEffects, setSideEffects] = useState<ShotSideEffect[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setDate(getTodayDateValue());
    setTime(getCurrentTimeValue());
    setDosage('2.5');
    setInjectionSite(defaultInjectionSite);
    setSideEffects([]);
    setNotes('');
    setLocalError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setLocalError(null);
    onClose();
  };

  const handleSideEffectChange = (sideEffect: ShotSideEffect) => {
    setSideEffects((currentSideEffects) => {
      if (currentSideEffects.includes(sideEffect)) {
        return currentSideEffects.filter((currentSideEffect) => currentSideEffect !== sideEffect);
      }

      return [...currentSideEffects, sideEffect];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!date || !time || !dosage || !injectionSite) {
      setLocalError('Please select date, time, dose and injection site.');
      return;
    }

    const parsedDosage = Number(dosage);

    if (Number.isNaN(parsedDosage) || parsedDosage <= 0) {
      setLocalError('Please select a valid dose.');
      return;
    }

    const trimmedNotes = notes.trim();

    if (trimmedNotes.length > 250) {
      setLocalError('Notes can be max 250 characters.');
      return;
    }

    const newShot: CreateShotInput = {
      dateTime: createDateTimeFromDateAndTimeValue(date, time),
      dosage: parsedDosage,
      injectionSite,
      ...(sideEffects.length > 0 ? { sideEffects } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };

    await onShotAdded(newShot);

    resetForm();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: cba
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
            <DateField
              id='shot-date'
              label='Date'
              value={date}
              onChange={setDate}
              disabled={isSubmitting}
            />

            <TimeField
              id='shot-time'
              label='Time'
              value={time}
              onChange={setTime}
              disabled={isSubmitting}
            />
          </div>

          <div className='add-shot-modal__row'>
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

            <label className='add-shot-modal__field' htmlFor='shot-injection-site'>
              <span className='add-shot-modal__label'>Injection site</span>

              <select
                id='shot-injection-site'
                className='add-shot-modal__select'
                value={injectionSite}
                onChange={(event) => setInjectionSite(event.target.value as InjectionSite)}
                disabled={isSubmitting}
                required
              >
                {injectionSiteOptions.map((site) => (
                  <option key={site.value} value={site.value}>
                    {site.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className='add-shot-modal__fieldset'>
            <legend className='add-shot-modal__label'>How was last week?</legend>

            <p className='add-shot-modal__helper-text'>
              Select any side effects you noticed since your previous shot.
            </p>

            <div className='add-shot-modal__chips'>
              {sideEffectOptions.map((sideEffect) => {
                const selected = sideEffects.includes(sideEffect.value);

                return (
                  <button
                    key={sideEffect.value}
                    type='button'
                    className={`add-shot-modal__chip ${
                      selected ? 'add-shot-modal__chip--selected' : ''
                    }`}
                    onClick={() => handleSideEffectChange(sideEffect.value)}
                    disabled={isSubmitting}
                    aria-pressed={selected}
                  >
                    {sideEffect.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className='add-shot-modal__field' htmlFor='shot-notes'>
            <span className='add-shot-modal__label'>Notes</span>

            <textarea
              id='shot-notes'
              className='add-shot-modal__textarea'
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              maxLength={250}
              rows={3}
              placeholder='Optional note...'
            />

            <span className='add-shot-modal__hint'>{notes.length}/250</span>
          </label>

          {(localError || error) && <p className='add-shot-modal__error'>{localError || error}</p>}

          <footer className='add-shot-modal__footer'>
            <Button
              variant='solid'
              color='primary'
              icon={<FiCheckCircle size={20} />}
              type='submit'
              disabled={isSubmitting}
              size='lg'
            >
              {isSubmitting ? 'Adding...' : 'Add Shot'}
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
