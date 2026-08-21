import { prisma } from '@/lib/prisma';
import { tmdbFetch } from '@/utils/tmdbFetch';
import { ShowDetailsRaw } from '@/features/show/types/show';
import { SeasonRaw } from '@/features/season';

export const addShow = async (tmdbId: number) => {
  try {
    const existing = await prisma.show.findUnique({
      where: {
        tmdbId,
      },
      include: {
        tracking: true,
      },
    });

    if (existing) return;

    const show = await tmdbFetch<ShowDetailsRaw>(`tv/${tmdbId}`);

    const seasons = await Promise.all(
      show.seasons.map((season) =>
        tmdbFetch<SeasonRaw>(`tv/${tmdbId}/season/${season.season_number}`),
      ),
    );

    return await prisma.$transaction(async (tx) => {
      return tx.show.create({
        data: {
          tmdbId: show.id,
          name: show.name,
          overview: show.overview,
          posterPath: show.poster_path,
          backdropPath: show.backdrop_path,
          firstAirDate: show.first_air_date ? new Date(show.first_air_date) : null,
          lastAirDate: show.last_air_date ? new Date(show.last_air_date) : null,
          status: show.status,
          tagline: show.tagline,
          numberOfSeasons: show.number_of_seasons,
          numberOfEpisodes: show.number_of_episodes,
          inProduction: show.in_production,
          lastSyncedAt: new Date(),

          tracking: {
            create: {},
          },

          genres: {
            connectOrCreate: show.genres.map((genre: { id: number; name: string }) => ({
              where: {
                tmdbId: genre.id,
              },
              create: {
                tmdbId: genre.id,
                name: genre.name,
              },
            })),
          },

          seasons: {
            create: seasons.map((season) => ({
              tmdbId: season.id,
              name: season.name,
              seasonNumber: season.season_number,
              episodeCount: season.episodes.length,
              airDate: season.air_date ? new Date(season.air_date) : null,

              episodes: {
                create: season.episodes.map((episode) => ({
                  tmdbId: episode.id,
                  episodeNumber: episode.episode_number,
                  name: episode.name,
                  overview: episode.overview,
                  runtime: episode.runtime,
                  airDate: episode.air_date ? new Date(episode.air_date) : null,
                })),
              },
            })),
          },
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    throw new Error(`Failed to add show: ${message}`, {
      cause: error,
    });
  }
};
