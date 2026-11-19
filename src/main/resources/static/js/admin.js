renderChrome('admin');
const root = document.getElementById('root');
const FIELDS = [
  { name: 'title', label: 'Título', max: 150, min: 5, full: true },
  { name: 'category', label: 'Categoria', max: 50, min: 1, list: 'cats', hint: 'Ex.: Tutoriais, Java, Dicas' },
  { name: 'author', label: 'Autor', max: 80, min: 1 },
  { name: 'coverUrl', label: 'Link da imagem de capa (opcional)', max: 500, min: 0, full: true, type: 'url', hint: 'Começa com https://' },
  { name: 'summary', label: 'Resumo', max: 300, min: 10, full: true, hint: 'Aparece no card da página inicial.' },
  { name: 'content', label: 'Conteúdo', max: 50000, min: 50, full: true, area: true,
    hint: 'Use ## para subtítulos, - para listas e ``` para blocos de código.' }
];
let token = sessionStorage.getItem('adminToken') || '';
let editingId = null;

function validateField(f, value) {
  const v = value.trim();
  if (f.min > 0 && !v) return `Preencha o campo ${f.label.toLowerCase()}.`;
  if (v && v.length < f.min) return `${f.label} precisa de pelo menos ${f.min} caracteres.`;
  if (v.length > f.max) return `${f.label} aceita no máximo ${f.max} caracteres.`;
  if (f.name === 'coverUrl' && v && !/^https?:\/\/\S+$/.test(v)) return 'O link deve começar com http:// ou https://.';
  return '';
}

function showGate(message) {
  sessionStorage.removeItem('adminToken'); token = '';
  const input = el('input', { id: 'token', type: 'password', autocomplete: 'current-password', required: true });
  const error = el('div', { class: 'error', role: 'alert' }, message || '');
  const form = el('form', { class: 'panel gate', novalidate: true,
    onsubmit: async e => {
      e.preventDefault();
      try {
        await api('/auth/check', { token: input.value });
        token = input.value; sessionStorage.setItem('adminToken', token); showEditor();
      } catch (err) { error.textContent = err.status === 401 ? 'Token incorreto.' : err.message; }
    } },
    el('h1', {}, 'Área do autor'),
    el('div', { class: 'field' }, el('label', { for: 'token' }, 'Token de acesso'), input, error),
    el('div', { class: 'actions' }, el('button', { class: 'btn primary', type: 'submit' }, 'Entrar')));
  root.replaceChildren(form);
  input.focus();
}

