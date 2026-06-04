import { useState, type FormEvent } from 'react';
import { cognitoAuth } from '../services/cognitoAuth';

interface LoginFormProps {
  onLogin: () => void;
  onSwitchToSignUp: () => void;
}

export const LoginForm = ({
  onLogin,
  onSwitchToSignUp,
}: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await cognitoAuth.signIn(email, password);
      onLogin();
    } catch (err) {
      setError((err as Error)?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="auth-actions">
        <button type="button" onClick={onSwitchToSignUp} className="btn-link">
          Create account
        </button>
      </div>
    </div>
  );
};
