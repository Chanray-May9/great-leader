# 郭权锐同志个人网站

个人主页。红金党政媒体风格，静态站点，托管于 GitHub Pages。

## 结构

```
index.html            首页
articles/             栏目列表页 + 文章页（共 39 个）
assets/               样式、脚本、图片
api/                  Cloudflare Worker（访问量统计）
build-lists.js        生成栏目列表页与搜索结果页
build-search.js       生成搜索索引
build-bundle.js       打包成单文件预览
```

## 本地开发

```bash
python -m http.server 8080     # 然后访问 http://localhost:8080
```

改完内容后重新生成：

```bash
node build-lists.js && node build-search.js
```

## 部署

站点同时部署在两处，内容完全相同：

| 地址 | 平台 |
|---|---|
| https://chanray-may9.github.io/great-leader/ | GitHub Pages |
| https://great-leader.pages.dev/ | Cloudflare Pages |

访问量接口：`https://gqr-api.gqr20080509.workers.dev`（Cloudflare Worker + KV）。
Worker 的 CORS 白名单必须同时包含以上两个域名，新增域名时记得同步 `api/worker.js` 并重新部署。

一键部署两处：

```bash
./deploy.sh "提交说明"
```

## 声明

本站为个人主页，与任何机构、组织、政党均无关联。
