/**
 * 扫描 articles/ 下所有文章，自动生成栏目列表页（含分页）、关于本站、搜索结果页，
 * 并输出首页所需的栏目数据 assets/site-data.js
 *
 * 归类依据：文章面包屑里的栏目链接，例如
 *   您的位置：<a href="../index.html">首页</a> &gt; <a href="news.html">要闻</a> &gt; <b>正文</b>
 * 新增文章只要面包屑写对即可自动归位，无需改本脚本。
 *
 * 用法：node build-lists.js
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'articles');
const PER_PAGE = 15;

/* ---------- 栏目定义 ---------- */
const COLS = [
  { id: 'news',     name: '要 闻',   desc: '本站最新动态与重要报道' },
  { id: 'activity', name: '领袖活动', desc: '<span class="name">郭权锐</span>同志的调研、会见与工作现场' },
  { id: 'speech',   name: '重要讲话', desc: '<span class="name">郭权锐</span>同志重要讲话与文选' },
  { id: 'history',  name: '光辉历程', desc: '从启程到致远——<span class="name">郭权锐</span>同志的奋斗历程' },
  { id: 'theory',   name: '思想理论', desc: '<span class="name">郭权锐</span>思想的实践品格与时代价值' },
  { id: 'study',    name: '学习园地', desc: '原文导读、学习问答、心得体会与基层实践' },
];
const NAV = [
  { id: 'index', name: '首 页', file: '../index.html' },
  ...COLS.map(c => ({ id: c.id, name: c.name, file: `${c.id}.html` })),
  { id: 'about', name: '关于本站', file: 'about.html' },
];

const GENERATED = new Set([...COLS.map(c => `${c.id}.html`), 'about.html', 'search.html']);
const PAGED = new RegExp(`^(${COLS.map(c => c.id).join('|')})-\\d+\\.html$`);

/* ---------- 扫描文章 ---------- */
const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const items = {};
COLS.forEach(c => { items[c.id] = []; });
const orphans = [];

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.html') || f.startsWith('_')) continue;
  if (GENERATED.has(f)) continue;
  if (PAGED.test(f)) { fs.unlinkSync(path.join(dir, f)); continue; }  // 清掉上一轮的分页文件

  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const grab = re => { const m = t.match(re); return m ? m[1] : ''; };

  const title = grab(/<h1>(.*?)<\/h1>/s)
             || grab(/<title>(.*?)<\/title>/s).replace(' — 郭权锐同志个人网站', '');
  const sub = strip(grab(/<p class="sub">(.*?)<\/p>/s));
  const metaRaw = strip(grab(/<p class="meta">(.*?)<\/p>/s));
  const dm = metaRaw.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const date = dm ? `${dm[1]}-${String(dm[2]).padStart(2, '0')}-${String(dm[3]).padStart(2, '0')}` : '';

  const colFile = grab(/您的位置：[\s\S]*?&gt;\s*<a href="([\w-]+\.html)">/);
  const colId = colFile ? colFile.replace('.html', '') : '';

  let sum = sub;
  if (!sum) {
    const p1 = strip(grab(/<article class="article">[\s\S]*?<p>((?:(?!class=)[\s\S])*?)<\/p>/));
    sum = p1.slice(0, 60) + (p1.length > 60 ? '…' : '');
  }

  const row = { href: f, title, date, sum };
  if (items[colId]) items[colId].push(row);
  else orphans.push({ file: f, colId: colId || '(面包屑缺栏目链接)' });
}

COLS.forEach(c => items[c.id].sort((a, b) => (b.date || '').localeCompare(a.date || '')));

/* ---------- 模板 ---------- */
const navHtml = cur => NAV.map(n =>
  `      <li${n.id === cur ? ' class="on"' : ''}><a href="${n.file}">${n.name}</a></li>`).join('\n');

