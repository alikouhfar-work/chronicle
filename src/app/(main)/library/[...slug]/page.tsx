import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { MediaType } from '@/shared/types/media';
import { LibraryDetails } from '@/modules/library';
import { getTrackedMovie } from '@/modules/movie/queries/getTrackedMovie';
import { getMovieCredits } from '@/modules/movie/queries/getMovieCredits';
import { getSimilarMovies } from '@/modules/movie/queries/getSimilarMovies';
import { getFreshTrackedShow } from '@/modules/show/queries/getFreshTrackedShow';
import { getShowCredits } from '@/modules/show/queries/getShowCredits';
import { getSimilarShows } from '@/modules/show/queries/getSimilarShows';
import { getTitleDetails } from '@/modules/discovery/search/queries/getTitleDetails';
import type { LibraryDetailsPageProps } from '@/modules/library/types/libraryDetailsPage';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { getAppBaseUrl } from '@/shared/lib/appUrl';
import { auth } from '@/infra/auth/auth';
import { getCommentViewer } from '@/modules/comments/queries/getCommentViewer';
import { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
import { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';

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

const PublicMediaPreview = async ({ mediaType, id }: { mediaType: MediaType; id: string }) => {
  // Reachable by signed-out readers and link-preview crawlers. The body is
  // session-free: TMDB supplies the public details, while the review feed is
  // keyed by TMDB id and is readable by everyone.
  const tmdbId = Number(id);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) notFound();

  const details = await getTitleDetails(mediaType, id);
  if (!details) notFound();

  const posterUrl = getTmdbImageUrl(details.posterPath, 'poster', 'w500');

  return (
    <article className="mx-auto space-y-6 px-4 py-8 font-sans">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">
          {details.name}
          {details.year && details.year !== 'N/A' ? ` (${details.year})` : ''}
        </h1>
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={details.name}
            width={300}
            height={450}
            className="rounded-2xl border border-white/10"
          />
        )}
        {details.overview && (
          <p className="text-sm leading-relaxed text-zinc-300">{details.overview}</p>
        )}
        <Link
          href={`/search?query=${encodeURIComponent(details.name)}`}
          className="inline-flex rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Open in Chronicle
        </Link>
      </div>

      <Suspense fallback={<MediaCommentTabsSkeleton />}>
        <MediaCommentTabs
          mediaType={mediaType === 'tv' ? 'show' : 'movie'}
          tmdbId={tmdbId}
          viewer={null}
        />
      </Suspense>
    </article>
  );
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

  if (mediaType === 'movie') {
    const [movie, credits, similarMovies] = await Promise.all([
      getTrackedMovie(id),
      getMovieCredits(id),
      getSimilarMovies(id),
    ]);

    if (!movie) notFound();

    return (
      <LibraryDetails
        media={movie}
        mediaType="movie"
        credits={credits}
        similarMedia={similarMovies}
        viewer={viewer}
      />
    );
  }

  const [show, tvCredits, similarShows] = await Promise.all([
    getFreshTrackedShow(id),
    getShowCredits(id),
    getSimilarShows(id),
  ]);

  if (!show) notFound();

  return (
    <LibraryDetails
      media={show}
      mediaType="tv"
      credits={tvCredits}
      similarMedia={similarShows}
      viewer={viewer}
    />
  );
};

export default LibraryDetailsPage;
