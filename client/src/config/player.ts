import type { VidkingPlayerOptions } from "@/lib/api/vidking-embed";

/** Global defaults for Vidking iframe query params (accent color = white). */
export const defaultVidkingOptions: VidkingPlayerOptions = {
  color: "ffffff",
  autoPlay: false,
  nextEpisode: true,
  episodeSelector: true,
};
