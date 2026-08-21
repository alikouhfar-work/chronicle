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
      <div className="border-zinc-850 flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-gold-400/10 border-gold-400/20 text-gold-400 rounded-lg border p-1.5">
            <Icon className="size-5.5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-white sm:text-lg">{sectionTitle}</h4>
            <p className="font-mono text-[11px] text-zinc-500">{sectionSubtitle}</p>
          </div>
        </div>
        <span className="text-gold-400 bg-gold-400/10 border-gold-400/25 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold">
          {upcomingMedia.length} {upcomingMedia.length === 1 ? 'Release' : 'Releases'}
        </span>
      </div>

      <ul>
        {upcomingMedia.map((media, index) => (
          <UpcomingMediaCard
            index={index}
            media={media}
            title={getTitle?.(media) ?? ''}
            subTitle={getSubtitle?.(media) ?? ''}
            mediaCount={upcomingMedia.length}
            key={`timeline-${media.id}-${media.name}`}
          />
        ))}
      </ul>
    </div>
  );
};
