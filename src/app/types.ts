export type ShowStatus = 'Watching' | 'Plan to Watch' | 'Completed' | 'Dropped';
export type MovieStatus = 'Plan to Watch' | 'Watching' | 'Completed';

export interface EpisodeMetadata {
  episodeNumber: number;
  title: string;
  airDate?: string;
  overview?: string;
}

export interface SeasonMetadata {
  seasonNumber: number;
  episodes: EpisodeMetadata[];
}

export interface EpisodeProgress {
  episodeNumber: number;
  watched: boolean;
  watchedAt?: string;
  rating?: number; // 1-5
  notes?: string;
}

export interface SeasonProgress {
  seasonNumber: number;
  episodes: EpisodeProgress[];
}

export interface ActivityLog {
  id: string;
  type:
    | 'watched_episode'
    | 'unwatched_episode'
    | 'watched_movie'
    | 'added_show'
    | 'added_movie'
    | 'status_change';
  timestamp: string;
  mediaId: string;
  mediaType: 'show' | 'movie';
  mediaTitle: string;
  details: string; // e.g., "S1E3 - Pilot", "Completed"
}

export interface Recommendation {
  title: string;
  type: 'show' | 'movie';
  year: number;
  genres: string[];
  synopsis: string;
  reason: string; // Why Gemini is recommending this
}
