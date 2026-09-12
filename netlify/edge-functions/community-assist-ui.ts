import type { Context, Config } from "@netlify/edge-functions";

const styles = `
<style id="ca-simplified-ui">
:root{--ca-green:#173d32;--ca-soft:#eef5f1;--ca-border:#dce6e0}
.hero{padding:20px 18px}.hero h1{font-size:clamp(2.15rem,7vw,4rem);max-width:760px}.hero>p{display:none!important}.hero>small{opacity:.82}
.hero .actions button{display:none}.hero .actions #startReport,.hero .actions #myIssuesBtn,.hero .actions #notificationsBtn,.hero .actions #quickLocation,.hero .actions #caMoreBtn{display:inline-flex;align-items:center;justify-content:center}
#trustCard,main>.footer-note.card{display:none!important}
#draftStatus,#step1>p.tiny,#step2 .route:has(>b:first-child:nth-last-child(n+1)){ }
.ca-hidden-copy{display:none!important}.ca-simple-head p,.ca-simple-head small.long-copy{display:none!important}
.ca-more-sheet{position:fixed;inset:0;background:rgba(12,28,23,.34);z-index:1000;display:none;align-items:flex-end;justify-content:center;padding:14px}.ca-more-sheet.open{display:flex}.ca-more-panel{background:#fff;width:min(620px,100%);border-radius:24px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.18)}.ca-more-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ca-more-grid button{min-height:48px;text-align:left;border-radius:15px}.ca-more-close{width:100%;margin-top:10px}
.ca-bottom-nav{display:none}.ca-smart-watch{background:#f7faf8;border:1px solid var(--ca-border);border-radius:18px;padding:13px;margin-top:10px}.ca-smart-row{display:grid;grid-template-columns:1fr auto;gap:8px}.ca-smart-row button{border-radius:13px}.ca-place{margin-top:10px;padding:12px;background:#fff;border:1px solid var(--ca-border);border-radius:15px}.ca-place h3{margin:0 0 3px}.ca-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ca-chip{font-size:.74rem;font-weight:800;background:#e8f3ed;color:#245b44;padding:.4rem .58rem;border-radius:999px}.ca-context-details{margin-top:9px;border-top:1px solid #e4ebe7;padding-top:8px}.ca-context-details summary{cursor:pointer;font-weight:800;color:#315f4e}.ca-context-list{display:grid;gap:7px;margin-top:8px}.ca-context-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-bottom:1px solid #edf1ef}.ca-context-item:last-child{border-bottom:0}.ca-context-item small{display:block;color:#6a7972}.ca-context-item button{padding:.48rem .62rem;font-size:.76rem}.ca-watch-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.ca-watch-actions button{min-height:42px}.ca-watch-list{margin-top:12px}.ca-watch-line{display:flex;justify-content:space-between;gap:8px;align-items:center;padding:10px 0;border-top:1px solid #e7ece9}.ca-watch-line:first-child{border-top:0}.ca-watch-line b{display:block}.ca-watch-line small{color:#6a7972}.ca-advanced{margin-top:12px}.ca-advanced summary{cursor:pointer;font-weight:800;color:#4a665b;padding:8px 0}.ca-advanced .grid{margin-top:8px}
#watchCenterCard>.head .eyebrow,#watchCenterCard>.head+ p.tiny{display:none!important}#watchCenterCard>.head h2{font-size:1.55rem}
#watchCenterCard>.route:first-of-type{display:none!important}
#watchCenterCard>.grid{display:none!important}
#watchCenterCard.ca-advanced-open>.grid{display:grid!important}
#watchCenterCard.ca-advanced-open>.route:first-of-type{display:block!important}
#watchCenterCard .ca-watch-native-lists{display:none}
.stepbar{margin:10px 0}.stepbar span{padding:.42rem .15rem}.card{scroll-margin-top:76px}
#step1 .route:has(#publicSummary){margin-top:8px}#step2 .route:has(.privacy-choice){margin-top:8px}#step2 .route:has(>b:first-child){ }
.ca-about-note{font-size:.78rem;color:#6d7b75;margin-top:10px}
@media(max-width:760px){body{padding-bottom:74px}.shell{padding:8px}.top{padding:9px 12px}.logo{width:36px;height:36px}.brand small{display:none}.hero{border-radius:18px;padding:18px 15px}.hero h1{font-size:2.25rem;margin:.28rem 0 .7rem}.hero .actions{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.hero .actions button{min-height:44px;font-size:.9rem}.hero .actions #quickLocation{display:none}.card{border-radius:18px;padding:14px;margin-top:9px;box-shadow:none}.head h2{font-size:1.35rem}.eyebrow{font-size:.64rem}.tiny{font-size:.78rem}.route,.notice,.success{padding:10px;margin:8px 0}.metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.metric{padding:9px}.metric b{font-size:1.05rem}.ca-bottom-nav{position:fixed;left:8px;right:8px;bottom:8px;z-index:900;display:grid;grid-template-columns:repeat(5,1fr);background:#fff;border:1px solid var(--ca-border);border-radius:18px;padding:6px;box-shadow:0 10px 32px rgba(18,45,36,.18)}.ca-bottom-nav button{padding:7px 3px;background:transparent;border-radius:12px;font-size:.67rem;min-height:48px}.ca-bottom-nav button b{display:block;font-size:1rem;margin-bottom:1px}.ca-more-sheet{padding:8px}.ca-more-panel{border-radius:20px}.ca-smart-row{grid-template-columns:1fr}.ca-smart-row button{width:100%}.ca-context-item{align-items:flex-start}.ca-watch-actions{display:grid;grid-template-columns:1fr 1fr}.ca-watch-actions button{width:100%}.privacy-choice{grid-template-columns:1fr}.trust-grid{grid-template-columns:1fr}.issue-actions{gap:6px}.issue-actions button,.issue-actions .linkbtn,.issue-actions .secondary-link{padding:.58rem .7rem;font-size:.78rem}.stats{gap:8px}.stats span{font-size:.72rem}}
@media(max-width:430px){.hero .actions{grid-template-columns:1fr 1fr}.ca-more-grid{grid-template-columns:1fr 1fr}.ca-watch-actions{grid-template-columns:1fr}}
</style>`;

