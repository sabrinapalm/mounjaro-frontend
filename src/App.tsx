import { useEffect, useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { ConfirmSignUpForm } from './components/ConfirmSignUpForm';
import { ProfileForm } from './components/ProfileForm';
import { apiClient } from './services/apiClient';
import { cognitoAuth } from './services/cognitoAuth';
import type { ProfileFormValues, UserProfile } from './types';
import { useTheme } from './hooks/useTheme';

type AuthView = 'login' | 'signup' | 'confirm';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const { theme, toggleTheme } = useTheme();

  const loadProfile = async () => {
    setProfileLoaded(false);
    setProfileError('');

    try {
      const loadedProfile = await apiClient.getProfile();
      setProfile(loadedProfile);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Could not load profile.'
      );
    } finally {
      setProfileLoaded(true);
    }
  };

  useEffect(() => {
    cognitoAuth
      .getAuthToken()
      .then(async () => {
        setAuthenticated(true);
        await loadProfile();
      })
      .catch(() => {
        setAuthenticated(false);
        setProfile(null);
        setProfileLoaded(true);
      })
      .finally(() => setInitialized(true));
  }, []);

  const handleLoginSuccess = async () => {
    setAuthenticated(true);
    setAuthView('login');
    await loadProfile();
  };

  const handleSignOut = () => {
    cognitoAuth.signOut();
    setAuthenticated(false);
    setAuthView('login');
    setProfile(null);
    setProfileLoaded(false);
    setIsEditingProfile(false);
  };

  const handleSignedUp = (email: string) => {
    setPendingEmail(email);
    setAuthView('confirm');
  };

  const handleSaveProfile = async (values: ProfileFormValues) => {
    const savedProfile = await apiClient.updateProfile(values);
    setProfile(savedProfile);
    setIsEditingProfile(false);
  };

  if (!initialized) {
    return <div className="app">Loading authentication...</div>;
  }

  const renderAuthenticatedContent = () => {
    if (!profileLoaded) {
      return <div className="app-content">Loading profile...</div>;
    }

    if (profileError) {
      return (
        <div className="app-content">
          <p className="error-message">{profileError}</p>
          <button onClick={loadProfile}>Try again</button>
        </div>
      );
    }

    if (!profile || isEditingProfile) {
      return (
        <ProfileForm
          initialProfile={profile}
          title={profile ? 'Edit profile' : 'Welcome! Set up your profile'}
          submitLabel={profile ? 'Save changes' : 'Continue'}
          onSubmit={handleSaveProfile}
          onCancel={profile ? () => setIsEditingProfile(false) : undefined}
        />
      );
    }

    return (
        <Dashboard profile={profile} />
    );
  };

  return (
    <div className="app">
      <Header onEditProfile={() => setIsEditingProfile(true)} onSignOut={authenticated ? handleSignOut : undefined} theme={theme} onToggleTheme={toggleTheme}
 />

      {authenticated ? (
        renderAuthenticatedContent()
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