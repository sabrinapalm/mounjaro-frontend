import { Milestones } from '../components/Milestones';
import { PageHeader } from '../components/PageHeader';
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
      <PageHeader
        title='All Milestones'
        description='Track your achievements and see what progress milestones are coming next.'
      />
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
