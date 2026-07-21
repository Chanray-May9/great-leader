/* 郭权锐同志个人网站 — 前端脚本 */

// ⬇⬇ 部署后把这里改成你的 Worker 地址
const API = 'https://gqr-api.gqr20080509.workers.dev';

const LINK = window.HREF || (f => 'articles/' + f);

/* ---------- 日期 ---------- */
(function () {
  const d = new Date();
  const w = '日一二三四五六'[d.getDay()];
  document.getElementById('today').textContent =
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w}`;
})();

/* ---------- 栏目数据（来自 assets/site-data.js，由 build-lists.js 自动生成） ---------- */
const SD = window.SITE_DATA || {};
const pick = (id, n) => (SD[id] || []).slice(0, n);

function render(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = rows
    .map(([t, d, href]) => `<li><a href="${LINK(href)}">${t}</a><time>${d}</time></li>`)
    .join('');
}

function renderCards(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = rows
    .map(([t, d, href, sum]) => `<li><a href="${LINK(href)}">${t}</a><p>${sum || ''}</p></li>`)
    .join('');
}

render('list-news',        pick('news', 8));
render('tab-activity',     pick('activity', 8));
render('tab-theory',       pick('theory', 8));
render('list-activity',    pick('activity', 8));
render('list-speech',      pick('speech', 8));
render('list-speech-side', pick('speech', 5));
render('list-history',     pick('history', 6));
renderCards('list-theory', pick('theory', 4));
renderCards('list-study',  pick('study', 4));
render('list-study-side',  pick('study', 5));
renderCards('list-history-wide', pick('history', 6));

/* ---------- 在库文章数 ---------- */
(function () {
  const el = document.getElementById('st-art');
  if (el) el.textContent = SD._total || '—';
})();

/* ---------- 要闻 tab 切换 ---------- */
(function () {
  const bar = document.getElementById('news-tabs');
  if (!bar) return;
  bar.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    [...bar.children].forEach(b => b.classList.toggle('on', b === btn));
    document.querySelectorAll('.tabpane').forEach(p =>
      p.classList.toggle('on', p.id === btn.dataset.pane));
  });
})();

/* ---------- 全站文章索引（底部四列，取各栏目最新若干） ---------- */
(function () {
  const box = document.getElementById('allindex');
  if (!box) return;
  const all = [];
  ['news', 'activity', 'speech', 'history', 'theory', 'study']
    .forEach(k => (SD[k] || []).slice(0, 8).forEach(r => all.push(r)));
  const seen = new Set();
  box.innerHTML = all
    .filter(r => !seen.has(r[2]) && seen.add(r[2]))
    .map(([t, , href]) => `<a href="${LINK(href)}">${t.replace(/<[^>]+>/g, '')}</a>`)
    .join('');
})();

/* ---------- 轮播 ---------- */
(function () {
  const slides = [...document.querySelectorAll('.slide')];
  const dots = document.querySelector('.dots');
  let i = 0;
  dots.innerHTML = slides.map((_, n) => `<b data-n="${n}"${n ? '' : ' class="on"'}></b>`).join('');
  const bs = [...dots.children];

  function go(n) {
    slides[i].classList.remove('on'); bs[i].classList.remove('on');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('on'); bs[i].classList.add('on');
  }
  dots.onclick = e => {
    if (e.target.dataset.n) { e.preventDefault(); go(+e.target.dataset.n); }
  };
  const sl = document.getElementById('slider');
  let timer = setInterval(() => go(i + 1), 4000);
  sl.onmouseenter = () => clearInterval(timer);
  sl.onmouseleave = () => { timer = setInterval(() => go(i + 1), 4000); };
})();

/* ---------- 语录轮换 ---------- */
(function () {
  const qs = [
    ['“路虽远，行则将至；事虽难，做则必成。”', '“路虽远，行则将至；<br>事虽难，做则必成。”'],
    ['“方向决定道路，道路决定命运。”', '“方向决定道路，<br>道路决定命运。”'],
    ['“真抓才能攻坚克难，实干才能梦想成真。”', '“真抓才能攻坚克难，<br>实干才能梦想成真。”'],
    ['“不驰于空想，不骛于虚声。”', '“不驰于空想，<br>不骛于虚声。”'],
    ['“把群众放在心上，群众才会把你放在心上。”', '“把群众放在心上，<br>群众才会把你放在心上。”'],
  ];
  let n = 0;
  const bar = document.getElementById('quote');
  const card = document.getElementById('quotecard-text');
  setInterval(() => {
    n = (n + 1) % qs.length;
    bar.textContent = qs[n][0];
    void bar.offsetWidth;
    card.innerHTML = qs[n][1];
  }, 6000);
})();

/* ---------- 访问量 ---------- */
(async function loadPV() {
  try {
    const r = await fetch(`${API}/api/pv`, { method: 'POST' });
    const { count } = await r.json();
    const s = count.toLocaleString();
    document.getElementById('pv').textContent = s;
    document.getElementById('st-pv').textContent = s;
  } catch {
    document.getElementById('pv').textContent = '—';
    document.getElementById('st-pv').textContent = '—';
  }
})();
