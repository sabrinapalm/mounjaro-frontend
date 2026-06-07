import dayjs from 'dayjs';
import {
  LuActivity,
  LuCalendarCheck,
  LuFlame,
  LuHeartPulse,
  LuMessageSquareText,
  LuSparkles,
} from 'react-icons/lu';
import type { CheckInEntry, CheckInLevel, SideEffect } from '../types';
import './CheckInStatsCards.css';

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
        <div className='dashboard-card check-in-summary-card check-in-summary-card--empty'>
          <div className='dashboard-card-icon dashboard-card-icon-check-in'>
            <LuHeartPulse size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Check-in Insights</span>
            <span className='dashboard-card-value'>No data yet</span>
            <span className='dashboard-card-meta'>
              Log your first daily check-in to see patterns
            </span>
          </div>
        </div>
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
      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-check-in'>
          <LuCalendarCheck size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Total Check-ins</span>
          <span className='dashboard-card-value'>{checkIns.length}</span>
          <span className='dashboard-card-meta'>
            {checkIns.length === 1 ? '1 check-in logged' : `${checkIns.length} check-ins logged`}
          </span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-streak'>
          <LuFlame size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Current Streak</span>
          <span className='dashboard-card-value'>{currentStreak}</span>
          <span className='dashboard-card-meta'>
            {currentStreak === 1 ? '1 day in a row' : `${currentStreak} days in a row`}
          </span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-energy'>
          <LuSparkles size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Average Energy</span>
          <span className='dashboard-card-value'>{formatAverage(averageEnergy)}</span>
          <span className='dashboard-card-meta'>Out of 5</span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-mood'>
          <LuHeartPulse size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Average Mood</span>
          <span className='dashboard-card-value'>{formatAverage(averageMood)}</span>
          <span className='dashboard-card-meta'>Out of 5</span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-hunger'>
          <LuActivity size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Average Hunger</span>
          <span className='dashboard-card-value'>{formatAverage(averageHunger)}</span>
          <span className='dashboard-card-meta'>Out of 5</span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-side-effects'>
          <LuActivity size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Side Effects</span>
          <span className='dashboard-card-value'>{sideEffectStats.value}</span>
          <span className='dashboard-card-meta'>{sideEffectStats.meta}</span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-notes'>
          <LuMessageSquareText size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Notes</span>
          <span className='dashboard-card-value'>{notesStats.value}</span>
          <span className='dashboard-card-meta'>{notesStats.meta}</span>
        </div>
      </div>

      <div className='dashboard-card check-in-summary-card'>
        <div className='dashboard-card-icon dashboard-card-icon-latest'>
          <LuHeartPulse size={38} color='currentColor' aria-hidden='true' />
        </div>

        <div className='dashboard-card-copy'>
          <span className='dashboard-card-label'>Latest Check-in</span>
          <span className='dashboard-card-value'>{latestCheckInStats.value}</span>
          <span className='dashboard-card-meta'>{latestCheckInStats.meta}</span>
        </div>
      </div>
    </div>
  );
};
