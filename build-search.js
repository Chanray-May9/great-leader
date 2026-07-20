/**
 * 扫描全站页面，生成搜索索引 assets/search-index.js
 * 索引内容：文章标题、栏目名、摘要、正文关键词
 * 用法：node build-search.js
 */
const fs = require('fs');
const path = require('path');

const artDir = path.join(__dirname, 'articles');
const LIST = new Set(['news.html', 'activity.html', 'speech.html', 'history.html',
  'theory.html', 'study.html', 'about.html']);

const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const index = [];

for (const f of fs.readdirSync(artDir).sort()) {
  if (!f.endsWith('.html') || f.startsWith('_') || f === 'search.html') continue;
  const t = fs.readFileSync(path.join(artDir, f), 'utf8');
  const grab = re => { const m = t.match(re); return m ? m[1] : ''; };

  const title = strip(grab(/<title>(.*?)<\/title>/s)).replace(' — 郭权锐同志个人网站', '');
  const isList = LIST.has(f);

  // 栏目名
  let col = strip(grab(/您的位置：.*?&gt;\s*<a href="[^"]*">(.*?)<\/a>/s))
         || strip(grab(/您的位置：.*?&gt;\s*<b>(.*?)<\/b>/s)) || '';

  // 摘要：副标题优先，否则取正文首段
  let sum = strip(grab(/<p class="sub">(.*?)<\/p>/s))
         || strip(grab(/<p class="lt-hd">(.*?)<\/p>/s))
         || strip(grab(/<div class="lt-hd">.*?<p>(.*?)<\/p>/s))
         || strip(grab(/<article class="article">.*?<p>(?!class)(.*?)<\/p>/s));
  if (sum.length > 70) sum = sum.slice(0, 70) + '…';

  // 正文全文（供关键词匹配，不输出）
  const bodyRaw = strip(grab(/<div class="wrap art-grid">(.*?)<footer>/s));
  // 去掉侧栏固定文案，避免每篇都命中
  const body = bodyRaw.replace(/郭权锐 同志 伟大的领袖 · 人民的引路人.*/, '');

  index.push({
    i: f.replace('.html', ''),
    t: title,
    c: col,
    s: sum,
    k: isList ? 'column' : 'article',
    // 正文取前 1200 字参与匹配，控制索引体积
    b: body.slice(0, 1200),
  });
}

const out = `/* 搜索索引 — 由 build-search.js 自动生成，勿手改 */
window.SEARCH_INDEX = ${JSON.stringify(index)};
`;
fs.writeFileSync(path.join(__dirname, 'assets/search-index.js'), out, 'utf8');

const cols = index.filter(x => x.k === 'column').length;
console.log(`索引已生成：${index.length} 条（栏目 ${cols}，文章 ${index.length - cols}）`);
console.log(`体积 ${(out.length / 1024).toFixed(0)} KB`);
