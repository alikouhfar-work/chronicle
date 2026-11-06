import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTitleDetails } from '@/modules/discovery/search/queries/getTitleDetails';
import { MediaCommentTabs } from '@/modules/comments/components/MediaCommentTabs';
import { MediaCommentTabsSkeleton } from '@/modules/comments/components/MediaCommentTabsSkeleton';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import type { PublicMediaPreviewProps } from '@/modules/library/types/publicMediaPreview';

/**
 * What a signed-out visitor (and every link-preview crawler) sees for a library
 * URL: public TMDB details plus the review feed. Session-free on purpose, so it
 * lives outside the page file the authenticated branch owns.
 */
export const PublicMediaPreview = async ({ mediaType, id }: PublicMediaPreviewProps) => {
  const tmdbId = Number(id);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) notFound();

  const details = await getTitleDetails(mediaType, id);
  if (!details) notFound();

  const posterUrl = getTmdbImageUrl(details.posterPath, 'poster', 'w500');

  return (
    <article className="mx-auto space-y-6 px-4 py-8 font-sans">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-ink">
          {details.name}
          {details.year && details.year !== 'N/A' ? ` (${details.year})` : ''}
        </h1>
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={details.name}
            width={300}
            height={450}
            className="rounded-card border border-line"
          />
        )}
        {details.overview && (
          <p className="text-sm leading-relaxed text-ink-secondary">{details.overview}</p>
        )}
        <Link
          href={`/search?query=${encodeURIComponent(details.name)}`}
          className="inline-flex rounded-pill bg-accent px-4 py-2 text-xs font-semibold text-ink"
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
