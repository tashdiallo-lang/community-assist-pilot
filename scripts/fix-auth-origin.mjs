import { readFile, writeFile } from 'node:fs/promises';

const path = 'dist/index.html';
const canonical = 'https://community-assist-pilot.netlify.app';
let html = await readFile(path, 'utf8');

const releaseMarker = "const FRONTEND_RELEASE='20260911-evidence-privacy-v13'";
const canonicalBlock = `${releaseMarker}\nconst CANONICAL_ORIGIN='${canonical}'\nif(location.hostname.endsWith('.netlify.app')&&location.origin!==CANONICAL_ORIGIN){location.replace(CANONICAL_ORIGIN+location.pathname+location.search+location.hash)}`;
if (!html.includes("const CANONICAL_ORIGIN='")) {
  if (!html.includes(releaseMarker)) throw new Error('Could not find frontend release marker for canonical auth origin.');
  html = html.replace(releaseMarker, canonicalBlock);
}

const dynamicRedirect = 'emailRedirectTo:location.origin+location.pathname+location.search';
const fixedRedirect = 'emailRedirectTo:CANONICAL_ORIGIN+location.pathname+location.search';
if (html.includes(dynamicRedirect)) html = html.replaceAll(dynamicRedirect, fixedRedirect);
if (html.includes(dynamicRedirect)) throw new Error('Dynamic auth redirect is still present.');
if (!html.includes(fixedRedirect)) throw new Error('Canonical auth redirect was not installed.');

await writeFile(path, html, 'utf8');
console.log('Pinned Community Assist auth and Netlify previews to the permanent production origin.');
