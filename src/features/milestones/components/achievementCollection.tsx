import { useState } from 'react';
import { LuArrowUpRight, LuCheck, LuStar, LuTarget } from 'react-icons/lu';
import type { Milestone } from '../milestoneTypes';
import {
  formatAchievementDate,
  getAchievementCondition,
  getFeaturedAchievement,
  groupAchievements,
} from '../utils/achievementPresentation';
import { AchievementCard } from './achievementCard';
import { AchievementDetails } from './achievementDetails';
import { AchievementIcon } from './achievementIcon';
import './achievementCollection.css';

type AchievementCollectionProps = {
  milestones: Milestone[];
  weightMilestones: Milestone[];
  nextAchievement: { title: string; remaining: string; progress: number } | null;
};

export const AchievementCollection = ({
  milestones,
  weightMilestones,
  nextAchievement,
}: AchievementCollectionProps) => {
  const [selected, setSelected] = useState<Milestone | null>(null);
  const featured = getFeaturedAchievement(milestones);
  const date = formatAchievementDate(featured?.achievementDate);
  const groups = groupAchievements(milestones);
  const completedCount = weightMilestones.filter(
    (milestone) => milestone.status === 'completed'
  ).length;

  return (
    <div className='achievement-collection'>
      <div className='achievement-collection__highlights'>
        <section className='achievement-featured' aria-labelledby='featured-achievement-title'>
          <div className='achievement-emblem achievement-emblem--featured' aria-hidden='true'>
            {featured ? <AchievementIcon icon={featured.icon} size={42} /> : <LuStar size={42} />}
          </div>
          <div className='achievement-featured__copy'>
            <p className='achievement-eyebrow'>Featured achievement</p>
            <h2 id='featured-achievement-title'>
              {featured?.title ?? 'Your first achievement awaits'}
            </h2>
            {featured && !featured.id.startsWith('weight-loss-') && (
              <p className='achievement-featured__condition'>{getAchievementCondition(featured)}</p>
            )}
            <p className='achievement-featured__date'>
              {featured
                ? date
                  ? `Achieved ${date}`
                  : 'Unlock date unavailable'
                : 'Every journey starts with a first entry. Your achievements will find a home here.'}
            </p>
            {featured && (
              <button
                type='button'
                className='achievement-featured__action'
                onClick={() => setSelected(featured)}
                aria-haspopup='dialog'
              >
                <LuCheck size={14} aria-hidden='true' /> Unlocked{' '}
                <LuArrowUpRight size={14} aria-hidden='true' />
                <span className='sr-only'> · View {featured.title} details</span>
              </button>
            )}
          </div>
        </section>
        <section className='achievement-next' aria-labelledby='next-achievement-title'>
          <div className='achievement-next__heading'>
            <p className='achievement-eyebrow'>Next achievement</p>
            <LuTarget size={20} aria-hidden='true' />
          </div>
          <h2 id='next-achievement-title'>
            {nextAchievement?.title ?? 'A little progress, a new milestone'}
          </h2>
          <p>
            {nextAchievement?.remaining ??
              'Add a starting weight and a measurement to see your next weight milestone.'}
          </p>
          {nextAchievement && (
            <>
              <div className='achievement-next__progress-label'>
                <span>Since the previous milestone</span>
                <strong>{Math.round(nextAchievement.progress)}%</strong>
              </div>
              <div
                className='achievement-progress'
                role='progressbar'
                aria-label={`Progress to ${nextAchievement.title}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={nextAchievement.progress}
              >
                <span style={{ width: `${nextAchievement.progress}%` }} />
              </div>
            </>
          )}
        </section>
      </div>
      <section
        className='achievement-category achievement-category--weight'
        aria-labelledby='weight-achievements-title'
      >
        <header className='achievement-category__header'>
          <div>
            <h2 id='weight-achievements-title'>Weight milestones</h2>
            <p>Small steps. Meaningful milestones.</p>
          </div>
          <span className='achievement-category__count'>{completedCount} unlocked</span>
        </header>
        {weightMilestones.length ? (
          <ul className='achievement-badges'>
            {weightMilestones.map((milestone) => (
              <AchievementCard
                key={milestone.id}
                milestone={milestone}
                onSelect={setSelected}
                badge
              />
            ))}
          </ul>
        ) : (
          <p className='achievement-category__empty'>
            Your collection will grow with each 5 kg milestone. Start by logging a measurement and
            setting your starting weight.
          </p>
        )}
      </section>
      <section className='achievement-category' aria-labelledby='goal-achievements-title'>
        <header className='achievement-category__header'>
          <div>
            <h2 id='goal-achievements-title'>Goal achievements</h2>
            <p>Celebrate the progress toward your goal weight.</p>
          </div>
        </header>
        <ul className='achievement-cards'>
          {groups.goal.map((milestone) => (
            <AchievementCard key={milestone.id} milestone={milestone} onSelect={setSelected} />
          ))}
        </ul>
      </section>
      <section className='achievement-category' aria-labelledby='journey-achievements-title'>
        <header className='achievement-category__header'>
          <div>
            <h2 id='journey-achievements-title'>Journey achievements</h2>
            <p>The first steps and habits that keep you moving.</p>
          </div>
        </header>
        <ul className='achievement-cards'>
          {groups.journey.map((milestone) => (
            <AchievementCard key={milestone.id} milestone={milestone} onSelect={setSelected} />
          ))}
        </ul>
      </section>
      {selected && <AchievementDetails milestone={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};
