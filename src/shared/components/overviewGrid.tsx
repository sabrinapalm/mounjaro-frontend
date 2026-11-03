import type { ReactNode } from 'react';
import './overviewGrid.css';

type OverviewGridProps = { children: ReactNode };

export const OverviewGrid = ({ children }: OverviewGridProps) => (
  <div className='overview-grid'>
    <div className='overview-grid__content'>{children}</div>
  </div>
);
