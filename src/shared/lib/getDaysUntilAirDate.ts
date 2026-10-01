import { differenceInCalendarDays, startOfDay } from 'date-fns';

export const getDaysUntilAirDate = (dateStr: Date | null) => {
  if (!dateStr) return null;

  const targetDate = new Date(dateStr);

  if (Number.isNaN(targetDate.getTime()) || targetDate >= new Date(2095, 0, 1)) {
    return null;
  }

  const diffDays = differenceInCalendarDays(startOfDay(targetDate), startOfDay(new Date()));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  if (diffDays > 1) {
    return `in ${diffDays} days`;
  }

  if (diffDays === -1) {
    return 'Yesterday';
  }

  return `${Math.abs(diffDays)} days ago`;
};