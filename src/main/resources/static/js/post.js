renderChrome('home');
const root = document.getElementById('root');
const back = el('a', { class: 'back', href: 'index.html' }, 'Voltar para os artigos');

function fail(title, text) {
  root.replaceChildren(el('div', { class: 'state', style: 'margin-top:2.5rem' }, el('h2', {}, title), el('p', {}, text),
    el('a', { class: 'btn primary', href: 'index.html' }, 'Ver todos os artigos')));
}

(async function () {
  const id = new URLSearchParams(location.search).get('id');
  if (!id || !/^\d+$/.test(id)) return fail('Artigo não encontrado', 'O endereço está incompleto ou incorreto.');
  try {
    const p = await api('/posts/' + id);
    document.title = p.title + ' | Linha de Código';
    const body = el('div', { class: 'prose' });
    renderContent(body, p.content);
    const updated = p.updatedAt && p.updatedAt.slice(0, 10) !== p.createdAt.slice(0, 10)
      ? `, atualizado em ${fmtDate(p.updatedAt)}` : '';
    root.replaceChildren(
      el('article', { class: 'article' },
        p.coverUrl ? coverBlock(p) : null,
        el('header', { class: 'article-head' },
          el('span', { class: 'tag' }, p.category),
          el('h1', {}, p.title),
          el('p', { class: 'lead' }, p.summary),
          el('p', { class: 'meta' }, `Por ${p.author}, ${fmtDate(p.createdAt)}${updated}`)),
        body),
      back);
  } catch (e) {
    e.status === 404 ? fail('Artigo não encontrado', 'Ele pode ter sido removido ou o endereço está errado.')
                     : fail('Não foi possível abrir o artigo', e.message);
  }
})();
