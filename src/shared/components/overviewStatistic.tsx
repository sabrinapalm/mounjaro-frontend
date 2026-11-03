import type { ReactNode } from 'react';
import './overviewStatistic.css';

type OverviewStatisticProps = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  meta?: ReactNode;
};

export const OverviewStatistic = ({ label, value, icon, meta }: OverviewStatisticProps) => (
  <div className='overview-statistic'>
    <dt className='overview-statistic__label'>
      <span className='overview-statistic__icon' aria-hidden='true'>
        {icon}
      </span>
      {label}
    </dt>
    <dd className='overview-statistic__value'>{value}</dd>
    {meta != null && <dd className='overview-statistic__meta'>{meta}</dd>}
  </div>
);
