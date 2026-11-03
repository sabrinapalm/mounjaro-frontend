import type { ReactNode } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { cn } from '../utils/cn';
import { Card } from './ui/card';
import './historyCard.css';

type HistoryCardProps = { children: ReactNode; className?: string };

export const HistoryCard = ({ children, className }: HistoryCardProps) => (
  <Card asChild appearance='custom'>
    <section className={cn('history-card', className)}>{children}</section>
  </Card>
);

type HistoryCardHeaderProps = { title: string; summary?: ReactNode; action?: ReactNode };

export const HistoryCardHeader = ({ title, summary, action }: HistoryCardHeaderProps) => (
  <header className='history-card__header'>
    <div>
      <h2 className='history-card__title'>{title}</h2>
      {summary != null && <p className='history-card__summary'>{summary}</p>}
    </div>
    {action}
  </header>
);

type HistoryEmptyStateProps = { icon: ReactNode; children: ReactNode; tone?: 'primary' | 'accent' };

export const HistoryEmptyState = ({ icon, children, tone = 'primary' }: HistoryEmptyStateProps) => (
  <div className='history-card__empty-state'>
    <div
      className={`history-card__empty-icon history-card__empty-icon--${tone}`}
      aria-hidden='true'
    >
      {icon}
    </div>
    <p>{children}</p>
  </div>
);

type HistoryGroupProps = { label: string; children: ReactNode };

export const HistoryGroup = ({ label, children }: HistoryGroupProps) => (
  <section className='history-card__month'>
    <h3 className='history-card__month-title'>{label}</h3>
    <ul className='history-card__list'>{children}</ul>
  </section>
);

type HistoryDeleteButtonProps = { label: string; onClick: () => void; className?: string };

export const HistoryDeleteButton = ({ label, onClick, className }: HistoryDeleteButtonProps) => (
  <button
    type='button'
    className={cn('history-card__delete-button', className)}
    aria-label={label}
    onClick={onClick}
  >
    <AiOutlineDelete size={19} aria-hidden='true' />
  </button>
);
