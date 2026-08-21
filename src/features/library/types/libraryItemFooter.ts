export type LibraryItemFooterProps = {
  enrichment: any;
  isAlreadyTracked: (title: string, type: 'tv' | 'show' | 'movie') => boolean;
};