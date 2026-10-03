(() => {
  const slots = [...document.querySelectorAll('[data-guide-products]')];
  if (!slots.length) return;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const priceOf = (p) => {
    const offers = Array.isArray(p?.affiliate_offers) ? p.affiliate_offers : [];
    const priced = offers.filter(o => Number(o?.price) > 0).sort((a,b) => Number(a.price) - Number(b.price));
    return priced[0] || offers[0] || null;
  };

  const imageOf = (p) => p?.images?.primary || '';

  const renderProduct = (p, placement) => {
    const offer = priceOf(p);
    if (!offer?.url) return '';
    const price = Number(offer.price) > 0 ? Number(offer.price).toLocaleString('sv-SE') + ' kr' : 'Se butik';
    const image = imageOf(p);
    const title = [p.brand, p.model].filter(Boolean).join(' ');
    const detail = Array.isArray(p.tags) && p.tags.length ? p.tags.slice(0, 2).join(' · ') : '';
    return `<article class="guide-product">
      <div class="guide-product-image">${image ? `<img src="${esc(image)}" alt="${esc(title)}" loading="lazy">` : ''}</div>
      <div class="guide-product-body">
        <span class="guide-product-label">FINNS I BIBLIOTEKET</span>
        <h3>${esc(title)}</h3>
        ${detail ? `<p class="guide-product-meta">${esc(detail)}</p>` : ''}
        <div class="guide-product-bottom">
          <strong>${price}</strong>
          <a href="${esc(offer.url)}" target="_blank" rel="sponsored nofollow noopener"
             data-guide-affiliate="${esc(p.id)}" data-placement="${esc(placement)}"
             data-merchant="${esc(offer.merchant || '')}" data-network="${esc(offer.network || '')}">
            Kolla produkten →
          </a>
        </div>
      </div>
    </article>`;
  };

  const renderSlot = (slot, products) => {
    const ids = String(slot.dataset.guideProducts || '').split(',').map(x => x.trim()).filter(Boolean);
    const selected = ids.map(id => products.find(p => p.id === id)).filter(Boolean);
    if (!selected.length) return;
    const placement = slot.dataset.guidePlacement || 'guide';
    const label = selected.length === 1 ? 'EN SAK ATT KIKA PÅ' : 'ETT PAR SAKER ATT KIKA PÅ';
    slot.innerHTML = `<div class="guide-product-head"><span class="eyebrow">${label}</span></div><div class="guide-product-grid">${selected.map(p => renderProduct(p, placement)).join('')}</div>`;
    slot.querySelectorAll('[data-guide-affiliate]').forEach(link => {
      link.addEventListener('click', () => {
        const params = {product_id:link.dataset.guideAffiliate,placement:link.dataset.placement,merchant:link.dataset.merchant,network:link.dataset.network};
        if (typeof window.gtag === 'function') { try { window.gtag('event', 'affiliate_click', params); } catch (_) {} }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({event:'affiliate_click', ...params, ts:new Date().toISOString()});
      });
    });
  };

  Promise.all([fetch('data/products.json'), fetch('data/grinders.json')]).then(async ([a,b]) => {
    if (!a.ok || !b.ok) throw new Error('Produktdata kunde inte laddas');
    const products = [...await a.json(), ...await b.json()].filter(p =>
      p?.lifecycle_status === 'active' && (p?.images?.status === 'approved' || p?.images?.status === 'no_suitable_image')
    );
    slots.forEach(slot => renderSlot(slot, products));
  }).catch(() => {});
})();
