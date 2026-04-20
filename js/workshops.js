/* ─────────────────────────────────────────────────────────────
   WORKSHOPS DATA
   Edit here to add / remove workshop projects and dates.
   Dates with iso < today are automatically hidden.
   ───────────────────────────────────────────────────────────── */
window.workshopsData = [
  {
    id: 'dech-panevni-dno',
    label: 'Projekt 01',
    title: 'Dech a pánevní dno',
    subtitle: 'Hypopresivní metoda + vědomý dech',
    tags: ['Hypopresivní', 'Pranajáma'],
    guides: [
      {
        name: 'Lucie Linková',
        photo: '/assets/images/lucie-new.jpeg',
        role: 'Hypopresivní metoda',
        bio: 'Vědomá práce s nitrobřišním tlakem, bránicí a pánevním dnem. Lucie vás provede technikou, která aktivuje hluboký stabilizační systém — bez síly, bez přetěžování. Tělo se učí fungovat efektivněji prostřednictvím dechu a polohy.',
        instagram: '@bodyease_hypopressive',
        igUrl: 'https://instagram.com/bodyease_hypopressive'
      },
      {
        name: 'Katka',
        photo: '/assets/images/katka.jpeg',
        role: 'Pranajáma · vědomý dech',
        bio: 'Pranajáma je starobylá jógová praxe vědomé práce s dechem — přímý vstup do nervové soustavy. Prostřednictvím prodlouženého výdechu, zadržení dechu a střídavého dýchání Katka zklidňuje mysl, reguluje stres a prohlubuje vědomí těla.',
        instagram: '@breathart_katerina',
        igUrl: 'https://instagram.com/breathart_katerina'
      }
    ],
    dates: [
      {
        iso: '2026-04-26',
        monthLabel: 'Duben',
        time: '9:15 – 11:15',
        location: 'Studio jógy · Vršovice',
        capacity: 10,
        extras: [],
        price: 1500,
        brunch: true,
        bookingUrl: 'https://docs.google.com/forms/d/1cal5NTOLQ7MFXRznwiBadaxSZd5c7jeMXGnpkfDI_wY/viewform'
      },
      {
        iso: '2026-06-13',
        monthLabel: 'Červen',
        time: '9:15 – 11:15',
        location: 'Grébovka · venku',
        capacity: 20,
        extras: ['Outdoor'],
        price: 1500,
        brunch: true,
        bookingUrl: 'https://docs.google.com/forms/d/1cal5NTOLQ7MFXRznwiBadaxSZd5c7jeMXGnpkfDI_wY/viewform',
        locationInfo: {
          icon: '🌿',
          titleHtml: 'Milujeme <em>Grébovku</em>',
          body: 'Ranní klid, čerstvý vzduch, rozkvetlá zeleň… a do toho jemné cvičení, které tě probudí.'
        }
      },
      {
        iso: '2026-09-19',
        monthLabel: 'Září',
        time: '9:30 – 11:00',
        location: 'Solná jeskyně · Praha',
        capacity: 7,
        extras: ['Solná jeskyně'],
        price: 1500,
        brunch: false,
        bookingUrl: 'https://docs.google.com/forms/d/1cal5NTOLQ7MFXRznwiBadaxSZd5c7jeMXGnpkfDI_wY/viewform',
        locationInfo: {
          icon: '✦',
          titleHtml: 'Síla <em>solné jeskyně</em>',
          body: 'Solná jeskyně přirozeně podporuje dýchací cesty, zklidňuje organismus a pomáhá uvolnit napětí. Mikroklima s obsahem minerálů může přispět ke zlepšení imunity, kvalitnějšímu dýchání a celkovému zklidnění.',
          badgeLabel: '✦ Proč solná jeskyně'
        }
      }
    ]
  }
  // Add new projects here. Example:
  // {
  //   id: 'yoga-hypopresivo',
  //   label: 'Projekt 02',
  //   title: 'Yoga + Hypopresivo',
  //   subtitle: 'Vinyasa + hluboký stabilizační systém',
  //   tags: ['Hypopresivní', 'Yoga'],
  //   guides: [
  //     { name: 'Lucie Linková', photo: '/assets/images/lucie-new.jpeg', role: '...', bio: '...', instagram: '@...', igUrl: '...' },
  //     { name: '[Yoga Teacher]', photo: '/assets/images/...', role: '...', bio: '...', instagram: '@...', igUrl: '...' }
  //   ],
  //   dates: [ … ]
  // }
];

