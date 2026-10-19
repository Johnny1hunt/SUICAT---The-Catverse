/* nav */
const ham=document.getElementById('ham'), drawer=document.getElementById('drawer');
ham.addEventListener('click', ()=>{
  const open=drawer.classList.toggle('open');
  ham.setAttribute('aria-expanded', open?'true':'false');
  ham.textContent=open?'✕':'☰';
});
drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>{
  drawer.classList.remove('open'); ham.setAttribute('aria-expanded','false'); ham.textContent='☰';
}));

/* contract copy */
const CONTRACT="0x63e89267aad1dcbd9fb84e7686db54bd128cb25ce4e9f1fda97fc716c4b73682::suipump::SUIPUMP";
function fallbackCopy(t){
  const ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0';
  document.body.appendChild(ta); ta.select();
  let ok=false; try{ ok=document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta); return ok;
}
async function copyContract(btn){
  const label=btn?btn.textContent:'Copy';
  try{
    if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(CONTRACT); }
    else { if(!fallbackCopy(CONTRACT)) throw new Error('fallback failed'); }
    if(btn){ btn.textContent='Copied!'; setTimeout(()=>btn.textContent=label,1600); }
    announce('Contract copied');
  }catch(e){
    if(btn){ btn.textContent='Copy failed'; setTimeout(()=>btn.textContent=label,1600); }
    announce('Copy failed — contract selected for manual copy');
    const code=document.getElementById('contractCode');
    if(code){ const r=document.createRange(); r.selectNodeContents(code); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  }
}
document.getElementById('copyContract').addEventListener('click', e=>copyContract(e.currentTarget));
document.getElementById('copyContract2').addEventListener('click', e=>copyContract(e.currentTarget));
function announce(msg){ const el=document.getElementById('a11yStatus'); el.textContent=msg; setTimeout(()=>el.textContent='',1200); }

/* floating cat — 3 states */
const catBtn=document.getElementById('floatingCat');
const catImg=document.getElementById('catImg');
const catLabel=document.getElementById('catLabel');
const heroBubble=document.getElementById('heroBubble');
let state='moving'; // moving | playing | sleeping
let sleepTimer=null, playTimer=null;
const RUN_SRC='assets/cat-run.png';
const PLAY_SRC='assets/cat-play.png';
const SLEEP_SRC='assets/cat-sleep.png';
function setState(next, opts={}){
  state=next;
  catBtn.classList.toggle('playing', next==='playing');
  if(next==='moving'){
    catImg.src=RUN_SRC; catImg.alt='SuiCat — moving';
    catLabel.textContent='tap me ✦';
    if(!opts.silent) announce('SuiCat is moving');
  }else if(next==='playing'){
    catImg.src=PLAY_SRC; catImg.alt='SuiCat — playing with the SUI ball';
    catLabel.textContent='*pounce*';
    announce('SuiCat is playing with the SUI ball');
    if(heroBubble) heroBubble.textContent='*pounce* — SUI ball acquired ✦';
  }else if(next==='sleeping'){
    catImg.src=SLEEP_SRC; catImg.alt='SuiCat — sleeping';
    catLabel.textContent='zZ… tap to wake';
    announce('SuiCat fell asleep');
    if(heroBubble) heroBubble.textContent='shh… cat is dozing. tap to wake ✦';
  }
  catImg.style.opacity='0';
  requestAnimationFrame(()=>{ catImg.style.opacity='1'; });
}
function scheduleSleep(){
  clearTimeout(sleepTimer);
  sleepTimer=setTimeout(()=>{ if(state!=='playing') setState('sleeping'); }, 5000);
}
function triggerPlay(){
  clearTimeout(playTimer); clearTimeout(sleepTimer);
  setState('playing');
  playTimer=setTimeout(()=>{ setState('moving'); scheduleSleep(); }, 1800);
  scheduleSleep();
}
function wakeOnActivity(){
  if(state==='sleeping'){
    clearTimeout(playTimer);
    setState('moving');
  }
  scheduleSleep();
}
// throttle wake to avoid spam
let wakeThrottle=null;
function handleGlobalActivity(){
  if(wakeThrottle) return;
  wakeThrottle=setTimeout(()=>wakeThrottle=null, 250);
  wakeOnActivity();
}
catBtn.addEventListener('click', triggerPlay);
catBtn.addEventListener('keydown', e=>{
  if(e.key==='Enter' || e.key===' '){ e.preventDefault(); triggerPlay(); }
});
// wake on any movement/activity, not just tapping the cat
['mousemove','mousedown','keydown','touchstart','scroll','wheel'].forEach(ev=>{
  window.addEventListener(ev, handleGlobalActivity, {passive:true});
});
document.addEventListener('visibilitychange', ()=>{
  if(!document.hidden) scheduleSleep();
});
// motion bob via CSS — respect reduced motion, keep transform free for mobile centering
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function syncIdle(){
  if(!prefersReduced && state==='moving') catBtn.classList.add('idle');
  else catBtn.classList.remove('idle');
}
// patch setState to sync idle class after state change
const _setStateOrig = setState;
setState = function(next, opts={}){
  _setStateOrig(next, opts);
  syncIdle();
};
syncIdle();
scheduleSleep();
// cleanup on page hide
document.addEventListener('visibilitychange', ()=>{ if(document.hidden){ clearTimeout(sleepTimer); clearTimeout(playTimer);} else scheduleSleep(); });
window.addEventListener('beforeunload', ()=>{ clearTimeout(sleepTimer); clearTimeout(playTimer); });

