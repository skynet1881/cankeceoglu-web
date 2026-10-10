import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parsePost,buildBlog} from '../scripts/build-blog.mjs';
const post=(title,date='2026-10-10',extra='')=>`---\ntitle: "${title}"\ndate: "${date}"\ndescription: "A personal essay"\ncategory: "Life abroad"\nlang: en\n${extra}\n---\n\n## A heading\n\n**Bold** and [link](https://example.com).\n\n<script>alert(1)</script>\n\n[bad](javascript:alert(1))\n`;
test('Markdown metadata validation, draft handling, scheduling, and safe rendering',()=>{
 const parsed=parsePost(post('My essay'),'my-essay.md','2026-10-10');
 assert.equal(parsed.title,'My essay');assert.match(parsed.html,/<h2>A heading<\/h2>/);assert.match(parsed.html,/<strong>Bold<\/strong>/);
 assert(!parsed.html.includes('<script'));assert(!parsed.html.includes('javascript:'));
 assert.equal(parsePost(post('Draft','2026-10-10','draft: true'),'draft.md','2026-10-10'),null);
 assert.equal(parsePost(post('Later','2026-11-01'),'later.md','2026-10-10'),null);
 assert.throws(()=>parsePost(post('Bad date','2026-02-30'),'bad.md','2026-10-10'));
 assert.throws(()=>parsePost(post('Title'),'../bad.md','2026-10-10'));
});
test('build generates static articles, orders posts, and removes unpublished output',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'cankeceoglu-blog-'));
 try{
  await mkdir(path.join(root,'public'));await mkdir(path.join(root,'blog/posts'),{recursive:true});
  await writeFile(path.join(root,'public/index.html'),await readFile(new URL('../public/index.html',import.meta.url),'utf8'));
  await writeFile(path.join(root,'blog/posts/older.md'),post('Older','2026-10-01'));
  await writeFile(path.join(root,'blog/posts/newer.md'),post('Newer'));
  await writeFile(path.join(root,'blog/posts/draft.md'),post('Draft','2026-10-10','draft: true'));
  await buildBlog(root,'2026-10-10');
  const listing=await readFile(path.join(root,'public/blog.html'),'utf8');
  assert(listing.indexOf('Newer')<listing.indexOf('Older'));assert(!listing.includes('Draft'));
  assert.match(listing,/href="blog.html" aria-current="page"/);
  const article=await readFile(path.join(root,'public/blog/newer.html'),'utf8');assert(article.includes('<base href="/">'));assert(article.includes('lang="en"'));assert(article.includes('<strong>Bold</strong>'));
  await assert.rejects(access(path.join(root,'public/blog/draft.html')));
  await rm(path.join(root,'blog/posts/newer.md'));await buildBlog(root,'2026-10-10');await assert.rejects(access(path.join(root,'public/blog/newer.html')));
 }finally{await rm(root,{recursive:true,force:true})}
});
