'use strict';
const ABOUT={
 tr:{pageViews:"Sayfa görüntüleme",viewsNote:"Takip başladığından beri · benzersiz ziyaretçi sayısı değildir",navContact:"İletişim",contactTitle:"Bana ulaşın",contactNote:"Bu form e-posta uygulamanızda bir taslak açar. Mesajı oradan gönderebilirsiniz.",contactName:"Adınız",contactEmail:"E-posta adresiniz",contactSubject:"Konu",contactMessage:"Mesajınız",contactSend:"E-posta taslağı aç",contactOpened:"E-posta uygulamanızda taslağı gönderin. Açılmazsa yukarıdaki e-posta adresine doğrudan yazabilirsiniz.",navCourses:'Kurslar',navAbout:'Hakkımda',eyebrow:'HAKKIMDA',role:'Gömülü yazılım mühendisi & eğitmen',education:'TOBB Ekonomi ve Teknoloji Üniversitesi Elektrik-Elektronik Mühendisliği mezunuyum.',experience:"Roketsan ve TÜBİTAK'ta gömülü yazılım mühendisi olarak çalıştım. 2022'den beri Almanya'da medikal alanda yazılım geliştiriyorum.",sharing:"LinkedIn'de yazılım mühendisliği ve yurt dışında çalışma üzerine videolar paylaşıyorum.",signoff:'Görüşmek üzere, Can',courses:'Kurslarımı keşfet',footer:'Bağımsız bir web sitesidir. Udemy ile bağlantılı değildir.',title:'Can Keceoglu — Hakkımda',description:'Can Keceoglu hakkında: gömülü yazılım, medikal yazılım ve eğitim.'},
 en:{pageViews:"Page views",viewsNote:"Since tracking began · not unique visitors",navContact:"Contact",contactTitle:"Get in touch",contactNote:"This form opens a draft in your email app. Send the message from there.",contactName:"Your name",contactEmail:"Your email address",contactSubject:"Subject",contactMessage:"Your message",contactSend:"Open email draft",contactOpened:"Send the draft in your email app. If it does not open, email the address above directly.",navCourses:'Courses',navAbout:'About',eyebrow:'ABOUT ME',role:'Embedded software engineer & instructor',education:'I graduated from TOBB University of Economics and Technology with a degree in Electrical and Electronics Engineering.',experience:'I worked as an embedded software engineer at Roketsan and TÜBİTAK. Since 2022, I have been developing medical software in Germany.',sharing:'I share videos about software engineering and working abroad on LinkedIn.',signoff:'See you soon, Can',courses:'Explore my courses',footer:'Independent website. Not affiliated with Udemy.',title:'Can Keceoglu — About',description:'Meet Can Keceoglu: embedded software engineer, medical software developer, and instructor.'}
};
let language='tr';try{language=localStorage.getItem('site-language')==='en'?'en':'tr'}catch{}
function renderAbout(){const t=ABOUT[language];document.documentElement.lang=language;document.title=t.title;document.querySelector('meta[name="description"]').content=t.description;document.querySelectorAll('[data-text]').forEach(n=>n.textContent=t[n.dataset.text]);document.querySelectorAll('[data-language]').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.language===language)));}
document.getElementById('contact-status').textContent='';
document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{language=b.dataset.language;try{localStorage.setItem('site-language',language)}catch{}renderAbout()}));renderAbout();

const contactForm=document.getElementById('contact-form');
contactForm.addEventListener('submit',event=>{
 event.preventDefault();
 if(!contactForm.reportValidity())return;
 const fields=new FormData(contactForm);
 const body=`${ABOUT[language].contactName}: ${fields.get('name').trim()}\n${ABOUT[language].contactEmail}: ${fields.get('email').trim()}\n\n${fields.get('message').trim()}`;
 const subject=fields.get('subject').trim();
 window.location.href='mailto:skynettech1992@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 document.getElementById('contact-status').textContent=ABOUT[language].contactOpened;
});
