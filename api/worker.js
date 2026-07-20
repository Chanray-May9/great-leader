/**
 * 郭权锐同志个人网站 — Cloudflare Worker 后端
 * 提供：访问量统计 /api/pv
 * 存储：KV namespace 绑定名 SITE
 */

// 只允许你自己的前端域名调用（部署后改成你的 GitHub Pages 地址）
const ALLOW = [
  'https://chanray-may9.github.io',
  'http://localhost:8080',
];

const cors = (origin) => ({
  'Access-Control-Allow-Origin': ALLOW.includes(origin) ? origin : ALLOW[0],
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
});

const json = (data, origin, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    // ---- 访问量 ----
    if (pathname === '/api/pv') {
      let count = Number(await env.SITE.get('pv')) || 0;

      if (request.method === 'POST') {
        // 同一 IP 60 秒内只计一次，避免刷新灌水
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const seen = await env.SITE.get(`seen:${ip}`);
        if (!seen) {
          count += 1;
          await env.SITE.put('pv', String(count));
          await env.SITE.put(`seen:${ip}`, '1', { expirationTtl: 60 });
        }
      }

      return json({ count }, origin);
    }

    return json({ error: 'Not Found' }, origin, 404);
  },
};
