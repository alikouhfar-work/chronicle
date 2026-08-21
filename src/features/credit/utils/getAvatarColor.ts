const getAvatarColor = (name: string) => {
  const colors = [
    'from-emerald-950/40 to-teal-900/25 text-emerald-300 border-emerald-900/30',
    'from-blue-950/40 to-indigo-900/25 text-blue-300 border-blue-900/30',
    'from-amber-950/40 to-yellow-900/25 text-amber-300 border-amber-900/30',
    'from-rose-950/40 to-pink-900/25 text-rose-300 border-rose-900/30',
    'from-violet-950/40 to-fuchsia-900/25 text-violet-300 border-violet-900/30',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
};
