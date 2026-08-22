import { prisma } from '@/lib/prisma';
import { tmdbFetch } from '@/utils/tmdbFetch';
import { ShowDetailsRaw } from '@/features/show/types/show';
import { SeasonRaw } from '@/features/season';

export const addShow = async (tmdbId: number) => {
  try {
    // 1. Check if the show already exists
    const existing = await prisma.show.findUnique({
      where: {
        tmdbId,
      },
    });

    if (existing) return;

    // 2. Fetch show details
    const showData = await tmdbFetch<ShowDetailsRaw>(`tv/${tmdbId}`);

    // 3. Fetch all seasons BEFORE touching the database
    const seasons = await Promise.all(
      showData.seasons.map((season) =>
        tmdbFetch<SeasonRaw>(`tv/${tmdbId}/season/${season.season_number}`),
      ),
    );

    // 4. Create the show + its small relations
    const createdShow = await prisma.$transaction(async (tx) => {
      return tx.show.create({
        data: {
          tmdbId: showData.id,
          name: showData.name,
          overview: showData.overview,
          posterPath: showData.poster_path,
          backdropPath: showData.backdrop_path,

          firstAirDate: showData.first_air_date ? new Date(showData.first_air_date) : null,

          lastAirDate: showData.last_air_date ? new Date(showData.last_air_date) : null,

          status: showData.status,
          tagline: showData.tagline,
          numberOfSeasons: showData.number_of_seasons,
          numberOfEpisodes: showData.number_of_episodes,
          inProduction: showData.in_production,
          lastSyncedAt: new Date(),

          tracking: {
            create: {},
          },

          genres: {
            connectOrCreate: showData.genres.map((genre) => ({
              where: {
                tmdbId: genre.id,
              },
              create: {
                tmdbId: genre.id,
                name: genre.name,
              },
            })),
          },
        },
      });
    });

    // 5. Create seasons in bulk
    await prisma.season.createMany({
      data: seasons.map((season) => ({
        showId: createdShow.id,
        tmdbId: season.id,
        name: season.name,
        seasonNumber: season.season_number,
        episodeCount: season.episodes.length,
        airDate: season.air_date ? new Date(season.air_date) : null,
      })),
    });

    // 6. Get the created seasons so we know their database IDs
    const createdSeasons = await prisma.season.findMany({
      where: {
        showId: createdShow.id,
      },
      select: {
        id: true,
        seasonNumber: true,
      },
    });

    const seasonIdByNumber = new Map(
      createdSeasons.map((season) => [season.seasonNumber, season.id]),
    );

    // 7. Flatten all episodes
    const episodes = seasons.flatMap((season) => {
      const seasonId = seasonIdByNumber.get(season.season_number);

      if (!seasonId) {
        throw new Error(`Could not find database season ${season.season_number}`);
      }

      return season.episodes.map((episode) => ({
        seasonId,
        tmdbId: episode.id,
        episodeNumber: episode.episode_number,
        name: episode.name,
        overview: episode.overview,
        runtime: episode.runtime,
        airDate: episode.air_date ? new Date(episode.air_date) : null,
      }));
    });

    // 8. Insert episodes in chunks
    const CHUNK_SIZE = 100;

    for (let i = 0; i < episodes.length; i += CHUNK_SIZE) {
      const chunk = episodes.slice(i, i + CHUNK_SIZE);

      await prisma.episode.createMany({
        data: chunk,
      });
    }

    // 9. Fetch the complete show AFTER all writes are finished
    return prisma.show.findUnique({
      where: {
        id: createdShow.id,
      },
      include: {
        tracking: true,
        genres: true,
        seasons: {
          include: {
            episodes: true,
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Failed to add show: ${message}`, {
      cause: error,
    });
  }
};