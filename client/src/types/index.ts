export type ContentKind = "movie" | "show";

export type ContentRating = "TV-Y7" | "TV-PG" | "PG" | "PG-13" | "TV-14" | "R";

export interface ContentItem {
  id: string;
  kind: ContentKind;
  title: string;
  tagline?: string;
  description: string;
  genres: string[];
  year: number;
  rating: ContentRating;
  maturityScore?: number;
  posterUrl: string;
  backdropUrl: string;
  titleArtUrl?: string;
  durationMinutes?: number;
  cast: string[];
  trending?: boolean;
  isNew?: boolean;
}

export interface Movie extends ContentItem {
  kind: "movie";
  durationMinutes: number;
}

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  durationMinutes: number;
  synopsis: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
  /** When full episode rows are not loaded (e.g. TMDB list-only). */
  episodeCount?: number;
}

export interface Show extends ContentItem {
  kind: "show";
  seasons: Season[];
}

export interface ClipStats {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
}

export interface Clip {
  id: string;
  contentId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  durationSeconds: number;
  creatorId: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  aiGenerated: boolean;
  createdAt: string;
  stats: ClipStats;
}

export interface Comment {
  id: string;
  clipId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  body: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  preferredGenres: string[];
  watchlistTitleIds: string[];
  continueWatching: ContinueWatchingItem[];
  createdClipIds: string[];
  likedClipIds: string[];
}

export interface ContinueWatchingItem {
  contentId: string;
  progressPercent: number;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface WatchlistItem {
  contentId: string;
  addedAt: string;
}

export interface GeneratorPrompt {
  text: string;
  styleHint?: string;
}

export type GeneratorStatus = "idle" | "generating" | "success" | "failed";

export type GeneratorStep =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export interface GeneratorSession {
  step: GeneratorStep;
  selectedContentId: string | null;
  segmentStartSeconds: number;
  segmentEndSeconds: number;
  prompt: GeneratorPrompt;
  previewModelId: string | null;
  status: GeneratorStatus;
  errorMessage: string | null;
  publishTitle: string;
  publishDescription: string;
  generatedClipId: string | null;
}