(function() {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // Czech plural: 1 termín · 2–4 termíny · 5+ termínů
  const pluralTermin = n => {
    if (n === 1) return '1 termín';
    if (n >= 2 && n <= 4) return `${n} termíny`;
    return `${n} termínů`;
  };

  function render(data, container) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const active = data
      .map(p => ({ ...p, dates: p.dates.filter(d => new Date(d.iso) >= today) }))
      .filter(p => p.dates.length > 0);

    if (active.length === 0) {
      container.innerHTML = '<p class="ws-no-events">Momentálně nejsou vypsané nové termíny. Brzy připravujeme další.</p>';
      return;
    }

    // Registry for location-info popups (keyed per date)
    const locationInfoMap = {};

    const renderGuides = guides => !guides || !guides.length ? '' : `
      <div class="ws-project-guides" style="--guides-count: ${guides.length}">
        <div class="ws-project-subsection-label ws-guides-label">Kdo vás povede</div>
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

    // Open-by-default rule: single project → open. Multiple → only the first.
    container.innerHTML = active.map((p, i) => {
      const isOpen = active.length === 1 || i === 0;
      return `
      <details class="ws-project"${isOpen ? ' open' : ''}>
        <summary class="ws-project-top">
          <div class="ws-project-badges">
            <span class="ws-project-num">${esc(p.label)}</span>
            <span class="ws-project-count">${esc(pluralTermin(p.dates.length))}</span>
          </div>
          <h3 class="ws-project-title">${esc(p.title)}</h3>
          <p class="ws-project-sub">${esc(p.subtitle)}</p>
          <div class="ws-project-tags">
            ${p.tags.map(t => `<span class="ws-event-tag">${esc(t)}</span>`).join('')}
          </div>
          <span class="ws-project-chevron" aria-hidden="true">▾</span>
        </summary>
        ${renderGuides(p.guides)}
        <div class="ws-project-dates">
          <div class="ws-project-subsection-label">Nadcházející termíny</div>
          ${p.dates.map(d => {
            const day = new Date(d.iso).getDate();
            const hasInfo = !!d.locationInfo;
            const infoKey = `${p.id}--${d.iso}`;
            if (hasInfo) locationInfoMap[infoKey] = d.locationInfo;
            const locEl = hasInfo
              ? `<button type="button" class="ws-date-loc ws-date-loc-btn" data-ws-info="${esc(infoKey)}">${esc(d.location)} <span class="ws-loc-icon" aria-hidden="true">ⓘ</span></button>`
              : `<h4 class="ws-date-loc">${esc(d.location)}</h4>`;
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
                    <span>Max ${d.capacity} osob</span>
                    ${d.extras.map(e => `<span class="ws-date-extra">${esc(e)}</span>`).join('')}
                  </div>
                  ${d.brunch ? `<button type="button" class="ws-brunch-badge" data-ws-modal="brunch">✦ Brunch + káva v ceně</button>` : ''}
                  ${hasInfo && d.locationInfo.badgeLabel ? `<button type="button" class="ws-brunch-badge" data-ws-info="${esc(infoKey)}">${esc(d.locationInfo.badgeLabel)}</button>` : ''}
                </div>
                <div class="ws-date-actions">
                  <span class="ws-date-price">${d.price.toLocaleString('cs-CZ')} Kč</span>
                  <a href="${esc(d.bookingUrl)}" target="_blank" rel="noopener" class="btn-event">Přihlásit se →</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </details>
    `;
    }).join('');

    window.__wsLocationInfo = locationInfoMap;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('ws-projects-container');
    if (container && Array.isArray(window.workshopsData)) {
      render(window.workshopsData, container);
    }
  });
})();
