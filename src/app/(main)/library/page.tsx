'use client'

import {useEffect, useState} from 'react';
import {ActivityLog, TrackedMovie, TrackedShow} from '../types';
import {
  getActivityLogs,
  getTrackedMovies,
  getTrackedShows,
  initializeStorage,
  saveTrackedMovies,
  saveTrackedShows,
} from '../utils/storage';
import MediaGrid from '../components/MediaGrid';


export default function App() {
  const [shows, setShows] = useState<TrackedShow[]>([]);
  const [movies, setMovies] = useState<TrackedMovie[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Selected item detail view state
  const [selectedShow, setSelectedShow] = useState<TrackedShow | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<TrackedMovie | null>(null);

  // Initialize data on component load
  useEffect(() => {
    initializeStorage();
    setShows(getTrackedShows());
    setMovies(getTrackedMovies());
    setLogs(getActivityLogs());
  }, []);

  const handleUpdateShows = (newShows: TrackedShow[]) => {
    setShows(newShows);
    saveTrackedShows(newShows);
    // If we have a selected show, update its referenced detail state
    if (selectedShow) {
      const updated = newShows.find((s) => s.id === selectedShow.id);
      if (updated) setSelectedShow(updated);
    }
  };

  const handleUpdateMovies = (newMovies: TrackedMovie[]) => {
    setMovies(newMovies);
    saveTrackedMovies(newMovies);
    // If we have a selected movie, update its referenced detail state
    if (selectedMovie) {
      const updated = newMovies.find((m) => m.id === selectedMovie.id);
      if (updated) setSelectedMovie(updated);
    }
  };

  // Safe Deletion Handlers
  const handleDeleteShow = (id: string) => {
    const showToDelete = shows.find((s) => s.id === id);
    if (!showToDelete) return;

    if (confirm(`Are you sure you want to stop tracking "${showToDelete.title}"? Your logged episodes, ratings, and stats for this show will be deleted.`)) {
      const updated = shows.filter((s) => s.id !== id);
      handleUpdateShows(updated);

      if (selectedShow?.id === id) {
        setSelectedShow(null);
      }
    }
  };

  const handleDeleteMovie = (id: string) => {
    const movieToDelete = movies.find((m) => m.id === id);
    if (!movieToDelete) return;

    if (confirm(`Are you sure you want to stop tracking the movie "${movieToDelete.title}"?`)) {
      const updated = movies.filter((m) => m.id !== id);
      handleUpdateMovies(updated);

      if (selectedMovie?.id === id) {
        setSelectedMovie(null);
      }
    }
  };

  // Reset details and switch tabs helper
  const handleSelectShow = (show: TrackedShow) => {
    setSelectedShow(show);
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie: TrackedMovie) => {
    setSelectedMovie(movie);
    setSelectedShow(null);
  };

  return (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <MediaGrid
                  shows={shows}
                  movies={movies}
                  onSelectShow={handleSelectShow}
                  onSelectMovie={handleSelectMovie}
                  onDeleteShow={handleDeleteShow}
                  onDeleteMovie={handleDeleteMovie}
              />
        </main>
  );
}
