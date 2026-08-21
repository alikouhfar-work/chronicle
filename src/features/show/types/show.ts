import { Genre, GenreRaw } from '@/features/genre';
import { Season } from '@/features/season';
import { ShowTrackingStatus } from '../../../../generated/prisma/enums';

export type TrackedShow = {
  id: string;
  tmdbId: number;
  name: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  firstAirDate: Date | null;
  lastAirDate: Date | null;
  lastSyncedAt: Date;
  status: string;
  tagline?: string | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  inProduction: boolean;
  seasons: Season[];
  genres: Genre[];
  tracking: ShowTracking | null;
};

type ShowTracking = {
  id: string;
  status: ShowTrackingStatus;
  addedAt: Date;
  startedAt: Date | null;
};

type ShowEpisodeRaw = {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
};

type ShowProductionCompanyRaw = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

type ShowProductionCountry = {
  name: string;
  iso_3166_1: string;
};

type ShowNetworkRaw = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

export type ShowSeasonRaw = {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
};

type ShowSpokenLanguageRaw = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

export type ShowDetailsRaw = {
  adult: boolean;
  backdrop_path: string;
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string;
  }[];
  episode_run_time: number[];
  first_air_date: string;
  genres: GenreRaw[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: ShowEpisodeRaw;
  name: string;
  next_episode_to_air: ShowEpisodeRaw | null;
  networks: ShowNetworkRaw[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ShowProductionCompanyRaw[];
  production_countries: ShowProductionCountry[];
  seasons: ShowSeasonRaw[];
  spoken_languages: ShowSpokenLanguageRaw[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
};
