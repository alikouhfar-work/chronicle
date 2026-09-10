import { prisma } from '@/lib/prisma';
import { tmdbFetch } from '@/utils/tmdbFetch';
import { ShowDetailsRaw } from '@/features/show/types/show';
import { SeasonRaw } from '@/features/season';

export const syncShow = async (showId: string) => {
  try {
    const existingShow = await prisma.show.findUnique({
      where: { tmdbId: +showId },
      select: {
        id: true,
        tmdbId: true,
      },
    });

    if (!existingShow) {
      throw new Error('Show not found');
    }

    const show = await tmdbFetch<ShowDetailsRaw>(`tv/${existingShow.tmdbId}`);

    await prisma.show.update({
      where: { id: existingShow.id },
      data: {
        name: show.name,
        overview: show.overview,
        posterPath: show.poster_path,
        backdropPath: show.backdrop_path,
        firstAirDate: show.first_air_date ? new Date(show.first_air_date) : null,
        lastAirDate: show.last_air_date ? new Date(show.last_air_date) : null,
        status: show.status,
        numberOfSeasons: show.number_of_seasons,
        numberOfEpisodes: show.number_of_episodes,
        inProduction: show.in_production,
        lastSyncedAt: new Date(),

        genres: {
          set: show.genres.map((genre) => ({
            tmdbId: genre.id,
          })),
        },
      },
    });

    for (const seasonSummary of show.seasons) {
      if (seasonSummary.season_number === 0) {
        continue;
      }

      const season = await tmdbFetch<SeasonRaw>(
        `tv/${existingShow.tmdbId}/season/${seasonSummary.season_number}`,
      );

      const localSeason = await prisma.season.upsert({
        where: {
          showId_seasonNumber: {
            showId: existingShow.id,
            seasonNumber: season.season_number,
          },
        },
        create: {
          tmdbId: season.id,
          showId: existingShow.id,
          seasonNumber: season.season_number,
          name: season.name,
          episodeCount: season.episodes.length,
          airDate: season.air_date ? new Date(season.air_date) : null,
        },
        update: {
          tmdbId: season.id,
          name: season.name,
          episodeCount: season.episodes.length,
          airDate: season.air_date ? new Date(season.air_date) : null,
        },
      });

      await prisma.$transaction(
        season.episodes.map((episode) =>
          prisma.episode.upsert({
            where: {
              tmdbId: episode.id,
            },
            create: {
              tmdbId: episode.id,
              seasonId: localSeason.id,
              episodeNumber: episode.episode_number,
              name: episode.name,
              overview: episode.overview ?? '',
              runtime: episode.runtime,
              airDate: episode.air_date ? new Date(episode.air_date) : null,
            },
            update: {
              name: episode.name,
              overview: episode.overview ?? '',
              runtime: episode.runtime,
              airDate: episode.air_date ? new Date(episode.air_date) : null,
            },
          }),
        ),
      );
    }

    return;
  } catch (error) {
    console.error('Failed to sync show:', error);
    return null;
  }
};
