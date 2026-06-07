import { IoScaleOutline, IoStarOutline } from 'react-icons/io5';
import {
  LuChartBar,
  // LuChartNoAxesColumnIncreasing,
  LuCircleHelp,
  // LuClipboardList,
  LuHeartPulse,
  LuHouse,
  LuSyringe,
  LuUserRound,
} from 'react-icons/lu';
import TracksyLogoWhite from '/tracksy_logo.svg';
import TracksyLogoDark from '/tracksy_logo_dark_mode.svg';
import './Sidebar.css';

export type SidebarSection =
  | 'dashboard'
  | 'shots'
  | 'weight'
  | 'progress'
  | 'dose-history'
  | 'side-effects'
  | 'milestones'
  | 'profile'
  | 'check-in'
  | 'insights';

type SidebarProps = {
  activeSection?: SidebarSection;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onNavigate?: (section: SidebarSection) => void;
  theme?: 'light' | 'dark';
};

const navItems: Array<{
  id: SidebarSection;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LuHouse size={22} />,
  },
  {
    id: 'check-in',
    label: 'Check-in',
    icon: <LuHeartPulse size={22} />,
  },
  {
    id: 'shots',
    label: 'Shots',
    icon: <LuSyringe size={22} />,
  },
  {
    id: 'weight',
    label: 'Weight',
    icon: <IoScaleOutline size={22} />,
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: <LuChartBar size={22} />,
  },
  {
    id: 'milestones',
    label: 'Milestones',
    icon: <IoStarOutline size={22} />,
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <LuUserRound size={22} />,
  },
];

export const Sidebar = ({
  activeSection = 'dashboard',
  isMobileOpen = false,
  onMobileClose,
  onNavigate,
  theme,
}: SidebarProps) => {
  const handleNavigate = (section: SidebarSection) => {
    onNavigate?.(section);
  };

  const logoSrc = theme === 'dark' ? TracksyLogoDark : TracksyLogoWhite;

  return (
    <>
      <button
        type='button'
        className={`sidebar-mobile-backdrop ${isMobileOpen ? 'sidebar-mobile-backdrop--open' : ''}`}
        aria-label='Close navigation menu'
        onClick={onMobileClose}
      />

      <aside
        className={`sidebar ${isMobileOpen ? 'sidebar--mobile-open' : ''}`}
        aria-label='Main navigation'
      >
        <div className='sidebar__inner'>
          <div className='sidebar__brand'>
            <img key={logoSrc} className='sidebar__logo' src={logoSrc} alt='Tracksy' />
            {/* <div>
              <p className='sidebar__brand-subtitle'>Your Mounjaro journey</p>
            </div> */}
          </div>

          <nav className='sidebar__nav' aria-label='Dashboard sections'>
            {navItems.map((item) => {
              const isActive = item.id === activeSection;

              return (
                <button
                  key={item.id}
                  type='button'
                  className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                  onClick={() => handleNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className='sidebar__nav-icon' aria-hidden='true'>
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className='sidebar__spacer' />

          <a
            className='sidebar__help-card'
            href='https://www.lilly.com/'
            target='_blank'
            rel='noreferrer'
          >
            <span className='sidebar__help-icon' aria-hidden='true'>
              <LuCircleHelp size={24} />
            </span>

            <span>
              <span className='sidebar__help-title'>Need help?</span>
              <span className='sidebar__help-text'>Learn about Mounjaro ↗</span>
            </span>
          </a>
        </div>
      </aside>
    </>
  );
};
