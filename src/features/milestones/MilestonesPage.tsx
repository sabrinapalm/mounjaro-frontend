import { PageHeader } from '../../shared/components/PageHeader';
import type { ShotEntry, UserProfile, WeightEntry } from '../../shared/types';
import { Milestones } from './components/Milestones';

type MilestonesPageProps = {
  weights: WeightEntry[];
  shots: ShotEntry[];
  profile: UserProfile;
};

export const MilestonesPage = ({ weights, shots, profile }: MilestonesPageProps) => {
  return (
    <section className='dashboard-page milestones-page'>
      <PageHeader
        title='Your milestones'
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
