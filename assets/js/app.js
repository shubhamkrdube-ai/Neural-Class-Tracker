/* Shared by dashboard.html and saved.html:
   auth guard → per-user class store → header + sidebar. */
(function () {
  'use strict';
  const N = window.NCT, P = N.PAGES, page = document.body.dataset.page;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  N.esc = esc;

  /* ---------- icons ---------- */
  const PATHS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>',
    bookmark: '<path d="M6 3.5h12v17l-6-4.5-6 4.5z"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    logout: '<path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9"/><path d="M16 8l4 4-4 4M20 12H9"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 21h4"/>',
    down: '<path d="m6 9 6 6 6-6"/>', right: '<path d="m9 6 6 6-6 6"/>', left: '<path d="m15 6-6 6 6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    dots: '<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    cap: '<path d="m12 4 10 5-10 5L2 9z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="currentColor"/>'
  };
  N.svg = (inner, cls = 'h-5 w-5') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  N.icon = (name, cls) => N.svg(PATHS[name], cls);

  /* ---------- toast ---------- */
  let toastTimer;
  N.toast = (msg, action) => {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = esc(msg) + (action ? ` <a href="${esc(action.href)}">${esc(action.label)}</a>` : '');
    t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 4500);
  };

  const fail = (msg) => {
    document.body.className = 'bg-night font-sans text-white';
    document.body.innerHTML = `<div style="max-width:560px;margin:15vh auto;padding:2rem"><h1 style="font-size:1.6rem;font-weight:800">Couldn’t start the app</h1><p style="margin-top:1rem;color:#cbd5e1">${esc(msg)}</p><p style="margin-top:1.5rem"><a href="${P.home}" style="color:#22d3ee">← Back to home</a></p></div>`;
  };

  /* ---------- per-user class store (this browser) ---------- */
  function makeStore(userId) {
    const KEY = 'nct:classes:' + userId;
    const read = () => { try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };
    const write = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch { N.toast('Could not save — browser storage is full or blocked.'); return false; } };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return {
      all: read,
      add(c) { const a = read(); const item = { id: uid(), createdAt: new Date().toISOString(), ...c }; a.push(item); return write(a) ? item : null; },
      update(id, patch) { const a = read().map((c) => (c.id === id ? { ...c, ...patch } : c)); return write(a); },
      remove(id) { return write(read().filter((c) => c.id !== id)); },
      counts() { const a = read(); return { all: a.length, completed: a.filter((c) => c.status === 'completed').length, notcompleted: a.filter((c) => c.status === 'notcompleted').length }; }
    };
  }

  /* ---------- header + sidebar ---------- */
  function renderShell(clerk, store) {
    const user = clerk.user;
    const name = user.fullName || user.firstName || 'Student';
    const sub = user.primaryEmailAddress?.emailAddress || '';
    const avatar = user.hasImage
      ? `<img src="${esc(user.imageUrl)}" alt="" class="h-11 w-11 flex-none rounded-full object-cover">`
      : `<span class="avatar">${esc(name.charAt(0).toUpperCase())}</span>`;
    const isDash = page === 'dashboard';

    const header = document.createElement('header');
    header.className = 'app-header';
    header.innerHTML = `
      <button id="nav-toggle" type="button" class="icon-btn lg:hidden" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">${N.icon('menu', 'h-6 w-6')}</button>
      <a href="${P.dashboard}" class="flex flex-none items-center gap-3">
        <img src="./assets/images/logo.png" alt="" width="44" height="44" class="h-10 w-10 object-contain sm:h-11 sm:w-11">
        <span class="hidden text-xl font-semibold tracking-tight sm:inline">Neural <span class="text-glow">Class</span> <span class="text-grad-violet">Tracker</span></span>
      </a>
      <div class="mx-auto hidden w-full max-w-[540px] md:block">
        <label class="search">${N.icon('search', 'h-5 w-5 flex-none')}<span class="sr-only">Search saved classes</span><input id="search" type="search" placeholder="Search saved classes…" autocomplete="off"><span class="hidden items-center gap-1.5 lg:flex"><kbd class="kbd">Ctrl</kbd><kbd class="kbd">K</kbd></span></label>
      </div>
      <div class="ml-auto flex items-center gap-2 sm:gap-4 md:ml-0">
        <button id="bell" type="button" class="icon-btn relative" aria-label="Pending classes">${N.icon('bell', 'h-6 w-6')}<span id="bell-dot" class="dot-red hidden"></span></button>
        <span class="vline hidden sm:block"></span>
        <div class="relative">
          <button id="user-btn" type="button" class="flex items-center gap-3 rounded-xl p-1 text-left" aria-haspopup="menu" aria-expanded="false">
            ${avatar}
            <span class="hidden min-w-0 sm:block"><span class="block max-w-[170px] truncate font-semibold leading-tight">${esc(name)}</span><span class="block max-w-[170px] truncate text-sm text-slate-400">${esc(sub)}</span></span>
            ${N.icon('down', 'h-4 w-4 flex-none text-slate-300')}
          </button>
          <div id="user-menu" class="menu hidden" role="menu">
            <button type="button" role="menuitem" id="m-account">Manage account</button>
            <button type="button" role="menuitem" id="m-logout">Log out</button>
          </div>
        </div>
      </div>`;

    const aside = document.createElement('aside');
    aside.id = 'sidebar'; aside.className = 'sidebar';
    aside.innerHTML = `
      <nav class="flex flex-col gap-1.5" aria-label="App">
        <div class="side-item ${isDash ? 'active' : ''}"><a class="si" href="${P.dashboard}" ${isDash ? 'aria-current="page"' : ''}>${N.icon('home', 'h-6 w-6')}Dashboard</a></div>
        <div id="saved-item" class="side-item">
          <a id="saved-link" class="si" href="${P.saved}" ${page === 'saved' ? 'aria-current="page"' : ''}>${N.icon('bookmark', 'h-6 w-6')}<span>Saved</span><span id="saved-total" class="pill pill-green ml-auto hidden"></span></a>
          <button id="saved-toggle" type="button" class="side-chev" aria-label="Show or hide saved filters" aria-expanded="true">${N.icon('down', 'h-5 w-5')}</button>
        </div>
        <ul id="saved-sub" class="sub">
          <li><a class="sub-link" href="${P.saved}?filter=completed">${N.icon('check-circle', 'h-6 w-6 text-slate-200')}Completed<span id="n-completed" class="pill pill-green ml-auto">0</span></a></li>
          <li><a class="sub-link" href="${P.saved}?filter=notcompleted">${N.icon('clock', 'h-6 w-6 text-slate-200')}Not Completed<span id="n-notcompleted" class="pill pill-amber ml-auto">0</span></a></li>
        </ul>
      </nav>
      <hr class="side-hr">
      <div class="side-item"><button id="settings-btn" type="button" class="si">${N.icon('gear', 'h-6 w-6')}Settings</button></div>
      <div class="mt-auto flex flex-col gap-6 pt-6">
        <div class="promo">
          <span class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20 text-cyan-300">${N.icon('bolt', 'h-6 w-6')}</span>
          <p class="text-xl font-bold leading-snug text-cyan-300">Track Better,<br>Learn Smarter!</p>
          <p class="mt-2 text-slate-300">Stay consistent and achieve your goals.</p>
          <svg viewBox="0 0 220 60" class="mt-3 h-12 w-full" aria-hidden="true"><defs><linearGradient id="sp" x1="0" x2="1"><stop offset="0" stop-color="#6366f1" stop-opacity=".2"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><path d="M0 56C30 52 50 34 80 38s40 16 70-8 50-16 70-28" fill="none" stroke="url(#sp)" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <button id="logout-btn" type="button" class="flex items-center gap-3 px-3 py-2 font-semibold text-red-400 hover:text-red-300">${N.icon('logout', 'h-6 w-6')}Logout</button>
      </div>`;

    const main = $('#main');
    document.body.insertBefore(header, main);
    document.body.insertBefore(aside, main);

    /* sidebar / badges reflect how many classes exist */
    let lastHas = null, collapsed = false;
    const refresh = () => {
      const c = store.counts(), has = c.all > 0;
      const item = $('#saved-item'), link = $('#saved-link');
      item.classList.toggle('disabled', !has);
      item.classList.toggle('active', has && page === 'saved');
      link.setAttribute('aria-disabled', String(!has));
      link.tabIndex = has ? 0 : -1;
      link.title = has ? '' : 'Add your first class to unlock Saved';
      $('#saved-sub').classList.toggle('hidden', !has || collapsed);
      const total = $('#saved-total');
      total.textContent = c.all; total.classList.toggle('hidden', !(has && page === 'saved'));
      $('#n-completed').textContent = c.completed;
      $('#n-notcompleted').textContent = c.notcompleted;
      $('#bell-dot').classList.toggle('hidden', c.notcompleted === 0);
      if (lastHas === false && has) { item.classList.add('unlock'); setTimeout(() => item.classList.remove('unlock'), 2600); }
      lastHas = has;
    };
    refresh();

    $('#saved-link').addEventListener('click', (e) => {
      if ($('#saved-link').getAttribute('aria-disabled') === 'true') { e.preventDefault(); N.toast('Add your first class to unlock Saved.'); }
    });
    $('#saved-toggle').addEventListener('click', () => {
      collapsed = !collapsed;
      $('#saved-toggle').setAttribute('aria-expanded', String(!collapsed));
      refresh();
    });

    /* panels */
    const toggle = $('#nav-toggle'), userBtn = $('#user-btn'), menu = $('#user-menu');
    const closePanels = () => {
      menu.classList.add('hidden'); userBtn.setAttribute('aria-expanded', 'false');
      aside.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', (e) => { e.stopPropagation(); const open = aside.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
    userBtn.addEventListener('click', (e) => { e.stopPropagation(); const open = menu.classList.toggle('hidden') === false; userBtn.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target) && !aside.contains(e.target)) closePanels(); });
    $('#m-account').addEventListener('click', () => { closePanels(); clerk.openUserProfile(); });
    $('#settings-btn').addEventListener('click', () => { closePanels(); clerk.openUserProfile(); });
    const signOut = () => clerk.signOut({ redirectUrl: N.abs(P.home) });
    $('#m-logout').addEventListener('click', signOut);
    $('#logout-btn').addEventListener('click', signOut);

    /* bell → pending (not completed) classes */
    $('#bell').addEventListener('click', () => {
      const c = store.counts();
      if (!c.all) N.toast('No classes yet — add one on the dashboard.');
      else if (!c.notcompleted) N.toast('All caught up — no pending classes.');
      else location.href = `${P.saved}?filter=notcompleted`;
    });

    /* search */
    const search = $('#search');
    if (page === 'saved') search.value = new URLSearchParams(location.search).get('q') || '';
    search.addEventListener('input', () => window.dispatchEvent(new CustomEvent('nct:search', { detail: search.value.trim() })));
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || page === 'saved') return;
      if (!store.counts().all) return N.toast('Add your first class to search saved classes.');
      const q = search.value.trim();
      location.href = P.saved + (q ? '?q=' + encodeURIComponent(q) : '');
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); search.focus(); search.select(); }
      else if (e.key === 'Escape') closePanels();
    });

    return refresh;
  }

  /* ---------- boot ---------- */
  N.appReady = (async () => {
    let clerk;
    try { clerk = await N.clerkReady; } catch (err) { fail(err.message); return null; }
    if (!clerk.isSignedIn) { location.replace(N.abs(P.home)); return null; }
    clerk.addListener(({ user }) => { if (!user) location.replace(N.abs(P.home)); });   // signed out in another tab
    const store = makeStore(clerk.user.id);
    const refresh = renderShell(clerk, store);
    document.body.classList.remove('auth-pending');
    return { clerk, user: clerk.user, store, refresh };
  })();
})();
