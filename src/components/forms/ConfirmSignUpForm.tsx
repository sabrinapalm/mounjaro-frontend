import { type FormEvent, useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiMail } from 'react-icons/fi';
import { MdOutlineMarkEmailRead } from 'react-icons/md';
import { cognitoAuth } from '../../services/cognitoAuth';
import './ConfirmSignUpForm.css';
import { Button } from '../general/Button';

interface ConfirmSignUpFormProps {
  email?: string;
  onConfirmed: () => void;
  onSwitchToLogin: () => void;
}

export const ConfirmSignUpForm = ({
  email: initialEmail = '',
  onConfirmed,
  onSwitchToLogin,
}: ConfirmSignUpFormProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    if (!trimmedCode) {
      setError('Confirmation code is required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await cognitoAuth.confirmSignUp(trimmedEmail, trimmedCode);
      onConfirmed();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to confirm account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='confirm-signup-card'>
      <header className='confirm-signup-card__header'>
        <div className='confirm-signup-card__icon' aria-hidden='true'>
          <MdOutlineMarkEmailRead size={32} />
        </div>

        <div className='confirm-signup-card__heading'>
          <h2 className='confirm-signup-card__title'>Confirm Account</h2>

          <p className='confirm-signup-card__description'>
            Enter the confirmation code from your email to activate your Tracksy account.
          </p>

          <p className='confirm-signup-card__hint'>
            If you do not see the email within a few minutes, check your spam or junk folder. The
            code is valid for 24 hours.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className='confirm-signup-form'>
        <label className='confirm-signup-form__field' htmlFor='confirm-email'>
          <span className='confirm-signup-form__label'>Email</span>

          <div className='confirm-signup-form__input-wrapper'>
            <FiMail className='confirm-signup-form__input-icon' size={20} />

            <input
              id='confirm-email'
              className='confirm-signup-form__input confirm-signup-form__input--with-icon'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='you@example.com'
              autoComplete='email'
              disabled={loading}
              required
            />
          </div>
        </label>

        <label className='confirm-signup-form__field' htmlFor='confirm-code'>
          <span className='confirm-signup-form__label'>Confirmation Code</span>

          <div className='confirm-signup-form__input-wrapper'>
            <FiCheckCircle className='confirm-signup-form__input-icon' size={20} />

            <input
              id='confirm-code'
              className='confirm-signup-form__input confirm-signup-form__input--with-icon'
              type='text'
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder='Enter your code'
              autoComplete='one-time-code'
              inputMode='numeric'
              disabled={loading}
              required
            />
          </div>
        </label>

        {error ? <p className='confirm-signup-form__error'>{error}</p> : null}

        <Button
          icon={<FiCheckCircle size={20} />}
          variant='solid'
          size='lg'
          color='secondary'
          disabled={loading}
          type='submit'
        >
          {loading ? 'Confirming…' : 'Confirm'}
        </Button>
      </form>

      <footer className='confirm-signup-card__actions'>
        <Button
          variant='text'
          color='muted'
          icon={<FiArrowLeft size={18} />}
          onClick={onSwitchToLogin}
          disabled={loading}
        >
          Back to sign in
        </Button>
      </footer>
    </section>
  );
};
