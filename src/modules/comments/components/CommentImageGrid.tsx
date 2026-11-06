'use client';

import { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import type { CommentImageGridProps } from '@/modules/comments/types/commentImageGrid';

/**
 * Renders an image grid for comment attachments with fixed aspect-ratio
 * tiles and a lightbox for full-size viewing (reuses the dialog pattern).
 */
export const CommentImageGrid = ({ attachments }: CommentImageGridProps) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.mimeType?.startsWith('image/') && a.url);

  const [first] = images;
  if (!first) return null;

  const openLightbox = (url: string) => setLightboxUrl(url);
  const closeLightbox = () => setLightboxUrl(null);

  return (
    <div className="flex flex-col gap-2">
      {images.length === 1 ? (
        <button
          type="button"
          onClick={() => openLightbox(first.url)}
          className="group relative block w-full overflow-hidden rounded-control border border-line bg-surface-soft"
          aria-label="View attached image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={first.url}
            alt="Comment attachment"
            className="aspect-video w-full object-cover"
          />
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openLightbox(image.url)}
              className="group relative block overflow-hidden rounded-control border border-line bg-surface-soft"
              aria-label="View attached image"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt="Comment attachment"
                className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxUrl && (
        <dialog
          open
          onClose={closeLightbox}
          className="backdrop:bg-black/60"
          style={{
            position: 'fixed',
            inset: 0,
            margin: 0,
            padding: 0,
            border: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            background: 'transparent',
            color: 'inherit',
            overflow: 'hidden',
          }}
        >
          <div className="relative flex h-full w-full items-center justify-center p-4">
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close lightbox"
              className="absolute top-4 right-4 rounded-pill bg-black/50 p-2 text-ink transition hover:bg-black/70"
            >
              <IconX size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxUrl}
              alt="Comment attachment full size"
              className="max-h-[90vh] max-w-full rounded-control object-contain"
            />
          </div>
        </dialog>
      )}
    </div>
  );
};

export default CommentImageGrid;
