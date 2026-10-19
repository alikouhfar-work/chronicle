import { getTmdbImageUrl } from '@/infra/tmdb/images';
import type { Credits } from '@/modules/discovery/credit';
import type { TrackedMedia } from '@/modules/library/types/trackedMedia';
import type { MediaType } from '@/shared/types/media';

const TOP_BILLED_COUNT = 5;

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  posterUrl: string | null;
};

const isShow = (media: TrackedMedia): media is Extract<TrackedMedia, { seasons: unknown }> =>
  'seasons' in media;

// Media crosses the RSC boundary on its way into the client share button,
// so Date fields arrive as ISO strings at runtime even though the types say
// Date. Normalize before calling any Date methods.
type DateLike = Date | string | null | undefined;

const toDate = (value: DateLike): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string' && value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const headline = (media: TrackedMedia): string => {
  if (!isShow(media)) {
    const year = toDate(media.releaseDate)?.getFullYear();
    return year ? `${media.name} (${year})` : media.name;
  }
  const first = toDate(media.firstAirDate)?.getFullYear();
  const last = toDate(media.lastAirDate)?.getFullYear();
  if (!first) return media.name;
  const range = last && last !== first ? `${first}-${last}` : `${first}`;
  return `${media.name} (${range})`;
};

const rating = (media: TrackedMedia): number | null =>
  isShow(media) ? null : (media.tracking?.rating ?? null);

const topBilled = (credits: Credits | null): string | null => {
  if (!credits || credits.cast.length === 0) return null;
  return [...credits.cast]
    .sort((a, b) => a.order - b.order)
    .slice(0, TOP_BILLED_COUNT)
    .map((member) => (member.character ? `${member.name} as ${member.character}` : member.name))
    .join(', ');
};

export const buildShareMessage = ({
  media,
  credits,
  origin,
}: {
  media: TrackedMedia;
  mediaType: MediaType;
  credits: Credits | null;
  origin: string;
}): SharePayload => {
  const url = `${origin}/search?query=${encodeURIComponent(media.name)}`;
  const posterUrl = getTmdbImageUrl(media.posterPath);

  // The headline lives inside the text itself (not just the payload title),
  // because share targets routinely drop native share's separate `title`
  // field. Poster goes first so chat apps unfurl it into the image preview.
  const title = headline(media);
  const lines: string[] = [];
  lines.push(title);
  if (media.genres.length > 0) {
    lines.push(`Genres: ${media.genres.map((genre) => genre.name).join(', ')}`);
  }
  const score = rating(media);
  if (score !== null) lines.push(`My rating: ${score}/5`);
  const cast = topBilled(credits);
  if (cast) lines.push(`Cast: ${cast}`);
  if (media.overview) lines.push('', media.overview);
  // Bare details URL on its own line so apps linkify it into a tap target.
  lines.push('', url);
  if (posterUrl) lines.push(posterUrl);

  return { title, text: lines.join('\n'), url, posterUrl };
};
