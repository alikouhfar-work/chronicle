import type { UpcomingMediaSectionProps } from '@/shared/types/upcoming';
import { UpcomingMediaCard } from '@/modules/dashboard/components/upcoming/UpcomingMediaCard';
import type { MappedUpcomingEpisode } from '@/modules/episode-season/types/upcomingEpisode';
import type { MappedUpcomingMovie } from '@/modules/movie/types/upcomingMovie';
import { UpcomingMediaEmpty } from '@/modules/dashboard/components/upcoming/UpcomingMediaEmpty';

export const UpcomingMediaSection = <T extends MappedUpcomingEpisode | MappedUpcomingMovie>({
  icon: Icon,
  sectionTitle,
  sectionSubtitle,
  emptySectionTitle,
  emptySectionSubtitle,
  upcomingMedia,
  getTitle,
  getSubtitle,
  mediaType,
}: UpcomingMediaSectionProps<T>) => {
  if (upcomingMedia.length === 0) {
    return (
      <UpcomingMediaEmpty title={emptySectionTitle} subTitle={emptySectionSubtitle} icon={Icon} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2.5 border-b border-line pb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <div className="rounded-control border border-accent-line bg-accent-bright/15 p-2 text-accent-ink">
            <Icon className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">{sectionTitle}</h4>
            <p className="text-xs text-ink-muted">{sectionSubtitle}</p>
          </div>
        </div>
        <span className="apple-badge self-end border border-line bg-surface-soft text-xs text-ink-secondary">
          {upcomingMedia.length} Upcoming
        </span>
      </div>

      <ul className="flex flex-col space-y-2.5">
        {upcomingMedia.map((media) => (
          <UpcomingMediaCard
            media={media}
            key={media.id}
            mediaType={mediaType}
            title={getTitle?.(media) ?? ''}
            subTitle={getSubtitle?.(media) ?? ''}
          />
        ))}
      </ul>
    </div>
  );
};
