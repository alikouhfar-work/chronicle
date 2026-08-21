export const getPosterPlaceholderColor = (title: string) => {
  const colors = [
    'from-indigo-600 via-indigo-700 to-indigo-900',
    'from-rose-600 via-rose-700 to-orange-800',
    'from-teal-600 via-teal-700 to-emerald-800',
    'from-blue-600 via-blue-700 to-cyan-800',
    'from-fuchsia-600 via-fuchsia-700 to-pink-900',
  ];
  let sum = 0;
  for (let i = 0; i < title.length; i++) sum += title.charCodeAt(i);
  return colors[sum % colors.length];
};