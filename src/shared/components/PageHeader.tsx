import type { ReactNode } from 'react';
import './PageHeader.css';

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <header className='page-header'>
      <div className='page-header__copy'>
        <h1>{title}</h1>

        {description && <p>{description}</p>}
      </div>

      {action && <div className='page-header__action'>{action}</div>}
    </header>
  );
};
