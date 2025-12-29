export type MediaType = 'youtube' | 'spotify' | 'direct' | 'unknown';

export interface MediaInfo {
  type: MediaType;
  id?: string;
  embedUrl?: string;
}

export function detectMediaType(url: string): MediaInfo {
  // YouTube detection
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    return {
      type: 'youtube',
      id: youtubeMatch[1],
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`,
    };
  }

  // Spotify detection
  const spotifyMatch = url.match(
    /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
  );
  if (spotifyMatch) {
    return {
      type: 'spotify',
      id: spotifyMatch[2],
      embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`,
    };
  }

  // Direct media link
  if (url.includes('.mp3') || url.includes('.mp4') || url.includes('.wav') || 
      url.includes('.webm') || url.includes('.ogg') || url.includes('.m4a')) {
    return {
      type: 'direct',
      embedUrl: url,
    };
  }

  return { type: 'unknown' };
}

export function isYouTubeUrl(url: string): boolean {
  return detectMediaType(url).type === 'youtube';
}

export function isSpotifyUrl(url: string): boolean {
  return detectMediaType(url).type === 'spotify';
}

export function isDirectUrl(url: string): boolean {
  return detectMediaType(url).type === 'direct';
}
