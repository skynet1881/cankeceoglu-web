import {learners} from './server/udemy.mjs';
import {visits} from './server/visits.mjs';
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/learners' && request.method === 'GET') return learners(request);
    if (path === '/api/visits') return visits(request,env);
    if (path.startsWith('/api/')) return new Response('Not found', {status:404});
    return env.ASSETS.fetch(request);
  }
};
