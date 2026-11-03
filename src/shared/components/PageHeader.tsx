import type { ReactNode } from 'react';
import './PageHeader.css';

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  actionMeta?: ReactNode;
};

export const PageHeader = ({
  title,
  eyebrow,
  description,
  action,
  actionMeta,
}: PageHeaderProps) => {
  return (
    <header className='page-header'>
      <div className='page-header__copy'>
        {eyebrow && <p className='page-header__eyebrow'>{eyebrow}</p>}
        <h1 className='page-header__title'>{title}</h1>

        {description && <p className='page-header__description'>{description}</p>}
      </div>

      {(action || actionMeta) && (
        <div className='page-header__action'>
          {actionMeta && <span className='page-header__action-meta'>{actionMeta}</span>}
          {action}
        </div>
      )}
    </header>
  );
};
