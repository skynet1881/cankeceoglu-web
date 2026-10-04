import {writeFile} from 'node:fs/promises';
import {PROFILE, parseProfile} from '../server/udemy.mjs';
const response=await fetch(PROFILE,{headers:{Accept:'text/html','Accept-Language':'en-US'},signal:AbortSignal.timeout(20000)});
if(!response.ok)throw new Error(`Udemy returned HTTP ${response.status}; previous snapshot retained`);
const stats=parseProfile(await response.text());
await writeFile(new URL('../public/udemy-stats.json',import.meta.url),JSON.stringify({...stats,updatedAt:new Date().toISOString(),source:PROFILE},null,2)+'\n');
console.log(`Verified ${stats.count} learners and ${stats.courses} courses`);
