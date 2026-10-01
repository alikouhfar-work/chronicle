import type { IconComponent } from '@/shared/types/icon';
import { MediaType } from '@/shared/types/media';

export type UpcomingMediaSectionProps<T> = {
  mediaType: MediaType;
  upcomingMedia: T[];
  sectionTitle: string;
  sectionSubtitle: string;
  emptySectionTitle: string;
  emptySectionSubtitle: string;
  icon: IconComponent;
  getTitle?: (media: T) => string;
  getSubtitle?: (media: T) => string;
};

export type UpcomingMediaCardProps<T> = {
  media: T;
  title: string;
  subTitle: string;
  mediaType: MediaType
};

export type UpcomingMediaEmptyProps = {
  title: string;
  subTitle: string;
  icon: IconComponent;
};
