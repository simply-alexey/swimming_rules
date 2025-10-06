const view = document.getElementById('view');
const pageTitle = document.getElementById('pageTitle');
const foot = document.getElementById('foot');
const btnBack = document.getElementById('btnBack');
const btnHome = document.getElementById('btnHome');

function setPageTitle(title) {
  pageTitle.textContent = title || 'Swimming Rules';
}


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
  const hash = location.hash.slice(1);
  if (!hash) return renderHome();

  const parts = hash.split('/');
  if (parts[0] === 'cat' && parts[1]) renderCategory(parts[1]);
  else if (parts[0] === 'other' && parts[1]) renderOther(parts[1]);
  else if (parts[0] === 'other') renderOtherHome();
  else if (parts[0] === 'infractions') renderInfractions();
  else if (parts[0] === 'link') handleLink(parts);
  else renderHome();
}

function setFootnote(text){ foot.textContent = text || ''; }

function renderHome(){
  setPageTitle('Swimming Rules');
    btnBack.classList.add('hidden');
  view.innerHTML = `
    <div class="grid">
      <a class="tile stroke" href="#cat/freestyle">Freestyle</a>
      <a class="tile stroke" href="#cat/backstroke">Backstroke</a>
      <a class="tile stroke" href="#cat/breaststroke">Breaststroke</a>
      <a class="tile stroke" href="#cat/butterfly">Butterfly</a>

      <a class="tile" href="#other/the-start">The Start</a>
      <a class="tile" href="#other/medley">Medley Swimming</a>
      <a class="tile" href="#other/the-race">The Race</a>
      <a class="tile" href="#other/swimwear">Swimwear & Wearables</a>

      <a class="tile" href="#infractions">Infraction Sheet</a>
    </div>
  `;
  setFootnote('');

}



function renderCategory(code, targetId){
  const cat = DATA.categories.find(c => c.code === code);
  if (!cat) return view.innerHTML = `<p>Category not found.</p>`;
  setPageTitle(cat.name);
  btnBack.classList.remove('hidden');

  const searchBox = `<input class="search" id="search" placeholder="Search ${cat.name}…" />`;
  const items = (cat.rules || []).map(r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`).join('');

  view.innerHTML = searchBox + items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);

  const input = document.getElementById('search');
  input.addEventListener('input', e => filterRules(cat.rules, e.target.value, searchBox));
}

function renderOther(code, targetId){
  const other = DATA.categories.find(c => c.code === 'other');
  const page = (other.submenu || []).find(x => x.code === code);
  if (!page) return renderOtherHome();

 setPageTitle(page.name);
  btnBack.classList.remove('hidden');

  const searchBox = `<input class="search" id="search" placeholder="Search ${page.name}…" />`;
  const items = (page.rules || []).map(r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`).join('');

  view.innerHTML = searchBox + items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);

  const input = document.getElementById('search');
  input.addEventListener('input', e => filterRules(page.rules, e.target.value, searchBox));

}

function renderInfractions(){
  setPageTitle('Infraction Sheet');
  btnBack.classList.remove('hidden');
  const searchBox = `<input class="search" id="search" placeholder="Search infractions…" />`;
  let html = searchBox;
  for (const group of INF){
    html += `
      <details class="collapsible">
        <summary>${group.section}</summary>
        <div class="card" style="margin:0;border:none;box-shadow:none;padding:0;">
          <table><tbody>
            ${group.infractions.map(item => `
              <tr>
                <td style="width:70%">${item.description}</td>
                <td style="width:30%;text-align:right">
                  <a href="${item.link || '#'}" class="code" style="color:#0b57d0;text-decoration:underline;">${item.rule}</a>
                </td>
              </tr>`).join('')}
          </tbody></table>
        </div>
      </details>`;
    
  }
  view.innerHTML = html;
  setFootnote('v. 13 Dec 2024');

  const input = document.getElementById('search');
  input.addEventListener('input', e => {
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
                  <td>${item.description}</td>
                  <td style="text-align:right">
                    <a href="${item.link || '#'}" class="code" style="color:#0b57d0;text-decoration:underline;">${item.rule}</a>
                  </td>
                </tr>`).join('')}
            </tbody></table>
          </div>
        </details>`;
    }
    view.innerHTML = out;
    setFootnote('v. 13 Dec 2024');
  });
}

function filterRules(list, query, searchBox){
  const q = query.trim().toLowerCase();
  const filtered = list.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.title.toLowerCase().includes(q) ||
    r.body.toLowerCase().includes(q)
  );
  view.innerHTML = searchBox + filtered.map(r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`).join('');
  setFootnote('eff. 1 Jan 2025');
}

function handleLink(parts){
  // Expected format: #link/[cat|other]/[subsection]/[rule-id]
  const type = parts[1];
  const sub = parts[2];
  const ruleId = parts[3];
  if (type === 'cat') {
    renderCategory(sub, ruleId);
  } else if (type === 'other') {
    renderOther(sub, ruleId);
  }
}

function scrollToRule(ruleId){
  setTimeout(() => {
    const el = document.getElementById(ruleId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'background 1.5s';
    el.style.background = '#e7f1ff';
    setTimeout(() => { el.style.background = ''; }, 2000);
  }, 300);
}

init();
