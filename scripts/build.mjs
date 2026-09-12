import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';

const base = await readFile('index.html', 'utf8');
const edge = await readFile('netlify/edge-functions/community-assist-ui.ts', 'utf8');

const stylesMatch = edge.match(/const styles = `([\s\S]*?)`;\n\nconst script = `/);
const scriptMatch = edge.match(/const script = `([\s\S]*?)`;\n\nexport default/);
if (!stylesMatch || !scriptMatch) throw new Error('Could not extract simplified UI payload from edge function.');

let html = base;
if (!html.includes('id="ca-simplified-ui"')) {
  html = html.replace('</body>', `${stylesMatch[1]}\n${scriptMatch[1]}\n</body>`);
}

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html, 'utf8');
await writeFile('dist/netlify.toml', '[build]\n  publish = "."\n', 'utf8');

// The UI payload is now baked into dist/index.html. Remove the runtime Edge Function
// from the build workspace so Netlify serves the verified static page directly.
await rm('netlify/edge-functions', { recursive: true, force: true });

console.log('Built dist/index.html with simplified Community Assist UI and disabled runtime edge rewriting.');
