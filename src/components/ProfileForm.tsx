import type { FormEvent } from 'react';
import { useState } from 'react';
import { FiArrowRight, FiTarget, FiTrendingUp, FiUser } from 'react-icons/fi';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type { ProfileFormValues, UnitSystem, UserProfile } from '../types';
import './ProfileForm.css';

type ProfileFormProps = {
  initialProfile?: UserProfile | null;
  title?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
};

const parseOptionalNumber = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return parsedValue;
};

export function ProfileForm({
  initialProfile = null,
  title = 'Welcome to Tracksy',
  submitLabel = 'Continue to dashboard',
  isSubmitting = false,
  submitError = null,
  onSubmit,
}: ProfileFormProps) {
  const initialUnitSystem = initialProfile?.unitSystem ?? 'metric';

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(initialUnitSystem);

  const {
    weightUnit,
    heightUnit,
    displayWeightFromKg,
    displayHeightFromCm,
    normalizeWeightToKg,
    normalizeHeightToCm,
    convertWeightInputBetweenSystems,
    convertHeightInputBetweenSystems,
  } = useUnitSettings(unitSystem);

  const [displayName, setDisplayName] = useState(initialProfile?.displayName ?? '');
  const [goalWeight, setGoalWeight] = useState(displayWeightFromKg(initialProfile?.goalWeight));
  const [startWeight, setStartWeight] = useState(displayWeightFromKg(initialProfile?.startWeight));
  const [height, setHeight] = useState(displayHeightFromCm(initialProfile?.height));
  const [localError, setLocalError] = useState('');

  const handleUnitSystemChange = (nextUnitSystem: UnitSystem) => {
    setStartWeight((currentValue) =>
      convertWeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setGoalWeight((currentValue) =>
      convertWeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setHeight((currentValue) =>
      convertHeightInputBetweenSystems(currentValue, unitSystem, nextUnitSystem)
    );

    setUnitSystem(nextUnitSystem);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();

    if (!trimmedDisplayName) {
      setLocalError('Display name is required.');
      return;
    }

    const parsedStartWeight = parseOptionalNumber(startWeight);
    const parsedGoalWeight = parseOptionalNumber(goalWeight);
    const parsedHeight = parseOptionalNumber(height);

    setLocalError('');

    await onSubmit({
      displayName: trimmedDisplayName,
      startWeight: normalizeWeightToKg(parsedStartWeight),
      goalWeight: normalizeWeightToKg(parsedGoalWeight),
      height: normalizeHeightToCm(parsedHeight),
      unitSystem,
    });
  };

  const error = localError || submitError;

  return (
    <section className='profile-form-page'>
      <div className='profile-form-card'>
        <header className='profile-form-card__header'>
          <div className='profile-form-card__icon' aria-hidden='true'>
            <FiUser size={30} />
          </div>

          <div className='profile-form-card__heading'>
            <p className='profile-form-card__eyebrow'>Getting started</p>

            <h2 className='profile-form-card__title'>{title}</h2>

            <p className='profile-form-card__description'>
              Let’s set up your starting point so Tracksy can personalize your dashboard, progress
              and milestones.
            </p>
          </div>
        </header>

        {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: cba */}
        <div className='profile-form-card__highlights' aria-label='What Tracksy will personalize'>
          <div className='profile-form-card__highlight'>
            <FiTarget size={18} />
            <span>Goal progress</span>
          </div>

          <div className='profile-form-card__highlight'>
            <FiTrendingUp size={18} />
            <span>Weight trends</span>
          </div>

          <div className='profile-form-card__highlight'>
            <FiUser size={18} />
            <span>Personal dashboard</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='profile-form'>
          <label className='profile-form__field' htmlFor='profile-display-name'>
            <span className='profile-form__label'>What should we call you?</span>

            <input
              id='profile-display-name'
              className='profile-form__input'
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                setLocalError('');
              }}
              placeholder='John Doe'
              autoComplete='name'
              disabled={isSubmitting}
            />
          </label>

          <label className='profile-form__field' htmlFor='profile-unit-system'>
            <span className='profile-form__label'>Unit system</span>

            <select
              id='profile-unit-system'
              className='profile-form__input'
              value={unitSystem}
              onChange={(event) => handleUnitSystemChange(event.target.value as UnitSystem)}
              disabled={isSubmitting}
            >
              <option value='metric'>Metric — kg, cm</option>
              <option value='imperial'>Imperial — lb, in</option>
            </select>
          </label>

          <div className='profile-form__grid'>
            <label className='profile-form__field' htmlFor='profile-start-weight'>
              <span className='profile-form__label'>Start weight</span>

              <div className='profile-form__input-with-unit'>
                <input
                  id='profile-start-weight'
                  className='profile-form__input profile-form__input--with-unit'
                  type='number'
                  step='0.1'
                  min='1'
                  value={startWeight}
                  onChange={(event) => {
                    setStartWeight(event.target.value);
                    setLocalError('');
                  }}
                  placeholder={unitSystem === 'metric' ? '100' : '220'}
                  disabled={isSubmitting}
                />

                <span className='profile-form__unit'>{weightUnit}</span>
              </div>
            </label>

            <label className='profile-form__field' htmlFor='profile-goal-weight'>
              <span className='profile-form__label'>Goal weight</span>

              <div className='profile-form__input-with-unit'>
                <input
                  id='profile-goal-weight'
                  className='profile-form__input profile-form__input--with-unit'
                  type='number'
                  step='0.1'
                  min='1'
                  value={goalWeight}
                  onChange={(event) => {
                    setGoalWeight(event.target.value);
                    setLocalError('');
                  }}
                  placeholder={unitSystem === 'metric' ? '65' : '143'}
                  disabled={isSubmitting}
                />

                <span className='profile-form__unit'>{weightUnit}</span>
              </div>
            </label>
          </div>

          <label className='profile-form__field' htmlFor='profile-height'>
            <span className='profile-form__label'>Height</span>

            <div className='profile-form__input-with-unit'>
              <input
                id='profile-height'
                className='profile-form__input profile-form__input--with-unit'
                type='number'
                step='1'
                min='1'
                value={height}
                onChange={(event) => {
                  setHeight(event.target.value);
                  setLocalError('');
                }}
                placeholder={unitSystem === 'metric' ? '165' : '65'}
                disabled={isSubmitting}
              />

              <span className='profile-form__unit'>{heightUnit}</span>
            </div>
          </label>

          <p className='profile-form__hint'>
            You can update these values later from Profile Settings.
          </p>

          {error ? <p className='profile-form__error'>{error}</p> : null}

          <footer className='profile-form__actions'>
            <button
              className='profile-form__button profile-form__button--accent'
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  {submitLabel}
                  <FiArrowRight size={20} />
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </section>
  );
}
