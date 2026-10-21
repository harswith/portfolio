// GET /api/spotify-login: one-time setup. Sends you to Spotify to approve access,
// then Spotify returns to /api/spotify-callback, which shows your refresh token.
// Both routes switch off once SPOTIFY_REFRESH_TOKEN is set.

export default function handler(req, res) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (SPOTIFY_REFRESH_TOKEN) return res.status(404).send('Not found');
  if (!SPOTIFY_CLIENT_ID) return res.status(500).send('Set SPOTIFY_CLIENT_ID in Vercel first, then redeploy.');

  const redirect = `https://${req.headers.host}/api/spotify-callback`;
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirect,
    scope: 'user-read-currently-playing user-read-recently-played',
  });
  res.writeHead(302, { Location: `https://accounts.spotify.com/authorize?${params}` });
  res.end();
}
