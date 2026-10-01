export type RatingStarsProps = {
  value: number;
  onChange?: (next: number) => void;
  max?: number;
  size?: number;
  disabled?: boolean;
};
