import { FC, SVGProps } from 'react';
import { MediaType } from '@/types/media';

export type TrendingMedia = {
  adult: boolean;
  backdropPath: string;
  id: number;
  title: string;
  originalLanguage: string;
  overview: string;
  posterPath: string;
  mediaType: MediaType;
  genres: string[];
  popularity: number;
  firstAirYear: string;
  rating: number;
  voteCount: number;
  isTracked: boolean;
};

export type TrendingSectionProps = {
  trendingShows: TrendingMedia[];
  trendingMovies: TrendingMedia[];
};

export type TrendingMediaListProps<T> = {
  title: string;
  subtitle: string;
  trendingMedia: T[];
  icon: FC<SVGProps<SVGSVGElement>>;
};

export type TrendingMediaCardProps<T> = {
  media: T;
};
