export type MilestoneStatus = 'completed' | 'inProgress' | 'locked';

export type MilestoneIcon = 'star' | 'target' | 'trend' | 'zap' | 'party';

export type Milestone = {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  progress?: number;
  icon: MilestoneIcon;
  order: number;
  achievementDate?: string;
  weightLossStatus?: 'completed' | 'upcoming' | 'locked';
};
