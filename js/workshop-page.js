/* ─────────────────────────────────────────────────────────
   WORKSHOP PAGE RENDERER
   Reads /content/workshop.{cs,en}.json based on <html lang>
   and renders the entire page body into #ws-root.
   Edit content in the JSON files, not here.
   ───────────────────────────────────────────────────────── */
(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // Czech-style plural picker: 1 / 2-4 / 5+
  const pluralTermin = (n, c) => {
    if (n === 1) return c.terminOne;
    const key = n >= 2 && n <= 4 ? 'terminFew' : 'terminMany';
    return (c[key] || '{n}').replace('{n}', n);
  };

  // ───── SECTION RENDERERS ─────

  const renderHero = h => `
    <div class="ws-hero">
      <div class="ws-hero-inner">
        <div class="s-tag">${esc(h.tag)}</div>
        <h1>${h.titleHtml || ''}</h1>
        <p class="ws-hero-sub">${esc(h.sub)}</p>
        <div class="ws-hero-pills">
          ${(h.pills || []).map(p =>
            `<div class="ws-hero-pill"><strong>${esc(p.strong)}</strong> · ${esc(p.text)}</div>`
          ).join('')}
        </div>
        <a href="${esc(h.ctaHref)}" class="btn-main">${esc(h.ctaText)}</a>
      </div>
    </div>
  `;

  const renderGuides = (guides, events) => {
    if (!guides || !guides.length) return '';
    return `
      <div class="ws-project-guides" style="--guides-count: ${guides.length}">
        <div class="ws-project-subsection-label ws-guides-label">${esc(events.guidesSubsectionLabel)}</div>
        <div class="ws-guides-diptych">
          <div class="ws-guides-photos">
            ${guides.map(g => `<img src="${esc(g.photo)}" alt="${esc(g.name)}" class="ws-guide-photo-large" loading="lazy">`).join('')}
          </div>
          ${guides.length === 2 ? `<span class="ws-guides-connector" aria-hidden="true">×</span>` : ''}
        </div>
        <div class="ws-guides-info">
          ${guides.map(g => `
            <div class="ws-guide-info">
              <div class="ws-guide-role">${esc(g.role)}</div>
              <h4 class="ws-guide-name">${esc(g.name)}</h4>
              ${g.bio ? `<p class="ws-guide-bio">${esc(g.bio)}</p>` : ''}
              ${g.igUrl ? `<a href="${esc(g.igUrl)}" target="_blank" rel="noopener" class="ws-guide-ig">${esc(g.instagram || 'Instagram')} →</a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  const renderDate = (d, p, events, modals, locationInfoMap) => {
    const day = new Date(d.iso).getDate();
    const hasInfo = !!d.locationInfo;
    const infoKey = `${p.id}--${d.iso}`;
    if (hasInfo) locationInfoMap[infoKey] = d.locationInfo;

    const locEl = hasInfo
      ? `<button type="button" class="ws-date-loc ws-date-loc-btn" data-ws-info="${esc(infoKey)}">${esc(d.location)} <span class="ws-loc-icon" aria-hidden="true">ⓘ</span></button>`
      : `<h4 class="ws-date-loc">${esc(d.location)}</h4>`;

    const priceStr = d.price.toLocaleString(events.locale || 'cs-CZ') + ' ' + (events.currency || 'Kč');
    const capacityStr = (events.maxCapacityLabel || 'Max {n}').replace('{n}', d.capacity);

    return `
      <div class="ws-date">
        <div class="ws-date-day">
          <span class="ws-date-mo">${esc(d.monthLabel)}</span>
          <span class="ws-date-num">${day}</span>
        </div>
        <div class="ws-date-body">
          ${locEl}
          <div class="ws-date-meta">
            <span>${esc(d.time)}</span>
            <span>${esc(capacityStr)}</span>
            ${(d.extras || []).map(e => `<span class="ws-date-extra">${esc(e)}</span>`).join('')}
          </div>
          ${d.brunch && modals?.brunch?.badgeLabel ? `<button type="button" class="ws-brunch-badge" data-ws-modal="brunch">${esc(modals.brunch.badgeLabel)}</button>` : ''}
          ${hasInfo && d.locationInfo.badgeLabel ? `<button type="button" class="ws-brunch-badge" data-ws-info="${esc(infoKey)}">${esc(d.locationInfo.badgeLabel)}</button>` : ''}
        </div>
        <div class="ws-date-actions">
          <span class="ws-date-price">${esc(priceStr)}</span>
          <a href="${esc(d.bookingUrl)}" target="_blank" rel="noopener" class="btn-event">${esc(events.bookingCta)}</a>
        </div>
      </div>
    `;
  };

  const renderEvents = (content, locationInfoMap) => {
    const { events, projects = [], modals } = content;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = projects
      .map(p => ({ ...p, dates: (p.dates || []).filter(d => new Date(d.iso) >= today) }))
      .filter(p => p.dates.length > 0);

    const projectsHtml = active.length === 0
      ? `<p class="ws-no-events">${esc(events.noEventsText)}</p>`
      : active.map((p, i) => {
          const isOpen = active.length === 1 || i === 0;
          return `
            <details class="ws-project"${isOpen ? ' open' : ''}>
              <summary class="ws-project-top">
                <div class="ws-project-badges">
                  <span class="ws-project-num">${esc(p.label)}</span>
                  <span class="ws-project-count">${esc(pluralTermin(p.dates.length, events))}</span>
                </div>
                <h3 class="ws-project-title">${esc(p.title)}</h3>
                <p class="ws-project-sub">${esc(p.subtitle)}</p>
                <div class="ws-project-tags">
                  ${(p.tags || []).map(t => `<span class="ws-event-tag">${esc(t)}</span>`).join('')}
                </div>
                <span class="ws-project-chevron" aria-hidden="true">▾</span>
              </summary>
              ${renderGuides(p.guides, events)}
              <div class="ws-project-dates">
                <div class="ws-project-subsection-label">${esc(events.datesSubsectionLabel)}</div>
                ${p.dates.map(d => renderDate(d, p, events, modals, locationInfoMap)).join('')}
              </div>
            </details>
          `;
        }).join('');

    return `
      <div class="ws-section" id="ws-events">
        <div class="s-tag">${esc(events.tag)}</div>
        <h2>${events.titleHtml || ''}</h2>
        <p style="font-size:0.9rem;color:var(--mid);font-weight:300;max-width:560px;margin-bottom:2.5rem;line-height:1.75;">${esc(events.intro)}</p>
        <div class="ws-projects-container">${projectsHtml}</div>
      </div>
    `;
  };

  const renderPractical = (practical, storno) => `
    <div class="ws-section ws-section-dark">
      <div class="s-tag" style="color:var(--terra-light);border-color:rgba(184,98,58,0.3);">${esc(practical.tag)}</div>
      <h2 style="text-align:center;margin-bottom:0.5rem;">${practical.titleHtml || ''}</h2>
      <p style="text-align:center;font-size:0.87rem;color:rgba(253,250,246,0.45);font-weight:300;margin-bottom:0;">${esc(practical.subtitle)}</p>
      <div class="ws-info-grid">
        <div class="ws-price-block">
          <div class="ws-price-num">${esc(practical.price.amount)}</div>
          <div class="ws-price-desc">${esc(practical.price.desc)}</div>
          <div class="ws-price-note">${practical.price.noteHtml || ''}</div>
        </div>
        <div class="ws-info-block">
          <h4>${esc(practical.included.title)}</h4>
          <ul>${(practical.included.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="ws-info-block">
          <h4>${esc(practical.bring.title)}</h4>
          <ul>${(practical.bring.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
      </div>
      ${storno ? renderStorno(storno) : ''}
    </div>
  `;

  const renderStorno = storno => `
    <div class="ws-storno">
      <h4 class="ws-storno-title">${esc(storno.title)}</h4>
      <p class="ws-storno-intro">${esc(storno.intro)}</p>
      <div class="ws-storno-tiers">
        ${(storno.tiers || []).map(t => `
          <div class="ws-storno-tier${t.isZero ? ' ws-storno-tier-zero' : ''}">
            <div class="ws-storno-pct">${esc(t.pct)}</div>
            <div class="ws-storno-label">${esc(t.label)}</div>
            <div class="ws-storno-when">${esc(t.when)}</div>
          </div>
        `).join('')}
      </div>
      <p class="ws-storno-note">${esc(storno.note)}</p>
    </div>
  `;

  const renderArchive = a => `
    <div class="ws-section ws-section-alt">
      <div class="s-tag" style="justify-content:center;">${esc(a.tag)}</div>
      <h2 style="text-align:center;">${a.titleHtml || ''}</h2>
      <div class="ws-archive-empty"><p>${a.emptyHtml || ''}</p></div>
    </div>
  `;

  const renderContact = c => `
    <div class="ws-section" style="text-align:center;">
      <div class="s-tag" style="justify-content:center;">${esc(c.tag)}</div>
      <h2>${c.titleHtml || ''}</h2>
      <p style="font-size:0.93rem;color:var(--mid);font-weight:300;max-width:400px;margin:0 auto 2rem;line-height:1.75;">${esc(c.sub)}</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <a href="${esc(c.phoneHref)}" class="btn-main">${esc(c.phone)}</a>
        <a href="${esc(c.emailHref)}" class="btn-ghost" style="font-size:0.9rem;">${esc(c.email)}</a>
      </div>
    </div>
  `;

  // ───── MODAL SETUP ─────

  function populateBrunchModal(modals) {
    const m = document.getElementById('wsBrunchModal');
    if (!m || !modals?.brunch) return;
    const b = modals.brunch;
    m.querySelector('[data-brunch-icon]').textContent = b.icon || '';
    m.querySelector('[data-brunch-title]').innerHTML = b.titleHtml || '';
    m.querySelector('[data-brunch-body]').textContent = b.body || '';
    const list = m.querySelector('[data-brunch-items]');
    list.innerHTML = (b.itemsHtml || []).map(i => `<li>${i}</li>`).join('');
    m.querySelector('[data-brunch-footnote]').textContent = b.footnote || '';
    // Close button labels
    m.querySelectorAll('[data-close]').forEach(el => el.setAttribute('aria-label', modals.closeLabel || 'Close'));
  }

  function setupModalInteractions(locationInfoMap) {
    const brunchModal = document.getElementById('wsBrunchModal');
    const infoModal = document.getElementById('wsInfoModal');
    if (!brunchModal && !infoModal) return;

    const open = m => { m.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
    const close = m => { m.classList.remove('is-open'); document.body.style.overflow = ''; };
    const closeAll = () => [brunchModal, infoModal].forEach(m => m && close(m));

    const populateInfo = ({ icon, titleHtml, body }) => {
      infoModal.querySelector('[data-modal-icon]').textContent = icon || '';
      infoModal.querySelector('[data-modal-title]').innerHTML = titleHtml || '';
      infoModal.querySelector('[data-modal-body]').textContent = body || '';
    };

    document.addEventListener('click', e => {
      const brunchBtn = e.target.closest('[data-ws-modal="brunch"]');
      if (brunchBtn && brunchModal) { open(brunchModal); return; }

      const infoBtn = e.target.closest('[data-ws-info]');
      if (infoBtn && infoModal) {
        const info = locationInfoMap[infoBtn.dataset.wsInfo];
        if (info) { populateInfo(info); open(infoModal); }
      }
    });

    [brunchModal, infoModal].forEach(m => {
      if (!m) return;
      const closeBtn = m.querySelector('[data-close]');
      if (closeBtn) closeBtn.addEventListener('click', () => close(m));
      m.addEventListener('click', e => { if (e.target === m) close(m); });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAll();
    });
  }

  // ───── ORCHESTRATOR ─────

  async function init() {
    const root = document.getElementById('ws-root');
    if (!root) return;

    const lang = document.documentElement.lang === 'en' ? 'en' : 'cs';
    const resp = await fetch(`/content/workshop.${lang}.json`);
    if (!resp.ok) {
      console.error('Failed to load workshop content:', resp.status);
      return;
    }
    const content = await resp.json();

    const locationInfoMap = {};

    root.innerHTML =
      renderHero(content.hero) +
      renderEvents(content, locationInfoMap) +
      renderPractical(content.practical, content.storno) +
      renderArchive(content.archive) +
      renderContact(content.contact);

    populateBrunchModal(content.modals);
    setupModalInteractions(locationInfoMap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
