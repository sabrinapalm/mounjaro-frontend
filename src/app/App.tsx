import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import './App.css';
import { useIntl } from 'react-intl';
import { AuthLayout, ConfirmSignUpForm, LoginForm, SignUpForm } from '../features/auth';
import {
  ProfileForm,
  ProfileProvider,
  profileQueryKeys,
  useProfile,
  useUpdateProfile,
} from '../features/profile';
import { cognitoAuth } from '../shared/auth/cognitoAuth';
import { DashboardErrorNotice } from '../shared/components/DashboardErrorNotice';
import { Header } from '../shared/components/Header';
import { LinearLoader } from '../shared/components/LinearLoader';
import { useTheme } from '../shared/hooks/useTheme';
import { messages } from '../shared/i18n/messages';
import type { ProfileFormValues, UserProfile } from '../shared/types';
import { getQueryErrorMessage } from '../shared/utils/queryErrorMessage';
import { Dashboard } from './DashboardShell';

type AuthView = 'login' | 'signup' | 'confirm';

export const App = () => {
  const queryClient = useQueryClient();
  const { formatMessage } = useIntl();

  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  const { theme, toggleTheme } = useTheme();

  const profileQuery = useProfile(authenticated);
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        await cognitoAuth.getAuthToken();

        if (!isMounted) {
          return;
        }

        setAuthenticated(true);
      } catch {
        if (!isMounted) {
          return;
        }

        setAuthenticated(false);
        queryClient.clear();
        sessionStorage.removeItem('TRACKSY_QUERY_CACHE');
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
  }, [queryClient]);

  const handleLoginSuccess = async () => {
    setAuthenticated(true);
    setAuthView('login');

    await queryClient.invalidateQueries({
      queryKey: profileQueryKeys.profile,
    });
  };

  const handleSignOut = () => {
    cognitoAuth.signOut();

    setAuthenticated(false);
    setAuthView('login');
    setPendingEmail('');

    queryClient.clear();
    sessionStorage.removeItem('TRACKSY_QUERY_CACHE');
  };

  const handleSignedUp = (email: string) => {
    setPendingEmail(email);
    setAuthView('confirm');
  };

  const handleSaveProfile = async (values: ProfileFormValues) => {
    await updateProfileMutation.mutateAsync(values);
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    queryClient.setQueryData(profileQueryKeys.profile, updatedProfile);
  };

  const renderAuthenticatedContent = () => {
    if (profileQuery.isLoading) {
      return <LinearLoader />;
    }

    if (profileQuery.isError) {
      return (
        <main className='app-content app-content--centered'>
          <DashboardErrorNotice
            title={formatMessage(messages.errorProfileTitle)}
            message={getQueryErrorMessage(
              profileQuery.error,
              formatMessage(messages.errorProfileMessage)
            )}
            onRetry={() => {
              void profileQuery.refetch();
            }}
          />
        </main>
      );
    }

    if (!profileQuery.data) {
      return (
        <ProfileForm
          initialProfile={null}
          onSubmit={handleSaveProfile}
          isSubmitting={updateProfileMutation.isPending}
          submitError={
            updateProfileMutation.isError
              ? getQueryErrorMessage(
                  updateProfileMutation.error,
                  formatMessage(messages.saveProfileError)
                )
              : undefined
          }
        />
      );
    }

    return (
      <ProfileProvider initialProfile={profileQuery.data}>
        <Dashboard
          profile={profileQuery.data}
          onProfileUpdated={handleProfileUpdated}
          onSignOut={handleSignOut}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </ProfileProvider>
    );
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
        <LoginForm
          onLogin={handleLoginSuccess}
          onSwitchToConfirm={() => setAuthView('confirm')}
          onSwitchToSignUp={() => setAuthView('signup')}
        />
      </AuthLayout>
    );
  };

  if (!initialized) {
    return <LinearLoader />;
  }

  return (
    <div className='app'>
      {authenticated ? (
        renderAuthenticatedContent()
      ) : (
        <>
          <Header theme={theme} onToggleTheme={toggleTheme} />
          {renderUnauthenticatedContent()}
        </>
      )}
    </div>
  );
};
