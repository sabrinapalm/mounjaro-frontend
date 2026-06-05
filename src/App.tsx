import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { AuthLayout } from './components/AuthLayout';
import { ConfirmSignUpForm } from './components/ConfirmSignUpForm';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { LinearLoader } from './components/LinearLoader';
import { LoginForm } from './components/LoginForm';
import { ProfileForm } from './components/ProfileForm';
import { SignUpForm } from './components/SignUpForm';
import { useTheme } from './hooks/useTheme';
import { apiClient } from './services/apiClient';
import { cognitoAuth } from './services/cognitoAuth';
import type { ProfileFormValues, UserProfile } from './types';

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

  const loadProfile = useCallback(async () => {
    setProfileLoaded(false);
    setProfileError('');

    try {
      const loadedProfile = await apiClient.getProfile();
      setProfile(loadedProfile);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not load profile.');
    } finally {
      setProfileLoaded(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await cognitoAuth.getAuthToken();

        if (!isMounted) {
          return;
        }

        setAuthenticated(true);
        await loadProfile();
      } catch {
        if (!isMounted) {
          return;
        }

        setAuthenticated(false);
        setProfile(null);
        setProfileLoaded(true);
      } finally {
        if (isMounted) {
          setInitialized(true);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

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

  const renderAuthenticatedContent = () => {
    if (!profileLoaded) {
      return null;
    }

    if (profileError) {
      return (
        <div className='app-content'>
          <p className='error-message'>{profileError}</p>
          <button type='button' onClick={loadProfile}>
            Try again
          </button>
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

    return <Dashboard profile={profile} />;
  };

  const renderUnauthenticatedContent = () => {
    if (authView === 'signup') {
      return (
        <AuthLayout>
          <SignUpForm onSignedUp={handleSignedUp} onSwitchToLogin={() => setAuthView('login')} />
        </AuthLayout>
      );
    }

    if (authView === 'confirm') {
      return (
        <AuthLayout>
          <ConfirmSignUpForm
            email={pendingEmail}
            onConfirmed={() => setAuthView('login')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        </AuthLayout>
      );
    }

    return (
      <AuthLayout>
        <LoginForm onLogin={handleLoginSuccess} onSwitchToSignUp={() => setAuthView('signup')} />
      </AuthLayout>
    );
  };

  if (!initialized) {
    return <LinearLoader />;
  }

  return (
    <div className='app'>
      <Header
        onEditProfile={() => setIsEditingProfile(true)}
        onSignOut={authenticated ? handleSignOut : undefined}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {authenticated ? renderAuthenticatedContent() : renderUnauthenticatedContent()}
    </div>
  );
}

export default App;
