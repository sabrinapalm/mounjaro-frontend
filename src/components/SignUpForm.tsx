import { type FormEvent, useState } from 'react';
import { cognitoAuth } from '../services/cognitoAuth';

interface SignUpFormProps {
  onSignedUp: (email: string) => void;
  onSwitchToLogin: () => void;
}

export const SignUpForm = ({ onSignedUp, onSwitchToLogin }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await cognitoAuth.signUp(email, password);
      onSignedUp(email);
    } catch (err) {
      setError((err as Error)?.message || 'Unable to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-card'>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} className='auth-form'>
        <label htmlFor='signup-email'>Email</label>
        <input
          id='signup-email'
          type='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor='signup-password'>Password</label>
        <input
          id='signup-password'
          type='password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className='auth-error'>{error}</p>}
        <button type='submit' disabled={loading} className='btn-primary'>
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <div className='auth-actions'>
        <button type='button' onClick={onSwitchToLogin} className='btn-link'>
          Back to sign in
        </button>
      </div>
    </div>
  );
};
