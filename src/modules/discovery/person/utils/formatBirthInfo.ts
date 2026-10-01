export const formatBirthInfo = (birthday: string, deathday: string) => {
  if (!birthday) return null;
  try {
    const bDate = new Date(birthday);
    const bFormatted = bDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (deathday) {
      const dDate = new Date(deathday);
      const dFormatted = dDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const ageAtDeath = dDate.getFullYear() - bDate.getFullYear();
      return `${bFormatted} – ${dFormatted} (Died at ${ageAtDeath})`;
    }

    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const mDiff = today.getMonth() - bDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < bDate.getDate())) {
      age--;
    }
    return `${bFormatted} (Age ${age})`;
  } catch {
    return birthday;
  }
};
