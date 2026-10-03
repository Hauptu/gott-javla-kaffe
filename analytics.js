(() => {
  const GUIDE_PATHS = new Set([
    'kaffemaskin.html','kaffedrycker.html','bonor.html',
    'helautomatisk-kaffemaskin.html','helautomatisk-eller-espressomaskin.html',
    'kaffemaskin-for-hemmet.html','kaffemaskin-nordkunskap.html','espressomaskin-nordning.html',
    'kaffemaskin-under-5000.html','kaffemaskin-under-3000.html','kaffemaskin-under-10000.html',
    'kaffemaskin-med-mjolksystem.html','basta-kaffemaskinen-for-hemmet.html',
    'espressomaskin-for-nyborjare.html','kaffemaskin-med-kvarn.html','kaffebryggare.html',
    'espressomaskin.html','kaffemaskin-for-cappuccino.html'
  ]);

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function(){ window.dataLayer.push(arguments); };
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-H0SRDZ43FY';
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', 'G-H0SRDZ43FY');
  }

  const track = (event, params = {}) => {
    const payload = {event, ...params, ts:new Date().toISOString()};
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', event, params); } catch (_) {}
    }
  };

  const path = location.pathname.split('/').pop() || 'index.html';
  if (GUIDE_PATHS.has(path)) {
    track('guide_landing', {guide:path});
  }

  document.addEventListener('click', (event) => {
    const a = event.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const match = href.match(/(?:^|\/)index\.html#(finder|products)$/);
    if (!match) return;
    track('guide_conversion_click', {
      destination: match[1],
      source_path: location.pathname,
      link_text: (a.textContent || '').trim().slice(0,120)
    });
  });
})();