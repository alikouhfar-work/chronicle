import { GenreRaw } from '@/features/genre';
import { SeasonRaw } from '@/features/season';
import { EpisodeRaw } from '@/features/episode';

type ProductionCompanyRaw = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

type ProductionCountry = {
  name: string;
  iso_3166_1: string;
};

type NetworkRaw = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

type SpokenLanguageRaw = {
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
  last_episode_to_air: EpisodeRaw;
  name: string;
  next_episode_to_air: EpisodeRaw | null;
  networks: NetworkRaw[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompanyRaw[];
  production_countries: ProductionCountry[];
  seasons: SeasonRaw[];
  spoken_languages: SpokenLanguageRaw[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
};
