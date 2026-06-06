import { LuMoon, LuSun } from 'react-icons/lu';
import './Header.css';
import TracksyLogo from '/tracksy_logo.svg';
import TracksyLogoDark from '/tracksy_logo_dark_mode.svg';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header = ({ theme, onToggleTheme }: HeaderProps) => {
  const isDark = theme === 'dark';
  const logoSrc = isDark ? TracksyLogoDark : TracksyLogo;

  return (
    <header className='header'>
      <div className='header-container'>
        <div className='header-brand'>
          <div className='header-logo-container'>
            <img key={logoSrc} src={logoSrc} alt='Tracksy' className='header-logo-image' />
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
            {isDark ? (
              <LuSun size={20} aria-hidden='true' />
            ) : (
              <LuMoon size={20} aria-hidden='true' />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
