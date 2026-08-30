import { TrendingMediaListProps } from '@/types/trending';
import { TrendingShow } from '@/features/show';
import { TrendingMovie } from '@/features/movie';
import { TrendingMediaCard } from '@/components/trending/TrendingMediaCard';

export const TrendingMediaSection = <T extends TrendingShow | TrendingMovie>({
  icon: Icon,
  title,
  subtitle,
  trendingMedia,
}: TrendingMediaListProps<T>) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-white/8 pb-3 md:flex-row md:items-center">
        <div className="space-y-0.5">
          <h3 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            <Icon className="size-5 text-violet-400" />
            <span>{title}</span>
          </h3>
          <p className="text-xs font-normal text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <ul className="-mx-1 flex snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent gap-5 overflow-x-auto scroll-smooth px-1 pt-1.5 pb-4">
        {trendingMedia.map((media) => (
          <TrendingMediaCard media={media} key={media.id} />
        ))}
      </ul>
    </div>
  );
};
