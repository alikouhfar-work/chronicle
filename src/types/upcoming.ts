import { FC, SVGProps } from 'react';

export type UpcomingMediaSectionProps<T> = {
  upcomingMedia: T[];
  sectionTitle: string;
  sectionSubtitle: string;
  emptySectionTitle: string;
  emptySectionSubtitle: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  getTitle?: (media: T) => string;
  getSubtitle?: (media: T) => string;
};

export type UpcomingMediaCardProps<T> = {
  media: T;
  title: string;
  subTitle: string;
};

export type UpcomingMediaEmptyProps = {
  title: string;
  subTitle: string;
  icon: FC<SVGProps<SVGSVGElement>>;
};
