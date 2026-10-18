// Offline presentation of both proposed pages. No hosting, dependencies or network required.
const fs=require('node:fs');
const path=require('node:path');
const dir=__dirname;
const css=fs.readFileSync(path.join(dir,'style.css'),'utf8');
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const bridge=`document.addEventListener('click',function(e){const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href')||'';if(/^(index|prices)\\.html/.test(h)){e.preventDefault();const u=new URL(h,'https://preview.local/');parent.postMessage({kind:'concept-page',page:h.startsWith('prices')?'prices':'home',hash:u.hash,tariff:u.searchParams.get('tariff')},'*');}});`;
const pages={};
for(const [key,file] of [['home','index.html'],['prices','prices.html']]){
 let html=fs.readFileSync(path.join(dir,file),'utf8').replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+css+'\n.review{display:none}</style>').replace('<script src="app.js" defer></script>','');
 html=html.replace(/src="assets\/([^"]+)"/g,(_,name)=>{
  const type=name.endsWith('.svg')?'image/svg+xml':'image/jpeg';
  return 'src="data:'+type+';base64,'+fs.readFileSync(path.join(dir,'assets',name)).toString('base64')+'"';
 });
 html=html.replace('</body>',()=>'<script>'+app+'\n'+bridge+'</script></body>');
 pages[key]=Buffer.from(html).toString('base64');
}
const output=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Amerika.by — эскиз главной и цен</title><style>*{box-sizing:border-box}body{margin:0;background:#f8f6f0;color:#14263d;font-family:Segoe UI,Arial,sans-serif}.bar{height:44px;background:#e9ece8;display:flex;align-items:center;justify-content:space-between;padding:0 20px;font-size:11px;gap:12px}.bar span{letter-spacing:.07em}.bar nav{display:flex;gap:8px}button{background:transparent;border:0;padding:8px 12px;font:600 12px Segoe UI,Arial;cursor:pointer;color:#14263d}button[aria-pressed=true]{background:#14263d;color:white;border-radius:4px}iframe{display:block;width:100%;height:calc(100dvh - 44px);border:0}button:focus-visible{outline:2px solid #cc1735}@media(max-width:500px){.bar{padding:0 12px;font-size:9px}.bar nav{gap:0}}</style></head><body><div class="bar"><span>AMERIKA.BY · ЭСКИЗ · 18.10.2026</span><nav aria-label="Страницы эскиза"><button data-page="home" aria-pressed="true">Главная</button><button data-page="prices" aria-pressed="false">Цены</button></nav></div><iframe id="preview" title="Эскиз сайта Amerika.by"></iframe><script>const pages=${JSON.stringify(pages)};const frame=document.getElementById('preview');function show(page,hash='',tariff=''){document.querySelectorAll('[data-page]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.page===page)));frame.onload=()=>{if(tariff&&frame.contentDocument.getElementById('interest'))frame.contentDocument.getElementById('interest').value='Интересует тариф «'+tariff+'»';if(hash)frame.contentDocument.querySelector(hash)?.scrollIntoView();};frame.srcdoc=new TextDecoder().decode(Uint8Array.from(atob(pages[page]),c=>c.charCodeAt(0)));}document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>show(b.dataset.page));addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.kind==='concept-page'&&pages[e.data.page])show(e.data.page,e.data.hash,e.data.tariff)});show('home');</script></body></html>`;
fs.writeFileSync(path.join(dir,'preview.html'),output);
console.log('Saved offline preview.html ('+Buffer.byteLength(output)+' bytes)');
