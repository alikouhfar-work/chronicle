import Image from 'next/image';
import { clsx } from 'clsx';
import { getPosterPlaceholderColor, getTmdbImageUrl } from '@/infra/tmdb/images';
import type { MediaPosterImageProps } from '@/shared/types/mediaPosterImage';

export const MediaPosterImage = ({
  title,
  path,
  alt,
  size = 'w500',
  className,
  placeholderClassName,
}: MediaPosterImageProps) => {
  const src = getTmdbImageUrl(path, 'backdrop', size);

  return (
    <>
      <div
        aria-hidden="true"
        className={clsx(
          'absolute inset-0 bg-linear-to-br',
          getPosterPlaceholderColor(title),
          placeholderClassName,
        )}
      />
      {src && <Image fill alt={alt} src={src} className={className} />}
    </>
  );
};
