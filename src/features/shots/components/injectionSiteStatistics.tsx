import { LuMapPin } from 'react-icons/lu';
import { Card } from '../../../shared/components/ui/card';
import type { ShotEntry } from '../../../shared/types';
import { useShotStatsCards } from '../hooks/useShotStatsCards';
import { formatInjectionSite, getInjectionSiteCounts } from '../utils/shotStatsUtils';
import './injectionSiteStatistics.css';

type InjectionSiteStatisticsProps = { shots: ShotEntry[] };

export const InjectionSiteStatistics = ({ shots }: InjectionSiteStatisticsProps) => {
  const siteCounts = getInjectionSiteCounts(shots);
  const totalWithSite = siteCounts.reduce((total, site) => total + site.count, 0);
  const { mostUsedSite } = useShotStatsCards({ shots });

  return (
    <Card asChild appearance='custom'>
      <section
        className='injection-site-distribution'
        aria-labelledby='injection-site-distribution-title'
      >
        <header className='injection-site-distribution__header'>
          <div>
            <h2 id='injection-site-distribution-title'>Injection sites</h2>
            <p>Distribution of your logged injections.</p>
          </div>
          <LuMapPin size={20} aria-hidden='true' />
        </header>
        {siteCounts.length > 0 ? (
          <>
            <ul className='injection-site-distribution__list'>
              {siteCounts.map(({ site, count }) => (
                <li key={site} className='injection-site-distribution__item'>
                  <div className='injection-site-distribution__label'>
                    <span>{formatInjectionSite(site)}</span>
                    <strong>
                      {count}
                      <span className='sr-only'> injections</span>
                    </strong>
                  </div>
                  <div className='injection-site-distribution__bar' aria-hidden='true'>
                    <span style={{ width: `${(count / totalWithSite) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            {mostUsedSite && (
              <p className='injection-site-distribution__most-used'>
                Most used: <strong>{mostUsedSite.value}</strong> · {mostUsedSite.meta}
              </p>
            )}
          </>
        ) : (
          <p className='injection-site-distribution__empty'>
            Log an injection with a site to see your distribution.
          </p>
        )}
      </section>
    </Card>
  );
};
