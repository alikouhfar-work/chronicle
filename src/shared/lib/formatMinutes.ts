const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_HOUR = 60;

export const formatMinutes = (totalMinutes: number) => {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return '0m';
  }

  const wholeMinutes = Math.floor(totalMinutes);
  const days = Math.floor(wholeMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((wholeMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  const mins = wholeMinutes % MINUTES_PER_HOUR;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${mins}m`);

  return parts.join(' ');
};
