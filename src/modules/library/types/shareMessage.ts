export type SharePayload = {
  title: string;
  text: string;
  url: string;
  posterUrl: string | null;
};

export type BuildShareMessageInput = {
  media: import('@/modules/library/types/trackedMedia').TrackedMedia;
  mediaType: import('@/shared/types/media').MediaType;
  credits: import('@/modules/discovery/credit').Credits | null;
  origin: string;
};
