import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  name: 'Chronicle — Personal Media Archive',
  short_name: 'Chronicle',
  description:
    'Your ultimate personal movie and TV show tracker. Track watched episodes, movies, and log statistics.',
  start_url: '/',
  display: 'standalone',
  background_color: '#09090b',
  theme_color: '#0a0a0a',
  orientation: 'portrait-primary',
  icons: [
    {
      src: '/icons/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/icons/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/icons/pwa-maskable.png',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
    {
      src: '/icons/logo.png',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'any',
    },
  ],
  categories: ['entertainment', 'utilities', 'lifestyle'],
});

export default manifest;
