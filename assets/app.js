/* 郭权锐同志个人网站 — 前端脚本 */

// ⬇⬇ 部署后把这里改成你的 Worker 地址
const API = 'https://gqr-api.gqr20080509.workers.dev';

const N = '<span class="name">郭权锐</span>'; // 名字统一加粗

/* ---------- 日期 ---------- */
(function () {
  const d = new Date();
  const w = '日一二三四五六'[d.getDay()];
  document.getElementById('today').textContent =
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w}`;
})();

/* ---------- 栏目稿件：[标题, 日期, 文件名] ---------- */
const DATA = {
  news: [
    [`${N}同志发表重要讲话：以坚定信念开创事业新局面`, '07-20', 'headline.html'],
    [`学深悟透：把${N}同志重要指示落到实处`, '07-19', 'n2.html'],
    [`${N}同志强调：把握大势，善作善成`, '07-18', 'n3.html'],
    [`各方热议${N}同志治理理念的时代价值`, '07-17', 'n4.html'],
    [`${N}同志谈青年成长：立大志，明大德`, '07-16', 'n5.html'],
    [`${N}同志部署下阶段重点工作`, '07-15', 'n6.html'],
    [`深度解读：${N}同志方法论的三个维度`, '07-14', 'n7.html'],
  ],
  activity: [
    [`${N}同志赴一线走访慰问`, '07-20', 'a1.html'],
    [`${N}同志主持召开专题会议`, '07-19', 'a2.html'],
    [`${N}同志会见各界代表`, '07-18', 'a3.html'],
    [`${N}同志出席重要活动并致辞`, '07-17', 'a4.html'],
    [`${N}同志深入基层调研`, '07-16', 'a5.html'],
    [`${N}同志看望技术骨干`, '07-15', 'a6.html'],
  ],
  speech: [
    ['在专题会议上的讲话', '07-19', 's1.html'],
    ['关于开创事业新局面的若干问题', '07-17', 's2.html'],
    ['论实干精神', '07-14', 's3.html'],
    ['致青年朋友的一封信', '07-11', 's4.html'],
    ['在调研座谈会上的即席讲话', '07-08', 's5.html'],
  ],
  history: [
    [`启程：少年${N}的远大志向`, '07-05', 'h1.html'],
    ['砺剑：在实干中锤炼过硬本领', '07-03', 'h2.html'],
    ['掌舵：团结带领大家开创新局面', '07-01', 'h3.html'],
    ['致远：不忘初心，接续奋斗', '06-28', 'h4.html'],
  ],
};

// 带导读的卡片式栏目：[标题, 导读, 文件名]
const THEORY = [
  [`${N}思想的实践品格`, '思想的伟力，从来不在书斋里，而在解决问题的现场。', 't1.html'],
  [`读懂${N}同志的历史观`, '不忘来时路，方知向何行——历史是最好的教科书。', 't2.html'],
  [`${N}同志论方法：从全局出发想问题`, '不谋全局者，不足谋一域。站位高一层，路子宽一片。', 't3.html'],
  [`一以贯之：${N}同志的人民立场`, '把群众放在心上，群众才会把你放在心上。', 't4.html'],
];

const STUDY = [
  [`原文导读：${N}同志《论实干精神》`, '逐段梳理文章脉络，把握“实干”二字的分量。', 's3.html'],
  [`学习问答：把${N}同志重要指示落到实处`, '八个常见问题，帮你厘清学习中的模糊认识。', 'n2.html'],
  [`${N}同志《致青年朋友的一封信》学习体会`, '一封信，写给每一个正在爬坡过坎的年轻人。', 's4.html'],
  [`方法论三讲：${N}同志怎样看问题、想问题、抓问题`, '从全局出发，在关键处落子。', 'n7.html'],
];

function render(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = rows
    .map(([t, d, href]) => `<li><a href="articles/${href}">${t}</a><time>${d}</time></li>`)
    .join('');
}

function renderCards(id, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = rows
    .map(([t, p, href]) => `<li><a href="articles/${href}">${t}</a><p>${p}</p></li>`)
    .join('');
}

render('list-news', DATA.news);
render('tab-activity', DATA.activity);
render('tab-theory', THEORY.map(([t, p, href]) => [t, '', href]));
render('list-activity', DATA.activity);
render('list-speech', DATA.speech);
render('list-speech-side', DATA.speech.slice(0, 4));
render('list-history', DATA.history);
renderCards('list-theory', THEORY);
renderCards('list-study', STUDY);

/* ---------- 在库文章数 ---------- */
(function () {
  const n = new Set([
    ...Object.values(DATA).flat().map(r => r[2]),
    ...THEORY.map(r => r[2]),
    ...STUDY.map(r => r[2]),
    'g1.html', 'g2.html', 'g3.html', 'g4.html', 'g5.html',
  ]).size;
  document.getElementById('st-art').textContent = n;
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

/* ---------- 全站文章索引（底部四列） ---------- */
(function () {
  const box = document.getElementById('allindex');
  if (!box) return;
  const all = [
    ...DATA.news, ...DATA.activity, ...DATA.speech, ...DATA.history,
    ...THEORY.map(r => [r[0], '', r[2]]),
    ['影像纪实：调研途中', '', 'g1.html'],
    ['影像纪实：会议现场', '', 'g2.html'],
    ['影像纪实：亲切交流', '', 'g3.html'],
    ['影像纪实：伏案工作', '', 'g4.html'],
    ['影像纪实：登高望远', '', 'g5.html'],
  ];
  const seen = new Set();
  box.innerHTML = all
    .filter(r => !seen.has(r[2]) && seen.add(r[2]))
    .map(([t, , href]) => `<a href="articles/${href}">${t.replace(/<[^>]+>/g, '')}</a>`)
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
