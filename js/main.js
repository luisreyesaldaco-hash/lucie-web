// Lucie Linková – Hypopresivní metoda
// Language switching is handled by separate pages (index.html / en/index.html).
// This file is reserved for shared UI interactions.

// ─── PROBLEM CARD MODALS ─────────────────────────────────────────────────────
const MODAL_DATA_EN = {
  tlak: {
    icon: '🫀',
    title: 'Pelvic pressure',
    body: `
      <p>A feeling of heaviness or downward pulling is one of the most common signs of an overloaded pelvic floor or early pelvic organ prolapse. Many women experience this mainly after prolonged standing, walking or physical exertion — and mistakenly attribute it to tiredness.</p>
      <p>The root cause is usually chronically elevated intra-abdominal pressure, which constantly overloads the pelvic floor. Classic strengthening exercises won't fix this — and for many women, they make it worse.</p>
      <p><strong>How the hypopressive method works differently:</strong></p>
      <ul>
        <li>Reduces intra-abdominal pressure and unloads the pelvic floor</li>
        <li>Supports the natural elevation of pelvic organs</li>
        <li>Restores coordination between the diaphragm and pelvic floor</li>
        <li>Results are typically noticeable after 6–8 weeks of regular practice</li>
      </ul>
      <p>If the pressure persists or worsens, I recommend a consultation with a gynaecologist or urogynaecologist — followed by targeted pelvic floor work.</p>
    `
  },
  brisko: {
    icon: '🤰',
    title: 'Bloated belly & diastasis',
    body: `
      <p>Diastasis recti — the separation of the midline abdominal connective tissue — is far more common than most people realise. It affects the majority of women after childbirth, but also men and women who have never been pregnant. It shows as a ridge or bulge down the centre of the abdomen, especially when sitting up or under strain.</p>
      <p>Ironically, classic exercises like crunches, sit-ups or planks deepen diastasis — they raise intra-abdominal pressure and pull the muscles further apart instead of bringing them together.</p>
      <p><strong>What actually helps:</strong></p>
      <ul>
        <li>Reducing intra-abdominal pressure — the foundation of the hypopressive method</li>
        <li>Activating the deep transverse abdominal muscle without surface overload</li>
        <li>Gradually restoring abdominal wall integrity</li>
        <li>Correct breathing patterns throughout daily activities</li>
      </ul>
      <p>Diastasis is treatable — but it requires patience and the right approach. It's never too late to start, even years after giving birth.</p>
    `
  },
  unik: {
    icon: '💧',
    title: 'Urinary leakage',
    body: `
      <p>Stress incontinence — leaking urine when coughing, laughing, jumping or running — is not an inevitable consequence of childbirth or ageing. It is a functional problem that can be systematically addressed.</p>
      <p>The issue often isn't that the pelvic floor is too weak. In many women it is actually overloaded and hypertonic — in which case traditional Kegel exercises won't help and may make things worse.</p>
      <p><strong>The hypopressive approach:</strong></p>
      <ul>
        <li>First assesses whether the issue is weakness or excessive tension</li>
        <li>Works with the whole system — diaphragm, abdominal muscles and pelvic floor together</li>
        <li>Trains the muscles to respond automatically — without conscious "squeezing"</li>
        <li>Reduces the pressure that causes leaks</li>
      </ul>
      <p>Research shows approximately one in three women experiences incontinence after childbirth. It isn't normal — and it is solvable.</p>
    `
  },
  zada: {
    icon: '🔥',
    title: 'Back pain',
    body: `
      <p>Chronic back pain — in the lumbar region, sacrum or neck — almost always shares one common denominator: a dysfunctional deep stabilising system. Surface muscles take over work they were never designed for, and they become overloaded.</p>
      <p>Classic physiotherapy or back-strengthening exercises may relieve symptoms temporarily. But if you don't engage the deep stabilisers — the diaphragm, pelvic floor and transverse abdominal muscle — the pain comes back.</p>
      <p><strong>What the hypopressive method brings:</strong></p>
      <ul>
        <li>Activation of the deep stabilising system (CORE) as a whole</li>
        <li>Reduction of chronic muscle tension in the paraspinal muscles</li>
        <li>Improved postural stability — the spine is naturally supported</li>
        <li>Lasting relief — not just for an hour after a session</li>
      </ul>
      <p>Many of my clients come primarily because of back pain — and leave with a sense of lightness they haven't felt in years.</p>
    `
  },
  reflux: {
    icon: '⚡',
    title: 'Reflux & digestive issues',
    body: `
      <p>Heartburn, acid reflux, bloating or a heavy feeling in the stomach — these complaints are typically treated with antacids or dietary changes. That can help short-term. But the cause is often elsewhere: in diaphragm tension.</p>
      <p>The diaphragm sits directly next to the oesophagus and stomach. When it is chronically stiff, it disrupts the function of the lower oesophageal sphincter and impairs the natural movement of food through the digestive tract. Every breath also gently massages the organs — when the diaphragm doesn't move freely, that massage is lost.</p>
      <p><strong>How the hypopressive method helps:</strong></p>
      <ul>
        <li>Releases chronic tension in the diaphragm</li>
        <li>Restores the natural breath-massage of digestive organs</li>
        <li>Activates the parasympathetic nervous system — essential for digestion</li>
        <li>Reduces intra-abdominal pressure, which worsens reflux</li>
      </ul>
      <p>Improvements in digestion are often one of the most pleasant surprises clients report after starting hypopressive training.</p>
    `
  },
  dech: {
    icon: '🌬️',
    title: 'Shallow breathing & inner tension',
    body: `
      <p>Shallow breathing, a feeling that you can't take a full breath, or persistent inner tension that never fully releases — these are signs that the diaphragm isn't free and the nervous system is overloaded.</p>
      <p>Breathing is the only bodily function that operates both automatically and consciously. That makes it the most direct route to the nervous system. By working with breath deliberately, you can shift from stress mode into recovery mode — literally within minutes.</p>
      <p><strong>What changes with hypopressive practice:</strong></p>
      <ul>
        <li>The diaphragm releases and breathing deepens</li>
        <li>The baseline level of tension in the body decreases</li>
        <li>Sleep quality and recovery improve</li>
        <li>The nervous system learns to reach calm more easily and quickly</li>
      </ul>
      <p>Breath isn't just physiology — it's the bridge between body and mind. The hypopressive method works with it intentionally and systematically.</p>
    `
  }
};

