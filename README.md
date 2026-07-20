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

## 声明

本站为个人主页，与任何机构、组织、政党均无关联。
