// One-time helper: prints a Spotify refresh token for the /api/now-playing function.
// Usage: SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... npm run spotify-token
import http from 'node:http';

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}
const redirect = 'http://127.0.0.1:8888/callback';
const scope = 'user-read-currently-playing user-read-recently-played';
const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({ client_id: id, response_type: 'code', redirect_uri: redirect, scope })}`;

http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') return res.end();
  const code = url.searchParams.get('code');
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
  });
  const data = await r.json();
  res.end(data.refresh_token ? 'Done! Check your terminal.' : 'Something went wrong, check your terminal.');
  console.log(data.refresh_token ? `\nSPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n` : data);
  process.exit(0);
}).listen(8888, '127.0.0.1', () => console.log(`Open this URL in your browser and approve:\n\n${authUrl}\n`));
