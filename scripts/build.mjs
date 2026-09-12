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

let html = base;
if (!html.includes('id="ca-simplified-ui"')) {
  html = html.replace('</body>', `${stylesMatch[1]}\n${uiScript}\n</body>`);
}

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html, 'utf8');
await writeFile('dist/netlify.toml', '[build]\n  publish = "."\n', 'utf8');

// The UI payload is now baked into dist/index.html. Remove the runtime Edge Function
// from the build workspace so Netlify serves the verified static page directly.
await rm('netlify/edge-functions', { recursive: true, force: true });

console.log('Built dist/index.html with mobile-safe simplified UI and disabled runtime edge rewriting.');
