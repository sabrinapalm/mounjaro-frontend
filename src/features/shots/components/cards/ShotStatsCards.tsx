import { LuCalendarClock, LuMapPin, LuSyringe } from 'react-icons/lu';
import { useIntl } from 'react-intl';
import { messages } from '../../../../shared/i18n/messages';
import type { ShotEntry } from '../../../../shared/types';
import { formatDateLabel } from '../../../../shared/utils/dateHelpers';
import { useShotStatsCards } from '../../hooks/useShotStatsCards';
import { formatInjectionSite } from '../../utils/shotStatsUtils';
import './ShotStatsCards.css';

type ShotStatsCardsProps = {
  shots: ShotEntry[];
};

export const ShotStatsCards = ({ shots }: ShotStatsCardsProps) => {
  const { formatMessage } = useIntl();
  const {
    hasShots,
    latestShot,
    latestShotDate,
    nextShotDate,
    totalShots,
    nextShot,
    sideEffects,
    notes,
  } = useShotStatsCards({ shots });

  return (
    <section className='shot-overview'>
      <div className='shot-overview__primary'>
        <div className='shot-overview__next'>
          <div className='shot-overview__eyebrow'>
            <LuCalendarClock size={17} aria-hidden='true' />
            <span>Next scheduled injection</span>
          </div>
          {nextShotDate ? (
            <>
              <p className='shot-overview__date'>{nextShotDate.format('dddd, MMM D')}</p>
              <p className={`shot-overview__due shot-overview__due--${nextShot?.tone ?? 'info'}`}>
                {nextShot?.value}
                {nextShot?.value === 'Overdue' ? ` · ${nextShot.meta}` : ''}
              </p>
            </>
          ) : (
            <p className='shot-overview__date shot-overview__date--empty'>
              Add your first injection to see your next date
            </p>
          )}
        </div>

        <div className='shot-overview__latest'>
          <p className='shot-overview__label'>Latest injection</p>
          {latestShot && latestShotDate ? (
            <>
              <p className='shot-overview__dose'>{latestShot.dosage.toFixed(1)} mg</p>
              <p className='shot-overview__meta'>{formatDateLabel(latestShotDate.toDate())}</p>
            </>
          ) : (
            <p className='shot-overview__meta'>No injections recorded</p>
          )}
        </div>
      </div>

      <dl className='shot-overview__supporting'>
        <div className='shot-overview__supporting-item'>
          <dt>
            <LuSyringe size={16} aria-hidden='true' />
            Injections logged
          </dt>
          <dd>{totalShots?.value ?? 0}</dd>
        </div>
        <div className='shot-overview__supporting-item'>
          <dt>
            <LuMapPin size={16} aria-hidden='true' />
            Most recent site
          </dt>
          <dd>
            {latestShot?.injectionSite
              ? formatMessage(messages[latestShot.injectionSite])
              : formatInjectionSite(null)}
          </dd>
        </div>
        <div className='shot-overview__supporting-item'>
          <dt>Side effects</dt>
          <dd>{hasShots ? sideEffects?.meta : 'No records yet'}</dd>
        </div>
        <div className='shot-overview__supporting-item'>
          <dt>Notes</dt>
          <dd>{hasShots ? notes?.meta : 'No records yet'}</dd>
        </div>
      </dl>
    </section>
  );
};
