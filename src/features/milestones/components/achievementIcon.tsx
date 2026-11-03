import { LuFlag, LuStar, LuTarget, LuTrendingDown, LuZap } from 'react-icons/lu';
import type { MilestoneIcon } from '../milestoneTypes';

type AchievementIconProps = { icon: MilestoneIcon; size?: number };

export const AchievementIcon = ({ icon, size = 22 }: AchievementIconProps) => {
  const Icon =
    icon === 'target'
      ? LuTarget
      : icon === 'trend'
        ? LuTrendingDown
        : icon === 'zap'
          ? LuZap
          : icon === 'party'
            ? LuFlag
            : LuStar;
  return <Icon size={size} aria-hidden='true' />;
};
