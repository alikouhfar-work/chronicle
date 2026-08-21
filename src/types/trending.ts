import { FC, SVGProps } from 'react';

export type TrendingMedia = {
  adult: boolean;
  backdropPath: string;
  id: number;
  title: string;
  originalLanguage: string;
  overview: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  genres: string[];
  popularity: number;
  firstAirYear: string;
  rating: number;
  voteCount: number;
};

export type TrendingSectionProps = {
  trendingShows: TrendingMedia[];
  trendingMovies: TrendingMedia[];
};

export type TrendingMediaListProps = {
  title: string;
  subtitle: string;
  trendingMedia: TrendingMedia[];
  icon: FC<SVGProps<SVGSVGElement>>;
};

export type TrendingMediaCardProps = {
  media: TrendingMedia;
};
