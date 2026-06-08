import { type FormEvent, useState } from 'react';
import { FiArrowLeft, FiMail, FiUserPlus } from 'react-icons/fi';
import { RiLockPasswordLine } from 'react-icons/ri';
import './SignUpForm.css';
import { cognitoAuth } from '../../services/cognitoAuth';
import { Button } from '../general/Button';

interface SignUpFormProps {
  onSignedUp: (email: string) => Promise<void> | void;
  onSwitchToLogin: () => void;
}

export const SignUpForm = ({ onSignedUp, onSwitchToLogin }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await cognitoAuth.signUp(trimmedEmail, password);
      await onSignedUp(trimmedEmail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='signup-card'>
      <header className='signup-card__header'>
        <div className='signup-card__icon' aria-hidden='true'>
          <FiUserPlus size={30} />
        </div>

        <div className='signup-card__heading'>
          <h2 className='signup-card__title'>Create Account</h2>

          <p className='signup-card__description'>
            Create your Tracksy account to start tracking your shots and progress.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className='signup-form'>
        <label className='signup-form__field' htmlFor='signup-email'>
          <span className='signup-form__label'>Email</span>

          <div className='signup-form__input-wrapper'>
            <FiMail className='signup-form__input-icon' size={20} />

            <input
              id='signup-email'
              className='signup-form__input signup-form__input--with-icon'
              type='email'
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder='you@example.com'
              autoComplete='email'
              disabled={loading}
              required
            />
          </div>
        </label>

        <label className='signup-form__field' htmlFor='signup-password'>
          <span className='signup-form__label'>Password</span>

          <div className='signup-form__input-wrapper'>
            <RiLockPasswordLine className='signup-form__input-icon' size={20} />

            <input
              id='signup-password'
              className='signup-form__input signup-form__input--with-icon'
              type='password'
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              placeholder='Choose a secure password'
              autoComplete='new-password'
              disabled={loading}
              required
            />
          </div>
        </label>

        {error ? <p className='signup-form__error'>{error}</p> : null}

        <Button
          size='lg'
          variant='solid'
          type='submit'
          disabled={loading}
          icon={<FiUserPlus size={20} />}
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </Button>
      </form>

      <footer className='signup-card__actions'>
        <Button
          variant='text'
          color='muted'
          onClick={onSwitchToLogin}
          disabled={loading}
          icon={<FiArrowLeft size={18} />}
        >
          Back to sign in
        </Button>
      </footer>
    </section>
  );
};
