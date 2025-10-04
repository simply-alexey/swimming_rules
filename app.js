const view = document.getElementById('view');
const search = document.getElementById('search');
const footer = document.getElementById('footer');
let RULES = [];

// Register SW when supported
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

async function load() {
  try {
    const res = await fetch('rules.json');
    RULES = await res.json();
    route();
    footer.innerHTML = `<div class="small">Offline ready. Link other rules using [[ID]].</div>`;
  } catch (e) {
    view.innerHTML = `<p>Could not load rules.json. Check your hosting path.</p>`;
  }
}
window.addEventListener('hashchange', route);

function route() {
  const hash = location.hash.slice(2); // "rule/FR-2.1"
  if (hash.startsWith('rule/')) {
    const id = decodeURIComponent(hash.split('/')[1]);
    renderRule(id);
  } else {
    renderHome();
  }
}

function linkify(body) {
  // [[ID]] -> anchor to #/rule/ID
  return body.replace(/\[\[([\w\-\.\:]+)\]\]/g, (_, id) =>
    `<a href="#/rule/${id}" class="code">${id}</a>`
  );
}

function renderHome(list = RULES) {
  view.innerHTML = list.map(r => `
    <article class="card">
      <h3><a href="#/rule/${r.id}">${r.title}</a></h3>
      <div>${linkify(r.body).slice(0, 220)}…</div>
      <div style="margin-top:.5rem"><span class="code">${r.id}</span></div>
    </article>
  `).join('');
}

function renderRule(id) {
  const r = RULES.find(x => x.id === id);
  if (!r) { view.innerHTML = `<p>Rule not found.</p>`; return; }
  view.innerHTML = `
    <article class="card">
      <div class="code">${r.id}</div>
      <h2>${r.title}</h2>
      <div>${linkify(r.body)}</div>
      <p><a href="#" onclick="history.back();return false;">← Back</a></p>
    </article>
  `;
}

search.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { renderHome(); return; }
  const list = RULES.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.title.toLowerCase().includes(q) ||
    r.body.toLowerCase().includes(q)
  );
  renderHome(list);
});

load();
