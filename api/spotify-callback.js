// GET /api/spotify-callback: exchanges Spotify's code for a refresh token and shows it once.

const page = body => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Spotify setup</title><body style="font-family:system-ui,sans-serif;background:#0a0a0c;color:#e9e9ee;max-width:640px;margin:60px auto;padding:0 16px;line-height:1.6">${body}</body>`;

export default async function handler(req, res) {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (SPOTIFY_REFRESH_TOKEN) return res.status(404).send('Not found');

  const code = new URL(req.url, `https://${req.headers.host}`).searchParams.get('code');
  if (!code) return res.status(400).send(page('<h1>No code from Spotify</h1><p>Start again at <a style="color:#ff2e4d" href="/api/spotify-login">/api/spotify-login</a>.</p>'));

  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `https://${req.headers.host}/api/spotify-callback`,
    }),
  });
  const data = await r.json();
  if (!data.refresh_token) {
    return res.status(400).send(page(`<h1>Spotify said no</h1><p>${data.error_description || data.error || 'Unknown error'}</p><p>Check that the Client ID, Client Secret and Redirect URI match your Spotify app.</p>`));
  }
  res.status(200).send(page(`<h1>Almost done</h1><p>In Vercel, add an environment variable named <b>SPOTIFY_REFRESH_TOKEN</b> with this value, then redeploy:</p>
<textarea readonly rows="5" style="width:100%;background:#18181d;color:#fff;border:1px solid #ff2e4d;border-radius:8px;padding:10px;font-family:monospace" onclick="this.select()">${data.refresh_token}</textarea>
<p>Keep it private. After you redeploy, this setup page switches itself off.</p>`));
}
