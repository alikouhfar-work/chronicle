export const getGenderLabel = (genderId: number) => {
  switch (genderId) {
    case 1:
      return 'Female';
    case 2:
      return 'Male';
    case 3:
      return 'Non-binary';
    default:
      return 'Not specified';
  }
};