function showEditor() {
  const refs = {};
  const fieldEls = FIELDS.map(f => {
    const input = f.area ? el('textarea', { id: f.name, name: f.name, rows: 14 })
      : el('input', { id: f.name, name: f.name, type: f.type || 'text', autocomplete: 'off', list: f.list });
    const err = el('div', { class: 'error', id: 'err-' + f.name, role: 'alert' });
    const counter = el('span', {}, `0/${f.max}`);
    input.setAttribute('aria-describedby', 'err-' + f.name);
    const wrap = el('div', { class: 'field' + (f.full ? ' full' : '') },
      el('label', { for: f.name }, f.label), input,
      el('div', { class: 'hint' }, el('span', {}, f.hint || ''), counter), err);
    input.addEventListener('input', () => { counter.textContent = `${input.value.length}/${f.max}`; if (wrap.classList.contains('invalid')) setErr(f.name, validateField(f, input.value)); });
    input.addEventListener('blur', () => setErr(f.name, validateField(f, input.value)));
    refs[f.name] = { input, err, wrap, counter };
    return wrap;
  });
  const datalist = el('datalist', { id: 'cats' });
  const title = el('h1', {}, 'Nova publicação');
  const submit = el('button', { class: 'btn primary', type: 'submit' }, 'Publicar');
  const cancel = el('button', { class: 'btn', type: 'button', hidden: true, onclick: () => reset() }, 'Cancelar edição');
  const list = el('ul', { class: 'admin-list' });

  function setErr(name, msg) {
    refs[name].err.textContent = msg || '';
    refs[name].wrap.classList.toggle('invalid', !!msg);
    refs[name].input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function fill(p) {
    FIELDS.forEach(f => { refs[f.name].input.value = p ? (p[f.name] || '') : ''; refs[f.name].counter.textContent = `${refs[f.name].input.value.length}/${f.max}`; setErr(f.name, ''); });
  }
  function reset() {
    editingId = null; fill(null); title.textContent = 'Nova publicação'; submit.textContent = 'Publicar'; cancel.hidden = true;
  }

  const form = el('form', { class: 'panel', novalidate: true, onsubmit: async e => {
    e.preventDefault();
    const body = {}; let firstBad = null;
    for (const f of FIELDS) {
      body[f.name] = refs[f.name].input.value.trim();
      const msg = validateField(f, body[f.name]); setErr(f.name, msg);
      if (msg && !firstBad) firstBad = f.name;
    }
    if (firstBad) { refs[firstBad].input.focus(); return toast('Corrija os campos destacados.', 'error'); }
    submit.disabled = true;
    try {
      if (editingId) { await api('/posts/' + editingId, { method: 'PUT', body, token }); toast('Alterações salvas.'); }
      else { await api('/posts', { method: 'POST', body, token }); toast('Publicado.'); }
      reset(); loadList(); loadCats();
    } catch (err) {
      if (err.status === 401) return showGate('Sua sessão expirou. Informe o token novamente.');
      Object.entries(err.fields).forEach(([k, m]) => refs[k] && setErr(k, m));
      toast(err.message, 'error');
    } finally { submit.disabled = false; }
  } }, title, el('div', { class: 'form-grid' }, ...fieldEls, datalist),
    el('div', { class: 'actions' }, submit, cancel));

  async function loadCats() {
    try { datalist.replaceChildren(...(await api('/categories')).map(c => el('option', { value: c }))); } catch { /* opcional */ }
  }

  async function loadList() {
    list.replaceChildren(el('li', {}, 'Carregando publicações...'));
    try {
      const data = await api('/posts?size=50');
      list.replaceChildren(...(data.content.length ? data.content.map(p => el('li', {},
        el('div', {}, el('div', { class: 't' }, p.title), el('div', { class: 'meta' }, `${p.category}, ${fmtDate(p.createdAt)}`)),
        el('div', { class: 'row-actions' },
          el('a', { class: 'btn small', href: 'post.html?id=' + p.id }, 'Ver'),
          el('button', { class: 'btn small', type: 'button', onclick: () => edit(p.id) }, 'Editar'),
          el('button', { class: 'btn small danger', type: 'button', onclick: () => remove(p) }, 'Excluir'))))
        : [el('li', {}, 'Nenhuma publicação ainda. Escreva a primeira acima.')]));
    } catch (e) { list.replaceChildren(el('li', {}, e.message)); }
  }

  async function edit(id) {
    try {
      const p = await api('/posts/' + id);
      editingId = id; fill(p); title.textContent = 'Editar publicação'; submit.textContent = 'Salvar alterações'; cancel.hidden = false;
      form.scrollIntoView({ behavior: 'smooth' }); refs.title.input.focus();
    } catch (e) { toast(e.message, 'error'); }
  }

  async function remove(p) {
    if (!confirm(`Excluir "${p.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api('/posts/' + p.id, { method: 'DELETE', token }); toast('Excluído.');
      if (editingId === p.id) reset();
      loadList(); loadCats();
    } catch (e) { e.status === 401 ? showGate('Sua sessão expirou. Informe o token novamente.') : toast(e.message, 'error'); }
  }

  root.replaceChildren(form,
    el('section', { class: 'panel' }, el('h2', {}, 'Publicações'), list),
    el('div', { style: 'margin-bottom:2rem' }, el('button', { class: 'btn small', type: 'button', onclick: () => showGate() }, 'Sair')));
  loadCats(); loadList();
}

(async function init() {
  if (!token) return showGate();
  try { await api('/auth/check', { token }); showEditor(); }
  catch (e) { showGate(e.status === 401 ? '' : e.message); }
})();
