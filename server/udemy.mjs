export const PROFILE = 'https://www.udemy.com/user/skynet-engineering/';
// Read only this instructor's module, never Udemy's global site statistics.
export function parseProfile(html) {
  const tag = html.match(/<[^>]*class="[^"]*ud-component--user-profile-instructor--instructor-profile[^"]*"[^>]*>/);
  const encoded = tag?.[0].match(/data-module-args="([^"]*)"/)?.[1];
  if (!encoded) throw new Error('Instructor data missing');
  const data = JSON.parse(encoded.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
  if (!Number.isSafeInteger(data.num_students) || data.num_students < 0 || !Number.isSafeInteger(data.num_courses) || data.num_courses < 0) throw new Error('Invalid instructor statistics');
  return {count:data.num_students, courses:data.num_courses};
}
export async function learners(request, fetcher = fetch, cache = globalThis.caches?.default) {
  const key = new Request(new URL('/api/learners', request.url));
  const cached = await cache?.match(key);
  if (cached) return cached;
  try {
    const upstream = await fetcher(PROFILE, {headers:{'Accept':'text/html', 'Accept-Language':'en-US'}, signal:AbortSignal.timeout(10000)});
    if (!upstream.ok) throw new Error('Udemy unavailable');
    const stats = parseProfile(await upstream.text());
    const response = Response.json({...stats, updatedAt:new Date().toISOString(), source:PROFILE}, {headers:{'Cache-Control':'public, max-age=3600'}});
    await cache?.put(key, response.clone());
    return response;
  } catch {
    return Response.json({error:'Udemy statistics temporarily unavailable'}, {status:503, headers:{'Cache-Control':'no-store'}});
  }
}
