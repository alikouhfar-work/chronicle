import Image from 'next/image';
import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { createMonogram } from '@/shared/lib/createMonogram';
import type { DetailsCastListProps } from '@/modules/library/types/detailsCastList';

export const DetailsCastList = ({ credits }: DetailsCastListProps) => {
  if (!credits) return null;

  return (
    <div className="space-y-3 lg:col-span-1">
      <div className="space-y-0.5">
        <h4 className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          <span>Key Cast</span>
        </h4>
        <p className="text-xs text-zinc-400">Notable lead performances</p>
      </div>

      <ul className="glass-card space-y-1 rounded-2xl border border-white/8 p-2.5">
        {credits.cast.map((member) => (
          <li key={member.name}>
            <Link
              href={`/person/${member.id}`}
              className="group/cast flex cursor-pointer items-center justify-between rounded-xl border border-transparent px-2 py-1.5 transition-all select-none hover:border-white/10 hover:bg-white/8 active:bg-white/12"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-zinc-800 text-xs font-bold text-zinc-200 transition-all group-hover/cast:border-violet-500/40 group-hover/cast:bg-violet-500/20 group-hover/cast:text-violet-300">
                  {member.profilePath ? (
                    <Image
                      fill
                      alt={member.name}
                      sizes="36px"
                      className="object-cover"
                      src={getTmdbImageUrl(member.profilePath, 'avatar', 'w300')!}
                    />
                  ) : (
                    createMonogram(member.name)
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white transition-colors group-hover/cast:text-violet-300">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-zinc-400">{member.character}</p>
                </div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                <IconChevronRight
                  size={14}
                  className="text-zinc-600 transition-all group-hover/cast:translate-x-0.5 group-hover/cast:text-violet-400"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
