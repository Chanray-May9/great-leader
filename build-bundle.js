/**
 * 把整站（首页 + 31 篇文章）打包成一个可点击的单文件 HTML。
 * 文章正文内联进 JS，用 hash 路由切换，所有栏目和按钮都能真的点进去。
 * 用法：node build-bundle.js <输出路径>
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = process.argv[2];
if (!out) { console.error('用法: node build-bundle.js <输出路径>'); process.exit(1); }

const read = p => fs.readFileSync(path.join(root, p), 'utf8');

/* ---------- 图片 → data URI ---------- */
const imgDir = path.join(root, 'assets/img');
const imgs = {};
for (const f of fs.readdirSync(imgDir)) {
  const p = path.join(imgDir, f);
  if (f.endsWith('.svg')) {
    imgs[f] = 'data:image/svg+xml;utf8,' + encodeURIComponent(fs.readFileSync(p, 'utf8'));
  } else if (/\.(jpe?g|png|webp|gif)$/i.test(f)) {
    const mime = /\.png$/i.test(f) ? 'image/png'
      : /\.webp$/i.test(f) ? 'image/webp'
      : /\.gif$/i.test(f) ? 'image/gif' : 'image/jpeg';
    imgs[f] = `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
  }
}
// 正文里只留占位符，运行时再从 IMG 表取真实 data URI（避免同一张图重复内联）
const swapImgs = s => s.replace(/(?:\.\.\/)?assets\/img\/([\w.-]+)/g,
  (m, f) => imgs[f] ? '__IMG__' + f : m);

/* ---------- 首页 ---------- */
const html = read('index.html');
const css = read('assets/style.css').replace(/url\(["']?img\/([\w.-]+)["']?\)/g,
  (m, f) => imgs[f] ? `url("${imgs[f]}")` : m);
const artCss = read('assets/article.css');
let js = read('assets/app.js');
const searchIdx = read('assets/search-index.js');
const siteData = read('assets/site-data.js');
const searchJs = read('assets/search.js');

let home = swapImgs(html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>')))
  .replace(/<script src="assets\/app\.js"><\/script>/, '');

// 首页里的文章链接 → hash 路由
home = home.replace(/href="articles\/([\w-]+)\.html"/g, 'href="#/$1"');

/* ---------- 文章 ---------- */
const artDir = path.join(root, 'articles');
const articles = {};
let count = 0;
for (const f of fs.readdirSync(artDir)) {
  if (!f.endsWith('.html') || f.startsWith('_') || f === 'search.html') continue;
  const id = f.replace('.html', '');
  const t = read(`articles/${f}`);

  const grab = (re) => { const m = t.match(re); return m ? m[1] : ''; };
  const title = grab(/<title>(.*?)<\/title>/s).replace(' — 郭权锐同志个人网站', '');
  const crumb = grab(/您的位置：.*?&gt;\s*<a href="[^"]*">(.*?)<\/a>/s)
             || grab(/您的位置：.*?&gt;\s*<b>(.*?)<\/b>/s) || '正文';
  const isList = /class="listmain"/.test(t) || /关于本站/.test(title);
  const body = grab(/<div class="wrap art-grid">(.*?)<\/div>\s*<footer>/s);

  articles[id] = {
    t: title,
    c: crumb,
    // 文章内部的相互链接也改成 hash 路由
    l: isList,
    h: swapImgs(body)
        .replace(/href="\.\.\/index\.html"/g, 'href="#/"')
        .replace(/href="([\w-]+)\.html"/g, 'href="#/$1"'),
  };
  count++;
}

/* ---------- 组装 ---------- */
const shell = `<title>郭权锐同志个人网站</title>
<style>
${css}
${artCss}

/* 单文件站点：视图切换 */
#view-home, #view-article { display: none; }
#view-home.on, #view-article.on { display: block; }
.bundle-note{
  background:#fffbe6;border:1px solid #e6d48a;border-left:5px solid #c9a75a;
  padding:10px 16px;margin:12px auto 0;font-size:12.5px;line-height:1.8;color:#6b5518;
}
.bundle-note b{color:#a11019}
:root[data-theme="dark"], :root[data-theme="light"]{ color-scheme: light; }
body{ background:#f5f5f5; color:#222; }
</style>

<div class="wrap bundle-note">
  <b>完整预览</b>：全站 ${count} 篇文章已内联，所有栏目和链接均可点击浏览。
</div>

<div id="view-home" class="on">${home}</div>

<div id="view-article">
  <div class="topbar"><div class="wrap">
    <span class="tb-left">郭权锐同志个人网站</span>
    <span class="tb-right"><a href="#/">返回首页</a><i>|</i><span id="today2"></span></span>
  </div></div>
  <header class="masthead"><div class="wrap mh-inner">
    <div class="logo">
      <a href="#/"><div class="logo-main">郭权锐</div></a>
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
  </div></header>
  <nav class="mainnav"><div class="wrap"><ul>
    <li><a href="#/">首 页</a></li>
    <li><a href="#/news">要 闻</a></li>
    <li><a href="#/activity">领袖活动</a></li>
    <li><a href="#/speech">重要讲话</a></li>
    <li><a href="#/history">光辉历程</a></li>
    <li><a href="#/theory">思想理论</a></li>
    <li><a href="#/study">学习园地</a></li>
    <li><a href="#/about">关于本站</a></li>
  </ul></div></nav>
  <div class="wrap crumb">
    <span id="crumb-inner">您的位置：<a href="#/">首页</a> &gt; <span id="art-crumb"></span><span id="art-tail"> &gt; <b>正文</b></span></span>
  </div>
  <div id="art-body"></div>
  <div class="wrap art-grid" id="search-body" style="display:none">
    <div class="listmain">
      <div class="lt-hd"><h1>搜索结果</h1><p id="sp-meta"></p></div>
      <ul class="listpage" id="sp-list"></ul>
    </div>
    <aside class="col-right">
      <div class="portrait">
        <img src="__IMG__portrait.jpg" alt="郭权锐同志" data-leader>
        <div class="pt-cap">郭权锐 同志</div>
        <div class="pt-sub">伟大的领袖 · 人民的引路人</div>
      </div>
    </aside>
  </div>
  <footer><div class="wrap">
    <p class="f-nav"><a href="#/">返回首页</a></p>
    <p>郭权锐同志个人网站 &nbsp;·&nbsp; 本站为个人主页，与任何机构、组织无关</p>
  </div></footer>
</div>

<script>
const IMG = ${JSON.stringify(imgs)};
const ARTICLES = ${JSON.stringify(articles)};
</script>
<script>
${siteData}
${searchIdx}
window.HREF = f => '#/' + f.replace('.html','');
window.SEARCH_URL = q => '#/search/' + encodeURIComponent(q);
</script>
<script>
${js}
</script>
<script>
${searchJs}
</script>
<script>
/* ---------- hash 路由 ---------- */
(function () {
  const LIST_OF = {'要闻':'news','领袖活动':'activity','重要讲话':'speech',
    '光辉历程':'history','思想理论':'theory','学习园地':'study','影像纪实':'study'};
  const home = document.getElementById('view-home');
  const art  = document.getElementById('view-article');
  const body = document.getElementById('art-body');
  const crumb= document.getElementById('art-crumb');

  function fixImgs(scope) {
    scope.querySelectorAll('img[src^="__IMG__"]').forEach(el => {
      const f = el.getAttribute('src').slice(7);
      if (IMG[f]) el.src = IMG[f];
    });
  }

  function route() {
    const raw = (location.hash.replace(/^#\\//, '') || '').trim();

    // 搜索结果视图
    if (raw === 'search' || raw.indexOf('search/') === 0) {
      const q = decodeURIComponent(raw.slice(7));
      document.getElementById('art-body').style.display = 'none';
      document.getElementById('search-body').style.display = '';
      document.getElementById('crumb-inner').innerHTML =
        '您的位置：<a href="#/">首页</a> &gt; <b>搜索结果</b>';
      home.classList.remove('on'); art.classList.add('on');
      if (window.renderSearchPage) window.renderSearchPage(q);
      fixImgs(document.getElementById('search-body'));
      window.scrollTo(0, 0);
      return;
    }
    document.getElementById('art-body').style.display = '';
    document.getElementById('search-body').style.display = 'none';

    const id = raw;
    if (id && ARTICLES[id]) {
      const a = ARTICLES[id];
      document.title = a.t + ' — 郭权锐同志个人网站';
      document.getElementById('crumb-inner').innerHTML =
        '您的位置：<a href="#/">首页</a> &gt; <span id="art-crumb"></span><span id="art-tail"> &gt; <b>正文</b></span>';
      const crumb2 = document.getElementById('art-crumb');
      crumb2.innerHTML = a.l ? '<b>' + a.c + '</b>'
        : '<a href="#/' + (LIST_OF[a.c] || 'news') + '">' + a.c + '</a>';
      document.getElementById('art-tail').style.display = a.l ? 'none' : '';
      body.innerHTML = '<div class="wrap art-grid">' + a.h + '</div>';
      fixImgs(body);
      home.classList.remove('on'); art.classList.add('on');
    } else {
      document.title = '郭权锐同志个人网站';
      home.classList.add('on'); art.classList.remove('on');
    }
    window.scrollTo(0, 0);
  }
  fixImgs(home);
  window.addEventListener('hashchange', route);
  route();

  // 两个报头各有一个搜索框，都要初始化
  window.__initSearch && window.__initSearch();

  const d = new Date(), w = '日一二三四五六'[d.getDay()];
  document.getElementById('today2').textContent =
    d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + w;
})();
</script>`;

fs.writeFileSync(out, shell, 'utf8');
console.log(`已生成: ${out}`);
console.log(`  内联文章 ${count} 篇，图片 ${Object.keys(imgs).length} 张，体积 ${(shell.length / 1024 / 1024).toFixed(2)} MB`);
