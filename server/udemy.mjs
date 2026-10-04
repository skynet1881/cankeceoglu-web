export const PROFILE = 'https://www.udemy.com/user/skynet-engineering/';
// Read only this instructor's module, never Udemy's global site statistics.
export function parseProfile(html) {
  const tag = html.match(/<[^>]*class="[^"]*ud-component--user-profile-instructor--instructor-profile[^"]*"[^>]*>/);
  const encoded = tag?.[0].match(/data-module-args="([^"]*)"/)?.[1];
  if (!encoded) throw new Error('Instructor data missing');
  const data = JSON.parse(encoded.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
  if (data.instructor_id !== 45773274 || !Number.isSafeInteger(data.num_students) || data.num_students < 0 || !Number.isSafeInteger(data.num_courses) || data.num_courses < 0) throw new Error('Invalid instructor statistics');
  return {count:data.num_students, courses:data.num_courses};
}
export async function learners(request, fetcher = fetch, cache = globalThis.caches?.default, assets) {
  const key = new Request(new URL('/api/learners', request.url));
  try { const cached = await cache?.match(key); if (cached) return cached; } catch { /* Cache failure must not prevent refreshing. */ }
  let reason='upstream_unavailable';
  try {
    const upstream = await fetcher(PROFILE, {headers:{'Accept':'text/html', 'Accept-Language':'en-US'}, signal:AbortSignal.timeout(10000)});
    if (!upstream.ok) { reason=`udemy_http_${upstream.status}`; throw new Error(reason); }
    reason='profile_parse_failed';
    const stats = parseProfile(await upstream.text());
    const response = Response.json({...stats, updatedAt:new Date().toISOString(), source:PROFILE, upstreamAvailable:true}, {headers:{'Cache-Control':'public, max-age=3600'}});
    try { await cache?.put(key, response.clone()); } catch { /* Return verified figures even if caching fails. */ }
    return response;
  } catch {
    // GitHub periodically verifies this file from outside the Worker network.
    // Preserve its verification time; never relabel a fallback as freshly fetched.
    if (assets) {
      try {
        const saved=await assets.fetch(new URL('/udemy-stats.json',request.url));
        if (!saved.ok) throw new Error('Snapshot missing');
        const stats=await saved.json();
        if (!Number.isSafeInteger(stats.count)||stats.count<0||!Number.isSafeInteger(stats.courses)||stats.courses<0||!Number.isFinite(Date.parse(stats.updatedAt))||stats.source!==PROFILE) throw new Error('Invalid snapshot');
        return Response.json({...stats,upstreamAvailable:false,reason}, {headers:{'Cache-Control':'no-store'}});
      } catch { /* Report the upstream failure if no valid snapshot exists. */ }
    }
    return Response.json({error:'Udemy statistics temporarily unavailable',reason}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
