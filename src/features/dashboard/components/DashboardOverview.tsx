import { LuArrowDownRight, LuArrowRight, LuScale, LuSyringe, LuTrophy } from 'react-icons/lu';
import { PageActionButton } from '../../../shared/components/pageActionButton';
import { Card } from '../../../shared/components/ui/card';
import { useUnitSettings } from '../../../shared/hooks/useUnitSettings';
import type { CreateWeightInput, UserProfile, WeightEntry } from '../../../shared/types';
import { formatDateLabel } from '../../../shared/utils/dateHelpers';
import { GoalProgress, WeightGraph } from '../../weight';
import { useAddWeightModal } from '../../weight/hooks/useAddWeightModal';
import type { DashboardSummary } from '../hooks/useDashboardSummary';
import './DashboardOverview.css';

type DashboardSection = 'dashboard' | 'weight' | 'shots' | 'milestones';

type DashboardOverviewProps = {
  profile: UserProfile;
  summary: DashboardSummary;
  weights: WeightEntry[];
  onWeightAdded: (weight: CreateWeightInput) => Promise<void>;
  onGoalWeightUpdated: (goalWeight: number) => Promise<void>;
  onNavigate: (section: DashboardSection) => void;
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
};

export const DashboardOverview = ({
  profile,
  summary,
  weights,
  onWeightAdded,
  onGoalWeightUpdated,
  onNavigate,
}: DashboardOverviewProps) => {
  const { weightUnit, displayWeightFromKg } = useUnitSettings(profile.unitSystem ?? 'metric');
  const addWeightModal = useAddWeightModal({ onWeightAdded });
  const formatWeight = (weight: number) => `${displayWeightFromKg(weight)} ${weightUnit}`;

  const latestWeight = weights[0];
  const previousWeight = weights[1];
  const recentWeightChange =
    latestWeight && previousWeight ? latestWeight.weight - previousWeight.weight : null;
  const recentWeightChangeLabel =
    recentWeightChange === null
      ? '—'
      : `${recentWeightChange > 0 ? '+' : recentWeightChange < 0 ? '−' : ''}${formatWeight(
          Math.abs(recentWeightChange)
        )}`;

  return (
    <div className='dashboard-overview'>
      <header className='dashboard-welcome'>
        <div>
          <p className='dashboard-eyebrow'>YOUR WELLNESS, AT YOUR PACE</p>
          <h1>
            {getGreeting()}, {profile.displayName || 'there'}
          </h1>
          <p className='dashboard-welcome__copy'>
            A clear view of your weight and treatment, all in one place.
          </p>
        </div>
        <div className='dashboard-welcome__actions'>
          <span className='dashboard-today'>Today · {summary.todayLabel}</span>
          <PageActionButton
            icon={<LuArrowDownRight aria-hidden='true' />}
            onClick={addWeightModal.openModal}
          >
            Log weight
          </PageActionButton>
        </div>
      </header>

      <div className='dashboard-hero-grid'>
        <Card asChild>
          <section className='dashboard-weight-card' aria-labelledby='current-weight-heading'>
            <div className='dashboard-weight-card__top'>
              <div>
                <p className='dashboard-card-label' id='current-weight-heading'>
                  CURRENT WEIGHT
                </p>
                <p className='dashboard-weight-card__date'>
                  {summary.currentWeightDate
                    ? `Last measured ${formatDateLabel(summary.currentWeightDate)}`
                    : 'Add your first weight entry'}
                </p>
              </div>
              <span className='dashboard-weight-card__icon' aria-hidden='true'>
                <LuScale />
              </span>
            </div>

            <div className='dashboard-weight-card__value-row'>
              <p className='dashboard-weight-card__value' aria-live='polite'>
                {summary.currentWeight === null ? '—' : displayWeightFromKg(summary.currentWeight)}
              </p>
              {summary.currentWeight !== null && (
                <span className='dashboard-weight-card__unit'>{weightUnit}</span>
              )}
            </div>

            <div className='dashboard-weight-card__footer'>
              {summary.totalWeightLoss !== null ? (
                <span
                  className={`dashboard-change ${
                    summary.totalWeightLoss >= 0 ? 'dashboard-change--down' : 'dashboard-change--up'
                  }`}
                >
                  {summary.totalWeightLoss >= 0 ? '−' : '+'}
                  {formatWeight(Math.abs(summary.totalWeightLoss))}
                  <span>since first entry</span>
                </span>
              ) : (
                <span className='dashboard-weight-card__hint'>Your progress starts here</span>
              )}
              <button
                className='dashboard-text-action'
                type='button'
                onClick={() => onNavigate('weight')}
              >
                Weight history <LuArrowRight aria-hidden='true' />
              </button>
            </div>
          </section>
        </Card>

        <GoalProgress
          weights={weights}
          profile={profile}
          onGoalWeightUpdated={onGoalWeightUpdated}
        />
      </div>

      <div className='dashboard-details-grid'>
        <WeightGraph weights={weights} />

        <Card asChild>
          <section className='dashboard-week-card' aria-labelledby='this-week-heading'>
            <div className='dashboard-section-heading'>
              <div>
                <p className='dashboard-card-label'>AT A GLANCE</p>
                <h2 id='this-week-heading'>This week</h2>
              </div>
            </div>

            <div className='dashboard-week-stat'>
              <span>Recent weight change</span>
              <strong>{recentWeightChangeLabel}</strong>
              <small>
                {previousWeight
                  ? 'Since your previous measurement'
                  : 'Log another weight to compare'}
              </small>
            </div>

            <div className='dashboard-week-stat'>
              <span>Current injection dose</span>
              <strong>{summary.currentDose}</strong>
              <small>{summary.currentDoseMeta}</small>
            </div>

            <div className='dashboard-week-stat'>
              <span>Next scheduled injection</span>
              <strong>{summary.nextShotLabel}</strong>
              <small>{summary.nextShotMeta}</small>
            </div>
          </section>
        </Card>
      </div>

      <Card asChild>
        <section className='dashboard-shortcuts' aria-labelledby='trackers-heading'>
          <div className='dashboard-section-heading'>
            <div>
              <p className='dashboard-card-label'>YOUR TRACKERS</p>
              <h2 id='trackers-heading'>Keep your progress moving</h2>
            </div>
          </div>
          <div className='dashboard-shortcuts__grid'>
            <button type='button' onClick={() => onNavigate('shots')}>
              <LuSyringe aria-hidden='true' />
              <span>
                <strong>Shots</strong>
                <small>Dosage and injection history</small>
              </span>
              <LuArrowRight aria-hidden='true' />
            </button>
            <button type='button' onClick={() => onNavigate('weight')}>
              <LuScale aria-hidden='true' />
              <span>
                <strong>Weight</strong>
                <small>Measurements and trends</small>
              </span>
              <LuArrowRight aria-hidden='true' />
            </button>
            <button type='button' onClick={() => onNavigate('milestones')}>
              <LuTrophy aria-hidden='true' />
              <span>
                <strong>Milestones</strong>
                <small>Celebrate every achievement</small>
              </span>
              <LuArrowRight aria-hidden='true' />
            </button>
          </div>
        </section>
      </Card>
      {addWeightModal.modal}
    </div>
  );
};
