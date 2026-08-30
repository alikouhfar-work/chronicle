import { FC } from 'react';
import { UpcomingMediaEmptyProps } from '@/types/upcoming';

export const UpcomingMediaEmpty: FC<UpcomingMediaEmptyProps> = ({
  icon: Icon,
  title,
  subTitle,
}) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center space-y-2 rounded-2xl border-dashed border-white/10 p-8 text-center">
      <Icon className="size-6.5 text-zinc-600" />
      <h5 className="text-sm font-semibold text-white">{title}</h5>
      <p className="max-w-xs text-xs leading-relaxed text-zinc-400">{subTitle}</p>
    </div>
  );
};
