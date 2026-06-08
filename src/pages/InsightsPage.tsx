import {
  LuActivity,
  LuCircleAlert,
  LuHeartPulse,
  LuMoon,
  LuSparkles,
  LuSyringe,
  LuTarget,
} from 'react-icons/lu';
import { MetricCard } from '../components/general/MetricCard';
import {
  getAverageScoreLabel,
  getDayMetaLabel,
  getDaySummaryLabel,
  getShotCycleDayLabel,
  useCurrentShotCycle,
} from '../hooks/useCurrentShotCycle';
import { type DailyCheckInEntry, formatSideEffectLabel, useInsights } from '../hooks/useInsights';
import type { ShotEntry, UserProfile, WeightEntry } from '../types';
import './InsightsPage.css';
import { useInsightsSummaryCards } from '../hooks/queries/useInsightSummaryCards';

type InsightsPageProps = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  checkIns: DailyCheckInEntry[];
  profile: UserProfile | null;
};

const ScoreChip = ({ label, value }: { label: string; value: number | null }) => {
  return (
    <div className='insights-score-chip'>
      <span>{label}</span>
      <strong>{getAverageScoreLabel(value)}</strong>
    </div>
  );
};

export const InsightsPage = ({ weights, shots, checkIns, profile }: InsightsPageProps) => {
  const insights = useInsights({
    weights,
    shots,
    checkIns,
    profile,
  });

  const summaryCards = useInsightsSummaryCards({ insights });
  const currentCycleDays = useCurrentShotCycle({ shots, checkIns });

  return (
    <section className='insights-page'>
      <header className='insights-page__header'>
        <div>
          <h1>Insights</h1>
          <p>Your shots, check-ins and weight logs turned into personal patterns.</p>
        </div>
      </header>

      <section className='insights-hero-card'>
        <div className='insights-hero-card__icon'>
          <LuSparkles size={38} aria-hidden='true' />
        </div>

        <div className='insights-hero-card__copy'>
          <span>Today’s useful insight</span>
          <h2>{insights.comeBackNudge.title}</h2>
          <p>{insights.comeBackNudge.description}</p>
        </div>

        {insights.goalProgress !== null && (
          <div className='insights-hero-card__progress'>
            <strong>{Math.round(insights.goalProgress)}%</strong>
            <span>toward goal</span>
            <div>
              <i style={{ width: `${insights.goalProgress}%` }} />
            </div>
          </div>
        )}
      </section>

      <section className='insights-summary-grid' aria-label='Insights summary'>
        {summaryCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            meta={card.meta}
            icon={card.icon}
            tone={card.tone}
            highlightValue={card.highlightValue}
          />
        ))}
      </section>

      <section className='insights-main-grid'>
        <article className='insights-card insights-card--wide'>
          <div className='insights-card__header'>
            <div>
              <span>Current cycle</span>
              <h2>Your 7 days after shot</h2>
              <p>
                Day 1 is your latest shot day. The rest of the week fills in as you add daily
                check-ins.
              </p>
            </div>

            <div className='insights-card__icon'>
              <LuSyringe size={28} aria-hidden='true' />
            </div>
          </div>

          <div className='shot-week-strip'>
            {currentCycleDays.map((day) => {
              const hasData = day.checkInCount > 0;
              const daySummary = getDaySummaryLabel({
                day: day.day,
                averageHunger: day.averageHunger,
                averageEnergy: day.averageEnergy,
                averageMood: day.averageMood,
                dailySideEffectCount: day.dailySideEffectCount,
                shotSideEffectCount: day.shotSideEffectCount,
                checkInCount: day.checkInCount,
                hasShot: day.hasShot,
                isFuture: day.isFuture,
              });

              return (
                <article
                  key={day.day}
                  className={`shot-week-day ${hasData ? 'shot-week-day--active' : ''}`}
                >
                  <header className='shot-week-day__header'>
                    <span>{getShotCycleDayLabel(day.day)}</span>

                    {day.date ? (
                      <strong>
                        {day.date.format('ddd')} <span>{day.date.format('MMM D')}</span>
                      </strong>
                    ) : (
                      <strong>—</strong>
                    )}
                  </header>

                  <div className='shot-week-day__summary'>
                    <strong>{daySummary}</strong>
                    <span>
                      {getDayMetaLabel({
                        checkInCount: day.checkInCount,
                        hasShot: day.hasShot,
                        isFuture: day.isFuture,
                      })}
                    </span>
                  </div>

                  <div className='shot-week-day__scores'>
                    <ScoreChip label='Hunger' value={day.averageHunger} />
                    <ScoreChip label='Energy' value={day.averageEnergy} />
                    <ScoreChip label='Mood' value={day.averageMood} />
                  </div>
                </article>
              );
            })}
          </div>
        </article>

        <article className='insights-card'>
          <div className='insights-card__header'>
            <div>
              <span>Pattern</span>
              <h2>Most sensitive day</h2>
              <p>The day that currently looks most worth watching.</p>
            </div>

            <div className='insights-card__icon insights-card__icon--warning'>
              <LuCircleAlert size={28} aria-hidden='true' />
            </div>
          </div>

          <div className='insights-big-message'>
            {insights.mostSensitiveShotDay ? (
              <>
                <strong>{getShotCycleDayLabel(insights.mostSensitiveShotDay.day)}</strong>
                <span>after shot</span>
                <p>
                  This is based on your historical hunger, energy, mood and side-effect logs. It is
                  a pattern, not a medical conclusion.
                </p>
              </>
            ) : (
              <>
                <strong>Locked</strong>
                <span>needs more check-ins</span>
                <p>Log a few daily check-ins after your shots to unlock this pattern.</p>
              </>
            )}
          </div>
        </article>

        <article className='insights-card'>
          <div className='insights-card__header'>
            <div>
              <span>Recovery</span>
              <h2>Best-feeling day</h2>
              <p>The day that currently looks most stable.</p>
            </div>

            <div className='insights-card__icon insights-card__icon--accent'>
              <LuMoon size={28} aria-hidden='true' />
            </div>
          </div>

          <div className='insights-big-message'>
            {insights.bestFeelingShotDay ? (
              <>
                <strong>{getShotCycleDayLabel(insights.bestFeelingShotDay.day)}</strong>
                <span>after shot</span>
                <p>
                  This day has your strongest historical mix of energy, mood and fewer logged
                  signals.
                </p>
              </>
            ) : (
              <>
                <strong>Locked</strong>
                <span>needs more data</span>
                <p>Complete one full shot week to make this more personal.</p>
              </>
            )}
          </div>
        </article>

        <article className='insights-card'>
          <div className='insights-card__header'>
            <div>
              <span>This week</span>
              <h2>Check-in mood</h2>
              <p>Your average daily signals for this week.</p>
            </div>

            <div className='insights-card__icon'>
              <LuActivity size={28} aria-hidden='true' />
            </div>
          </div>

          <div className='weekly-signal-grid'>
            <ScoreChip label='Hunger' value={insights.averageHungerThisWeek} />
            <ScoreChip label='Energy' value={insights.averageEnergyThisWeek} />
            <ScoreChip label='Mood' value={insights.averageMoodThisWeek} />
          </div>

          <div className='insights-note-card'>
            <strong>{insights.appetiteInsight}</strong>
            <p>More check-ins make this less generic and more like your actual rhythm.</p>
          </div>
        </article>

        <article className='insights-card'>
          <div className='insights-card__header'>
            <div>
              <span>Signals</span>
              <h2>Most common side effects</h2>
              <p>The things your body has reported most often.</p>
            </div>

            <div className='insights-card__icon insights-card__icon--warning'>
              <LuHeartPulse size={28} aria-hidden='true' />
            </div>
          </div>

          {insights.mostCommonSideEffects.length > 0 ? (
            <div className='side-effect-chip-list'>
              {insights.mostCommonSideEffects.slice(0, 6).map((sideEffect) => (
                <span key={sideEffect.label}>
                  {formatSideEffectLabel(sideEffect.label)} <strong>× {sideEffect.count}</strong>
                </span>
              ))}
            </div>
          ) : (
            <div className='insights-empty-card'>
              <p>No side effects logged yet. That is useful data too.</p>
            </div>
          )}
        </article>

        <article className='insights-card insights-card--watch'>
          <div className='insights-card__header'>
            <div>
              <span>Next</span>
              <h2>What to watch next</h2>
              <p>One thing that can make your next logs more useful.</p>
            </div>

            <div className='insights-card__icon insights-card__icon--accent'>
              <LuTarget size={28} aria-hidden='true' />
            </div>
          </div>

          <div className='insights-watch-card'>
            {insights.daysUntilNextShot !== null && insights.daysUntilNextShot <= 1 ? (
              <>
                <strong>Log the first 48 hours after your shot.</strong>
                <p>That window usually gives the most useful data for side effects and appetite.</p>
              </>
            ) : insights.mostSensitiveShotDay ? (
              <>
                <strong>
                  Pay attention to {getShotCycleDayLabel(insights.mostSensitiveShotDay.day)}.
                </strong>
                <p>Your data suggests this may be a more sensitive point in your shot week.</p>
              </>
            ) : (
              <>
                <strong>Complete one full shot cycle.</strong>
                <p>
                  Log check-ins from day 1 to day 7 after your shot to unlock a clearer weekly
                  pattern.
                </p>
              </>
            )}
          </div>
        </article>
      </section>
    </section>
  );
};
