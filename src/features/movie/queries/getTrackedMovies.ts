export const getTrackedMovies = async () => {
  return [];
  // return prisma.show.findMany({
  //   include: {
  //     genres: true,
  //     tracking: true,
  //     seasons: {
  //       orderBy: {
  //         seasonNumber: 'asc',
  //       },
  //       include: {
  //         episodes: {
  //           orderBy: {
  //             episodeNumber: 'asc',
  //           },
  //           include: {
  //             progress: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  //   orderBy: {
  //     createdAt: 'desc',
  //   },
  // });
};
