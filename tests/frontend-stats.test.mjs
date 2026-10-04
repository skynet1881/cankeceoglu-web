import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import worker from '../worker.mjs';
async function renderStats(response){
 const elements={};
 const get=id=>elements[id] ||= {textContent:'',addEventListener(){},replaceChildren(){},querySelector(){return {}}};
 const context=vm.createContext({document:{documentElement:{},getElementById:get,querySelector(){return {}},querySelectorAll(){return []}},window:{COURSES:[]},localStorage:{getItem(){return 'en'}},Intl,Date,URL,AbortSignal,fetch:async url=>url==='/api/learners'?response:{ok:false}});
 vm.runInContext(readFileSync(new URL('../public/app.js',import.meta.url),'utf8'),context);
 await vm.runInContext('refreshLearners()',context);
 return elements;
}
test('failed or incomplete refresh preserves the verified course and student counts',async()=>{
 for(const response of [{ok:false},{ok:true,json:async()=>({count:9000,updatedAt:'2026-10-05T00:00:00Z'})}]){
  const elements=await renderStats(response);
  assert.equal(elements['course-total'].textContent,'14');
  assert.equal(elements['learner-count'].textContent,'8,685');
  assert.match(elements['learner-status'].textContent,/Live update unavailable/);
 }
});
test('successful refresh updates both totals and identifies refreshed data',async()=>{
 const elements=await renderStats({ok:true,json:async()=>({count:9000,courses:15,updatedAt:'2026-10-05T00:00:00Z'})});
 assert.equal(elements['course-total'].textContent,'15');assert.equal(elements['learner-count'].textContent,'9,000');
 assert.equal(elements['learner-status'].textContent,'Udemy figures refreshed');
});
test('homepage is served from index.html and existing links remain unchanged',async()=>{
 const env={ASSETS:{fetch:async request=>new Response(new URL(request.url).pathname)}};
 assert.equal(await (await worker.fetch(new Request('https://example.com/'),env)).text(),'/index.html');
 assert.equal(await (await worker.fetch(new Request('https://example.com/about.html'),env)).text(),'/about.html');
});
