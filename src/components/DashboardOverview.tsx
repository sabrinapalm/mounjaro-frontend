import { IoScaleOutline } from 'react-icons/io5';
import { LuCalendarHeart, LuSyringe } from 'react-icons/lu';
import { RiEmotionHappyLine } from 'react-icons/ri';
import type { DashboardSummary } from '../hooks/useDashboardSummary';
import { useUnitSettings } from '../hooks/useUnitSettings';
import type {
  CreateShotInput,
  CreateWeightInput,
  ShotEntry,
  UserProfile,
  WeightEntry,
} from '../types';
import { formatDateLabel } from '../utils/dateHelpers';
import { GoalProgress } from './GoalProgress';
import { Milestones } from './Milestones';
import { ShotTracker } from './ShotTracker';
import { WeightGraph } from './WeightGraph';
import { WeightTracker } from './WeightTracker';

interface DashboardOverviewProps {
  profile: UserProfile;
  summary: DashboardSummary;
  shots: ShotEntry[];
  weights: WeightEntry[];
  onShotAdded: (shot: CreateShotInput) => Promise<void>;
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onDeleteShot: (id: string, date: string) => Promise<void>;
  onDeleteWeight: (id: string, date: string) => Promise<void>;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
  onViewAllMilestones: () => void;
  onViewAllShots: () => void;
  onViewAllWeights: () => void;
}

export const DashboardOverview = ({
  profile,
  summary,
  shots,
  weights,
  onShotAdded,
  onWeightAdded,
  onDeleteShot,
  onDeleteWeight,
  onGoalWeightUpdated,
  onViewAllMilestones,
  onViewAllShots,
  onViewAllWeights,
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

  const totalWeightLossClassName =
    summary.totalWeightLoss !== null && summary.totalWeightLoss < 0
      ? 'total-weight-loss weight-gain'
      : 'total-weight-loss';

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

      <div className='dashboard-summary-cards'>
        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-weight'>
            <RiEmotionHappyLine size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Current Weight</span>
            <span className='dashboard-card-value'>{currentWeightLabel}</span>
            <span className='dashboard-card-meta'>{currentWeightDateLabel}</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-loss'>
            <IoScaleOutline size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Total Weight Loss</span>
            <span className={`dashboard-card-value ${totalWeightLossClassName}`}>
              {totalWeightLossLabel}
            </span>
            <span className='dashboard-card-meta'>Since first entry</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-calendar'>
            <LuCalendarHeart size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Next Shot</span>
            <span className='dashboard-card-value'>{summary.nextShotLabel}</span>
            <span className='dashboard-card-meta'>{summary.nextShotMeta}</span>
          </div>
        </div>

        <div className='dashboard-card'>
          <div className='dashboard-card-icon dashboard-card-icon-dose'>
            <LuSyringe size={38} color='currentColor' aria-hidden='true' />
          </div>

          <div className='dashboard-card-copy'>
            <span className='dashboard-card-label'>Current Dose</span>
            <span className='dashboard-card-value'>{summary.currentDose}</span>
            <span className='dashboard-card-meta'>{summary.currentDoseMeta}</span>
          </div>
        </div>
      </div>

      <section id='progress'>
        <GoalProgress
          weights={weights}
          profile={profile}
          onGoalWeightUpdated={onGoalWeightUpdated}
        />
      </section>

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
        <section id='dose-history'>
          <WeightGraph weights={weights} />
        </section>

        <section id='milestones'>
          <Milestones
            weights={weights}
            shots={shots}
            startWeight={profile.startWeight ?? null}
            goalWeight={profile.goalWeight ?? null}
            maxVisible={5}
            onViewAll={onViewAllMilestones}
          />
        </section>
      </div>
    </>
  );
};
