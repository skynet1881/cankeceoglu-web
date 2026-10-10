'use strict';
const BLOG_COPY={
 tr:{navCourses:'Kurslar',navAbout:'Hakkımda',navBlog:'Blog',navContact:'İletişim',blogTitle:'Yazılarım',blogIntro:'Almanya, yurt dışında yaşam, kariyer ve hayata dair düşünceler.',blogEmpty:'İlk yazım yakında burada.',blogEmptyBody:'Yeni yazılar için tekrar uğrayın.',readMore:'Yazıyı oku →',backToBlog:'← Tüm yazılar',pageViews:'Sayfa görüntüleme',viewsNote:'Takip başladığından beri · benzersiz ziyaretçi sayısı değildir',footer:'Bağımsız bir web sitesidir. Udemy ile bağlantılı değildir.'},
 en:{navCourses:'Courses',navAbout:'About',navBlog:'Blog',navContact:'Contact',blogTitle:'My writing',blogIntro:'Thoughts on Germany, living abroad, careers, and life.',blogEmpty:'My first article is coming soon.',blogEmptyBody:'Come back for new writing.',readMore:'Read article →',backToBlog:'← All articles',pageViews:'Page views',viewsNote:'Since tracking began · not unique visitors',footer:'Independent website. Not affiliated with Udemy.'}
};
let blogLanguage=document.documentElement.lang;try{const saved=localStorage.getItem('site-language');if(saved==='tr'||saved==='en')blogLanguage=saved}catch{}
function renderBlog(){
 document.documentElement.lang=blogLanguage;
 document.querySelectorAll('[data-text]').forEach(node=>{const value=BLOG_COPY[blogLanguage][node.dataset.text];if(value!==undefined)node.textContent=value});
 document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===blogLanguage)));
}
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{blogLanguage=button.dataset.language;try{localStorage.setItem('site-language',blogLanguage)}catch{}renderBlog()}));renderBlog();
