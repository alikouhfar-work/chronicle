import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { MediaType } from '@/shared/types/media';
import { LibraryDetails } from '@/modules/library';
import { PublicMediaPreview } from '@/modules/library/components/details/PublicMediaPreview';
import { getTrackedMovie } from '@/modules/movie/services/getTrackedMovie';
import { getMovieCredits } from '@/modules/movie/queries/getMovieCredits';
import { getSimilarMovies } from '@/modules/movie/queries/getSimilarMovies';
import { getSyncedTrackedShow } from '@/modules/show/services/getSyncedTrackedShow';
import { getShowCredits } from '@/modules/show/queries/getShowCredits';
import { getSimilarShows } from '@/modules/show/queries/getSimilarShows';
import { getTitleDetails } from '@/modules/discovery/search/queries/getTitleDetails';
import type { LibraryDetailsPageProps } from '@/modules/library/types/libraryDetailsPage';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { getAppBaseUrl } from '@/shared/lib/appUrl';
import { auth } from '@/infra/auth/auth';
import { getCommentViewer } from '@/modules/comments/services/getCommentViewer';
import { listComments } from '@/modules/comments/services/listComments';
import { toInitialCommentPage } from '@/modules/comments/lib/toInitialCommentPage';
import { listNotes } from '@/modules/notes/services/listNotes';
import { DEFAULT_COMMENT_LIMIT } from '@/modules/comments/constants';

const resolveTmdbId = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const dynamic = 'force-dynamic';

const isValidSlug = (slug: unknown): slug is [MediaType, string] =>
  Array.isArray(slug) &&
  slug.length === 2 &&
  (slug[0] === 'movie' || slug[0] === 'tv') &&
  typeof slug[1] === 'string' &&
  slug[1].length > 0;

export const generateMetadata = async ({ params }: LibraryDetailsPageProps): Promise<Metadata> => {
  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) return {};
    const [mediaType, id] = slug;

    // Metadata must not depend on the viewer's session: link-preview crawlers
    // (Telegram, WhatsApp, …) arrive unauthenticated. TMDB details keep OG
    // tags available for everyone and avoid blocking the page on user-scoped
    // queries or show syncing.
    const details = await getTitleDetails(mediaType, id);
    if (!details) return {};

    const baseUrl = await getAppBaseUrl();
    const title = details.name;
    const description = details.overview || `Details and similar titles for ${title}.`;
    const posterUrl =
      getTmdbImageUrl(details.posterPath, 'poster', 'w500') ?? `${baseUrl}/icons/logo.png`;
    const isPoster = Boolean(details.posterPath);

    return {
      metadataBase: new URL(baseUrl),
      title,
      description,
      alternates: { canonical: `${baseUrl}/library/${mediaType}/${id}` },
      openGraph: {
        type: 'website',
        siteName: 'Chronicle',
        title,
        description,
        url: `${baseUrl}/library/${mediaType}/${id}`,
        images: [
          {
            url: posterUrl,
            width: isPoster ? 500 : 1024,
            height: isPoster ? 750 : 1024,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [posterUrl],
      },
    };
  } catch {
    return {};
  }
};

const LibraryDetailsPage = async ({ params }: LibraryDetailsPageProps) => {
  const { slug } = await params;
  if (!isValidSlug(slug)) notFound();
  const [mediaType, id] = slug;

  const session = await auth();
  if (!session?.user?.id) {
    return <PublicMediaPreview mediaType={mediaType} id={id} />;
  }

  const viewer = await getCommentViewer();

  const tmdbId = resolveTmdbId(id);

  if (mediaType === 'movie') {
    const [movie, credits, similarMovies, reviews, notes] = await Promise.all([
      getTrackedMovie(id),
      getMovieCredits(id),
      getSimilarMovies(id),
      tmdbId === null
        ? Promise.resolve(null)
        : listComments('movie', tmdbId, undefined, DEFAULT_COMMENT_LIMIT),
      tmdbId === null ? Promise.resolve(null) : listNotes('movie', tmdbId),
    ]);

    if (!movie) notFound();

    return (
      <LibraryDetails
        media={movie}
        mediaType="movie"
        credits={credits}
        similarMedia={similarMovies}
        viewer={viewer}
        initialNotes={notes?.success ? notes.notes : undefined}
        initialReviews={reviews ? toInitialCommentPage(reviews) : undefined}
      />
    );
  }

  const [show, tvCredits, similarShows, reviews, notes] = await Promise.all([
    getSyncedTrackedShow(id),
    getShowCredits(id),
    getSimilarShows(id),
    tmdbId === null
      ? Promise.resolve(null)
      : listComments('show', tmdbId, undefined, DEFAULT_COMMENT_LIMIT),
    tmdbId === null ? Promise.resolve(null) : listNotes('show', tmdbId),
  ]);

  if (!show) notFound();

  return (
    <LibraryDetails
      media={show}
      mediaType="tv"
      credits={tvCredits}
      similarMedia={similarShows}
      viewer={viewer}
      initialNotes={notes?.success ? notes.notes : undefined}
      initialReviews={reviews ? toInitialCommentPage(reviews) : undefined}
    />
  );
};

export default LibraryDetailsPage;
