const view = document.getElementById('view');
const foot = document.getElementById('foot');
const btnBack = document.getElementById('btnBack');
const btnHome = document.getElementById('btnHome');

let DATA = null;
let INF = null;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');

btnBack.addEventListener('click', () => history.length > 1 ? history.back() : (location.hash = ''));
btnHome.addEventListener('click', () => location.hash = '');

window.addEventListener('hashchange', route);

async function init() {
  const [rulesRes, infraRes] = await Promise.all([fetch('rules.json'), fetch('infractions.json')]);
  DATA = await rulesRes.json();
  INF = await infraRes.json();
  route();
}
function route(){
  const hash = location.hash.slice(1); // e.g., "", "cat/freestyle", "other/the-start", "infractions"
  if (!hash) return renderHome();

  const parts = hash.split('/');
  if (parts[0] === 'cat' && parts[1]) {
    renderCategory(parts[1]);
  } else if (parts[0] === 'other' && parts[1]) {
    renderOther(parts[1]);
  } else if (parts[0] === 'other') {
    renderOtherHome();
  } else if (parts[0] === 'infractions') {
    renderInfractions();
  } else {
    renderHome();
  }
}

function setFootnote(text){ foot.textContent = text || ''; }

function renderHome(){
  view.innerHTML = `
    <div class="grid">
      <a class="tile" href="#cat/freestyle">Freestyle</a>
      <a class="tile" href="#cat/backstroke">Backstroke</a>
      <a class="tile" href="#cat/breaststroke">Breaststroke</a>
      <a class="tile" href="#cat/butterfly">Butterfly</a>
      <a class="tile" href="#other">Other Rules</a>
      <a class="tile" href="#infractions">Infraction Sheet</a>
    </div>
  `;
  setFootnote('');
}

function renderCategory(code){
  const cat = DATA.categories.find(c => c.code === code);
  if (!cat) { view.innerHTML = `<p>Category not found.</p>`; setFootnote(''); return; }
  const searchBox = `<input class="search" id="search" placeholder="Search ${cat.name}…" autocomplete="off" />`;
  const items = (cat.rules || []).map(r => `
    <article class="card">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>
  `).join('');
  view.innerHTML = searchBox + items;
  setFootnote('1 Jan 2025');

  const input = document.getElementById('search');
  if (input) input.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const list = (cat.rules || []).filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q)
    );
    view.innerHTML = searchBox + list.map(r => `
      <article class="card">
        <div class="small"><span class="code">${r.id}</span></div>
        <h2>${r.title}</h2>
        <div>${r.body}</div>
      </article>
    `).join('');
    setFootnote('1 Jan 2025');
  });
}

function renderOtherHome(){
  const other = DATA.categories.find(c => c.code === 'other');
  const grid = `
    <div class="grid">
      <a class="tile" href="#other/the-start">The Start</a>
      <a class="tile" href="#other/medley">Medley Swimming</a>
      <a class="tile" href="#other/the-race">The Race</a>
      <a class="tile" href="#other/swimwear">Swimwear & Wearables</a>
      <a class="tile" href="#infractions">Infraction Sheet</a>
    </div>
  `;
  view.innerHTML = grid;
  setFootnote('');
}

function renderOther(code){
  const other = DATA.categories.find(c => c.code === 'other');
  let page = (other.submenu || []).find(x => x.code === code);
  if (!page){ renderOtherHome(); return; }
  const searchBox = `<input class="search" id="search" placeholder="Search ${page.name}…" autocomplete="off" />`;
  const items = (page.rules || []).map(r => `
    <article class="card">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>
  `).join('');
  view.innerHTML = searchBox + items;
  setFootnote('1 Jan 2025');

  const input = document.getElementById('search');
  if (input) input.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    const list = (page.rules || []).filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.body.toLowerCase().includes(q)
    );
    view.innerHTML = searchBox + list.map(r => `
      <article class="card">
        <div class="small"><span class="code">${r.id}</span></div>
        <h2>${r.title}</h2>
        <div>${r.body}</div>
      </article>
    `).join('');
    setFootnote('1 Jan 2025');
  });
}

function renderInfractions(){
  const searchBox = `<input class="search" id="search" placeholder="Search infractions…" autocomplete="off" />`;
  let html = searchBox;
  for (const group of INF){
    html += `
      <details class="collapsible">
        <summary>${group.section}</summary>
        <div class="card" style="margin:0;border:none;box-shadow:none;padding:0;">
          <table>
            <tbody>
              ${group.infractions.map(item => `
                <tr>
                  <td style="width:70%">${item.description}</td>
                  <td style="width:30%;text-align:right"><span class="code">${item.rule}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </details>
    `;
  }
  view.innerHTML = html;
  setFootnote('v. 13 Dec 2024');

  // Expand/collapse filtering
  const input = document.getElementById('search');
  if (input) input.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    let out = searchBox;
    for (const group of INF){
      const filtered = group.infractions.filter(item =>
        group.section.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.rule.toLowerCase().includes(q)
      );
      if (filtered.length === 0) continue;
      out += `
        <details class="collapsible" ${q ? 'open' : ''}>
          <summary>${group.section}</summary>
          <div class="card" style="margin:0;border:none;box-shadow:none;padding:0;">
            <table><tbody>
              ${filtered.map(item => `
                <tr>
                  <td style="width:70%">${item.description}</td>
                  <td style="width:30%;text-align:right"><span class="code">${item.rule}</span></td>
                </tr>
              `).join('')}
            </tbody></table>
          </div>
        </details>
      `;
    }
    view.innerHTML = out;
    setFootnote('v. 13 Dec 2024');
  });
}

init();
