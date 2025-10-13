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

/* =====================
   SERVICE WORKER + UPDATE BANNER
===================== */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    // Listen for updates
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Show refresh prompt
          const banner = document.createElement('div');
          banner.textContent = 'A new version is available. Tap to refresh.';
          Object.assign(banner.style, {
            position: 'fixed',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0b57d0',
            color: '#fff',
            padding: '0.8rem 1.2rem',
            borderRadius: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: '0.95rem'
          });
          banner.addEventListener('click', () => {
            newWorker.postMessage({ action: 'skipWaiting' });
          });
          document.body.appendChild(banner);
        }
      });
    });
  });

  // Listen for message from the waiting service worker
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

/* =====================
   NAVIGATION
===================== */
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

/* =====================
   INITIAL LOAD
===================== */
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
      <a
