/**
 * Watch2Gether integration for synchronized video watching
 * Free tier: https://www.watch2gether.com/
 * Allows multiple users to watch YouTube videos in sync
 */

export interface Watch2GetherRoom {
  url: string;
  roomCode?: string;
}

/**
 * Generate a Watch2Gether URL for a YouTube video
 * Watch2Gether automatically creates rooms and manages sync
 * URL format: https://www.watch2gether.com/?room=ROOMCODE&autoplay=1
 * 
 * For a fresh room with a YouTube video, use:
 * https://www.watch2gether.com/?youtubeId=VIDEO_ID
 */
export function generateWatch2GetherUrl(youtubeId: string): string {
  // Watch2Gether can auto-load a YouTube video when creating a room
  return `https://www.watch2gether.com/?youtubeId=${youtubeId}&autoplay=1`;
}

/**
 * Extract YouTube ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Check if URL is a valid YouTube link
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}
