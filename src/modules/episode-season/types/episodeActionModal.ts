export type EpisodeActionModalProps = {
  episodeId: string;
  episodeName: string;
  episodeNumber: number;
  watchCount: number;
  onRewatch: (count: number) => void;
  onUnwatch: (count: number) => void;
  onClose: () => void;
};
