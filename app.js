function renderCategory(code, targetId) {
  const cat = DATA.categories.find(c => c.code === code);
  if (!cat) return view.innerHTML = `<p>Category not found.</p>`;
  setPageTitle(cat.name);

  const items = (cat.rules || []).map(r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`).join('');

  view.innerHTML = items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);
}

function renderOther(code, targetId) {
  const other = DATA.categories.find(c => c.code === 'other');
  const page = (other.submenu || []).find(x => x.code === code);
  if (!page) return renderOtherHome();

  setPageTitle(page.name);

  const items = (page.rules || []).map(r => `
    <article class="card" id="${r.id}">
      <div class="small"><span class="code">${r.id}</span></div>
      <h2>${r.title}</h2>
      <div>${r.body}</div>
    </article>`).join('');

  view.innerHTML = items;
  setFootnote('eff. 1 Jan 2025');

  if (targetId) scrollToRule(targetId);
}

function renderInfractions() {
  setPageTitle('Infraction Sheet');
  let html = '';
  for (const group of INF) {
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
}
