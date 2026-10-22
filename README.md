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
- **Resume:** `Harswith_Buchireddy_Resume.pdf` in the root powers both Download Resume buttons. Replace that file to update it.
- **LinkedIn URL:** the Contact section uses `linkedin.com/in/harswith-buchireddy`; change it if yours differs.
- **Email:** the Contact section uses `harswith28@gmail.com`.

## Run locally

```
npx vercel dev        # serves the site and /api/now-playing
# or, without the Spotify widget:
python3 -m http.server 8000
```

## Spotify "now playing" setup (one time, ~10 minutes)

1. Go to https://developer.spotify.com/dashboard, log in, and **Create app**.
   - Redirect URIs (add both): `https://harswith.com/api/spotify-callback` and `https://www.harswith.com/api/spotify-callback`
   - API: Web API
2. In Vercel → Settings → Environment Variables, add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the app's settings, then redeploy.
3. Visit https://harswith.com/api/spotify-login, approve, and copy the token it shows.
4. Add it in Vercel as `SPOTIFY_REFRESH_TOKEN`, then redeploy. The setup routes switch themselves off.

Never commit these values. The About card shows a "Coming soon" placeholder until this works, then shows what you're playing (or your last played track).

(Offline alternative: add `http://127.0.0.1:8888/callback` as a redirect URI and run `SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... npm run spotify-token`.)

## Deploy on Vercel + connect harswith.com

1. Push this folder to a GitHub repo, then import it at https://vercel.com/new (framework preset: Other).
2. Project → Settings → Domains → add `harswith.com` and `www.harswith.com`.
3. At your domain registrar, add the DNS records Vercel shows (typically an `A` record for `@` to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`).
