const API = '/api';

class ApiError extends Error {
  constructor(message, status, fields) { super(message); this.status = status; this.fields = fields || {}; }
}

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['X-Admin-Token'] = token;
  let res;
  try {
    res = await fetch(API + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet e tente de novo.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || 'Erro inesperado. Tente novamente.', res.status, data?.fields);
  return data;
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

const fmtDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const tintOf = text => 'tint-' + ([...text].reduce((a, c) => a + c.charCodeAt(0), 0) % 4);

function toast(message, type = 'ok') {
  let box = document.querySelector('.toasts');
  if (!box) { box = el('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' }); document.body.append(box); }
  const t = el('div', { class: 'toast ' + type }, message);
  box.append(t);
  setTimeout(() => t.remove(), 4000);
}

function renderChrome(active) {
  const link = (href, label, key) => el('a', { href, 'aria-current': active === key ? 'page' : null }, label);
  document.body.prepend(el('header', { class: 'site-header' }, el('div', { class: 'wrap' },
    el('a', { class: 'brand', href: 'index.html' }, el('span', {}, 'Linha'), 'de Código'),
    el('nav', { class: 'nav', 'aria-label': 'Principal' },
      link('index.html', 'Artigos', 'home'), link('admin.html', 'Escrever', 'admin')))));
  document.body.append(el('footer', { class: 'site-footer' }, el('div', { class: 'wrap' },
    el('span', {}, 'Linha de Código: anotações de quem aprende programando.'),
    el('span', {}, '© ' + new Date().getFullYear()))));
}

/* Converte o texto do artigo em HTML seguro (sem innerHTML). Suporta ##, ###, listas com - e blocos ``` */
function renderContent(root, text) {
  const lines = text.replace(/\r/g, '').split('\n');
  let i = 0, para = [];
  const flush = () => { if (para.length) { root.append(el('p', {}, para.join(' '))); para = []; } };
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith('```')) {
      flush(); const code = []; i++;
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++]);
      root.append(el('pre', {}, el('code', {}, code.join('\n')))); i++; continue;
    }
    if (l.startsWith('### ')) { flush(); root.append(el('h3', {}, l.slice(4))); }
    else if (l.startsWith('## ')) { flush(); root.append(el('h2', {}, l.slice(3))); }
    else if (/^[-*] /.test(l)) {
      flush(); const ul = el('ul');
      while (i < lines.length && /^[-*] /.test(lines[i])) ul.append(el('li', {}, lines[i++].slice(2)));
      root.append(ul); continue;
    }
    else if (l.trim() === '') flush();
    else para.push(l.trim());
    i++;
  }
  flush();
}

function coverBlock(post, extra = '') {
  return post.coverUrl
    ? el('div', { class: 'cover ' + extra }, el('img', { src: post.coverUrl, alt: '', loading: 'lazy',
        onerror: e => e.target.parentElement.replaceChildren(post.category) }))
    : el('div', { class: `cover ${tintOf(post.category)} ${extra}` }, post.category);
}
