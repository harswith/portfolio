# harswith.com

Personal portfolio for Harswith Buchireddy. Plain HTML/CSS/JS (no build step) plus one Vercel serverless function for the Spotify "now playing" widget.

```
index.html              page content
css/style.css           styles (red accent: --red in :root)
js/main.js              loader, sticky nav, hero slider, scroll reveals, counters, Spotify widget
api/now-playing.js      Vercel function: GET /api/now-playing
scripts/get-spotify-token.js   one-time helper to get your Spotify refresh token
assets/                 favicon, placeholder profile image, project art
```

## Things to fill in

- **Photo:** replace `assets/profile.svg` with your photo (e.g. `assets/profile.jpg`) and update the `<img>` in the About section.
- **Resume:** drop `Harswith_Buchireddy_Resume.pdf` in the root. The Download Resume button hides itself until the file exists.
- **LinkedIn URL:** the Contact section uses `linkedin.com/in/harswith-buchireddy`; change it if yours differs.
- **Email:** the Contact section uses `hello@harswith.com`. Swap in a real address (or set up email forwarding for the domain).

## Run locally

```
npx vercel dev        # serves the site and /api/now-playing
# or, without the Spotify widget:
python3 -m http.server 8000
```

## Spotify "now playing" setup (one time, ~10 minutes)

1. Go to https://developer.spotify.com/dashboard, log in, and **Create app**.
   - Redirect URI: `http://127.0.0.1:8888/callback`
   - API: Web API
2. Copy the app's **Client ID** and **Client Secret**.
3. Get a refresh token:
   ```
   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy npm run spotify-token
   ```
   Open the URL it prints, approve, and copy the `SPOTIFY_REFRESH_TOKEN=...` line from the terminal.
4. In Vercel: Project → Settings → Environment Variables, add
   `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, then redeploy.

Never commit these values. The widget shows what you're playing (with an equalizer and progress bar), falls back to your last played track, and stays hidden if the API isn't configured.

## Deploy on Vercel + connect harswith.com

1. Push this folder to a GitHub repo, then import it at https://vercel.com/new (framework preset: Other).
2. Project → Settings → Domains → add `harswith.com` and `www.harswith.com`.
3. At your domain registrar, add the DNS records Vercel shows (typically an `A` record for `@` to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`).
