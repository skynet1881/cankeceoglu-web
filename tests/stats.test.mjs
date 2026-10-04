import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseProfile,learners} from '../server/udemy.mjs';
import {visits} from '../server/visits.mjs';
const html=data=>`<div class="ud-component--user-profile-instructor--instructor-profile" data-module-args="${JSON.stringify(data).replaceAll('"','&quot;')}">`;
const profile={instructor_id:45773274,num_students:8685,num_courses:14};
test('extracts exact instructor counts, ignores global statistics and rejects invalid data',()=>{
 assert.deepEqual(parseProfile('num_courses:250000'+html(profile)),{count:8685,courses:14});
 for(const data of [{...profile,instructor_id:1},{...profile,num_students:'8.6K'},{...profile,num_courses:-1}])assert.throws(()=>parseProfile(html(data)));
 assert.throws(()=>parseProfile('<html>Access denied</html>'));
});
test('Udemy success is cached, a cache hit skips fetching, failures return 503',async()=>{
 let saved;
 const cache={match:async()=>saved?.clone(),put:async(key,response)=>{saved=response}};
 const request=new Request('https://example.com/api/learners');
 const response=await learners(request,async()=>new Response(html(profile)),cache);
 assert.equal(response.status,200);assert.equal((await response.json()).courses,14);
 assert.equal((await learners(request,()=>{throw Error('Should not fetch')},cache)).status,200);
 assert.equal((await learners(request,async()=>new Response('blocked',{status:403}),null)).status,503);
 assert.equal((await learners(request,async()=>new Response('challenge'),null)).status,503);
});
test('visitor counter validates origin and path, stores aggregates, and reports missing configuration',async()=>{
 let count=0,bindings;
 const env={DB:{prepare(sql){return {bind(...args){bindings=args;return this},async run(){count++},async first(){return {views:count,since:'2026-10-04'}}}}}};
 const request=(origin,path)=>new Request('https://example.com/api/visits',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({path})});
 assert.equal((await visits(request('https://evil.example','/'),env)).status,403);
 assert.equal((await visits(request('https://example.com','/secret'),env)).status,400);
 const response=await visits(request('https://example.com','/index.html'),env);
 assert.equal((await response.json()).views,1);assert.equal(bindings[1],'/');assert.equal(bindings[2],'XX');
 assert.equal((await visits(new Request('https://example.com/api/visits'),env)).status,200);
 assert.equal(count,1);
 assert.equal((await visits(request('https://example.com','/'),{})).status,503);
});
test('cache failures do not discard a successful Udemy fetch',async()=>{
 const cache={match:async()=>{throw Error('cache read')},put:async()=>{throw Error('cache write')}};
 const response=await learners(new Request('https://example.com/api/learners'),async()=>new Response(html(profile)),cache);
 assert.equal(response.status,200);assert.equal((await response.json()).count,8685);
});
test('blocked Worker fetch uses snapshot with original date and diagnostic reason',async()=>{
 const snapshot={count:9000,courses:15,updatedAt:'2026-10-04T12:00:00Z',source:'https://www.udemy.com/user/skynet-engineering/'};
 const assets={fetch:async()=>Response.json(snapshot)};
 const response=await learners(new Request('https://example.com/api/learners'),async()=>new Response('blocked',{status:403}),null,assets);
 const result=await response.json();
 assert.equal(response.status,200);assert.equal(result.count,9000);assert.equal(result.updatedAt,snapshot.updatedAt);
 assert.equal(result.upstreamAvailable,false);assert.equal(result.reason,'udemy_http_403');
});
