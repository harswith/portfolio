(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Loader
  window.addEventListener('load', () => setTimeout(() => $('#loader').classList.remove('show'), 300));

  $('#year').textContent = new Date().getFullYear();

  // Light / dark theme switch
  const root = document.documentElement;
  const themeSwitch = $('#themeSwitch');
  const themeHint = $('#themeHint');
  const syncTheme = () => {
    const light = root.dataset.theme === 'light';
    themeSwitch.setAttribute('aria-checked', light);
    $('#themeLabel').textContent = light ? 'Dark mode' : 'Light mode';
    themeHint.textContent = light ? 'Back to the dark side? Flip it again.' : 'Prefer softer colors? Flip this switch for light mode.';
    $('meta[name="theme-color"]').content = light ? '#f6f8fc' : '#0a0a0c';
  };
  themeSwitch.addEventListener('click', () => {
    root.classList.add('theming');
    if (root.dataset.theme === 'light') delete root.dataset.theme;
    else root.dataset.theme = 'light';
    try { localStorage.setItem('theme', root.dataset.theme || 'dark'); } catch (e) {}
    syncTheme();
    themeHint.classList.remove('show');
    setTimeout(() => root.classList.remove('theming'), 600);
  });
  syncTheme();
  // Show the hint briefly to first-time visitors
  let seenHint = false;
  try { seenHint = localStorage.getItem('themeHintSeen') === '1'; } catch (e) {}
  if (!seenHint) {
    setTimeout(() => themeHint.classList.add('show'), 2200);
    setTimeout(() => themeHint.classList.remove('show'), 8500);
    try { localStorage.setItem('themeHintSeen', '1'); } catch (e) {}
  }

  // Navbar: becomes sticky and slides in after scrolling past the hero top
  const nav = $('#navbar');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 150);
    nav.classList.toggle('awake', y > 350);
    toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  // Active nav link by section in view
  const navMap = new Map($$('a', links).map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const a = navMap.get(e.target.id);
      if (!a) return;
      $$('a', links).forEach(x => x.classList.remove('active'));
      a.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach(s => spy.observe(s));

  // Hero slider (fade, auto-advance)
  const slides = $$('.slide');
  const dots = $$('#sliderDots button');
  let current = 0;
  let timer;
  const show = i => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };
  const autoplay = () => { clearInterval(timer); timer = setInterval(() => show(current + 1), 6000); };
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); autoplay(); }));
  autoplay();

  // Reveal on scroll, staggered within each batch
  const revealer = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {
      setTimeout(() => e.target.classList.add('in'), i * 90);
      revealer.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => revealer.observe(el));

  // Number counters
  const counter = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach(e => {
      const el = e.target;
      const target = +el.dataset.number;
      const start = performance.now();
      const step = t => {
        const p = Math.min((t - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counter.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('.number').forEach(el => counter.observe(el));

  // Cursor glow (desktop only)
  const glow = $('.cursor-glow');
  if (matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    }, { passive: true });
  }

  // Hide the resume button until a resume PDF is added to the site root
  const resumeBtn = $('#resumeBtn');
  fetch(resumeBtn.getAttribute('href'), { method: 'HEAD' })
    .then(r => { if (!r.ok || !(r.headers.get('content-type') || '').includes('pdf')) resumeBtn.remove(); })
    .catch(() => resumeBtn.remove());

  // Spotify now playing (served by /api/now-playing on Vercel)
  const card = $('#spotifyCard');
  const float = $('#spotifyFloat');
  let track = null;
  let fetchedAt = 0;

  const fmtAgo = iso => {
    const mins = Math.round((Date.now() - new Date(iso)) / 60000);
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
    return `${Math.round(mins / 1440)}d ago`;
  };

  const render = () => {
    if (!track) return;
    const playing = track.isPlaying;
    card.classList.remove('placeholder');
    $('#spArt').hidden = false;
    $('#spArt').src = $('#spfArt').src = track.albumImageUrl;
    $('#spTitle').textContent = $('#spfTitle').textContent = track.title;
    $('#spTitle').href = float.href = track.songUrl;
    $('#spArtist').textContent = $('#spfArtist').textContent = track.artist;
    $('#spStatusText').textContent = playing ? 'Now playing' : (track.playedAt ? `Last played · ${fmtAgo(track.playedAt)}` : 'Last played');
    $('#spStatus').classList.toggle('idle', !playing);
    card.classList.toggle('paused', !playing);
    float.classList.toggle('paused', !playing);
    $('.sp-progress', card).style.display = playing && track.duration ? '' : 'none';
    tick();
    float.hidden = false;
    requestAnimationFrame(() => float.classList.add('show'));
  };

  const tick = () => {
    if (!track || !track.isPlaying || !track.duration) return;
    const progress = Math.min(track.progress + (Date.now() - fetchedAt), track.duration);
    $('#spBar').style.width = (progress / track.duration) * 100 + '%';
  };

  const load = async () => {
    try {
      const r = await fetch('/api/now-playing', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      if (!data || !data.title) return;
      track = data;
      fetchedAt = Date.now();
      render();
    } catch (_) { /* widget stays hidden when the API isn't available */ }
  };
  load();
  setInterval(load, 30000);
  setInterval(tick, 1000);
})();
