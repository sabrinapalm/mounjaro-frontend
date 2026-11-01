import type { ReactNode } from 'react';
import { Card } from './ui/card';
import './MetricCard.css';

export type MetricCardTone =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'neutral';

type MetricCardProps = {
  label: ReactNode;
  value: ReactNode;
  icon: ReactNode;
  meta?: ReactNode;
  tone?: MetricCardTone;
  highlightValue?: boolean;
  className?: string;
};

export const MetricCard = ({
  label,
  value,
  icon,
  meta,
  tone = 'primary',
  highlightValue = false,
  className = '',
}: MetricCardProps) => {
  const cardClassName = ['metric-card', className].filter(Boolean).join(' ');
  const iconClassName = ['metric-card__icon', `metric-card__icon--${tone}`].join(' ');
  const valueClassName = ['metric-card__value', highlightValue ? `metric-card__value--${tone}` : '']
    .filter(Boolean)
    .join(' ');

  return (
    <Card asChild appearance='custom'>
      <article className={cardClassName}>
        <div className={iconClassName}>{icon}</div>

        <div className='metric-card__copy'>
          <span className='metric-card__label'>{label}</span>
          <span className={valueClassName}>{value}</span>

          {meta !== undefined && meta !== null && <span className='metric-card__meta'>{meta}</span>}
        </div>
      </article>
    </Card>
  );
};
