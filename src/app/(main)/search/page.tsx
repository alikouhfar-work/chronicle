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
import MediaSearch from '../components/MediaSearch';

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

  const handleUpdateLogs = (newLogs: ActivityLog[]) => {
    setLogs(newLogs);
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
              <MediaSearch
                  trackedShows={shows}
                  trackedMovies={movies}
                  onUpdateShows={handleUpdateShows}
                  onUpdateMovies={handleUpdateMovies}
                  onUpdateLogs={handleUpdateLogs}
                  onSelectShow={handleSelectShow}
                  onSelectMovie={handleSelectMovie}
              />
        </main>
  );
}
