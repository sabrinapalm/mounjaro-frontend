import { LuChevronDown } from 'react-icons/lu';
import { Card } from '../../../shared/components/ui/card';
import type { ShotEntry, WeightEntry } from '../../../shared/types';
import { useInjectionSiteWeightLossStats } from '../hooks/useInjectionSiteWeightLossStats';
import { formatWeightChange } from '../utils/injectionSiteWeightLossUtils';
import './InjectionSiteWeightLossStats.css';

type InjectionSiteWeightLossStatsProps = { shots: ShotEntry[]; weights: WeightEntry[] };

export const InjectionSiteWeightLossStats = ({
  shots,
  weights,
}: InjectionSiteWeightLossStatsProps) => {
  const { stats, bestSite, hasStats } = useInjectionSiteWeightLossStats({ shots, weights });

  return (
    <Card asChild appearance='custom'>
      <details className='injection-site-weight-change'>
        <summary>
          <span>
            <span className='injection-site-weight-change__title'>Weight change by site</span>
            <span className='injection-site-weight-change__subtitle'>
              Recorded changes per completed period.
            </span>
          </span>
          <LuChevronDown size={16} aria-hidden='true' />
        </summary>
        {hasStats ? (
          <>
            <p className='injection-site-weight-change__description'>
              These statistics are descriptive and do not indicate that a site causes weight change.
            </p>
            <table>
              <caption className='sr-only'>Weight change by injection site in kilograms</caption>
              <thead>
                <tr>
                  <th scope='col'>Site</th>
                  <th scope='col'>Periods</th>
                  <th scope='col'>Total</th>
                  <th scope='col'>
                    <abbr title='Average loss'>Avg.</abbr>
                  </th>
                  <th scope='col'>Best</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.injectionSite}>
                    <th scope='row'>{stat.label}</th>
                    <td>{stat.completedPeriods}</td>
                    <td>{formatWeightChange(stat.totalWeightLoss)}</td>
                    <td>{formatWeightChange(stat.averageWeightLoss)}</td>
                    <td>{formatWeightChange(stat.bestPeriodLoss)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bestSite && (
              <p className='injection-site-weight-change__highlight'>
                Highest average: <strong>{bestSite.label}</strong> ·{' '}
                {formatWeightChange(bestSite.averageWeightLoss)} per completed period
              </p>
            )}
          </>
        ) : (
          <p className='injection-site-weight-change__description'>
            Add shots with injection sites and weight entries before and after them to see this
            insight.
          </p>
        )}
      </details>
    </Card>
  );
};
