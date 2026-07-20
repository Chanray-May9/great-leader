#!/usr/bin/env bash
# 一键部署到两个站点
set -e
cd "$(dirname "$0")"

echo "▸ 重新生成栏目页与搜索索引"
node build-lists.js && node build-search.js

echo "▸ 准备静态产物 dist/"
rm -rf dist && mkdir -p dist
cp -r index.html articles assets .nojekyll dist/
rm -f dist/articles/_template.html

echo "▸ 部署 GitHub Pages"
git add -A && git commit -m "${1:-更新站点}" && git push origin main

echo "▸ 部署 Cloudflare Pages"
npx wrangler pages deploy dist --project-name=great-leader --branch=main --commit-dirty=true

echo
echo "完成："
echo "  https://chanray-may9.github.io/great-leader/"
echo "  https://great-leader.pages.dev/"
