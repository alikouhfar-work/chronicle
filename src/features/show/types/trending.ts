export type TrendingShowRaw = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  name: string;
  original_language: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
};

export type TrendingMedia = {
  adult: boolean;
  backdropPath: string;
  id: number;
  title: string;
  originalLanguage: string;
  originalName: string;
  overview: string;
  posterPath: string;
  mediaType: string;
  genreIds: number[];
  popularity: number;
  firstAirYear: string;
  rating: number;
  voteCount: number;
  originCountry: string[];
};
