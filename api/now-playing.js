// Vercel serverless function: GET /api/now-playing
// Returns the track Harswith is currently playing on Spotify, or the most recently played one.
// Needs env vars SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN (see README).

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: SPOTIFY_REFRESH_TOKEN }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  return (await res.json()).access_token;
}

const shape = (item, extra) => ({
  title: item.name,
  artist: item.artists.map(a => a.name).join(', '),
  album: item.album.name,
  albumImageUrl: item.album.images[0]?.url,
  songUrl: item.external_urls.spotify,
  duration: item.duration_ms,
  ...extra,
});

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const now = await fetch(NOW_PLAYING_URL, { headers });
    if (now.status === 200) {
      const data = await now.json();
      if (data.item && data.currently_playing_type === 'track') {
        return res.status(200).json(shape(data.item, { isPlaying: data.is_playing, progress: data.progress_ms }));
      }
    }

    const recent = await fetch(RECENT_URL, { headers });
    if (recent.ok) {
      const { items } = await recent.json();
      if (items?.length) {
        return res.status(200).json(shape(items[0].track, { isPlaying: false, playedAt: items[0].played_at }));
      }
    }
    return res.status(200).json({ isPlaying: false });
  } catch (err) {
    return res.status(200).json({ isPlaying: false, error: 'unavailable' });
  }
}
