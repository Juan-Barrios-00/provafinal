renderChrome('home');

const state = { search: '', category: '', page: 0 };
const grid = document.getElementById('grid');
const pager = document.getElementById('pager');
const filters = document.getElementById('filters');
const searchInput = document.getElementById('search');
let requestId = 0;

function card(p, featured) {
  return el('article', { class: 'card' + (featured ? ' featured' : '') },
    el('a', { class: 'card-link', href: 'post.html?id=' + p.id },
      coverBlock(p),
      el('div', { class: 'card-body' },
        el('h2', {}, p.title),
        el('p', {}, p.summary),
        el('span', { class: 'meta' }, `${p.author}, ${fmtDate(p.createdAt)}`))));
}

function showState(title, text, actionLabel, action) {
  grid.replaceChildren(el('div', { class: 'state', style: 'grid-column:1/-1' },
    el('h2', {}, title), el('p', {}, text),
    actionLabel ? el('button', { class: 'btn primary', type: 'button', onclick: action }, actionLabel) : null));
  pager.replaceChildren();
}

function clearFilters() {
  state.search = ''; state.category = ''; state.page = 0; searchInput.value = '';
  renderChips(); load();
}

async function load() {
  const id = ++requestId;
  grid.replaceChildren(...Array.from({ length: 3 }, () => el('div', { class: 'skeleton' })));
  const qs = new URLSearchParams({ page: state.page, size: 9 });
  if (state.search) qs.set('search', state.search);
  if (state.category) qs.set('category', state.category);
  try {
    const data = await api('/posts?' + qs);
    if (id !== requestId) return;
    renderResults(data);
  } catch (e) {
    if (id !== requestId) return;
    showState('Não foi possível carregar os artigos', e.message, 'Tentar de novo', load);
  }
}

function renderResults(data) {
  const info = document.getElementById('result-info');
  if (info) info.textContent = `${data.totalElements} ${data.totalElements === 1 ? 'artigo' : 'artigos'}`;
  if (!data.content.length) {
    const filtered = state.search || state.category;
    return showState(filtered ? 'Nenhum artigo encontrado' : 'Ainda não há artigos',
      filtered ? 'Tente outro termo ou remova os filtros.' : 'Quando o primeiro artigo for publicado, ele aparece aqui.',
      filtered ? 'Limpar filtros' : null, clearFilters);
  }
  const featured = state.page === 0 && !state.search && !state.category && data.content.length > 1;
  grid.replaceChildren(...data.content.map((p, i) => card(p, featured && i === 0)));

  pager.replaceChildren();
  if (data.totalPages > 1) {
    const go = delta => { state.page += delta; load(); document.getElementById('filters').scrollIntoView({ behavior: 'smooth' }); };
    pager.append(
      el('button', { class: 'btn', type: 'button', disabled: data.page === 0, onclick: () => go(-1) }, 'Anterior'),
      el('span', {}, `Página ${data.page + 1} de ${data.totalPages}`),
      el('button', { class: 'btn', type: 'button', disabled: data.page + 1 >= data.totalPages, onclick: () => go(1) }, 'Próxima'));
  }
}

let categories = [];
function renderChips() {
  const chip = (label, value) => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.category === value),
    onclick: () => { state.category = value; state.page = 0; renderChips(); load(); } }, label);
  const old = document.getElementById('result-info');
  filters.replaceChildren(chip('Todas', ''), ...categories.map(c => chip(c, c)),
    el('span', { class: 'result-info', id: 'result-info', role: 'status' }, old ? old.textContent : ''));
}

async function loadCategories() {
  try { categories = await api('/categories'); } catch { categories = []; }
  renderChips();
}

let timer;
function applySearch() { state.search = searchInput.value.trim(); state.page = 0; load(); }
searchInput.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applySearch, 350); });
document.getElementById('search-form').addEventListener('submit', e => { e.preventDefault(); clearTimeout(timer); applySearch(); });

loadCategories();
load();
