import { UpcomingMediaSectionProps } from '@/types/upcoming';
import { UpcomingMediaCard } from '@/components/upcoming/UpcomingMediaCard';
import { MappedUpcomingEpisode } from '@/features/episode/types/upcomingEpisode';
import { MappedUpcomingMovie } from '@/features/movie/types/upcomingMovie';
import { UpcomingMediaEmpty } from '@/components/upcoming/UpcomingMediaEmpty';

export const UpcomingMediaSection = <T extends MappedUpcomingEpisode | MappedUpcomingMovie>({
  icon: Icon,
  sectionTitle,
  sectionSubtitle,
  emptySectionTitle,
  emptySectionSubtitle,
  upcomingMedia,
  getTitle,
  getSubtitle,
}: UpcomingMediaSectionProps<T>) => {
  if (upcomingMedia.length === 0) {
    return (
      <UpcomingMediaEmpty title={emptySectionTitle} subTitle={emptySectionSubtitle} icon={Icon} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/8 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-violet-500/25 bg-violet-500/15 p-2 text-violet-400">
            <Icon className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{sectionTitle}</h4>
            <p className="text-xs text-zinc-400">{sectionSubtitle}</p>
          </div>
        </div>
        <span className="apple-badge border border-white/10 bg-white/6 text-xs text-zinc-300">
          {upcomingMedia.length} Upcoming
        </span>
      </div>

      <ul className="flex flex-col space-y-2.5">
        {upcomingMedia.map((media) => (
          <UpcomingMediaCard
            media={media}
            title={getTitle?.(media) ?? ''}
            subTitle={getSubtitle?.(media) ?? ''}
            key={`timeline-${media.id}-${media.name}`}
          />
        ))}
      </ul>
    </div>
  );
};
