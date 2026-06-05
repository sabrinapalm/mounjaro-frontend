import { type FormEvent, useState } from 'react';
import { FiLogIn, FiMail, FiUserPlus } from 'react-icons/fi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { cognitoAuth } from '../services/cognitoAuth';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: () => void;
  onSwitchToSignUp: () => void;
}

export const LoginForm = ({ onLogin, onSwitchToSignUp }: LoginFormProps) => {
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
      await cognitoAuth.signIn(trimmedEmail, password);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='login-card'>
      <header className='login-card__header'>
        <div className='login-card__icon' aria-hidden='true'>
          <FiLogIn size={30} />
        </div>

        <div className='login-card__heading'>
          <h2 className='login-card__title'>Sign In</h2>

          <p className='login-card__description'>
            Welcome back. Sign in to continue tracking your shots and progress.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className='login-form'>
        <label className='login-form__field' htmlFor='login-email'>
          <span className='login-form__label'>Email</span>

          <div className='login-form__input-wrapper'>
            <FiMail className='login-form__input-icon' size={20} />

            <input
              id='login-email'
              className='login-form__input login-form__input--with-icon'
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

        <label className='login-form__field' htmlFor='login-password'>
          <span className='login-form__label'>Password</span>

          <div className='login-form__input-wrapper'>
            <RiLockPasswordLine className='login-form__input-icon' size={20} />

            <input
              id='login-password'
              className='login-form__input login-form__input--with-icon'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder='Enter your password'
              autoComplete='current-password'
              disabled={loading}
              required
            />
          </div>
        </label>

        {error ? <p className='login-form__error'>{error}</p> : null}

        <button className='login-form__submit' type='submit' disabled={loading}>
          <FiLogIn size={20} />
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <footer className='login-card__actions'>
        <button
          type='button'
          onClick={onSwitchToSignUp}
          className='login-card__link-button'
          disabled={loading}
        >
          <FiUserPlus size={18} />
          Create account
        </button>
      </footer>
    </section>
  );
};
