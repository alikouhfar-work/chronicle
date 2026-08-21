type LibraryItemParams = {
  id: string[];
};

const LibraryItemPage = async ({ params }: { params: Promise<LibraryItemParams> }) => {
  const { id } = await params;

  return <p>{id}</p>;
  // if (itemType === 'movie') {
  //   const [movie, cast, similarMovies] = await Promise.all([
  //     getTrackedMovie(id),
  //     getTrackedMovieCast(id),
  //     getSimilarMovies(id),
  //   ]);
  //   return <LibraryItem movie={movie} moviesList={[]} cast={cast} similarMovies={similarMovies} />;
  // }
  //
  // if (itemType === 'show') {
  //   const [show, cast, similarShows] = await Promise.all([
  //     getTrackedShow(id),
  //     getTrackedShowCast(id),
  //     getSimilarShows(id),
  //   ]);
  //   return <LibraryItem show={show} showsList={[]} cast={cast} similarShows={similarShows} />;
  // }
};

export default LibraryItemPage;
