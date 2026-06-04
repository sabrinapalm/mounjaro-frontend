import './Header.css';

interface HeaderProps {
  onSignOut?: () => void;
}

export const Header = ({ onSignOut }: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <h1 className="header-logo">Mounjaro Companion</h1>
        </div>

        <nav className="header-nav">
          {onSignOut && (
            <button onClick={onSignOut} className="header-signout">
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
