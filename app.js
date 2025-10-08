const view = document.getElementById('view');
const pageTitle = document.getElementById('pageTitle');
const foot = document.getElementById('foot');
const btnBack = document.getElementById('btnBack');
btnBack.classList.add('hidden');
const btnHome = document.getElementById('btnHome');

function setPageTitle(title) {
  pageTitle.textContent = title || 'Swimming Rules';
}

let DATA = null;
let INF = null;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

btnBack.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else location.hash = '';
});

btnHome.addEventListener('click', () => {
  location.hash = '';
});

// Prevent visible flicker when returning home
window.addEventListener('hashchange', () => {
  if (!location.hash || location.hash === '#') {
    btnBack.classList.add('hidden');
    btnHome.classList.add('hidden');
  }
}, { capture: true });

window.addEventListener('hashchange', route);

async function init() {
  const [rulesRes, infraRes] = await Promise.all([
    fetch('rules.json'),
    fetch('infractions.json')
  ]);
  DATA = await rulesRes.json();
  INF = await infraRes.json();
  route();
}

function route() {
  const hash = location.hash.slice(1);

  if (!hash) {
    btnBack.classList.add('hidden');
    btnHome.classList.add('hidden');
    return renderHome();
  }

  const parts = hash.split('/');

  // Show buttons for all non-home pages
  btnBack.classList.remove('hidden');
  btnHome.classList.remove('hidden');

  if (parts[0] === 'cat' && parts[1]) renderCategory(parts[1]);
  else if (parts[0] === 'other' && parts[1]) renderOther(parts[1]);
  else if (parts[0] === 'infractions') renderInfractions();
  else if (parts[0] === 'useful') renderUseful();
  else if (parts[0] === 'checklist') renderChecklist();
  else if (parts[0] === 'link') handleLink(parts);
  else {
    btnBack.classList.add('hidden');
    btnHome.classList.add('hidden');
    renderHome();
  }
}

function setFootnote(text) {
  foot.textContent = text || '';
}

/* =====================
   HOME SCREEN + GLOBAL SEARCH
===================== */
function renderHome() {
  setPageTitle('Swimming Rules');
  btnBack.classList.add('hidden');
  btnHome.classList.add('hidden');

  view.innerHTML = `
    <div class="search-container">
      <input class="search" id="search" placeholder="Search all rules…" />
      <button id="clearSearch" class="clear-btn" title="Clear search">✕</button>
    </div>
    <div class="grid" id="homeGrid">
      <a class="tile stroke" href="#cat/freestyle">Freestyle</a>
      <a class="tile stroke" href="#cat/backstroke">Backstroke</a>
      <a class="tile stroke" href="#cat/breaststroke">Breaststroke</a>
      <a class="tile stroke" href="#cat/butterfly">Butterfly</a>
      <a class="tile" href="#other/the-start">The Start</a>
      <a class="tile" href="#other/medley">Medley Swimming</a>
      <a class="tile" href="#other/the-race">The Race</a>
      <a class="tile" href="#other/swimwear">Swimwear & Wearables</a>
      <a class="tile" href="#infractions">Infraction Sheet</a>
      <a class="tile" href="#useful">Useful</a>
    </div>
    <div id="searchResults"></div>
  `;
  setFootnote('');

  const input = document.getElementById('search');
  const clearBtn = document.getElementById('clearSearch');
  const grid = document.getElementById('homeGrid');
  const results = document.getElementById('searchResults');

  // Clear button
  clearBtn.addEventListener('click', () => {
    input.value = '';
    grid.style.display = 'grid';
    results.innerHTML = '';
    clearBtn.style.display = 'none';
  });

  input.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    clearBtn.style.display = q ? 'block' : 'none';
    if (!q) {
      grid.style.display = 'grid';
      results.innerHTML = '';
      return;
    }

    grid.style.display = 'none';

    const allRules = DATA.categories.flatMap(cat =>
      (cat.rules || []).map(r => ({
        ...r,
        category: cat.name,
        link: `#cat/${cat.code}/${r.id}`
      }))
    );

    const otherRules =
      DATA.categories.find(c => c.code === 'other')?.submenu.flatMap(sub =>
        (sub.rules || []).map(r => ({
          ...r,
          category: sub.name,
          link: `#other/${sub.code}/${r.id}`
        }))
      ) || [];

    const matches = [...allRules, ...otherRules].filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      results.innerHTML = `<p>No matching rules found.</p>`;
      return;
    }

    // Highlight matches
    const highlight = (text) =>
      text.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>');

    results.innerHTML = matches
      .map(
        r => `
      <article class="card">
        <div class="small"><span class="code">${r.id}</span> — ${r.category}</div>
        <h2><a href="${r.link}" style="color:var(--blue);text-decoration:none;">${highlight(r.title)}</a></h2>
        <div>${highlight(r.body)}</div>
      </article>`
      )
      .join('');
  });
}

