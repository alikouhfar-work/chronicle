import { prisma } from '@/infra/db/prisma';
import { tmdbFetch } from '@/infra/tmdb/client';
import { ShowDetailsRaw } from '@/modules/show/types/showDetails';
import { SeasonRaw } from '@/modules/episode-season';
import { DatabaseError, ExternalServiceError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import { parseTmdbId } from '@/shared/lib/validate';
import { mapWithConcurrency } from '@/shared/lib/async';

const SEASON_FETCH_CONCURRENCY = 3;

export const syncShow = async (showId: string) => {
  try {
    const tmdbId = parseTmdbId(showId);

    const existingShow = await prisma.show.findUnique({
      where: { tmdbId },
      select: {
        id: true,
        tmdbId: true,
      },
    });

    if (!existingShow) {
      throw new NotFoundError(`Show not found: ${showId}`);
    }

    let show: ShowDetailsRaw;
    try {
      show = await tmdbFetch<ShowDetailsRaw>(`tv/${existingShow.tmdbId}`);
    } catch (error) {
      throw new ExternalServiceError('TMDB', `Failed to fetch show ${tmdbId}`, { cause: error });
    }

    // Ensure every genre exists before re-linking, otherwise `set` would throw P2025.
    if (show.genres.length > 0) {
      await prisma.genre.createMany({
        data: show.genres.map((genre) => ({ tmdbId: genre.id, name: genre.name })),
        skipDuplicates: true,
      });
    }

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

    const seasonSummaries = show.seasons.filter(
      (seasonSummary) => seasonSummary.season_number !== 0,
    );

    await mapWithConcurrency(
      seasonSummaries,
      SEASON_FETCH_CONCURRENCY,
      async (seasonSummary) => {
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
      },
    );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof ExternalServiceError
    ) {
      throw error;
    }
    throw new DatabaseError(`Failed to sync show ${showId}`, { cause: error });
  }
};
