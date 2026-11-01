import { type FormEvent, useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import { LuHeartPulse } from 'react-icons/lu';
import type { CheckInLevel, CreateCheckInInput, SideEffect } from '../../../../shared/types';
import {
  createDateTimeFromDateAndTimeValue,
  getCurrentTimeValue,
  getTodayDateValue,
} from '../../../../shared/utils/dateHelpers';
import './AddCheckInModal.css';
import { Button } from '../../../../shared/components/Button';
import { DateField } from '../../../../shared/components/DateField';
import { TimeField } from '../../../../shared/components/TimeField';

interface AddCheckInModalProps {
  open: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
}

type LevelField = {
  key: keyof Pick<
    CreateCheckInInput,
    'appetiteLevel' | 'hungerLevel' | 'energyLevel' | 'nauseaLevel' | 'moodLevel'
  >;
  label: string;
  lowLabel: string;
  highLabel: string;
};

const levelFields: LevelField[] = [
  {
    key: 'appetiteLevel',
    label: 'Appetite',
    lowLabel: 'Low',
    highLabel: 'High',
  },
  {
    key: 'hungerLevel',
    label: 'Hunger',
    lowLabel: 'Not hungry',
    highLabel: 'Very hungry',
  },
  {
    key: 'energyLevel',
    label: 'Energy',
    lowLabel: 'Low',
    highLabel: 'High',
  },
  {
    key: 'nauseaLevel',
    label: 'Nausea',
    lowLabel: 'None',
    highLabel: 'Strong',
  },
  {
    key: 'moodLevel',
    label: 'Mood',
    lowLabel: 'Low',
    highLabel: 'Great',
  },
];

const sideEffectOptions: Array<{ value: SideEffect; label: string }> = [
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

const levelOptions: CheckInLevel[] = [1, 2, 3, 4, 5];

const getInitialLevels = () => ({
  appetiteLevel: undefined,
  hungerLevel: undefined,
  energyLevel: undefined,
  nauseaLevel: undefined,
  moodLevel: undefined,
});

export const AddCheckInModal = ({
  open,
  isSubmitting = false,
  error,
  onClose,
  onCheckInAdded,
}: AddCheckInModalProps) => {
  const [date, setDate] = useState<string>(getTodayDateValue());
  const [time, setTime] = useState<string>(getCurrentTimeValue());
  const [levels, setLevels] = useState<{
    appetiteLevel?: CheckInLevel;
    hungerLevel?: CheckInLevel;
    energyLevel?: CheckInLevel;
    nauseaLevel?: CheckInLevel;
    moodLevel?: CheckInLevel;
  }>(getInitialLevels);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const resetForm = () => {
    setDate(getTodayDateValue());
    setTime(getCurrentTimeValue());
    setLevels(getInitialLevels());
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

  const handleLevelChange = (key: LevelField['key'], value: CheckInLevel) => {
    setLevels((currentLevels) => ({
      ...currentLevels,
      [key]: currentLevels[key] === value ? undefined : value,
    }));
  };

  const handleSideEffectChange = (sideEffect: SideEffect) => {
    setSideEffects((currentSideEffects) => {
      if (currentSideEffects.includes(sideEffect)) {
        return currentSideEffects.filter((currentSideEffect) => currentSideEffect !== sideEffect);
      }

      return [...currentSideEffects, sideEffect];
    });
  };

  const hasAtLeastOneLevel = Object.values(levels).some((level) => level !== undefined);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!date || !time) {
      setLocalError('Please select date and time.');
      return;
    }

    const trimmedNotes = notes.trim();

    if (!hasAtLeastOneLevel && sideEffects.length === 0 && !trimmedNotes) {
      setLocalError('Please add at least one check-in value.');
      return;
    }

    if (trimmedNotes.length > 250) {
      setLocalError('Notes can be max 250 characters.');
      return;
    }

    const newCheckIn: CreateCheckInInput = {
      dateTime: createDateTimeFromDateAndTimeValue(date, time),
      ...levels,
      ...(sideEffects.length > 0 ? { sideEffects } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    };

    await onCheckInAdded(newCheckIn);

    resetForm();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: cba
    <div className='add-check-in-modal-backdrop' role='presentation' onMouseDown={handleClose}>
      <section
        className='add-check-in-modal'
        role='dialog'
        aria-modal='true'
        aria-labelledby='add-check-in-modal-title'
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type='button'
          className='add-check-in-modal__close'
          aria-label='Close add check-in modal'
          onClick={handleClose}
          disabled={isSubmitting}
        >
          ×
        </button>

        <header className='add-check-in-modal__header'>
          <div className='add-check-in-modal__icon'>
            <LuHeartPulse size={30} />
          </div>

          <h2 id='add-check-in-modal-title' className='add-check-in-modal__title'>
            Daily Check-in
          </h2>

          <p className='add-check-in-modal__description'>
            Log how you feel today to help Tracksy spot patterns over time.
          </p>
        </header>

        <form className='add-check-in-modal__form' onSubmit={handleSubmit}>
          <div className='add-check-in-modal__row'>
            <DateField
              id='check-in-date'
              label='Date'
              value={date}
              onChange={setDate}
              disabled={isSubmitting}
            />

            <TimeField
              id='check-in-time'
              label='Time'
              value={time}
              onChange={setTime}
              disabled={isSubmitting}
            />
          </div>

          <div className='add-check-in-modal__levels'>
            {levelFields.map((field) => (
              <fieldset key={field.key} className='add-check-in-modal__level-fieldset'>
                <legend className='add-check-in-modal__label'>{field.label}</legend>

                <div className='add-check-in-modal__level-meta'>
                  <span>{field.lowLabel}</span>
                  <span>{field.highLabel}</span>
                </div>

                <div className='add-check-in-modal__level-options'>
                  {levelOptions.map((level) => {
                    const selected = levels[field.key] === level;

                    return (
                      <button
                        key={level}
                        type='button'
                        className={`add-check-in-modal__level-button ${
                          selected ? 'add-check-in-modal__level-button--selected' : ''
                        }`}
                        onClick={() => handleLevelChange(field.key, level)}
                        disabled={isSubmitting}
                        aria-pressed={selected}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <fieldset className='add-check-in-modal__fieldset'>
            <legend className='add-check-in-modal__label'>Side effects</legend>

            <div className='add-check-in-modal__chips'>
              {sideEffectOptions.map((sideEffect) => {
                const selected = sideEffects.includes(sideEffect.value);

                return (
                  <button
                    key={sideEffect.value}
                    type='button'
                    className={`add-check-in-modal__chip ${
                      selected ? 'add-check-in-modal__chip--selected' : ''
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

          <label className='add-check-in-modal__field' htmlFor='check-in-notes'>
            <span className='add-check-in-modal__label'>Notes</span>

            <textarea
              id='check-in-notes'
              className='add-check-in-modal__textarea'
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={isSubmitting}
              maxLength={250}
              rows={3}
              placeholder='Optional note...'
            />

            <span className='add-check-in-modal__hint'>{notes.length}/250</span>
          </label>

          {(localError || error) && (
            <p className='add-check-in-modal__error'>{localError || error}</p>
          )}

          <footer className='add-check-in-modal__footer'>
            <Button
              variant='solid'
              type='submit'
              color='secondary'
              size='lg'
              fullWidth
              isLoading={isSubmitting}
              icon={<FiCheckCircle size={20} />}
            >
              {isSubmitting ? 'Saving...' : 'Save check-in'}
            </Button>

            <Button variant='text' color='muted' onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
};
