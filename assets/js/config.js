/* One place to configure every page. */
window.NCT = {
  // Clerk Dashboard → API keys → Publishable key
  CLERK_PUBLISHABLE_KEY: 'pk_test_aW50ZW50LWdyb3VzZS03OTMyLmNsZXJrLmFjY291bnRzLmRldiQ',

  PAGES: { home: 'index.html', dashboard: 'dashboard.html', saved: 'saved.html' },

  // Where users land after login / register: 'dashboard' or 'saved'
  AFTER_LOGIN: 'dashboard'
};