/* tabs */
document.querySelectorAll('.tab').forEach(b=>{
  b.addEventListener('click', ()=>{
    const scope=b.closest('.lab');
    scope.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const t=b.dataset.tab;
    scope.querySelectorAll('.tab-pane').forEach(p=> p.hidden = p.dataset.pane!==t);
  });
});
/* oracle + forge */
const $=s=>document.querySelector(s);
const fortunes=["The hourglass tips. Your high score will outlive the cycles.","Three fish, one pounce. Your site is the pounce.","Sui pays the gas, SuiCat pays the vibes. You ship.","Walrus remembers. Your blobs are cozy and replicated.","The judges pause. Then they smile. It's the whiskers.","Move keeps it soft. Sui keeps it fast. You keep the fish.","You didn't choose the loaf. The loaf chose you.","A sunbeam hits the next Sui block. That's your window.","Most cats knock things off tables. SuiCat knocks fees off names.","Your clip will be screenshotted in the group chat."];
function doAsk(){
  const q=$('#q').value.trim();
  if(!q){ $('#q').focus(); $('#q').style.borderColor='var(--amber)'; setTimeout(()=>$('#q').style.borderColor='',900); return; }
  const f=fortunes[Math.floor(Math.random()*fortunes.length)];
  $('#oracleOut').innerHTML='<div><div class="mono" style="font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); font-weight:700">Q: '+q.replace(/</g,'&lt;')+'</div><div style="font-size:15px; font-weight:800; margin-top:8px; line-height:1.45">'+f+'</div></div>';
  if(heroBubble) heroBubble.textContent=f;
}
document.getElementById('askBtn').addEventListener('click', doAsk);
document.getElementById('q').addEventListener('keydown', e=>{ if(e.key==='Enter') doAsk(); });
const prefixes=["purr","whisker","loaf","mew","neko","sui","walrus","epoch","aqua","miso","mochi","yuzu","tuna","sunbeam","velvet","amber"];
const suffixes=["sanctuary","loaf","verse","haven","cove","den","nook","bloom","paws","whisk","mansion","atsui","onwalrus","dotepoch"];
function forge(){
  const seed=document.getElementById('forgeInput').value.trim().toLowerCase().replace(/[^a-z0-9]/g,"") || prefixes[Math.floor(Math.random()*prefixes.length)];
  const out=[];
  for(let i=0;i<6;i++){
    const a=i<2?seed:prefixes[Math.floor(Math.random()*prefixes.length)];
    const b=suffixes[Math.floor(Math.random()*suffixes.length)];
    const glue=Math.random()>.5?"-":"";
    const name=(a+glue+b).replace(/--/g,"-");
    const avail=Math.random()>.18?"available vibe ✓":"taken — try variant";
    const color=avail.includes("available")?"var(--aqua)":"var(--dim)";
    out.push('<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:10px 12px"><div><div style="font-weight:800; font-size:14px">'+name+'.<span style="color:var(--sui)">epoch</span></div><div class="mono" style="font-size:11px; color:'+color+'">'+avail+' • '+name+'.epochsui.com</div></div><button class="btn btn-ghost" style="padding:7px 12px; font-size:12px" onclick="navigator.clipboard.writeText(\''+name+'.epoch\').then(()=>announce(\'Copied \'+this.textContent))">Copy</button></div>');
  }
  document.getElementById('forgeOut').innerHTML=out.join('')+'<div class="mono" style="font-size:11px; color:var(--muted); margin-top:6px">Tip: Built on Sui — fast, object-centric, and yours.</div>';
}
document.getElementById('forgeBtn').addEventListener('click', forge);
document.getElementById('forgeInput').addEventListener('keydown', e=>{ if(e.key==='Enter') forge(); });
/* share kit */
function buildShare(){
  const base=document.getElementById('previewText').innerText.replace(/\s+/g,' ').trim();
  return base + ' @Suicatdotsui @EpochSui';
}
document.getElementById('postToX').addEventListener('click', e=>{
  e.preventDefault();
  const url='https://twitter.com/intent/tweet?text='+encodeURIComponent(buildShare());
  window.open(url,'_blank','width=560,height=520');
});
document.getElementById('copyPreview').addEventListener('click', ()=>{
  const t=buildShare();
  (navigator.clipboard?navigator.clipboard.writeText(t).catch(()=>fallbackCopy(t)):Promise.resolve(fallbackCopy(t))).then(()=>{
    const b=document.getElementById('copyPreview'); const o=b.textContent; b.textContent='Copied!'; setTimeout(()=>b.textContent=o,1400); announce('Share text copied');
  });
});
document.getElementById('copyAll').addEventListener('click', ()=>{
  const t=buildShare();
  (navigator.clipboard?navigator.clipboard.writeText(t).catch(()=>fallbackCopy(t)):Promise.resolve(fallbackCopy(t))).then(()=>{
    const b=document.getElementById('copyAll'); const o=b.textContent; b.textContent='Copied share text ✓'; setTimeout(()=>b.textContent=o,1400); announce('Share text copied');
  });
});
document.getElementById('downloadSite').addEventListener('click', e=>{
  e.preventDefault();
  const html=document.documentElement.outerHTML;
  const blob=new Blob([html], {type:'text/html'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='suicat-catverse-index.html'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
});