const MODAL_DATA = {
  tlak: {
    icon: '🫀',
    title: 'Tlak v pánvi',
    body: `
      <p>Pocit tahu nebo tlaku směrem dolů je jedním z nejčastějších příznaků přetíženého pánevního dna nebo počínajícího prolapsu pánevních orgánů. Mnoho žen tento pocit vnímá hlavně po delším stání, chůzi nebo fyzické námaze — a chybně ho přičítají únavě.</p>
      <p>Příčinou bývá chronicky zvýšený nitrobřišní tlak, který pánevní dno neustále přetěžuje. Klasické posilování situaci nezlepší — naopak, u mnoha žen ji zhorší.</p>
      <p><strong>Hypopresivní metoda pracuje jinak:</strong></p>
      <ul>
        <li>Snižuje nitrobřišní tlak a odlehčuje pánevní dno</li>
        <li>Podporuje přirozenou elevaci pánevních orgánů</li>
        <li>Obnovuje koordinaci mezi bránicí a pánevním dnem</li>
        <li>Výsledky jsou patrné již po 6–8 týdnech pravidelného cvičení</li>
      </ul>
      <p>Pokud pocit tlaku přetrvává nebo se zhoršuje, doporučuji konzultaci s gynekologem nebo urogynekologem — a následně zahájit cílenou práci s pánevním dnem.</p>
    `
  },
  brisko: {
    icon: '🤰',
    title: 'Vypouklé břicho a diastáza',
    body: `
      <p>Diastáza přímých břišních svalů — rozestup středové šlachy — je mnohem běžnější, než si myslíme. Postihuje většinu žen po porodu, ale i muže nebo ženy, které nikdy nerodily. Projevuje se jako vypouklý "ridge" uprostřed břicha, hlavně při sedu nebo námaze.</p>
      <p>Paradoxně, klasická cvičení jako sed-lehy, sklapovačky nebo plank diastázu prohlubují — zvyšují nitrobřišní tlak a táhnou svaly od sebe místo toho, aby je přibližovaly.</p>
      <p><strong>Co skutečně pomáhá:</strong></p>
      <ul>
        <li>Redukce nitrobřišního tlaku — základ hypopresivní metody</li>
        <li>Aktivace hlubokého příčného břišního svalu bez povrchového přetížení</li>
        <li>Postupné obnovení integrity břišní stěny</li>
        <li>Správné dechové vzorce při každodenních aktivitách</li>
      </ul>
      <p>Diastáza je řešitelná — ale vyžaduje trpělivost a správný přístup. Začít je možné kdykoli, i roky po porodu.</p>
    `
  },
  unik: {
    icon: '💧',
    title: 'Únik moči',
    body: `
      <p>Stresová inkontinence — únik moči při kašli, smíchu, skákání nebo běhu — není nevyhnutelným důsledkem porodu ani stárnutí. Je to funkční problém, který lze systematicky řešit.</p>
      <p>Problém často nespočívá v tom, že by pánevní dno bylo příliš slabé. U mnoha žen je naopak přetížené a hypertoniální — v takovém případě tradiční Kegelovy cviky situaci nezlepší a mohou ji zhoršit.</p>
      <p><strong>Hypopresivní přístup:</strong></p>
      <ul>
        <li>Nejprve zjistí, zda je problém v oslabení nebo v napětí svalů</li>
        <li>Pracuje s celým systémem — bránicí, břišními svaly i pánevním dnem najednou</li>
        <li>Učí svaly reagovat automaticky — bez vědomého "mačkání"</li>
        <li>Snižuje tlak, který způsobuje úniky</li>
      </ul>
      <p>Výzkumy ukazují, že přibližně každá třetí žena po porodu řeší inkontinenci. Není to normální — je to řešitelné.</p>
    `
  },
  zada: {
    icon: '🔥',
    title: 'Bolest zad',
    body: `
      <p>Chronická bolest zad — v bedrech, křížové oblasti nebo krční páteři — má ve většině případů jednoho společného jmenovatele: nefunkční hluboký stabilizační systém. Povrchové svaly přebírají práci, na kterou nestačí, a přetěžují se.</p>
      <p>Klasická fyzioterapie nebo posilování zad symptomy dočasně zmírní, ale pokud nezapojíte hluboké stabilizátory — bránici, pánevní dno a příčný břišní sval — bolest se vrací.</p>
      <p><strong>Co hypopresivní metoda přináší:</strong></p>
      <ul>
        <li>Aktivaci hlubokého stabilizačního systému (CORE) jako celku</li>
        <li>Snížení chronického svalového napětí v paravertebrálních svalech</li>
        <li>Zlepšení posturální stability — páteř je přirozeně podpořena</li>
        <li>Úlevu, která přetrvává — ne jen po hodině fyzioterapie</li>
      </ul>
      <p>Mnoho mých klientek přichází primárně kvůli bolestem zad — a odchází s pocitem lehkosti, který nezažívaly roky.</p>
    `
  },
  reflux: {
    icon: '⚡',
    title: 'Reflux a trávicí potíže',
    body: `
      <p>Pálení žáhy, reflux, nadýmání nebo pocit těžkého žaludku — tyto obtíže bývají léčeny antacidy nebo dietními úpravami. To může pomoci krátkodobě. Ale příčina je často jinde: v napětí bránice.</p>
      <p>Bránice přímo sousedí s jícnem a žaludkem. Pokud je chronicky ztuhlá, narušuje funkci jícnového svěrače a zhoršuje přirozený pohyb potravy trávicím traktem. Každý pohyb bránice zároveň masíruje orgány — pokud bránice nefunguje, tato masáž chybí.</p>
      <p><strong>Jak hypopresivní metoda pomáhá:</strong></p>
      <ul>
        <li>Uvolňuje chronické napětí v bránici</li>
        <li>Obnovuje přirozenou masáž trávicích orgánů dechem</li>
        <li>Aktivuje parasympatický nervový systém — klíčový pro trávení</li>
        <li>Snižuje nitrobřišní tlak, který reflux zhoršuje</li>
      </ul>
      <p>Výsledky v oblasti trávení bývají jedním z nejpříjemnějších překvapení, které klientky hlásí po zahájení hypopresivního tréninku.</p>
    `
  },
  dech: {
    icon: '🌬️',
    title: 'Napjatý dech a vnitřní napětí',
    body: `
      <p>Povrchový dech, pocit, že se nemůžete pořádně nadechnout, nebo chronické vnitřní napětí, které nikdy úplně neustoupí — to jsou signály, že bránice není volná a nervový systém je přetížen.</p>
      <p>Dech je jediná tělesná funkce, která probíhá jak automaticky, tak vědomě. Proto je nejpřímějším přístupem k nervovému systému. Vědomou prací s dechem lze přejít ze stresového režimu do regeneračního — a to doslova během několika minut.</p>
      <p><strong>Co se mění s hypopresivním cvičením:</strong></p>
      <ul>
        <li>Bránice se uvolňuje a dech se prohlubuje</li>
        <li>Snižuje se bazální úroveň napětí v těle</li>
        <li>Zlepšuje se kvalita spánku a regenerace</li>
        <li>Nervový systém se učí přecházet do klidu snáz a rychleji</li>
      </ul>
      <p>Dech není jen fyziologie — je to most mezi tělem a myslí. A hypopresivní metoda s ním pracuje záměrně a systematicky.</p>
    `
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('probModal');
  if (!overlay) return;

  const closeBtn = document.getElementById('probModalClose');
  const iconEl   = document.getElementById('probModalIcon');
  const titleEl  = document.getElementById('probModalTitle');
  const bodyEl   = document.getElementById('probModalBody');

  const isEN = document.documentElement.lang === 'en';
  const dataset = isEN ? MODAL_DATA_EN : MODAL_DATA;

  function openModal(key) {
    const data = dataset[key];
    if (!data) return;
    iconEl.textContent  = data.icon;
    titleEl.textContent = data.title;
    bodyEl.innerHTML    = data.body;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Card clicks
  document.querySelectorAll('.prob-card[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card.dataset.modal); }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

// ─── MOBILE HAMBURGER MENU ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  const navLinks = document.querySelector('.nav-links');
  if (!nav || !navLinks) return;

  // Inject hamburger button into nav
  const btn = document.createElement('button');
  btn.className = 'nav-hamburger';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(btn);

  // Build mobile drawer by cloning existing nav links
  const drawer = document.createElement('div');
  drawer.className = 'nav-mobile';
  navLinks.querySelectorAll('li').forEach(li => {
    if (li.classList.contains('has-dropdown')) {
      const label = document.createElement('span');
      label.className = 'nav-mobile-label';
      label.textContent = li.querySelector(':scope > a').textContent.trim();
      drawer.appendChild(label);
      li.querySelectorAll('.nav-dropdown a').forEach(a => {
        const clone = a.cloneNode(true);
        clone.classList.add('nav-mobile-sub');
        drawer.appendChild(clone);
      });
    } else {
      const a = li.querySelector('a');
      if (a) drawer.appendChild(a.cloneNode(true));
    }
  });
  nav.insertAdjacentElement('afterend', drawer);

  // Toggle open/close
  btn.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close drawer when a link is tapped
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
});

// Highlight active nav link based on scroll position
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              'nav-active',
              link.getAttribute('href') === '#' + entry.target.id
            );
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((s) => observer.observe(s));
});