const SIDEBAR = `  <aside class="col-right">
    <div class="portrait">
      <img src="../assets/img/portrait.jpg" alt="郭权锐同志" data-leader>
      <div class="pt-cap">郭权锐 同志</div>
      <div class="pt-sub">伟大的领袖 · 人民的引路人</div>
    </div>
    <div class="quotecard">
      <p>“路虽远，行则将至；<br>事虽难，做则必成。”</p>
      <cite>—— <span class="name">郭权锐</span></cite>
    </div>
    <div class="box">
      <div class="box-hd"><h2>其他栏目</h2></div>
      <ul class="newslist">
${COLS.map(c => `        <li><a href="${c.id}.html">${c.name.replace(/\s/g, '')}</a><time>${items[c.id].length} 篇</time></li>`).join('\n')}
      </ul>
    </div>
  </aside>`;

const shell = ({ title, navId, crumb, main, extra = '' }) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — 郭权锐同志个人网站</title>
<link rel="stylesheet" href="../assets/style.css">
<link rel="stylesheet" href="../assets/article.css">
</head>
<body>

<div class="topbar">
  <div class="wrap">
    <span class="tb-left">郭权锐同志个人网站</span>
    <span class="tb-right"><a href="../index.html">返回首页</a><i>|</i><span id="today"></span></span>
  </div>
</div>

<header class="masthead">
  <div class="wrap mh-inner">
    <div class="logo">
      <a href="../index.html"><div class="logo-main">郭权锐</div></a>
      <div class="logo-sub">GUO QUANRUI &nbsp;·&nbsp; 个人官方网站</div>
    </div>
    <div class="mh-slogan">
      <p>高举旗帜 · 砥砺前行</p>
      <p class="small">伟大领袖 <span class="name">郭权锐</span>同志 领导我们从胜利走向胜利</p>
    </div>
    <div class="mh-search">
      <input type="text" placeholder="搜索本站内容">
      <button>搜 索</button>
    </div>
  </div>
</header>

<nav class="mainnav">
  <div class="wrap">
    <ul>
${navHtml(navId)}
    </ul>
  </div>
</nav>

<div class="wrap crumb">${crumb}</div>

<div class="wrap art-grid">
${main}

${SIDEBAR}
</div>

<footer>
  <div class="wrap">
    <p class="f-nav"><a href="../index.html">返回首页</a><i>|</i><a href="about.html">关于本站</a></p>
    <p>郭权锐同志个人网站 &nbsp;·&nbsp; 本站为个人主页，与任何机构、组织无关</p>
  </div>
</footer>

