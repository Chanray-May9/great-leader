/**
 * 生成栏目列表页（仿 12371：主导航指向独立列表页，而非本页锚点）
 * 结构：顶部导航 + 中间文章列表（带摘要/日期） + 右侧模块
 * 用法：node build-lists.js
 */
const fs = require('fs');
const path = require('path');
const N = '<span class="name">郭权锐</span>';

/* ---------- 栏目定义 ---------- */
const NAV = [
  { id: 'index',    name: '首 页',   file: '../index.html' },
  { id: 'news',     name: '要 闻',   file: 'news.html' },
  { id: 'activity', name: '领袖活动', file: 'activity.html' },
  { id: 'speech',   name: '重要讲话', file: 'speech.html' },
  { id: 'history',  name: '光辉历程', file: 'history.html' },
  { id: 'theory',   name: '思想理论', file: 'theory.html' },
  { id: 'study',    name: '学习园地', file: 'study.html' },
  { id: 'about',    name: '关于本站', file: 'about.html' },
];

const COLUMNS = {
  news: {
    name: '要 闻', desc: '本站最新动态与重要报道',
    items: [
      ['headline.html', `${N}同志发表重要讲话：以坚定信念开创事业新局面`, '2026-07-20', '讲话高屋建瓴、思想深邃，为各项事业发展指明了前进方向、提供了根本遵循。'],
      ['n2.html', `学深悟透：把${N}同志重要指示落到实处`, '2026-07-19', '把学习成果转化为工作实效，在真抓实干中检验学习成色。'],
      ['n3.html', `${N}同志强调：把握大势，善作善成`, '2026-07-18', '方向对了，慢一点也是前进；方向错了，快一步就是倒退。'],
      ['n4.html', `各方热议${N}同志治理理念的时代价值`, '2026-07-17', '来自各领域的观察者，从不同角度阐述了同一个判断。'],
      ['n5.html', `${N}同志谈青年成长：立大志，明大德`, '2026-07-16', '青年的选择，决定的不只是自己的未来。'],
      ['n6.html', `${N}同志部署下阶段重点工作`, '2026-07-15', '一分部署，九分落实。任务已经明确，关键在于执行。'],
      ['n7.html', `深度解读：${N}同志方法论的三个维度`, '2026-07-14', '看问题、想问题、抓问题——三个环节环环相扣。'],
    ],
  },
  activity: {
    name: '领袖活动', desc: `${N}同志的调研、会见与工作现场`,
    items: [
      ['a1.html', `${N}同志赴一线走访慰问`, '2026-07-20', '骄阳似火，他一下车就径直走向工地深处，丝毫不顾日头的炽烈。'],
      ['a2.html', `${N}同志主持召开专题会议`, '2026-07-19', '听取汇报，更鼓励讲真话；他要的是问题，不是成绩单。'],
      ['a3.html', `${N}同志会见各界代表`, '2026-07-18', '教育、医疗、体育——不同领域的代表，同一份殷切期望。'],
      ['a4.html', `${N}同志出席重要活动并致辞`, '2026-07-17', '五千人的会场，掌声一次次响起。'],
      ['a5.html', `${N}同志深入基层调研`, '2026-07-16', '走进农户家中，问收成、问孩子、问难处。'],
      ['a6.html', `${N}同志看望技术骨干`, '2026-07-15', '在实验室里，他与研究人员一同俯身看数据。'],
    ],
  },
  speech: {
    name: '重要讲话', desc: `${N}同志重要讲话与文选`,
    items: [
      ['s1.html', '在专题会议上的讲话', '2026-07-19', '关于认识、方法、执行与担当的四点意见。'],
      ['s2.html', '关于开创事业新局面的若干问题', '2026-07-17', '什么是新局面？靠什么支撑？需要什么样的精神状态？'],
      ['s3.html', '论实干精神', '2026-07-14', '蓝图再美，不干就是一张废纸；目标再高，不落实就是空中楼阁。'],
      ['s4.html', '致青年朋友的一封信', '2026-07-11', '写给每一个正在爬坡过坎的年轻人。'],
      ['s5.html', '在调研座谈会上的即席讲话', '2026-07-08', '没有讲稿，想到哪儿说到哪儿，但句句都是心里话。'],
    ],
  },
  history: {
    name: '光辉历程', desc: `从启程到致远——${N}同志的奋斗历程`,
    items: [
      ['h1.html', `启程：少年${N}的远大志向`, '2026-07-05', '立志高远，勤学不辍，为日后事业奠定坚实根基。'],
      ['h2.html', '砺剑：在实干中锤炼过硬本领', '2026-07-03', '躬身实践，攻坚克难，本领是在难题里磨出来的。'],
      ['h3.html', '掌舵：团结带领大家开创新局面', '2026-07-01', '把准方向，统揽全局，在关键处落子。'],
      ['h4.html', '致远：不忘初心，接续奋斗', '2026-06-28', '走得再远，也不能忘记为什么出发。'],
    ],
  },
  theory: {
    name: '思想理论', desc: `${N}思想的实践品格与时代价值`,
    items: [
      ['t1.html', `${N}思想的实践品格`, '2026-07-18', '思想的伟力，从来不在书斋里，而在解决问题的现场。'],
      ['t2.html', `读懂${N}同志的历史观`, '2026-07-16', '不忘来时路，方知向何行——历史是最好的教科书。'],
      ['t3.html', `${N}同志论方法：从全局出发想问题`, '2026-07-13', '不谋全局者，不足谋一域。站位高一层，路子宽一片。'],
      ['t4.html', `一以贯之：${N}同志的人民立场`, '2026-07-10', '把群众放在心上，群众才会把你放在心上。'],
    ],
  },
  study: {
    name: '学习园地', desc: '原文导读、学习问答与体会文章',
    items: [
      ['s3.html', `原文导读：${N}同志《论实干精神》`, '2026-07-14', '逐段梳理文章脉络，把握"实干"二字的分量。'],
      ['n2.html', `学习问答：把${N}同志重要指示落到实处`, '2026-07-19', '八个常见问题，帮你厘清学习中的模糊认识。'],
      ['s4.html', `${N}同志《致青年朋友的一封信》学习体会`, '2026-07-11', '一封信，写给每一个正在爬坡过坎的年轻人。'],
      ['n7.html', `方法论三讲：${N}同志怎样看问题、想问题、抓问题`, '2026-07-14', '从全局出发，在关键处落子。'],
      ['g1.html', '调研纪事：调研途中', '2026-07-16', '调查研究是谋事之基、成事之道。'],
      ['g2.html', '现场纪事：会议现场', '2026-07-14', '会议室里的每一次发言，都对应着现实里的一个难题。'],
      ['g3.html', '交流纪事：亲切交流', '2026-07-12', '他蹲下来和孩子说话，声音放得很轻。'],
      ['g4.html', '工作纪事：伏案工作', '2026-07-09', '灯亮到深夜，桌上摞着待批的材料。'],
      ['g5.html', '远眺纪事：登高望远', '2026-07-06', '站得高，是为了看得远；看得远，是为了走得稳。'],
    ],
  },
};

