import Image from 'next/image';
import Link from 'next/link';
import { IconChevronRight } from '@tabler/icons-react';
import { getTmdbImageUrl } from '@/infra/tmdb/images';
import { createMonogram } from '@/shared/lib/createMonogram';
import type { DetailsCastListProps } from '@/modules/library/types/detailsCastList';

export const DetailsCastList = ({ credits }: DetailsCastListProps) => {
  if (!credits) return null;

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col space-y-3 lg:col-span-1 lg:h-[380px]">
      <div className="space-y-0.5">
        <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="h-2 w-2 rounded-pill bg-accent-strong" />
          <span>Key Cast</span>
        </h4>
        <p className="text-xs text-ink-muted">Notable lead performances</p>
      </div>

      <ul className="glass-card min-h-0 space-y-1 rounded-card border border-line p-2.5 lg:flex-1 lg:overflow-y-auto">
        {credits.cast.map((member) => (
          <li key={member.name}>
            <Link
              href={`/person/${member.id}`}
              className="group/cast flex cursor-pointer items-center justify-between rounded-control border border-transparent px-2 py-1.5 transition-all select-none hover:border-line hover:bg-surface-soft active:bg-surface-soft-hover"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-pill border border-line bg-surface-strong text-xs font-bold text-ink-secondary transition-all group-hover/cast:border-accent-line group-hover/cast:bg-accent-bright/20 group-hover/cast:text-accent-ink">
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
                  <p className="truncate text-xs font-bold text-ink transition-colors group-hover/cast:text-accent-ink">
                    {member.name}
                  </p>
                  <p className="truncate text-micro text-ink-muted">{member.character}</p>
                </div>
              </div>
              <div className="ml-2 flex shrink-0 items-center gap-1">
                <IconChevronRight
                  size={14}
                  className="text-ink-subtle transition-all group-hover/cast:translate-x-0.5 group-hover/cast:text-accent-ink"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
