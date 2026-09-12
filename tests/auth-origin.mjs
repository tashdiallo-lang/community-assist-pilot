import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('dist/index.html', 'utf8');
const canonical = 'https://community-assist-pilot.netlify.app';

assert.match(html, new RegExp(`const CANONICAL_ORIGIN='${canonical.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'`), 'canonical production origin is missing');
assert.match(html, /emailRedirectTo:CANONICAL_ORIGIN\+location\.pathname\+location\.search/, 'magic links are not pinned to the canonical production origin');
assert.doesNotMatch(html, /emailRedirectTo:location\.origin/, 'magic links can still bind to preview or deploy-specific origins');
assert.match(html, /location\.hostname\.endsWith\('\.netlify\.app'\)&&location\.origin!==CANONICAL_ORIGIN/, 'Netlify preview canonicalization is missing');
assert.match(html, /location\.replace\(CANONICAL_ORIGIN\+location\.pathname\+location\.search\+location\.hash\)/, 'preview canonicalization does not preserve auth callback state');
assert.match(html, /persistSession:true/, 'Supabase session persistence is disabled');
assert.match(html, /autoRefreshToken:true/, 'Supabase session refresh is disabled');

console.log('QA PASS: auth stays on the permanent Netlify origin and session persistence remains enabled.');
