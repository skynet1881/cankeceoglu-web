'use strict';
const COPY={
 tr:{pageViews:"Sayfa görüntüleme",viewsNote:"Takip başladığından beri · benzersiz ziyaretçi sayısı değildir",courseTotal:"Toplam Udemy kursu",navContact:"İletişim",navCourses:'Kurslar',navAbout:'Hakkımda',learners:'Toplam öğrenci',profile:'Udemy profili',checked:'4 Ekim 2026 itibarıyla · otomatik güncellenmez',eyebrow:'UDEMY KURSLARI',heading:'Kurslarım & Kuponlar',intro:'Yeni bir şey öğren. Sana uygun kursu ve indirim kuponunu bul.',catalog:'Kurs kataloğu',all:'Tüm Kurslar',turkish:'Türkçe Kurslar',english:'İngilizce Kurslar',database:'Veritabanı',ai:'Yapay Zeka',soon:'YAKINDA',reset:'Tüm kursları göster',priceNote:"Kaydolmadan önce Udemy'deki son fiyatı kontrol edin. Kuponların süresi veya kullanım hakkı dolabilir.",footer:'Bağımsız bir web sitesidir. Udemy ile bağlantılı değildir.',emptyTitle:'Kurslar burada yerini alacak.',emptyBody:'Güncel kurslar ve indirim kuponları yakında burada.',noMatch:'Bu dilde henüz kurs yok.',noMatchBody:'Diğer kurslara göz atmak için tüm kursları gösterin.',enroll:'KAYDOL',checkPrice:"Fiyatı Udemy'de gör",free:'Ücretsiz',ends:'Son gün',tr:'Türkçe',en:'İngilizce',filters:'Kursları filtrele',count:'kurs',title:'cankeceoglu — Kurslar ve Kuponlar',description:'cankeceoglu Udemy kursları ve indirim kuponları.'},
 en:{pageViews:"Page views",viewsNote:"Since tracking began · not unique visitors",courseTotal:"Total Udemy courses",navContact:"Contact",navCourses:'Courses',navAbout:'About',learners:'Total learners',profile:'Udemy profile',checked:'As of October 4, 2026 · updated manually',eyebrow:'UDEMY COURSES',heading:'My Courses & Coupons',intro:'Learn something new. Find your next course and a coupon to go with it.',catalog:'Course catalog',all:'All Courses',turkish:'Turkish Courses',english:'English Courses',database:'Database',ai:'Artificial Intelligence',soon:'COMING SOON',reset:'Show all courses',priceNote:'Check the final price on Udemy before enrolling. Coupons may expire or reach their redemption limit.',footer:'Independent website. Not affiliated with Udemy.',emptyTitle:'Your next course will be here.',emptyBody:'Courses and the latest coupon offers are coming soon.',noMatch:'No courses in this language yet.',noMatchBody:'Show all courses to explore other options.',enroll:'ENROLL',checkPrice:'See price on Udemy',free:'Free',ends:'Ends',tr:'Turkish',en:'English',filters:'Filter courses',count:'courses',title:'cankeceoglu — Courses & Coupons',description:'Udemy courses and coupon offers from cankeceoglu.'}
};
let lang='tr';try{lang=localStorage.getItem('site-language')==='en'?'en':'tr'}catch{}
let filter='all';
let learnerStats={count:8685,courses:null,updatedAt:'2026-10-04T11:00:00Z'};
const el=id=>document.getElementById(id);
function safeUrl(value,udemy=false){try{const u=new URL(value);return u.protocol==='https:'&&(!udemy||u.hostname==='udemy.com'||u.hostname.endsWith('.udemy.com'))?u.href:null}catch{return null}}
function availableCourses(){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());return (window.COURSES||[]).filter(c=>c.published!==false&&(c.titleTr||c.titleEn)&&safeUrl(c.url,true)&&(!c.expires||c.expires>=today));}
function node(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n}
function render(){const t=COPY[lang];document.documentElement.lang=lang;document.title=t.title;document.querySelector('meta[name="description"]').content=t.description;
 document.querySelectorAll('[data-text]').forEach(n=>{n.textContent=t[n.dataset.text]});
 document.querySelectorAll('[data-language]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.language===lang)));
 document.querySelectorAll('[data-filter]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.filter===filter)));
 el('learner-count').textContent=new Intl.NumberFormat(lang==='tr'?'tr-TR':'en-US').format(learnerStats.count);
 el('learner-updated').textContent=(lang==='tr'?'Son doğrulama: ':'Last verified: ')+new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Berlin'}).format(new Date(learnerStats.updatedAt));
 el('course-total').textContent=learnerStats.courses===null?'—':new Intl.NumberFormat(lang==='tr'?'tr-TR':'en-US').format(learnerStats.courses);
 const all=availableCourses();const shown=all.filter(c=>filter==='all'||c.language===filter);
 el('count').textContent=shown.length+' '+(lang==='en'&&shown.length===1?'course':t.count);
 el('grid').replaceChildren();el('empty').hidden=shown.length>0;el('reset').hidden=filter==='all';
 el('empty-title').textContent=all.length?t.noMatch:t.emptyTitle;el('empty-body').textContent=all.length?t.noMatchBody:t.emptyBody;
 el('empty').querySelector('.empty-label').hidden=all.length>0;
 for(const c of shown){const title=(lang==='tr'?c.titleTr:c.titleEn)||c.titleTr||c.titleEn;
  const article=node('article','card');const cover=node('div','cover');const fallback=()=>cover.replaceChildren(node('span','cover-label',title));const imageUrl=safeUrl(c.image);
  if(imageUrl){const img=node('img');img.src=imageUrl;img.alt='';img.loading='lazy';img.addEventListener('error',fallback,{once:true});cover.append(img)}if(imageUrl)article.append(cover);
  const body=node('div','card-body');if(t[c.language])body.append(node('p','course-language',t[c.language]));body.append(node('h3','',title));
  let price=t.checkPrice;if(typeof c.price==='number'&&Number.isFinite(c.price)&&c.price>=0){if(c.price===0)price=t.free;else if(['TRY','USD','EUR'].includes(c.currency))price=new Intl.NumberFormat(lang==='tr'?'tr-TR':'en-US',{style:'currency',currency:c.currency,maximumFractionDigits:2}).format(c.price)}
  body.append(node('span','price',price));const a=node('a','enroll',t.enroll);a.href=safeUrl(c.url,true);a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',t.enroll+' — '+title);body.append(a);
  if(c.expires){const date=new Date(c.expires+'T12:00:00Z');if(!Number.isNaN(date.valueOf()))body.append(node('p','expiry',t.ends+': '+new Intl.DateTimeFormat(lang==='tr'?'tr-TR':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(date)))}article.append(body);el('grid').append(article);
 }
}
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.language;try{localStorage.setItem('site-language',lang)}catch{}render()}));
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render()}));el('reset').addEventListener('click',()=>{filter='all';render()});render();

// Refresh on visits; failure keeps the verified snapshot and its original date.
async function refreshLearners(){
 try{const response=await fetch('/api/learners',{signal:AbortSignal.timeout(12000)});if(!response.ok)return;const data=await response.json();
  if(Number.isSafeInteger(data.count)&&data.count>=0&&data.count<100000000&&Number.isFinite(Date.parse(data.updatedAt))){learnerStats={count:data.count,courses:Number.isSafeInteger(data.courses)&&data.courses>=0?data.courses:null,updatedAt:data.updatedAt};render();}
 }catch{/* The visible date continues to identify the last verified data. */}
}
refreshLearners();
