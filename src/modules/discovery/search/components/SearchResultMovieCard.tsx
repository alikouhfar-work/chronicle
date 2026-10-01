import { MovieSearchResult } from '@/modules/movie';
import { SearchResultCard } from '@/modules/discovery/search/components/SearchResultCard';

export const SearchResultMovieCard = (movie: MovieSearchResult) => {
  return (
    <SearchResultCard
      id={movie.id}
      name={movie.name}
      mediaType={movie.mediaType}
      posterPath={movie.posterPath}
      year={movie.releaseDate?.substring(0, 4) ?? 'N/A'}
      rating={movie.voteAverage}
      originalLanguage={movie.originalLanguage}
      genres={movie.genres}
      overview={movie.overview}
      isTracked={movie.isTracked}
    />
  );
};
