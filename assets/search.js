/* 全站搜索
   行为：输入时不做任何提示，点击「搜 索」或按回车后跳转到独立的搜索结果页。
   链接与跳转地址交给 window.HREF / window.SEARCH_URL，
   静态站与单文件包各自注入不同实现。 */
(function () {
  const idx = window.SEARCH_INDEX || [];
  const href = window.HREF || (f => f);
  const searchUrl = window.SEARCH_URL || (q => 'search.html?q=' + encodeURIComponent(q));

  const esc = s => String(s).replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const mark = (text, q) => {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<em>' + esc(text.slice(i, i + q.length)) + '</em>'
         + esc(text.slice(i + q.length));
  };

  const snippet = (body, q) => {
    const i = (body || '').toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return '';
    const s = Math.max(0, i - 30);
    return (s > 0 ? '…' : '') + body.slice(s, i + q.length + 70) + '…';
  };

  function score(item, q) {
    const ql = q.toLowerCase();
    const t = item.t.toLowerCase();
    if (t === ql) return 100;
    if (t.startsWith(ql)) return 80;
    if (t.includes(ql)) return 60;
    if ((item.c || '').toLowerCase().includes(ql)) return 45;
    if ((item.s || '').toLowerCase().includes(ql)) return 30;
    if ((item.b || '').toLowerCase().includes(ql)) return item.k === 'column' ? 8 : 15;
    return 0;
  }

  function search(q) {
    q = q.trim();
    if (!q) return [];
    return idx
      .map(x => ({ x, sc: score(x, q) }))
      .filter(r => r.sc > 0)
      .sort((a, b) => b.sc - a.sc || a.x.t.length - b.x.t.length);
  }

  /* ---------- 搜索结果页渲染 ---------- */
  window.renderSearchPage = function (q) {
    const meta = document.getElementById('sp-meta');
    const list = document.getElementById('sp-list');
    if (!meta || !list) return;

    q = (q || '').trim();
    document.querySelectorAll('.mh-search input').forEach(i => { i.value = q; });

    if (!q) {
      meta.textContent = '请输入关键词后点击「搜 索」。';
      list.innerHTML = '';
      return;
    }

    const hits = search(q);
    document.title = `搜索“${q}” — 郭权锐同志个人网站`;

    if (!hits.length) {
      meta.innerHTML = `未找到与“<b>${esc(q)}</b>”相关的内容`;
      list.innerHTML = `<li class="sp-none">换个关键词试试，例如「实干」「调研」「青年」「方法」。</li>`;
      return;
    }

    const arts = hits.filter(r => r.x.k === 'article');
    const cols = hits.filter(r => r.x.k === 'column');
    meta.innerHTML = `关键词“<b>${esc(q)}</b>” &nbsp;·&nbsp; 共找到 ${hits.length} 条结果（文章 ${arts.length}，栏目 ${cols.length}）`;

    const row = r => {
      const x = r.x;
      const ctx = r.sc <= 15 ? snippet(x.b, q) : (x.s || '');
      return `<li>
        <a class="lt-title" href="${href(x.i + '.html')}">${mark(x.t, q)}</a>
        <p class="lt-sum">${ctx ? mark(ctx, q) : ''}</p>
        <span class="sp-tag${x.k === 'column' ? ' col' : ''}">${x.k === 'column' ? '栏目' : esc(x.c || '文章')}</span>
      </li>`;
    };

    list.innerHTML = [...arts, ...cols].map(row).join('');
  };

  /* ---------- 搜索框：仅在提交时跳转，不做实时预览 ---------- */
  document.querySelectorAll('.mh-search').forEach(box => {
    if (box.dataset.srReady) return;
    box.dataset.srReady = '1';

    const input = box.querySelector('input');
    const btn = box.querySelector('button');
    if (!input || !btn) return;

    const submit = () => {
      const q = input.value.trim();
      if (!q) { input.focus(); return; }
      const url = searchUrl(q);
      if (url.startsWith('#')) {
        location.hash = url.slice(1);
        window.renderSearchPage && window.renderSearchPage(q);
      } else {
        location.href = url;
      }
    };

    btn.addEventListener('click', e => { e.preventDefault(); submit(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); submit(); }
    });
  });
})();
