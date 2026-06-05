import './Header.css';
import TracksyLogo from '/tracksy_logo.svg';
import TracksyLogoDark from '/tracksy_logo_dark_mode.svg';
import { LuCircleUserRound } from 'react-icons/lu';
import { LuMoon, LuSun } from 'react-icons/lu';
import { GoSignOut } from "react-icons/go";

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
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div className="header-logo-container">
          <img src={logoSrc} alt="Tracksy Logo" className="header-logo-image" />
          </div>
        </div>

        <nav className="header-nav">
                <button
          type="button"
          className="nav-button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <LuSun size={20} /> : <LuMoon size={20} />}
        </button>

            <button onClick={onEditProfile} className="nav-button" aria-label="Edit Profile">
              <LuCircleUserRound size={22} aria-hidden="true" />
            </button>

          {onSignOut && (
            <button onClick={onSignOut} className="nav-button" aria-label="Sign Out">
              <GoSignOut size={22} aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
