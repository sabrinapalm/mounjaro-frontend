import { Milestones } from '../components/Milestones';
import type { ShotEntry, UserProfile, WeightEntry } from '../types';
import './MilestonesPage.css';

type MilestonesPageProps = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  profile: UserProfile;
};

export const MilestonesPage = ({ weights, shots, profile }: MilestonesPageProps) => {
  return (
    <section className='milestones-page'>
      <header className='milestones-page__header'>
        <div>
          <h1>All Milestones</h1>
          <p>Track your achievements and see what progress milestones are coming next.</p>
        </div>
      </header>

      <Milestones
        weights={weights}
        shots={shots}
        startWeight={profile.startWeight ?? null}
        goalWeight={profile.goalWeight ?? null}
        variant='full'
      />
    </section>
  );
};
