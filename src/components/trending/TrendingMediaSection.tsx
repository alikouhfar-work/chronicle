import { FC } from 'react';
import { TrendingMediaListProps } from '@/types/trending';
import { TrendingMediaCard } from '@/components/trending/TrendingMediaCard';

export const TrendingMediaList: FC<TrendingMediaListProps> = ({
  icon: Icon,
  title,
  subtitle,
  trendingMedia,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-zinc-850 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
        <div className="space-y-1">
          <h3 className="flex items-center gap-3 font-serif text-2xl font-extrabold text-white md:text-3xl">
            <Icon className="text-amber-400 size-5.5" />
            <span>{title}</span>
          </h3>
          <p className="text-xs leading-relaxed font-normal text-zinc-500">{subtitle}</p>
        </div>
      </div>

      <ul className="flex gap-4 overflow-x-auto pb-2">
        {trendingMedia.map((media) => (
          <TrendingMediaCard key={media.id} media={media} />
        ))}
      </ul>
    </div>
  );
};
