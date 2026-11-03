import type { ReactNode } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { cn } from '../utils/cn';
import './collapsibleCard.css';

type CollapsibleCardProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
};

export const CollapsibleCard = ({
  title,
  description,
  children,
  className,
}: CollapsibleCardProps) => (
  <details className={cn('collapsible-card', className)}>
    <summary className='collapsible-card__summary'>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <LuChevronDown size={20} aria-hidden='true' />
    </summary>
    <div className='collapsible-card__content'>{children}</div>
  </details>
);
