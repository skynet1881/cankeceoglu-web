import {readdir,readFile,mkdir,writeFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse as parseYaml} from 'yaml';
import {marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function parsePost(source,filename,today){
 const match=source.replace(/\r\n/g,'\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
 if(!match)throw Error(`${filename}: start with YAML front matter between --- lines`);
 const data=parseYaml(match[1],{schema:'core',maxAliasCount:0});
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error(`${filename}: metadata must be a mapping`);
 const content=match[2];
 if(data.draft!==undefined&&typeof data.draft!=='boolean')throw Error(`${filename}: draft must be true or false`);
 const slug=filename.replace(/\.md$/i,'');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error(`${filename}: use a lowercase filename with hyphens`);
 if(data.draft===true)return null;
 for(const key of ['title','description','category'])if(typeof data[key]!=='string'||!data[key].trim())throw Error(`${filename}: ${key} is required`);
 const date=data.date instanceof Date?data.date.toISOString().slice(0,10):data.date;
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error(`${filename}: date must be YYYY-MM-DD`);
 if(!['tr','en'].includes(data.lang))throw Error(`${filename}: lang must be tr or en`);
 if(date>today)return null;
 if(!content.trim())throw Error(`${filename}: article body is empty`);
 const html=sanitizeHtml(marked.parse(content),{
  allowedTags:[...sanitizeHtml.defaults.allowedTags,'img'],
  allowedAttributes:{...sanitizeHtml.defaults.allowedAttributes,img:['src','alt','title','width','height','loading'],code:['class']},
  allowedSchemes:['https','http','mailto'],allowProtocolRelative:false
 });
 return {slug,title:data.title.trim(),description:data.description.trim(),category:data.category.trim(),lang:data.lang,date,html};
}
export async function buildBlog(projectRoot=root,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())){
 const input=path.join(projectRoot,'blog/posts');
 const posts=[];
 for(const filename of (await readdir(input)).filter(name=>name.endsWith('.md')).sort()){
  const post=parsePost(await readFile(path.join(input,filename),'utf8'),filename,today);
  if(post)posts.push(post);
 }
 posts.sort((a,b)=>b.date.localeCompare(a.date)||a.slug.localeCompare(b.slug));
 // Reuse the site's header and footer to keep navigation consistent.
 const home=await readFile(path.join(projectRoot,'public/index.html'),'utf8');
 const header=home.match(/<header>[\s\S]*?<\/header>/)[0].replace(' aria-current="page"','').replace('href="blog.html"','href="blog.html" aria-current="page"');
 const footer=home.match(/<footer>[\s\S]*?<\/footer>/)[0];
 const shell=(title,description,main,language='tr')=>`<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><title>${escape(title)} — cankeceoglu</title><meta name="description" content="${escape(description)}"><meta name="theme-color" content="#672bd7"><link rel="icon" type="image/png" href="logo.png"><link rel="stylesheet" href="style.css"><script src="blog.js" defer></script><script src="stats.js" defer></script></head><body>${header}<main class="blog-main">${main}</main>${footer}</body></html>\n`;
 const dateText=post=>new Intl.DateTimeFormat(post.lang==='tr'?'tr-TR':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(post.date+'T12:00:00Z'));
 const meta=post=>`<p class="post-meta"><span>${escape(post.category)}</span><time datetime="${post.date}">${dateText(post)}</time><span>${post.lang==='tr'?'Türkçe':'English'}</span></p>`;
 const cards=posts.map(post=>`<article class="post-card" lang="${post.lang}">${meta(post)}<h2><a href="blog/${post.slug}.html">${escape(post.title)}</a></h2><p>${escape(post.description)}</p><a class="post-read" href="blog/${post.slug}.html" data-text="readMore">Yazıyı oku →</a></article>`).join('\n');
 const listing=`<section class="intro"><p class="eyebrow">BLOG</p><h1 data-text="blogTitle">Yazılarım</h1><p data-text="blogIntro">Almanya, yurt dışında yaşam, kariyer ve hayata dair düşünceler.</p></section><section class="blog-list" aria-label="Blog">${cards||'<div class="empty"><h2 data-text="blogEmpty">İlk yazım yakında burada.</h2><p data-text="blogEmptyBody">Yeni yazılar için tekrar uğrayın.</p></div>'}</section>`;
 // Validate all posts before replacing generated output. Removing deleted posts is intentional.
 const output=path.join(projectRoot,'public/blog');
 await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});
 await writeFile(path.join(projectRoot,'public/blog.html'),shell('Blog','Can Keceoglu: Almanya, yurt dışında yaşam, kariyer ve kişisel yazılar.',listing));
 for(const post of posts){
  const body=`<article class="blog-article" lang="${post.lang}"><a class="post-back" href="blog.html" data-text="backToBlog">← Tüm yazılar</a><header class="post-header">${meta(post)}<h1>${escape(post.title)}</h1><p class="post-description">${escape(post.description)}</p><p class="post-author">Can Keceoglu</p></header><div class="post-content">${post.html}</div><a class="post-back" href="blog.html" data-text="backToBlog">← Tüm yazılar</a></article>`;
  await writeFile(path.join(output,post.slug+'.html'),shell(post.title,post.description,body,post.lang));
 }
 console.log(`Built blog with ${posts.length} published article(s).`);
 return posts;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildBlog();
