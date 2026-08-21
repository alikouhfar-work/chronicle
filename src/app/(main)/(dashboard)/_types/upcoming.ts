import { UpcomingEvent } from '@/app/(main)/(dashboard)/_types/dashboard';

export type DashboardUpcomingProps = {
  upcomingEvents: UpcomingEvent[];
};

export type UpcomingSectionHeaderProps = {
  upcomingEventsCount: number;
  upcomingSectionView: UpcomingSectionView;
  setUpcomingSectionView: (view: UpcomingSectionView) => void;
};

export type UpcomingSectionGalleryViewProps = {
  upcomingEvents: UpcomingEvent[];
};

export type UpcomingSectionGalleryCardProps = {
  upcomingEvent: UpcomingEvent;
};

export type UpcomingSectionCoverViewProps = {
  upcomingEvents: UpcomingEvent[];
};

export type UpcomingSectionCoverCardProps = {
  upcomingEvent: UpcomingEvent;
};

export type UpcomingSectionView = 'gallery' | 'covers';