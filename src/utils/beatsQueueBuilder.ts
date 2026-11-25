import {
  BEATS_ROOMS,
  MODERN_RNB_PLAYLISTS,
  OTHER_ROOMS_CONTENT,
  type BeatsRoomKey,
  type ModernRnbPlaylist,
} from '../data/beatsRoomsData';
import type { SonicTrackItem } from '../types/sonicOrb';

const ENERGY_PROFILES_BY_ID: Record<string, SonicTrackItem['energyProfile']> = {
  'rnb-now': { bpm: 92, warmth: 0.78, depth: 0.72 },
  'new-rnb-july-2026': { bpm: 96, warmth: 0.72, depth: 0.7 },
  'rising-now-rnb-soul': { bpm: 84, warmth: 0.85, depth: 0.68 },
  'fresh-finds-rnb': { bpm: 88, warmth: 0.82, depth: 0.74 },
  'rnb-x': { bpm: 98, warmth: 0.7, depth: 0.8 },
  'vanguard-alt-rnb': { bpm: 104, warmth: 0.45, depth: 0.78 },
  'alt-rnb-neo-soul': { bpm: 82, warmth: 0.68, depth: 0.72 },
  'rap-rotation': { bpm: 124, warmth: 0.65, depth: 0.92 },
  'rap-sotw': { bpm: 138, warmth: 0.55, depth: 0.94 },
  'african-roots': { bpm: 112, warmth: 0.88, depth: 0.86 },
  'piano-felt': { bpm: 70, warmth: 0.4, depth: 0.42 },
  'lofi-beats': { bpm: 78, warmth: 0.62, depth: 0.58 },
  'lofi-night-drive': { bpm: 116, warmth: 0.34, depth: 0.82 },
  'study-deep': { bpm: 74, warmth: 0.3, depth: 0.48 },
};

const ROOM_ARTIST_LABEL: Record<string, string> = {
  'rnb-now': 'SZA · Summer Walker · Leon Thomas · Kehlani',
  'new-rnb-july-2026': 'Contemporary R&B Releases & New Voices',
  'rising-now-rnb-soul': 'Emerging R&B & Neo-Soul Singers',
  'fresh-finds-rnb': 'Fresh Finds R&B · Newer Voices',
  'rnb-x': 'Contemporary R&B Flagship Selection',
  'vanguard-alt-rnb': 'Alternative & Experimental R&B',
  'alt-rnb-neo-soul': 'Alternative R&B · Modern Neo-Soul',
  'rap-rotation': 'RapCaviar · Heavy Drums & Rotation',
  'rap-sotw': 'Creepy Nuts',
  'african-roots': 'African Heat · Afrobeats & Alté',
  'piano-felt': 'Peaceful Piano · Solo Acoustic',
  'lofi-beats': 'lofi beats · Dusty Tape Saturation',
  'lofi-night-drive': 'Retrowave // Outrun · Midnight Synth',
  'study-deep': 'Intense Studying · Deep Focus',
};

export function playlistToSonicTrack(playlist: ModernRnbPlaylist): SonicTrackItem {
  return {
    id: `modern-rnb-${playlist.id}`,
    title: playlist.title,
    artist: ROOM_ARTIST_LABEL[playlist.id] ?? playlist.subtitle,
    collection: `Modern R&B · ${playlist.platform}`,
    roomKey: 'rnb',
    roomLabel: '02 · R&B / Modern R&B',
    platform: playlist.platform,
    spotifyUrl: playlist.spotifyEmbedUrl,
    openLinkUrl: playlist.openLinkUrl,
    note: playlist.previewNote || playlist.subtitle,
    energyProfile: ENERGY_PROFILES_BY_ID[playlist.id] ?? { bpm: 90, warmth: 0.72, depth: 0.7 },
  };
}

/**
 * Builds the canonical unified listening queue across all 6 BEATS rooms
 * while keeping existing room and playlist data intact without duplication.
 */
export function buildBeatsSonicQueue(): SonicTrackItem[] {
  const modernRnbTracks = MODERN_RNB_PLAYLISTS.map(playlistToSonicTrack);

  const otherRoomKeys: Exclude<BeatsRoomKey, 'rnb'>[] = [
    'rap',
    'african-music',
    'classical-piano',
    'lofi',
    'study-music',
  ];

  const roomTracks: SonicTrackItem[] = [];

  for (const roomKey of otherRoomKeys) {
    const meta = BEATS_ROOMS.find((r) => r.key === roomKey);
    const items = OTHER_ROOMS_CONTENT[roomKey];
    for (const item of items) {
      if (!item.spotifyUrl) continue;
      roomTracks.push({
        id: `room-${roomKey}-${item.id}`,
        title: item.title,
        artist: ROOM_ARTIST_LABEL[item.id] ?? item.subtitle,
        collection: `${meta?.label ?? roomKey.toUpperCase()} · Room ${meta?.number ?? ''}`,
        roomKey,
        roomLabel: `${meta?.number ?? ''} · ${meta?.label ?? roomKey}`,
        platform: 'Spotify',
        spotifyUrl: item.spotifyUrl,
        openLinkUrl: item.spotifyUrl,
        note: item.description,
        energyProfile: ENERGY_PROFILES_BY_ID[item.id] ?? { bpm: 96, warmth: 0.5, depth: 0.65 },
      });
    }
  }

  // Place Fresh Finds R&B (verified direct PDF Spotify playlist) at the front of Modern R&B or keep editorial order with Fresh Finds default
  return [...modernRnbTracks, ...roomTracks];
}
