'use strict';
// One page-view event per document load. Language changes do not add views.
(async()=>{
 try {
  const response=await fetch('/api/visits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return;
  const data=await response.json();
  if(!Number.isSafeInteger(data.views)||data.views<0)return;
  const count=document.getElementById('visitor-count');
  function renderViews(){count.textContent=new Intl.NumberFormat(document.documentElement.lang==='en'?'en-US':'tr-TR').format(data.views)}
  renderViews();
  new MutationObserver(renderViews).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 }catch{/* An unavailable counter stays blank, never shows an invented number. */}
})();
