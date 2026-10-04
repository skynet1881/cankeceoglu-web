import {learners} from './server/udemy.mjs';
import {visits} from './server/visits.mjs';
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/learners' && request.method === 'GET') return learners(request);
    if (path === '/api/visits') return visits(request,env);
    if (path.startsWith('/api/')) return new Response('Not found', {status:404});
    // HTML handling is disabled to preserve the existing .html links.
    // Resolve the homepage explicitly, since / is not an asset filename.
    if (path === '/') {
      const url = new URL(request.url);
      url.pathname = '/index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  }
};
