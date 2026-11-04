import Link from 'next/link';
import { IconDeviceTv, IconMovie } from '@tabler/icons-react';
import type { LibraryMediaTypeSwitchProps } from '@/modules/library/types/libraryMediaTypeSwitch';

const buildHref = (
  type: 'tv' | 'movie',
  { status, sort, search }: Pick<LibraryMediaTypeSwitchProps, 'status' | 'sort' | 'search'>,
): string => {
  const params = new URLSearchParams({ type });
  if (status && status !== 'all') params.set('status', status);
  if (sort && sort !== 'recent') params.set('sort', sort);
  if (search) params.set('search', search);
  return `/library?${params.toString()}`;
};

/**
 * Server Component: media-type switch rendered as links. No client state or
 * router hooks — the active segment comes from the page's searchParams.
 */
export const LibraryMediaTypeSwitch = ({
  activeType,
  status,
  sort,
  search,
}: LibraryMediaTypeSwitchProps) => {
  const options = [
    { type: 'tv' as const, label: 'TV Series', Icon: IconDeviceTv },
    { type: 'movie' as const, label: 'Movies', Icon: IconMovie },
  ];

  return (
    <div className="flex items-center justify-between pt-1">
      <div className="flex shrink-0 gap-1 rounded-full border border-white/8 bg-zinc-900/90 p-1 shadow-md select-none">
        {options.map(({ type, label, Icon }) => {
          const isActive = activeType === type;

          return (
            <Link
              key={type}
              href={buildHref(type, { status, sort, search })}
              aria-current={isActive ? 'page' : undefined}
              className={`apple-pill-btn flex cursor-pointer items-center gap-2 px-5 py-2 text-xs font-semibold tracking-tight transition-all duration-150 ${
                isActive
                  ? 'bg-white font-bold text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:bg-white/4 hover:text-white'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-zinc-950' : 'text-violet-400'} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