const script = `
<script id="ca-simplified-ui-script">
(()=>{
  const onReady=(fn)=>document.readyState==='complete'?fn():addEventListener('load',fn,{once:true});
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  function config(){
    const source=[...document.scripts].filter(s=>s.type==='module').map(s=>s.textContent||'').join('\n');
    return{url:source.match(/const SUPABASE_URL='([^']+)'/)?.[1]||'',key:source.match(/const KEY='([^']+)'/)?.[1]||''};
  }
  function authToken(){
    try{
      for(const k of Object.keys(localStorage)){
        if(!/^sb-.*-auth-token$/.test(k))continue;
        const v=JSON.parse(localStorage.getItem(k)||'null');
        const t=v?.access_token||v?.currentSession?.access_token||v?.session?.access_token;
        if(t)return t;
      }
    }catch{}
    return'';
  }
  async function fnFetch(name,{method='GET',body=null,query=null,auth=false}={}){
    const c=config();if(!c.url||!c.key)throw new Error('Community Assist connection is unavailable.');
    const u=new URL(c.url+'/functions/v1/'+name);if(query)Object.entries(query).forEach(([k,v])=>v!==undefined&&v!==null&&v!==''&&u.searchParams.set(k,String(v)));
    const headers={apikey:c.key};if(body)headers['Content-Type']='application/json';if(auth){const t=authToken();if(!t)throw new Error('SIGN_IN_REQUIRED');headers.Authorization='Bearer '+t}
    const r=await fetch(u,{method,headers,body:body?JSON.stringify(body):undefined});const p=await r.json().catch(()=>({}));if(!r.ok)throw new Error(p.error||p.message||'Request failed.');return p;
  }
  const click=id=>{$(id)?.click()};
  function simplifyHero(){
    const hero=document.querySelector('.hero');if(!hero)return;
    const small=hero.querySelector(':scope>small');if(small)small.textContent='YOUR NEIGHBORHOOD · ONE PLACE TO ACT';
    const h=hero.querySelector('h1');if(h)h.innerHTML='Report it. Track it. <em>Get action.</em>';
    const more=document.createElement('button');more.id='caMoreBtn';more.textContent='More';hero.querySelector('.actions')?.appendChild(more);more.onclick=openMore;
  }
  function addMoreSheet(){
    if($('caMoreSheet'))return;
    const d=document.createElement('div');d.id='caMoreSheet';d.className='ca-more-sheet';d.innerHTML='<div class="ca-more-panel"><div class="head"><div><b>More</b></div><button id="caMoreX">Close</button></div><div class="ca-more-grid"><button data-go="aroundMe">◎ Nearby</button><button data-go="watchesBtn">◉ Watch an area</button><button data-go="browseIssuesBtn">Browse issues</button><button data-go="findCaseBtn">Find a case</button><button data-go="civicDashboardBtn">Civic dashboard</button><button data-go="privacyBtn">Privacy & data</button><button id="caAboutBtn">About</button></div></div>';document.body.appendChild(d);
    d.addEventListener('click',e=>{if(e.target===d)d.classList.remove('open')});$('caMoreX').onclick=()=>d.classList.remove('open');d.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{d.classList.remove('open');click(b.dataset.go)});$('caAboutBtn').onclick=()=>{d.classList.remove('open');showAbout()};
  }
  function openMore(){addMoreSheet();$('caMoreSheet').classList.add('open')}
  function showAbout(){
    const trust=$('trustCard');if(trust){trust.style.setProperty('display','block','important');trust.scrollIntoView({behavior:'smooth',block:'start'});return}
    alert('Community Assist connects resident reports, public records, verification and accountability. Detailed privacy and methodology information is available in the app when needed.');
  }
  function addBottomNav(){
    if($('caBottomNav'))return;const n=document.createElement('nav');n.id='caBottomNav';n.className='ca-bottom-nav';n.innerHTML='<button data-bottom="home"><b>⌂</b>Home</button><button data-bottom="report"><b>＋</b>Report</button><button data-bottom="nearby"><b>◎</b>Nearby</button><button data-bottom="mine"><b>☑</b>My issues</button><button data-bottom="more"><b>•••</b>More</button>';document.body.appendChild(n);
    n.querySelector('[data-bottom="home"]').onclick=()=>scrollTo({top:0,behavior:'smooth'});n.querySelector('[data-bottom="report"]').onclick=()=>click('startReport');n.querySelector('[data-bottom="nearby"]').onclick=()=>$('pulseCard')?.scrollIntoView({behavior:'smooth',block:'start'});n.querySelector('[data-bottom="mine"]').onclick=()=>click('myIssuesBtn');n.querySelector('[data-bottom="more"]').onclick=openMore;
  }
  function simplifyCopy(){
    $('draftStatus')?.classList.add('ca-hidden-copy');
    const jurisdiction=[...document.querySelectorAll('#step2 .route')].find(x=>x.querySelector('b')?.textContent?.trim()==='Jurisdiction check');if(jurisdiction)jurisdiction.classList.add('ca-hidden-copy');
    const trust=$('trustCard');if(trust)trust.style.display='none';
    const photo=[...document.querySelectorAll('main>.card')].find(x=>x.querySelector('.eyebrow')?.textContent?.includes('PHOTO EVIDENCE'));if(photo)photo.style.display='none';
    const reportHead=[...document.querySelectorAll('main>.card .head h2')].find(x=>x.textContent.includes('Report a neighborhood problem'));if(reportHead)reportHead.textContent='Report an issue';
  }
  function compactActionLabels(root=document){
    root.querySelectorAll('[data-progress]').forEach(b=>b.textContent='Track');root.querySelectorAll('[data-timeline]').forEach(b=>b.textContent='History');root.querySelectorAll('[data-field-update]').forEach(b=>b.textContent='Update');root.querySelectorAll('[data-share-verify]').forEach(b=>b.textContent='Invite neighbor');root.querySelectorAll('[data-e]').forEach(b=>b.textContent='Take action');
  }
  let selected=null;
  const boroughNames={1:'Manhattan',2:'Bronx',3:'Brooklyn',4:'Queens',5:'Staten Island'};
  function boardLabel(code){const n=Number(code);if(!Number.isFinite(n))return'';return (boroughNames[Math.floor(n/100)]||'NYC')+' Community Board '+(n%100)}
  function watchMarkup(){return '<div class="ca-smart-watch"><div class="ca-smart-row"><input id="caWatchSearch" inputmode="search" placeholder="ZIP, address, place or coordinates"><button id="caWatchFind" class="primary">Find</button></div><div class="ca-watch-actions"><button id="caWatchGPS">Use my location</button></div><div id="caWatchResult"></div><div id="caMyWatches" class="ca-watch-list"></div><details class="ca-advanced" id="caAdvancedWatch"><summary>Advanced options</summary></details></div>'}
  async function resolveContext(item){
    const q=item.postalCode?{postalCode:item.postalCode}:{lat:item.latitude,lng:item.longitude};try{return await fnFetch('location-context',{query:q})}catch{return{locality:{displayName:item.label,postalCode:item.postalCode||null,latitude:item.latitude,longitude:item.longitude},civic:{},agencies:[],coverageMessage:'Location found.'}}
  }
  function renderContext(item,ctx){
    selected={...item,ctx};const box=$('caWatchResult');if(!box)return;const loc=ctx.locality||{};const civic=ctx.civic||{};const agencies=Array.isArray(ctx.agencies)?ctx.agencies:[];const chips=[];if(loc.postalCode)chips.push('ZIP '+loc.postalCode);if(civic.communityDistrictCode)chips.push(boardLabel(civic.communityDistrictCode));if(civic.councilDistrict)chips.push('Council '+civic.councilDistrict);
    const agencyHtml=agencies.map(a=>'<div class="ca-context-item"><div><b>'+esc(a.shortName)+'</b><small>'+esc(a.topic||a.fullName||'')+'</small></div><button data-follow-agency="'+esc(a.shortName)+'">Follow</button></div>').join('');
    const districtHtml=(civic.communityDistrictCode?'<div class="ca-context-item"><div><b>'+esc(boardLabel(civic.communityDistrictCode))+'</b></div><button data-follow-scope="community_board" data-code="'+esc(civic.communityDistrictCode)+'">Follow</button></div>':'')+(civic.councilDistrict?'<div class="ca-context-item"><div><b>Council District '+esc(civic.councilDistrict)+'</b></div><button data-follow-scope="council_district" data-code="'+esc(civic.councilDistrict)+'">Follow</button></div>':'');
    box.innerHTML='<div class="ca-place"><h3>'+esc(loc.displayName||item.label)+'</h3><div class="ca-chips">'+chips.map(x=>'<span class="ca-chip">'+esc(x)+'</span>').join('')+'</div><div class="ca-watch-actions"><button id="caSaveArea" class="primary">'+(item.scopeMode==='postal_code'?'Watch this ZIP':'Watch 1 km around here')+'</button></div><details class="ca-context-details" '+(agencyHtml||districtHtml?'':'hidden')+'><summary>Agencies & districts</summary><div class="ca-context-list">'+districtHtml+agencyHtml+'</div></details><p class="ca-about-note">'+esc(ctx.coverageMessage||'')+'</p><div id="caWatchMsg"></div></div>';
    $('caSaveArea').onclick=saveArea;box.querySelectorAll('[data-follow-agency]').forEach(b=>b.onclick=()=>saveScope('agency',b.dataset.followAgency));box.querySelectorAll('[data-follow-scope]').forEach(b=>b.onclick=()=>saveScope(b.dataset.followScope,b.dataset.code));
  }
  async function chooseItem(item){$('caWatchResult').innerHTML='<div class="notice">Loading area…</div>';const ctx=await resolveContext(item);renderContext(item,ctx)}
  async function findWatchLocation(){const q=String($('caWatchSearch')?.value||'').trim();if(q.length<3){$('caWatchResult').innerHTML='<div class="notice err">Enter a ZIP, address, place or coordinates.</div>';return}$('caWatchResult').innerHTML='<div class="notice">Finding location…</div>';try{const p=await fnFetch('location-search',{query:{text:q,mode:'watch'}});const items=Array.isArray(p.results)?p.results:[];if(!items.length){$('caWatchResult').innerHTML='<p class="empty">No location found.</p>';return}if(items.length===1){await chooseItem(items[0]);return}$('caWatchResult').innerHTML=items.map((i,n)=>'<div class="ca-context-item"><div><b>'+esc(i.label)+'</b></div><button data-ca-place="'+n+'">Use</button></div>').join('');$('caWatchResult').querySelectorAll('[data-ca-place]').forEach(b=>b.onclick=()=>chooseItem(items[Number(b.dataset.caPlace)]))}catch(e){$('caWatchResult').innerHTML='<div class="notice err">'+esc(e.message)+'</div>'}}
  function useGPS(){if(!navigator.geolocation){$('caWatchResult').innerHTML='<div class="notice err">Location is unavailable in this browser.</div>';return}navigator.geolocation.getCurrentPosition(p=>chooseItem({label:'Current location',latitude:p.coords.latitude,longitude:p.coords.longitude,scopeMode:'radius',locationKind:'coordinates'}),()=>{$('caWatchResult').innerHTML='<div class="notice err">Could not access your location.</div>'},{enableHighAccuracy:true,timeout:12000,maximumAge:15000})}
  async function saveArea(){if(!selected)return;const token=authToken();if(!token){click('authBtn');$('caWatchMsg').innerHTML='<div class="notice">Sign in to save this area.</div>';return}const loc=selected.ctx?.locality||{};const body={label:loc.displayName||selected.label,lat:Number(selected.latitude),lng:Number(selected.longitude),categoryKeys:[]};if(selected.scopeMode==='postal_code'&&selected.postalCode)body.postalCode=selected.postalCode;else body.radiusMeters=1000;try{await fnFetch('area-watches',{method:'POST',body,auth:true});$('caWatchMsg').innerHTML='<div class="success"><b>Area saved.</b></div>';await loadQuickWatches()}catch(e){$('caWatchMsg').innerHTML='<div class="notice err">'+esc(e.message==='SIGN_IN_REQUIRED'?'Sign in to save this area.':e.message)+'</div>'}}
  async function saveScope(type,code){const msg=$('caWatchMsg');if(!authToken()){click('authBtn');if(msg)msg.innerHTML='<div class="notice">Sign in to follow this.</div>';return}try{await fnFetch('scope-watches',{method:'POST',body:{scopeType:type,scopeCode:String(code),categoryKeys:[]},auth:true});if(msg)msg.innerHTML='<div class="success"><b>Following.</b></div>'}catch(e){if(msg)msg.innerHTML='<div class="notice err">'+esc(e.message)+'</div>'}}
  async function loadQuickWatches(){const box=$('caMyWatches');if(!box)return;if(!authToken()){box.innerHTML='';return}try{const p=await fnFetch('area-watches',{auth:true});const items=Array.isArray(p.watches)?p.watches:[];box.innerHTML=items.length?'<h3>My areas</h3>'+items.map(w=>'<div class="ca-watch-line"><div><b>'+esc(w.label)+'</b><small>'+(w.watchKind==='postal_code'&&w.postalCode?'ZIP '+esc(w.postalCode):Math.round(Number(w.radiusMeters||0)/100)/10+' km')+'</small></div><button data-ca-delete="'+esc(w.id)+'">Stop</button></div>').join(''):'';box.querySelectorAll('[data-ca-delete]').forEach(b=>b.onclick=()=>deleteQuickWatch(b.dataset.caDelete))}catch{box.innerHTML=''}}
  async function deleteQuickWatch(id){try{const c=config(),t=authToken();const r=await fetch(c.url+'/functions/v1/area-watches?id='+encodeURIComponent(id),{method:'DELETE',headers:{apikey:c.key,Authorization:'Bearer '+t}});if(!r.ok)throw new Error('Unable to remove watch.');await loadQuickWatches()}catch(e){$('caMyWatches').insertAdjacentHTML('afterbegin','<div class="notice err">'+esc(e.message)+'</div>')}}
  function rebuildWatchCenter(){const card=$('watchCenterCard');if(!card||$('caWatchSearch'))return;const head=card.querySelector('.head h2');if(head)head.textContent='Watch an area';const oldGrid=card.querySelector(':scope>.grid');const oldFilter=card.querySelector(':scope>.route');card.querySelector('.head')?.insertAdjacentHTML('afterend',watchMarkup());const advanced=$('caAdvancedWatch');if(advanced){if(oldFilter)advanced.appendChild(oldFilter);if(oldGrid)advanced.appendChild(oldGrid)}$('caWatchFind').onclick=findWatchLocation;$('caWatchSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();findWatchLocation()}});$('caWatchGPS').onclick=useGPS;loadQuickWatches()}
  function observe(){const mo=new MutationObserver(()=>compactActionLabels());mo.observe(document.body,{subtree:true,childList:true});compactActionLabels()}
  onReady(()=>{simplifyHero();addMoreSheet();addBottomNav();simplifyCopy();rebuildWatchCenter();observe()});
})();
</script>`;

export default async (_req: Request, context: Context) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  const updated = html.includes("ca-simplified-ui-script") ? html : html.replace("</head>", styles + "</head>").replace("</body>", script + "</body>");
  return new Response(updated, { status: response.status, statusText: response.statusText, headers });
};

export const config: Config = { path: "/*" };
