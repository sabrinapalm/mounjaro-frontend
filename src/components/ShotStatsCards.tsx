import dayjs from 'dayjs';
import {
  LuCalendarHeart,
  LuClock3,
  LuMapPin,
  LuMessageSquareText,
  LuSyringe,
} from 'react-icons/lu';
import type { ShotEntry } from '../types';
import { MetricCard } from './general/MetricCard';
import './ShotStatsCards.css';

type ShotStatsCardsProps = {
  shots: ShotEntry[];
};

const sideEffectLabels: Record<string, string> = {
  fatigue: 'Fatigue',
  nausea: 'Nausea',
  headache: 'Headache',
  stomach_pain: 'Stomach pain',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  injection_site_reaction: 'Injection site reaction',
  appetite_loss: 'Appetite loss',
  other: 'Other',
};

const injectionSiteLabels: Record<string, string> = {
  abdomen_left: 'Left abdomen',
  abdomen_right: 'Right abdomen',
  thigh_left: 'Left thigh',
  thigh_right: 'Right thigh',
  arm_left: 'Left arm',
  arm_right: 'Right arm',
};

const getShotDateTime = (shot: ShotEntry) => {
  return shot.dateTime;
};

const getShotTimestamp = (shot: ShotEntry) => {
  const timestamp = dayjs(getShotDateTime(shot)).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatDosage = (dosage: number | string) => {
  return `${dosage} mg`;
};

const formatFallbackLabel = (value: string) => {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatInjectionSite = (site?: string) => {
  if (!site) {
    return 'Not set';
  }

  return injectionSiteLabels[site] ?? formatFallbackLabel(site);
};

const formatSideEffect = (sideEffect?: string) => {
  if (!sideEffect) {
    return 'None';
  }

  return sideEffectLabels[sideEffect] ?? formatFallbackLabel(sideEffect);
};

const getMostUsedInjectionSite = (shots: ShotEntry[]) => {
  const counts = shots.reduce<Record<string, number>>((acc, shot) => {
    if (!shot.injectionSite) {
      return acc;
    }

    acc[shot.injectionSite] = (acc[shot.injectionSite] ?? 0) + 1;

    return acc;
  }, {});

  const [site, count] =
    Object.entries(counts).sort(([, countA], [, countB]) => countB - countA)[0] ?? [];

  if (!site || !count) {
    return {
      value: 'Not set',
      meta: 'No injection sites logged yet',
    };
  }

  return {
    value: formatInjectionSite(site),
    meta: count === 1 ? 'Used once' : `Used ${count} times`,
  };
};

const getSideEffectStats = (shots: ShotEntry[]) => {
  const shotsWithSideEffects = shots.filter((shot) => (shot.sideEffects?.length ?? 0) > 0);

  const sideEffectCounts = shots.reduce<Record<string, number>>((acc, shot) => {
    shot.sideEffects?.forEach((sideEffect) => {
      acc[sideEffect] = (acc[sideEffect] ?? 0) + 1;
    });

    return acc;
  }, {});

  const [mostCommonSideEffect, mostCommonCount] =
    Object.entries(sideEffectCounts).sort(([, countA], [, countB]) => countB - countA)[0] ?? [];

  if (!shots.length) {
    return {
      value: 'No data yet',
      meta: 'Log side effects to see patterns',
    };
  }

  if (!shotsWithSideEffects.length) {
    return {
      value: 'None logged',
      meta: 'No side effects recorded',
    };
  }

  return {
    value: `${shotsWithSideEffects.length}/${shots.length}`,
    meta:
      mostCommonSideEffect && mostCommonCount
        ? `Most common: ${formatSideEffect(mostCommonSideEffect)}`
        : 'Side effects recorded',
  };
};

const getNotesStats = (shots: ShotEntry[]) => {
  const notesCount = shots.filter((shot) => shot.notes?.trim()).length;

  if (!notesCount) {
    return {
      value: 'No notes',
      meta: 'Add notes to remember context',
    };
  }

  return {
    value: notesCount,
    meta: notesCount === 1 ? '1 shot has notes' : `${notesCount} shots have notes`,
  };
};

const getNextShotLabel = (latestShotDate: dayjs.Dayjs) => {
  const today = dayjs().startOf('day');
  const nextShotDate = latestShotDate.add(7, 'day').startOf('day');
  const daysUntilNextShot = nextShotDate.diff(today, 'day');

  if (daysUntilNextShot < 0) {
    const overdueDays = Math.abs(daysUntilNextShot);

    return {
      value: 'Overdue',
      meta: `${overdueDays} ${overdueDays === 1 ? 'day' : 'days'} late`,
      tone: 'danger' as const,
    };
  }

  if (daysUntilNextShot === 0) {
    return {
      value: 'Today',
      meta: 'Your next shot is due today',
      tone: 'warning' as const,
    };
  }

  if (daysUntilNextShot === 1) {
    return {
      value: 'Tomorrow',
      meta: nextShotDate.format('MMM D'),
      tone: 'info' as const,
    };
  }

  return {
    value: `In ${daysUntilNextShot} days`,
    meta: nextShotDate.format('MMM D'),
    tone: 'info' as const,
  };
};

export const ShotStatsCards = ({ shots }: ShotStatsCardsProps) => {
  const sortedShots = [...shots].sort((a, b) => getShotTimestamp(a) - getShotTimestamp(b));

  const latestShot = sortedShots[sortedShots.length - 1];
  const mostUsedSite = getMostUsedInjectionSite(shots);
  const sideEffectStats = getSideEffectStats(shots);
  const notesStats = getNotesStats(shots);

  if (!latestShot) {
    return (
      <div className='dashboard-summary-cards shot-summary-cards'>
        <MetricCard
          label='Shot Insights'
          value='No data yet'
          meta='Log your first shot to see your rhythm'
          icon={<LuSyringe aria-hidden='true' />}
          tone='primary'
          className='shot-summary-card shot-summary-card--empty'
        />
      </div>
    );
  }

  const latestShotDate = dayjs(getShotDateTime(latestShot)).startOf('day');
  const nextShot = getNextShotLabel(latestShotDate);

  return (
    <div className='dashboard-summary-cards shot-summary-cards'>
      <MetricCard
        label='Total Shots'
        value={shots.length}
        meta={shots.length === 1 ? '1 shot logged' : `${shots.length} shots logged`}
        icon={<LuSyringe aria-hidden='true' />}
        tone='primary'
        className='shot-summary-card'
      />

      <MetricCard
        label='Latest Dose'
        value={formatDosage(latestShot.dosage)}
        meta={`Logged ${latestShotDate.format('MMM D')}`}
        icon={<LuCalendarHeart aria-hidden='true' />}
        tone='success'
        className='shot-summary-card'
      />

      <MetricCard
        label='Next Shot'
        value={nextShot.value}
        meta={nextShot.meta}
        icon={<LuClock3 aria-hidden='true' />}
        tone={nextShot.tone}
        highlightValue={nextShot.tone === 'danger' || nextShot.tone === 'warning'}
        className='shot-summary-card'
      />

      <MetricCard
        label='Most Used Site'
        value={mostUsedSite.value}
        meta={mostUsedSite.meta}
        icon={<LuMapPin aria-hidden='true' />}
        tone='info'
        className='shot-summary-card'
      />

      <MetricCard
        label='Side Effects'
        value={sideEffectStats.value}
        meta={sideEffectStats.meta}
        icon={<LuCalendarHeart aria-hidden='true' />}
        tone='warning'
        className='shot-summary-card'
      />

      <MetricCard
        label='Notes'
        value={notesStats.value}
        meta={notesStats.meta}
        icon={<LuMessageSquareText aria-hidden='true' />}
        tone='neutral'
        className='shot-summary-card'
      />
    </div>
  );
};
