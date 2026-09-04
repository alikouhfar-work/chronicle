export const getGradientForTitle = (title: string) => {
  const gradients = [
    'from-zinc-800 via-zinc-900 to-violet-950',
    'from-zinc-800 via-zinc-900 to-indigo-950',
    'from-zinc-850 via-zinc-900 to-violet-900/80',
    'from-zinc-850 via-zinc-900 to-indigo-900/80',
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i);
  return gradients[sum % gradients.length];
};
