import { format } from 'date-fns';
import type { TrackedMovieDetailsRaw } from '@/modules/movie/types/trackedMovie';
import type { ShowDetailsRaw } from '@/modules/show/types/showDetails';
import type { MediaType } from '@/shared/types/media';
import type { TitleDetails } from '../types/titleDetails';

const toDate = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const yearOf = (iso: string | null | undefined): string | null => {
  const date = toDate(iso);
  return date ? `${date.getFullYear()}` : null;
};

const formatAirDate = (iso: string | null | undefined): string | null => {
  const date = toDate(iso);
  return date ? format(date, 'MMMM d, yyyy') : null;
};

const mapMovieDetails = (raw: TrackedMovieDetailsRaw): TitleDetails => ({
  tmdbId: raw.id,
  mediaType: 'movie',
  name: raw.title,
  overview: raw.overview,
  tagline: raw.tagline || null,
  posterPath: raw.poster_path || null,
  backdropPath: raw.backdrop_path || null,
  year: yearOf(raw.release_date) ?? 'N/A',
  releaseLabel: formatAirDate(raw.release_date),
  genres: raw.genres,
  rating: raw.vote_average ?? null,
  status: raw.status || null,
  runtimeLabel: raw.runtime ? `${raw.runtime} min` : null,
  seasonsLabel: null,
  networkLabel: null,
  languageLabel: raw.original_language?.toUpperCase() || null,
});

const mapShowDetails = (raw: ShowDetailsRaw): TitleDetails => {
  const first = yearOf(raw.first_air_date);
  const last = yearOf(raw.last_air_date);
  const year = !first ? 'N/A' : last && last !== first ? `${first}-${last}` : first;
  const episodeRuntime = raw.episode_run_time?.find((runtime) => runtime > 0);

  return {
    tmdbId: raw.id,
    mediaType: 'tv',
    name: raw.name,
    overview: raw.overview,
    tagline: raw.tagline || null,
    posterPath: raw.poster_path || null,
    backdropPath: raw.backdrop_path || null,
    year,
    releaseLabel: formatAirDate(raw.first_air_date),
    genres: raw.genres,
    rating: raw.vote_average ?? null,
    status: raw.status || null,
    runtimeLabel: episodeRuntime ? `${episodeRuntime} min / ep` : null,
    seasonsLabel:
      raw.number_of_seasons > 0
        ? `${raw.number_of_seasons} Season${raw.number_of_seasons === 1 ? '' : 's'} · ${raw.number_of_episodes} Episodes`
        : null,
    networkLabel: raw.networks?.[0]?.name || null,
    languageLabel: raw.original_language?.toUpperCase() || null,
  };
};

export const mapTitleDetails = (
  mediaType: MediaType,
  raw: TrackedMovieDetailsRaw | ShowDetailsRaw,
): TitleDetails =>
  mediaType === 'movie'
    ? mapMovieDetails(raw as TrackedMovieDetailsRaw)
    : mapShowDetails(raw as ShowDetailsRaw);
