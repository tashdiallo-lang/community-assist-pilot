import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';

const base = await readFile('index.html', 'utf8');
const edge = await readFile('netlify/edge-functions/community-assist-ui.ts', 'utf8');

const stylesMatch = edge.match(/const styles = `([\s\S]*?)`;\n\nconst script = `/);
const scriptMatch = edge.match(/const script = `([\s\S]*?)`;\n\nexport default/);
if (!stylesMatch || !scriptMatch) throw new Error('Could not extract simplified UI payload from edge function.');

let uiScript = scriptMatch[1];
const unsafeLabels = "function compactActionLabels(root=document){\n    root.querySelectorAll('[data-progress]').forEach(b=>b.textContent='Track');root.querySelectorAll('[data-timeline]').forEach(b=>b.textContent='History');root.querySelectorAll('[data-field-update]').forEach(b=>b.textContent='Update');root.querySelectorAll('[data-share-verify]').forEach(b=>b.textContent='Invite neighbor');root.querySelectorAll('[data-e]').forEach(b=>b.textContent='Take action');\n  }";
const safeLabels = "function compactActionLabels(root=document){\n    const set=(sel,label)=>root.querySelectorAll(sel).forEach(b=>{if(b.textContent!==label)b.textContent=label});\n    set('[data-progress]','Track');set('[data-timeline]','History');set('[data-field-update]','Update');set('[data-share-verify]','Invite neighbor');set('[data-e]','Take action');\n  }";
if (!uiScript.includes(unsafeLabels)) throw new Error('Could not find action-label observer payload to harden.');
uiScript = uiScript.replace(unsafeLabels, safeLabels);

// iOS only opens the keyboard when focus remains inside the real user gesture.
// The bottom navigation previously used only a synthetic click, so focus could be
// lost even though the report form scrolled into view.
const oldBottomReport = "n.querySelector('[data-bottom=\"report\"]').onclick=()=>click('startReport');";
const newBottomReport = "n.querySelector('[data-bottom=\"report\"]').onclick=()=>{click('startReport');const d=$('description');if(d)d.focus({preventScroll:true})};";
if (!uiScript.includes(oldBottomReport)) throw new Error('Could not find the mobile Report navigation handler to harden.');
uiScript = uiScript.replace(oldBottomReport, newBottomReport);

const actionUi = `
<style id="ca-action-ui">
.ca-flow-details,.ca-case-more{margin:10px 0;border:1px solid #dfe8e3;border-radius:14px;background:#f9fbfa;padding:0 11px}.ca-flow-details>summary,.ca-case-more>summary{cursor:pointer;font-weight:850;color:#315f4e;padding:11px 2px;list-style:none}.ca-flow-details>summary::-webkit-details-marker,.ca-case-more>summary::-webkit-details-marker{display:none}.ca-flow-details>summary:after,.ca-case-more>summary:after{content:'+';float:right}.ca-flow-details[open]>summary:after,.ca-case-more[open]>summary:after{content:'−'}.ca-flow-details .route,.ca-flow-details .upload{margin:7px 0}.ca-flow-details .route>b:first-child,.ca-flow-details .route>small:first-of-type{display:none}.ca-privacy-compact .privacy-choice small{display:none}.ca-privacy-compact #locationPrivacyNote,.ca-privacy-compact #publicLocationPreview{display:none}.ca-case-simple>.issue-actions{gap:6px}.ca-case-more{margin-top:8px}.ca-case-more .issue-actions{margin:0 0 10px}.ca-case-more .issue-actions button{font-size:.76rem;padding:.52rem .65rem}#step3>.route>p.tiny{display:none}.ca-flow-details label.tiny{display:block;margin-top:8px}@media(max-width:760px){.stepbar span{font-size:.68rem}.ca-flow-details,.ca-case-more{margin:8px 0}.ca-case-simple>.issue-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.ca-case-simple>.issue-actions button{width:100%;min-height:42px}.ca-case-more .issue-actions{display:grid;grid-template-columns:1fr 1fr}.ca-case-more .issue-actions button{width:100%}}
</style>
<script id="ca-action-ui-script">
(()=>{
  const onReady=fn=>document.readyState==='complete'?fn():addEventListener('load',fn,{once:true});
  const $=id=>document.getElementById(id);
  function wrapNode(id,label,node,extraClass=''){
    if(!node||$(id))return null;
    const d=document.createElement('details');d.id=id;d.className=('ca-flow-details '+extraClass).trim();
    const s=document.createElement('summary');s.textContent=label;d.appendChild(s);
    node.parentNode.insertBefore(d,node);d.appendChild(node);return d;
  }
  function simplifyReport(){
    const desc=$('description');if(!desc)return;
    const card=desc.closest('section.card');
    const head=card?.querySelector('.head h2');if(head)head.textContent='Report an issue';
    [['s1','1 What'],['s2','2 Where'],['s3','3 Same issue?'],['s4','4 Done']].forEach(([id,label])=>{const el=$(id);if(el&&el.textContent!==label)el.textContent=label});
    desc.placeholder="What's happening?";
    if(!$('caReportMore')){
      const step1=$('step1'),before=$('toLocation');
      const d=document.createElement('details');d.id='caReportMore';d.className='ca-flow-details';
      const s=document.createElement('summary');s.textContent='Add details (optional)';d.appendChild(s);
      const body=document.createElement('div');d.appendChild(body);
      step1?.insertBefore(d,before||null);
      const publicRoute=$('publicSummary')?.closest('.route');
      const upload=$('reportPhoto')?.closest('.upload');
      const routeBox=$('routeBox');
      const category=$('categoryOverride');
      const categoryLabel=step1?.querySelector('label[for="categoryOverride"]');
      const categoryHelp=category?.nextElementSibling?.matches('p.tiny')?category.nextElementSibling:null;
      [publicRoute,upload,routeBox,categoryLabel,category,categoryHelp].filter(Boolean).forEach(n=>body.appendChild(n));
    }
    const addressRoute=$('addressSearch')?.closest('.route');wrapNode('caAddressMore','Search address',addressRoute);
    const privacyRoute=$('locationPrivacyNote')?.closest('.route');wrapNode('caPrivacyMore','Location privacy',privacyRoute,'ca-privacy-compact');
    const safety=$('safetyStatus')?.closest('.route');if(safety){const b=safety.querySelector('b');const sm=safety.querySelector('small');if(b)b.textContent='Safety';if(sm)sm.textContent='Immediate danger?'}
    const match=$('step3')?.querySelector('.route');if(match){const b=match.querySelector('b');if(b)b.textContent='Possible match nearby'}
    if($('successContinue'))$('successContinue').textContent='My issues';
    if($('successProgress'))$('successProgress').textContent='Track';
    if($('successShare'))$('successShare').textContent='Share';
    if($('anotherReport'))$('anotherReport').textContent='Report another';
  }
  function simplifyCase(issue){
    if(!issue||issue.classList.contains('ca-case-simple'))return;
    issue.classList.add('ca-case-simple');
    const row=[...issue.children].find(el=>el.classList?.contains('issue-actions'));if(!row)return;
    const secondary=[...row.querySelectorAll('[data-share-case],[data-timeline],[data-notify-toggle]')];
    if(!secondary.length)return;
    const d=document.createElement('details');d.className='ca-case-more';
    const s=document.createElement('summary');s.textContent='More';d.appendChild(s);
    const body=document.createElement('div');body.className='issue-actions';d.appendChild(body);
    secondary.forEach(b=>body.appendChild(b));row.insertAdjacentElement('afterend',d);
  }
  function scan(root=document){simplifyReport();root.querySelectorAll?.('article.issue').forEach(simplifyCase)}
  onReady(()=>scan());
  new MutationObserver(list=>{for(const m of list)for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('article.issue'))simplifyCase(n);n.querySelectorAll?.('article.issue').forEach(simplifyCase)}}).observe(document.body,{childList:true,subtree:true});
})();
</script>`;

let html = base;

// Give the report flow a permanent target instead of relying on page position.
const reportSectionStart = '<section class="card"><div class="head"><div><div class="eyebrow">LIVE REPORT FLOW</div>';
const reportSectionStable = '<section id="reportFlowCard" class="card"><div class="head"><div><div class="eyebrow">LIVE REPORT FLOW</div>';
if (!html.includes(reportSectionStart)) throw new Error('Could not find the report flow section to assign a stable target.');
html = html.replace(reportSectionStart, reportSectionStable);

// Keep focus synchronous with the real Report tap so iOS is allowed to open the keyboard.
const oldReportHandler = "$('startReport').onclick=()=>{setStep(1);document.querySelector('.card:nth-of-type(2)')?.scrollIntoView({behavior:'smooth'})}";
const newReportHandler = "$('startReport').onclick=()=>{setStep(1);const d=$('description');if(d)d.focus({preventScroll:true});document.getElementById('reportFlowCard')?.scrollIntoView({behavior:'smooth',block:'start'})}";
if (!html.includes(oldReportHandler)) throw new Error('Could not find the legacy Report button handler to replace.');
html = html.replace(oldReportHandler, newReportHandler);

if (!html.includes('id="ca-simplified-ui"')) {
  html = html.replace('</body>', `${stylesMatch[1]}\n${uiScript}\n</body>`);
}
if (!html.includes('id="ca-action-ui"')) {
  html = html.replace('</body>', `${actionUi}\n</body>`);
}

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html, 'utf8');
await writeFile('dist/netlify.toml', '[build]\n  publish = "."\n', 'utf8');

// The UI payload is now baked into dist/index.html. Remove the runtime Edge Function
// from the build workspace so Netlify serves the verified static page directly.
await rm('netlify/edge-functions', { recursive: true, force: true });

console.log('Built dist/index.html with verified mobile-safe report and case-action UI.');
