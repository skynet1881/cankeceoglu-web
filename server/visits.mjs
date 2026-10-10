const json = (body, status=200) => Response.json(body, {status, headers:{'Cache-Control':'no-store'}});
export async function visits(request, env) {
  if (!env.DB) return json({error:'Visitor counter not configured'}, 503);
  if (!['GET','POST'].includes(request.method)) return json({error:'Method not allowed'},405);
  try {
    if (request.method === 'POST') {
      if (request.headers.get('Origin') !== new URL(request.url).origin) return json({error:'Invalid origin'},403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({error:'Expected JSON'},415);
      if (Number(request.headers.get('Content-Length')) > 256) return json({error:'Request too large'},413);
      const raw = await request.text();
      if (raw.length > 256) return json({error:'Request too large'},413);
      let data; try { data=JSON.parse(raw); } catch { return json({error:'Invalid JSON'},400); }
      if (!['/','/index.html','/about.html','/blog.html'].includes(data?.path) && !/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(data?.path || '')) return json({error:'Invalid page'},400);
      // Store daily aggregates only: no IP addresses, cookies, or visitor IDs.
      const day = new Date().toISOString().slice(0,10);
      const path = data.path === '/index.html' ? '/' : data.path;
      const country = /^[A-Z]{2}$/.test(request.cf?.country || '') ? request.cf.country : 'XX';
      await env.DB.prepare('INSERT INTO page_views (day, path, country, views) VALUES (?, ?, ?, 1) ON CONFLICT(day, path, country) DO UPDATE SET views = views + 1').bind(day,path,country).run();
    }
    const result = await env.DB.prepare('SELECT COALESCE(SUM(views), 0) AS views, MIN(day) AS since FROM page_views').first();
    return json({views:result.views, since:result.since});
  } catch { return json({error:'Visitor counter temporarily unavailable'},503); }
}
