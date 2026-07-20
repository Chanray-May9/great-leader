/**
 * 把首页打包成单文件预览（CSS/JS 内联，SVG 转 data URI）
 * 用法：node build-preview.js <输出路径>
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = process.argv[2];
if (!out) { console.error('用法: node build-preview.js <输出路径>'); process.exit(1); }

const read = p => fs.readFileSync(path.join(root, p), 'utf8');

let html = read('index.html');
const css = read('assets/style.css');
let js = read('assets/app.js');

// 图片 → data URI
const imgDir = path.join(root, 'assets/img');
const imgs = {};
for (const f of fs.readdirSync(imgDir)) {
  const p = path.join(imgDir, f);
  if (f.endsWith('.svg')) {
    imgs[f] = 'data:image/svg+xml;utf8,' + encodeURIComponent(fs.readFileSync(p, 'utf8'));
  } else if (/\.(jpe?g|png|webp|gif)$/i.test(f)) {
    const mime = f.match(/\.png$/i) ? 'image/png'
      : f.match(/\.webp$/i) ? 'image/webp'
      : f.match(/\.gif$/i) ? 'image/gif' : 'image/jpeg';
    imgs[f] = `data:${mime};base64,` + fs.readFileSync(p).toString('base64');
  }
}

// 取出 <body> 内容
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));

let page = body
  .replace(/<script src="assets\/app\.js"><\/script>/, '')
  .replace(/assets\/img\/([\w.-]+)/g, (m, f) => imgs[f] || m);

// 文章链接在单文件预览里无法跳转，标记为未生成
page = page.replace(/href="articles\/([a-z0-9_]+)\.html"/g,
  'href="#" data-article="$1" class="pending"');

js = js
  .replace(/href="articles\/\$\{href\}"/g, 'href="#" data-article="${href}" class="pending"')
  .replace(/`articles\/\$\{href\}`/g, '"#"');

const cssInlined = css.replace(/url\(["']?img\/([\w.-]+)["']?\)/g,
  (m, f) => imgs[f] ? `url("${imgs[f]}")` : m);

const shell = `<title>郭权锐同志个人网站</title>
<style>
${cssInlined}

/* 预览页专用：锁定自身配色，不随查看者主题反转 */
:root[data-theme="dark"], :root[data-theme="light"]{ color-scheme: light; }
body{ background:#f5f5f5; color:#222; }

/* 未生成的文章链接 */
.pending{ cursor:not-allowed; }
.preview-note{
  background:#fffbe6;border:1px solid #e6d48a;border-left:5px solid #c9a75a;
  padding:12px 16px;margin:14px auto 0;font-size:13px;line-height:1.9;color:#6b5518;
}
.preview-note b{color:#a11019}
.toast{
  position:fixed;left:50%;bottom:32px;transform:translateX(-50%);
  background:#a11019;color:#fff;padding:10px 22px;font-size:14px;
  opacity:0;transition:opacity .25s;pointer-events:none;z-index:99;
}
.toast.on{opacity:1}
@media (prefers-reduced-motion: reduce){ .toast{transition:none} }
</style>

<div class="wrap preview-note">
  <b>预览版</b>：这是首页的单文件预览，用于查看布局与配色。文章页尚未生成，点击标题不会跳转。
  完整多页站点需部署到 GitHub Pages。
</div>
${page}
<div class="toast" id="toast"></div>
<script>
${js}

// 未生成文章的点击提示
(function(){
  var t = document.getElementById('toast'), timer;
  document.addEventListener('click', function(e){
    var a = e.target.closest('a.pending');
    if(!a) return;
    e.preventDefault();
    t.textContent = '文章「' + a.dataset.article + '.html」尚未生成';
    t.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function(){ t.classList.remove('on'); }, 2200);
  });
})();
</script>`;

fs.writeFileSync(out, shell, 'utf8');
console.log('已生成:', out, '(' + (shell.length / 1024).toFixed(1) + ' KB)');
