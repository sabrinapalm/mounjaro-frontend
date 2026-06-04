import { useState, type FormEvent } from 'react';
import { cognitoAuth } from '../services/cognitoAuth';

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
    setError(null);
    setLoading(true);

    try {
      await cognitoAuth.confirmSignUp(email, code);
      onConfirmed();
    } catch (err) {
      setError((err as Error)?.message || 'Unable to confirm account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Confirm Account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="confirm-email">Email</label>
        <input
          id="confirm-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="confirm-code">Confirmation Code</label>
        <input
          id="confirm-code"
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />

        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Confirming…' : 'Confirm'}
        </button>
      </form>

      <div className="auth-actions">
        <button type="button" onClick={onSwitchToLogin} className="btn-link">
          Back to sign in
        </button>
      </div>
    </div>
  );
};