/* =====================
   USEFUL PAGE
===================== */
function renderUseful() {
  setPageTitle('Useful');
  view.innerHTML = `
    <div class="grid">
      <a class="tile" href="#checklist">Checklist</a>
    </div>
  `;
  setFootnote('');
}

/* =====================
   CHECKLIST PAGE
===================== */
function renderChecklist() {
  setPageTitle('Checklist');
  const items = [
    '2 Stopwatches',
    '2 Pens',
    '2 Folders',
    'Towel',
    'Fan',
    'Folding chair',
    'Coin for locker',
    'Parking pass',
    'Snacks',
    'Lunch',
    'Water bottle',
    'Electrolytes'
    
  ];

  const listHTML = items
    .map(
      item => `
      <label style="display:flex;align-items:center;gap:0.6rem;margin:0.4rem 0;">
        <input type="checkbox" class="check-item" />
        <span>${item}</span>
      </label>`
    )
    .join('');

  view.innerHTML = `
    <button id="resetChecklist" class="btn" style="margin-bottom:1rem;">Reset</button>
    <div>${listHTML}</div>
  `;
  setFootnote('');

  const resetBtn = document.getElementById('resetChecklist');
  const checkboxes = document.querySelectorAll('.check-item');

  resetBtn.addEventListener('click', () => {
    checkboxes.forEach(cb => (cb.checked = false));
  });
}

/* =====================
   CATEGORY PAGE
===================== */
function renderCategory(code, targetId) {
  const cat = DATA.categories.find(c => c.code === code);
  if (!cat) return (view.innerHTML = `<p>Category not found.</p>`);
  setPageTitle(cat.name);

  const items = (cat.rules || [])
    .map(
      r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`
    )
    .join('');

  view.innerHTML = items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);
}

/* =====================
   OTHER PAGES
===================== */
function renderOther(code, targetId) {
  const other = DATA.categories.find(c => c.code === 'other');
  const page = (other.submenu || []).find(x => x.code === code);
  if (!page) return renderOtherHome();

  setPageTitle(page.name);

  const items = (page.rules || [])
    .map(
      r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`
    )
    .join('');

  view.innerHTML = items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);
}

/* =====================
   INFRACTIONS
===================== */
function renderInfractions() {
  setPageTitle('Infraction Sheet');
  let html = '';
  for (const group of INF) {
    html += `
      <details class="collapsible">
        <summary>${group.section}</summary>
        <div class="card" style="margin:0;border:none;box-shadow:none;padding:0;">
          <table><tbody>
            ${group.infractions
              .map(
                item => `
              <tr>
                <td style="width:70%">${item.description}</td>
                <td style="width:30%;text-align:right">
                  <a href="${item.link || '#'}" class="code" style="color:#0b57d0;text-decoration:underline;">${item.rule}</a>
                </td>
              </tr>`
              )
              .join('')}
          </tbody></table>
        </div>
      </details>`;
  }
  view.innerHTML = html;
  setFootnote('v. 13 Dec 2024');
}

/* =====================
   LINK HANDLER + SCROLL
===================== */
function handleLink(parts) {
  const type = parts[1];
  const sub = parts[2];
  const ruleId = parts[3];
  if (type === 'cat') {
    renderCategory(sub, ruleId);
  } else if (type === 'other') {
    renderOther(sub, ruleId);
  }
}

function scrollToRule(ruleId) {
  setTimeout(() => {
    const el = document.getElementById(ruleId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'background 1.5s';
    el.style.background = '#e7f1ff';
    setTimeout(() => {
      el.style.background = '';
    }, 2000);
  }, 300);
}

init();
