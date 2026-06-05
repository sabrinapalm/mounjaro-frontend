import './Header.css';
import { GoSignOut } from 'react-icons/go';
import { LuCircleUserRound, LuMoon, LuSun } from 'react-icons/lu';
import TracksyLogo from '/tracksy_logo.svg';
import TracksyLogoDark from '/tracksy_logo_dark_mode.svg';

interface HeaderProps {
  onSignOut?: () => void;
  onEditProfile?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header = ({ onEditProfile, onSignOut, theme, onToggleTheme }: HeaderProps) => {
  const isDark = theme === 'dark';
  const logoSrc = isDark ? TracksyLogoDark : TracksyLogo;

  return (
    <header className='header'>
      <div className='header-container'>
        <div className='header-brand'>
          <div className='header-logo-container'>
            <img src={logoSrc} alt='Tracksy Logo' className='header-logo-image' />
          </div>
        </div>

        <nav className='header-nav' aria-label='Header navigation'>
          <button
            type='button'
            className='nav-button nav-button--theme'
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <LuSun size={20} /> : <LuMoon size={20} />}
          </button>

          <button
            type='button'
            onClick={onEditProfile}
            className='nav-button nav-button--profile'
            aria-label='Edit profile'
            title='Edit profile'
          >
            <LuCircleUserRound size={22} aria-hidden='true' />
          </button>

          {onSignOut && (
            <button
              type='button'
              onClick={onSignOut}
              className='nav-button nav-button--signout'
              aria-label='Sign out'
              title='Sign out'
            >
              <GoSignOut size={22} aria-hidden='true' />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
