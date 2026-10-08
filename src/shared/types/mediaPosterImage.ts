export type MediaPosterImageProps = {
  title: string;
  path?: string | null;
  alt: string;
  size?: 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'w1280';
  sizes?: string;
  className?: string;
  placeholderClassName?: string;
};
