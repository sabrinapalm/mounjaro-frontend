import dayjs from 'dayjs';
import {
  LuActivity,
  LuCalendarCheck,
  LuFlame,
  LuHeartPulse,
  LuMessageSquareText,
  LuSparkles,
} from 'react-icons/lu';
import type { CheckInEntry, CheckInLevel, SideEffect } from '../../types';
import './CheckInStatsCards.css';
import { MetricCard } from '../general/MetricCard';

type CheckInStatsCardsProps = {
  checkIns: CheckInEntry[];
};

const sideEffectLabels: Record<SideEffect, string> = {
  nausea: 'Nausea',
  fatigue: 'Fatigue',
  headache: 'Headache',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  stomach_pain: 'Stomach pain',
  injection_site_reaction: 'Injection site reaction',
  reduced_appetite: 'Reduced appetite',
  heartburn: 'Heartburn',
  other: 'Other',
};

const getCheckInTimestamp = (checkIn: CheckInEntry) => {
  const timestamp = dayjs(checkIn.dateTime).valueOf();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatAverage = (value: number | null) => {
  if (value === null) {
    return 'No data';
  }

  return value.toFixed(1);
};

const getAverage = (values: Array<CheckInLevel | undefined>) => {
  const validValues = values.filter((value): value is CheckInLevel => typeof value === 'number');

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce((sum, value) => sum + value, 0);

  return total / validValues.length;
};

const getCurrentStreak = (checkIns: CheckInEntry[]) => {
  const loggedDays = new Set(
    checkIns
      .map((checkIn) => {
        const parsedDate = dayjs(checkIn.dateTime);

        return parsedDate.isValid() ? parsedDate.format('YYYY-MM-DD') : null;
      })
      .filter((date): date is string => Boolean(date))
  );

  if (loggedDays.size === 0) {
    return 0;
  }

  let streak = 0;
  let currentDay = dayjs().startOf('day');

  while (loggedDays.has(currentDay.format('YYYY-MM-DD'))) {
    streak += 1;
    currentDay = currentDay.subtract(1, 'day');
  }

  return streak;
};

const getSideEffectStats = (checkIns: CheckInEntry[]) => {
  const checkInsWithSideEffects = checkIns.filter((checkIn) => {
    return (checkIn.sideEffects?.length ?? 0) > 0;
  });

  const sideEffectCounts = checkIns.reduce<Partial<Record<SideEffect, number>>>(
    (counts, checkIn) => {
      checkIn.sideEffects?.forEach((sideEffect) => {
        counts[sideEffect] = (counts[sideEffect] ?? 0) + 1;
      });

      return counts;
    },
    {}
  );

  const [mostCommonSideEffect, mostCommonCount] =
    Object.entries(sideEffectCounts).sort(([, countA], [, countB]) => countB - countA)[0] ?? [];

  if (!checkIns.length) {
    return {
      value: 'No data yet',
      meta: 'Log side effects to see patterns',
    };
  }

  if (!checkInsWithSideEffects.length) {
    return {
      value: 'None logged',
      meta: 'No side effects recorded',
    };
  }

  return {
    value: `${checkInsWithSideEffects.length}/${checkIns.length}`,
    meta:
      mostCommonSideEffect && mostCommonCount
        ? `Most common: ${sideEffectLabels[mostCommonSideEffect as SideEffect]}`
        : 'Side effects recorded',
  };
};

const getNotesStats = (checkIns: CheckInEntry[]) => {
  const notesCount = checkIns.filter((checkIn) => checkIn.notes?.trim()).length;

  if (!checkIns.length) {
    return {
      value: 'No data yet',
      meta: 'Add notes to remember context',
    };
  }

  if (!notesCount) {
    return {
      value: 'No notes',
      meta: 'Add notes to remember context',
    };
  }

  return {
    value: String(notesCount),
    meta: notesCount === 1 ? '1 check-in has notes' : `${notesCount} check-ins have notes`,
  };
};

const getLatestCheckInStats = (checkIns: CheckInEntry[]) => {
  const sortedCheckIns = [...checkIns].sort(
    (a, b) => getCheckInTimestamp(a) - getCheckInTimestamp(b)
  );

  const latestCheckIn = sortedCheckIns[sortedCheckIns.length - 1];

  if (!latestCheckIn) {
    return {
      value: 'No data yet',
      meta: 'Log your first daily check-in',
    };
  }

  const latestDate = dayjs(latestCheckIn.dateTime);
  const daysSinceLatest = dayjs().startOf('day').diff(latestDate.startOf('day'), 'day');

  if (daysSinceLatest === 0) {
    return {
      value: 'Today',
      meta: latestDate.format('MMM D'),
    };
  }

  if (daysSinceLatest === 1) {
    return {
      value: 'Yesterday',
      meta: latestDate.format('MMM D'),
    };
  }

  return {
    value: `${daysSinceLatest} days ago`,
    meta: latestDate.format('MMM D'),
  };
};

export const CheckInStatsCards = ({ checkIns }: CheckInStatsCardsProps) => {
  const latestCheckIn = [...checkIns].sort(
    (a, b) => getCheckInTimestamp(a) - getCheckInTimestamp(b)
  )[checkIns.length - 1];

  if (!latestCheckIn) {
    return (
      <div className='dashboard-summary-cards check-in-summary-cards'>
        <MetricCard
          label='Check-in Insights'
          value='No data yet'
          meta='Log your first daily check-in to see patterns'
          icon={<LuHeartPulse aria-hidden='true' />}
          tone='primary'
          className='check-in-summary-card check-in-summary-card--empty'
        />
      </div>
    );
  }

  const currentStreak = getCurrentStreak(checkIns);
  const averageEnergy = getAverage(checkIns.map((checkIn) => checkIn.energyLevel));
  const averageHunger = getAverage(checkIns.map((checkIn) => checkIn.hungerLevel));
  const averageMood = getAverage(checkIns.map((checkIn) => checkIn.moodLevel));
  const sideEffectStats = getSideEffectStats(checkIns);
  const notesStats = getNotesStats(checkIns);
  const latestCheckInStats = getLatestCheckInStats(checkIns);

  return (
    <div className='dashboard-summary-cards check-in-summary-cards'>
      <MetricCard
        label='Total Check-ins'
        value={checkIns.length}
        meta={checkIns.length === 1 ? '1 check-in logged' : `${checkIns.length} check-ins logged`}
        icon={<LuCalendarCheck aria-hidden='true' />}
        tone='info'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Current Streak'
        value={currentStreak}
        meta={currentStreak === 1 ? '1 day in a row' : `${currentStreak} days in a row`}
        icon={<LuFlame aria-hidden='true' />}
        tone='warning'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Energy'
        value={formatAverage(averageEnergy)}
        meta='Out of 5'
        icon={<LuSparkles aria-hidden='true' />}
        tone='accent'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Mood'
        value={formatAverage(averageMood)}
        meta='Out of 5'
        icon={<LuHeartPulse aria-hidden='true' />}
        tone='primary'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Average Hunger'
        value={formatAverage(averageHunger)}
        meta='Out of 5'
        icon={<LuActivity aria-hidden='true' />}
        tone='secondary'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Side Effects'
        value={sideEffectStats.value}
        meta={sideEffectStats.meta}
        icon={<LuActivity aria-hidden='true' />}
        tone='warning'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Notes'
        value={notesStats.value}
        meta={notesStats.meta}
        icon={<LuMessageSquareText aria-hidden='true' />}
        tone='neutral'
        className='check-in-summary-card'
      />

      <MetricCard
        label='Latest Check-in'
        value={latestCheckInStats.value}
        meta={latestCheckInStats.meta}
        icon={<LuHeartPulse aria-hidden='true' />}
        tone='success'
        className='check-in-summary-card'
      />
    </div>
  );
};
