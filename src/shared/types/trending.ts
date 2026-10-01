import type { IconComponent } from '@/shared/types/icon';

export type TrendingMediaListProps<T> = {
  title: string;
  subtitle: string;
  trendingMedia: T[];
  icon: IconComponent;
};

export type TrendingMediaCardProps<T> = {
  media: T;
};
