export const formatCountryBadge = (countries?: string[]) => {
  if (countries && countries.length > 0) {
    if (countries.length === 1) return countries[0];
    if (countries.length === 2) return countries.join(', ');
    return `${countries.slice(0, 2).join(', ')} +${countries.length - 2}`;
  }
  return null;
};