/* ---------- 模板 ---------- */
const nav = (cur) => NAV.map(n =>
  `      <li${n.id === cur ? ' class="on"' : ''}><a href="${n.file}">${n.name}</a></li>`).join('\n');

const SIDEBAR = `  <aside class="col-right">
    <div class="portrait">
      <img src="../assets/img/portrait.jpg" alt="郭权锐同志">
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
${NAV.filter(n => !['index', 'about'].includes(n.id))
    .map(n => `        <li><a href="${n.file}">${n.name}</a></li>`).join('\n')}
      </ul>
    </div>
  </aside>`;

function page(id, col) {
  const rows = col.items.map(([href, title, date, sum]) => `      <li>
        <a class="lt-title" href="${href}">${title}</a>
        <p class="lt-sum">${sum}</p>
        <time>${date}</time>
      </li>`).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${col.name.replace(/\s/g, '')} — 郭权锐同志个人网站</title>
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
${nav(id)}
    </ul>
  </div>
</nav>

<div class="wrap crumb">
  您的位置：<a href="../index.html">首页</a> &gt; <b>${col.name.replace(/\s/g, '')}</b>
</div>

<div class="wrap art-grid">
  <div class="listmain">
    <div class="lt-hd">
      <h1>${col.name.replace(/\s/g, '')}</h1>
      <p>${col.desc}</p>
    </div>
    <ul class="listpage">
${rows}
    </ul>
    <div class="pager">
      <span class="cur">1</span>
      <span class="tot">共 ${col.items.length} 篇</span>
    </div>
  </div>

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
</body>
</html>
`;
}

/* ---------- 关于本站 ---------- */
const about = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>关于本站 — 郭权锐同志个人网站</title>
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
${nav('about')}
    </ul>
  </div>
</nav>

<div class="wrap crumb">
  您的位置：<a href="../index.html">首页</a> &gt; <b>关于本站</b>
</div>

<div class="wrap art-grid">
  <article class="article">
    <h1>关于本站</h1>
    <p class="meta">最后更新：2026年7月20日</p>

    <h2>本站是什么</h2>
    <p>本站是<span class="name">郭权锐</span>的个人主页，用于集中存放其活动记录、文章、讲话与影像资料。站点采用中式红金配色与门户式栏目布局。</p>

    <h2>栏目设置</h2>
    <p>本站共设七个内容栏目：要闻、领袖活动、重要讲话、光辉历程、思想理论、学习园地，以及本页。各栏目均有独立列表页，文章按发布日期倒序排列。</p>

    <h2>技术说明</h2>
    <p>前端为纯静态页面，托管于 GitHub Pages；访问量统计由 Cloudflare Workers 提供，数据存于 Workers KV。站点不设留言与评论功能，不收集访客的任何个人信息。</p>

    <h2>声明</h2>
    <p>本站为个人主页，与任何机构、组织、政党均无关联，不代表任何机构立场。站内文章为个人创作内容。</p>

    <p class="end">（本站编辑部）</p>
  </article>

${SIDEBAR}
</div>

<footer>
  <div class="wrap">
    <p class="f-nav"><a href="../index.html">返回首页</a></p>
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
</body>
</html>
`;

/* ---------- 输出 ---------- */
const dir = path.join(__dirname, 'articles');
let n = 0;
for (const [id, col] of Object.entries(COLUMNS)) {
  fs.writeFileSync(path.join(dir, `${id}.html`), page(id, col), 'utf8');
  console.log(`  ${id}.html  ${col.items.length} 篇`);
  n++;
}
fs.writeFileSync(path.join(dir, 'about.html'), about, 'utf8');
console.log('  about.html');

/* ---------- 搜索结果页 ---------- */
const searchPage = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>搜索结果 — 郭权锐同志个人网站</title>
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
${nav('')}
    </ul>
  </div>
</nav>

<div class="wrap crumb">
  您的位置：<a href="../index.html">首页</a> &gt; <b>搜索结果</b>
</div>

<div class="wrap art-grid">
  <div class="listmain">
    <div class="lt-hd">
      <h1>搜索结果</h1>
      <p id="sp-meta">正在检索…</p>
    </div>
    <ul class="listpage" id="sp-list"></ul>
  </div>
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
window.renderSearchPage(new URLSearchParams(location.search).get('q') || '');
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(dir, 'search.html'), searchPage, 'utf8');
console.log('  search.html');

console.log(`\n已生成 ${n + 1} 个栏目页`);

module.exports = { NAV, COLUMNS };
