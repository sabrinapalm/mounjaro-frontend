import { LuCalendarHeart, LuScale, LuSyringe, LuTrendingDown } from 'react-icons/lu';

import type { DashboardSummary } from '../hooks/useDashboardSummary';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type {
  CheckInEntry,
  CreateCheckInInput,
  CreateShotInput,
  CreateWeightInput,
  ShotEntry,
  UserProfile,
  WeightEntry,
} from '../types';
import { formatDateLabel } from '../utils/dateHelpers';
import { CheckInTracker } from './CheckInTracker';
import { GoalProgress } from './GoalProgress';
// import { ButtonShowcase } from './general/ButtonShowCase';
import { MetricCard } from './general/MetricCard';
import { Milestones } from './Milestones';
import { ShotTracker } from './ShotTracker';
import { WeightGraph } from './WeightGraph';
import { WeightTracker } from './WeightTracker';

interface DashboardOverviewProps {
  profile: UserProfile;
  summary: DashboardSummary;
  shots: ShotEntry[];
  weights: WeightEntry[];
  checkIns: CheckInEntry[];
  onCheckInAdded: (checkIn: CreateCheckInInput) => Promise<void>;
  onDeleteCheckIn: (id: string, dateTime: string) => Promise<void>;
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteShot: (id: string, dateTime: string) => Promise<void>;
  onDeleteWeight: (id: string, dateTime: string) => Promise<void>;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
  onViewAllMilestones: () => void;
  onViewAllShots: () => void;
  onViewAllWeights: () => void;
  onViewAllCheckIns: () => void;
}

export const DashboardOverview = ({
  profile,
  summary,
  shots,
  weights,
  checkIns,
  onShotAdded,
  onWeightAdded,
  onDeleteCheckIn,
  onCheckInAdded,
  onDeleteShot,
  onDeleteWeight,
  onGoalWeightUpdated,
  onViewAllMilestones,
  onViewAllShots,
  onViewAllWeights,
  onViewAllCheckIns,
}: DashboardOverviewProps) => {
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile.unitSystem ?? 'metric');

  const formatWeight = (value: number) => `${displayWeightFromKg(value)} ${weightUnit}`;

  const currentWeightLabel =
    summary.currentWeight !== null ? formatWeight(summary.currentWeight) : '—';

  const totalWeightLossLabel =
    summary.totalWeightLoss !== null
      ? summary.totalWeightLoss >= 0
        ? `-${formatWeight(summary.totalWeightLoss)}`
        : `+${formatWeight(Math.abs(summary.totalWeightLoss))}`
      : '—';

  const totalWeightLossTone =
    summary.totalWeightLoss !== null && summary.totalWeightLoss < 0 ? 'danger' : 'accent';

  const currentWeightDateLabel = summary.currentWeightDate
    ? formatDateLabel(summary.currentWeightDate)
    : 'No weight recorded';

  return (
    <>
      <div id='dashboard' className='dashboard-header'>
        <div>
          <h1>Dashboard</h1>
          <p>Small steps, real progress. You’re doing great, {profile.displayName || ''}!</p>
        </div>

        <div className='dashboard-header-date'>Today, {summary.todayLabel}</div>
      </div>

      {/* <ButtonShowcase /> */}

      <div className='dashboard-summary-cards'>
        <MetricCard
          label='Current Weight'
          value={currentWeightLabel}
          meta={currentWeightDateLabel}
          icon={<LuScale aria-hidden='true' />}
          tone='primary'
        />

        <MetricCard
          label='Total Weight Loss'
          value={totalWeightLossLabel}
          meta='Since first entry'
          icon={<LuTrendingDown aria-hidden='true' />}
          tone={totalWeightLossTone}
          highlightValue
        />

        <MetricCard
          label='Next Shot'
          value={summary.nextShotLabel}
          meta={summary.nextShotMeta}
          icon={<LuCalendarHeart aria-hidden='true' />}
          tone='info'
        />

        <MetricCard
          label='Current Dose'
          value={summary.currentDose}
          meta={summary.currentDoseMeta}
          icon={<LuSyringe aria-hidden='true' />}
          tone='success'
        />
      </div>

      <div className='dashboard-progress-grid'>
        <section id='progress' className='dashboard-progress-grid__goal'>
          <GoalProgress
            weights={weights}
            profile={profile}
            onGoalWeightUpdated={onGoalWeightUpdated}
          />
        </section>

        <section id='dose-history' className='dashboard-progress-grid__graph'>
          <WeightGraph weights={weights} />
        </section>
      </div>

      <div className='dashboard-grid'>
        <section id='checkins' className='checkin-section'>
          <CheckInTracker
            checkIns={checkIns}
            onCheckInAdded={onCheckInAdded}
            onDeleteCheckIn={onDeleteCheckIn}
            onViewAll={onViewAllCheckIns}
          />
        </section>

        <section id='weight' className='tracker-section'>
          <WeightTracker
            weights={weights}
            title='Recent Weights'
            summaryLabel='Total weight loss'
            variant='compact'
            onWeightAdded={onWeightAdded}
            onDeleteWeight={onDeleteWeight}
            onViewAll={onViewAllWeights}
          />
        </section>
      </div>

      <div className='dashboard-grid'>
        <section id='shots' className='tracker-section'>
          <ShotTracker
            title='Recent Shots'
            summaryLabel='Total shots'
            variant='compact'
            shots={shots}
            onShotAdded={onShotAdded}
            onDeleteShot={onDeleteShot}
            onViewAll={onViewAllShots}
          />
        </section>

        <section id='milestones' className='tracker-section'>
          <Milestones
            weights={weights}
            shots={shots}
            startWeight={profile.startWeight ?? null}
            goalWeight={profile.goalWeight ?? null}
            onViewAll={onViewAllMilestones}
          />
        </section>
      </div>
    </>
  );
};
