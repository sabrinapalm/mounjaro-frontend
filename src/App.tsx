import { useEffect, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { ConfirmSignUpForm } from './components/ConfirmSignUpForm';
import { cognitoAuth } from './services/cognitoAuth';

type AuthView = 'login' | 'signup' | 'confirm';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    cognitoAuth
      .getAuthToken()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setInitialized(true));
  }, []);

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setAuthView('login');
  };

  const handleSignOut = () => {
    cognitoAuth.signOut();
    setAuthenticated(false);
    setAuthView('login');
  };

  const handleSignedUp = (email: string) => {
    setPendingEmail(email);
    setAuthView('confirm');
  };

  if (!initialized) {
    return <div className="app">Loading authentication...</div>;
  }

  return (
    <div className="app">
      <Header onSignOut={authenticated ? handleSignOut : undefined} />
      {authenticated ? (
        <Dashboard />
      ) : authView === 'signup' ? (
        <SignUpForm
          onSignedUp={handleSignedUp}
          onSwitchToLogin={() => setAuthView('login')}
        />
      ) : authView === 'confirm' ? (
        <ConfirmSignUpForm
          email={pendingEmail}
          onConfirmed={() => setAuthView('login')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      ) : (
        <LoginForm
          onLogin={handleLoginSuccess}
          onSwitchToSignUp={() => setAuthView('signup')}
        />
      )}
    </div>
  );
}

export default App;