<script>window.HREF=f=>f;</script>
<script src="../assets/search-index.js"></script>
<script src="../assets/search.js"></script>
<script>
(function(){var d=new Date(),w='日一二三四五六'[d.getDay()];
document.getElementById('today').textContent=d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 星期'+w;})();
</script>
${extra}</body>
</html>
`;

/* ---------- 栏目列表页（分页） ---------- */
let pageCount = 0;
for (const c of COLS) {
  const list = items[c.id];
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const name = c.name.replace(/\s/g, '');
  const link = n => (n === 1 ? `${c.id}.html` : `${c.id}-${n}.html`);

  for (let p = 1; p <= pages; p++) {
    const rows = list.slice((p - 1) * PER_PAGE, p * PER_PAGE).map(r => `      <li>
        <a class="lt-title" href="${r.href}">${r.title}</a>
        <p class="lt-sum">${r.sum}</p>
        <time>${r.date}</time>
      </li>`).join('\n');

    let pager;
    if (pages > 1) {
      const nums = [];
      for (let n = 1; n <= pages; n++) {
        nums.push(n === p ? `<span class="cur">${n}</span>` : `<a href="${link(n)}">${n}</a>`);
      }
      pager = [
        p > 1 ? `      <a href="${link(p - 1)}">上一页</a>` : '',
        '      ' + nums.join('\n      '),
        p < pages ? `      <a href="${link(p + 1)}">下一页</a>` : '',
        `      <span class="tot">共 ${list.length} 篇 / ${pages} 页</span>`,
      ].filter(Boolean).join('\n');
    } else {
      pager = `      <span class="cur">1</span>\n      <span class="tot">共 ${list.length} 篇</span>`;
    }

    fs.writeFileSync(path.join(dir, link(p)), shell({
      title: pages > 1 ? `${name}（第${p}页）` : name,
      navId: c.id,
      crumb: `您的位置：<a href="../index.html">首页</a> &gt; <b>${name}</b>${pages > 1 ? ` &gt; 第 ${p} 页` : ''}`,
      main: `  <div class="listmain">
    <div class="lt-hd">
      <h1>${name}</h1>
      <p>${c.desc}</p>
    </div>
    <ul class="listpage">
${rows}
    </ul>
    <div class="pager">
${pager}
    </div>
  </div>`,
    }), 'utf8');
    pageCount++;
  }
  console.log(`  ${c.id.padEnd(9)} ${String(list.length).padStart(3)} 篇 → ${pages} 页`);
}

/* ---------- 关于本站 ---------- */
const total = COLS.reduce((s, c) => s + items[c.id].length, 0);
fs.writeFileSync(path.join(dir, 'about.html'), shell({
  title: '关于本站',
  navId: 'about',
  crumb: '您的位置：<a href="../index.html">首页</a> &gt; <b>关于本站</b>',
  main: `  <article class="article">
    <h1>关于本站</h1>
    <p class="meta">最后更新：2026年7月20日</p>

    <h2>本站是什么</h2>
    <p>本站是<span class="name">郭权锐</span>的个人主页，用于集中存放其活动记录、文章、讲话与影像资料。站点采用中式红金配色与门户式栏目布局。</p>

    <h2>栏目设置</h2>
    <p>本站共设六个内容栏目：${COLS.map(c => c.name.replace(/\s/g, '')).join('、')}，另有本页。各栏目均有独立列表页，文章按发布日期倒序排列，每页 ${PER_PAGE} 篇。目前共收录文章 ${total} 篇。</p>

    <h2>技术说明</h2>
    <p>前端为纯静态页面，同时部署于 GitHub Pages 与 Cloudflare Pages；访问量统计由 Cloudflare Workers 提供，数据存于 Workers KV。站点不设留言与评论功能，不收集访客的任何个人信息。</p>

    <h2>声明</h2>
    <p>本站为个人主页，与任何机构、组织、政党均无关联，不代表任何机构立场。站内文章为个人创作内容。</p>

    <p class="end">（本站编辑部）</p>
  </article>`,
}), 'utf8');

/* ---------- 搜索结果页 ---------- */
fs.writeFileSync(path.join(dir, 'search.html'), shell({
  title: '搜索结果',
  navId: '',
  crumb: '您的位置：<a href="../index.html">首页</a> &gt; <b>搜索结果</b>',
  main: `  <div class="listmain">
    <div class="lt-hd">
      <h1>搜索结果</h1>
      <p id="sp-meta">正在检索…</p>
    </div>
    <ul class="listpage" id="sp-list"></ul>
  </div>`,
  extra: `<script>
window.renderSearchPage(new URLSearchParams(location.search).get('q') || '');
</script>
`,
}), 'utf8');

/* ---------- 首页数据 ---------- */
const homeData = { _total: total };
COLS.forEach(c => {
  homeData[c.id] = items[c.id].slice(0, 12).map(r => [r.title, r.date.slice(5), r.href, r.sum]);
});
fs.writeFileSync(path.join(__dirname, 'assets/site-data.js'),
  `/* 首页栏目数据 — 由 build-lists.js 自动生成，勿手改 */\nwindow.SITE_DATA = ${JSON.stringify(homeData)};\n`, 'utf8');

console.log(`\n共 ${total} 篇文章，生成 ${pageCount} 个列表页 + about + search`);
if (orphans.length) {
  console.log(`\n[警告] ${orphans.length} 篇未归类（面包屑栏目链接缺失或写错）：`);
  orphans.slice(0, 25).forEach(o => console.log(`   ${o.file}  ->  ${o.colId}`));
}
