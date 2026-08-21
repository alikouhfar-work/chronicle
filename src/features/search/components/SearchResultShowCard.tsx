import { ShowSearchResult } from '@/features/show/types/showSearchResult';
import { formatCountryBadge } from '../utils/formatCountryBadge';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';

export const SearchResultShowCard = (show: ShowSearchResult) => {
  return (
    <SearchResultCard
      id={show.id}
      name={show.name}
      adult={show.adult}
      mediaType={show.mediaType}
      posterPath={show.posterPath}
      year={show.firstAirDate?.substring(0, 4) ?? 'N/A'}
      rating={show.voteAverage}
      originalLanguage={show.originalLanguage}
      countries={formatCountryBadge(show.originCountry)}
      genres={show.genres}
      overview={show.overview}
      isTracked={show.isTracked}
    />
  );
};
