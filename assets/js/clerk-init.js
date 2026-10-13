/* Loads Clerk once. Every page waits on NCT.clerkReady. */
(function () {
  const N = window.NCT;
  N.abs = (path) => new URL(path, location.href).href;   // absolute URL (works from any folder)

  const loadScript = (src, attrs = {}) => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src; el.async = true; el.crossOrigin = 'anonymous';
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.onload = resolve;
    el.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(el);
  });

  N.clerkReady = (async () => {
    const key = N.CLERK_PUBLISHABLE_KEY || '';
    if (!/^pk_(test|live)_/.test(key) || key.includes('PASTE_YOUR_KEY'))
      throw new Error('Add your Clerk publishable key (pk_test_… or pk_live_…) in assets/js/config.js.');
    const domain = atob(key.split('_')[2]).slice(0, -1);   // Frontend API domain is encoded in the key
    await loadScript(`https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`);
    await loadScript(`https://${domain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, { 'data-clerk-publishable-key': key });
    await Clerk.load({
      ui: { ClerkUI: window.__internal_ClerkUICtor },
      appearance: { variables: {
        colorPrimary: '#4f8cff', colorBackground: '#0a1030', colorText: '#ffffff',
        colorTextSecondary: '#a9b4c7', colorInputBackground: '#0d1538', colorInputText: '#ffffff',
        borderRadius: '14px', fontFamily: 'Manrope, Inter, sans-serif'
      } }
    });
    return window.Clerk;
  })();
  N.clerkReady.catch((err) => console.error('[Clerk]', err));
})();
