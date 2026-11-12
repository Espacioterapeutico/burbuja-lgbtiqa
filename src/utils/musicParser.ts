export interface ParsedMusic {
  type: 'spotify' | 'youtube' | 'custom';
  title: string;
  artist?: string;
  rawUrl?: string;
  spotifyTrackId?: string;
  youtubeId?: string;
  embedUrl?: string;
}

/**
 * Identifica automáticamente si la canción es un enlace de Spotify, YouTube o texto de artista/canción.
 * Elimina la necesidad de pegar código HTML manual.
 */
export function parseMusicLink(input: string): ParsedMusic {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'custom', title: '' };
  }

  // 1. Detección de Spotify
  // Formatos: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT
  //           https://open.spotify.com/intl-es/track/4cOdK2wGLETKBW3PvgPWqT?si=...
  //           spotify:track:4cOdK2wGLETKBW3PvgPWqT
  const spotifyMatch = trimmed.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([a-zA-Z0-9]+)/i) ||
                       trimmed.match(/spotify:track:([a-zA-Z0-9]+)/i);

  if (spotifyMatch && spotifyMatch[1]) {
    const trackId = spotifyMatch[1].split('?')[0];
    return {
      type: 'spotify',
      title: 'Pista de Spotify',
      spotifyTrackId: trackId,
      rawUrl: `https://open.spotify.com/track/${trackId}`,
      embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`
    };
  }

  // 2. Detección de YouTube
  // Formatos: https://www.youtube.com/watch?v=jfKfPfyJRdk
  //           https://youtu.be/jfKfPfyJRdk
  //           https://music.youtube.com/watch?v=jfKfPfyJRdk
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      title: 'Canción en YouTube',
      youtubeId: ytId,
      rawUrl: `https://www.youtube.com/watch?v=${ytId}`,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=0`
    };
  }

  // 3. Formato normal: Artista - Canción
  if (trimmed.includes(' - ')) {
    const parts = trimmed.split(' - ');
    return {
      type: 'custom',
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      rawUrl: undefined
    };
  }

  return {
    type: 'custom',
    title: trimmed,
    rawUrl: undefined
  };
}

// Canciones icónicas preconfiguradas para probar con 1 clic
export const DEMO_MUSIC_PRESETS = [
  {
    name: 'Troye Sivan - Rush',
    url: 'https://open.spotify.com/track/303W5F7o9Z5x6G7Y0yXw3m',
    source: 'spotify'
  },
  {
    name: 'Chappell Roan - Good Luck, Babe!',
    url: 'https://open.spotify.com/track/0x9j1sQ0rG5dE0qL2m9d8A',
    source: 'spotify'
  },
  {
    name: 'Lady Gaga - Born This Way',
    url: 'https://www.youtube.com/watch?v=wV1FrqwZyKw',
    source: 'youtube'
  },
  {
    name: 'Villano Antillano - BZRP Music Sessions',
    url: 'https://www.youtube.com/watch?v=wtI4b3u3sZg',
    source: 'youtube'
  }
];
