import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile('dist/index.html', 'utf8');
assert.match(html, /id="ca-simplified-ui"/, 'simplified UI styles were not injected');
assert.match(html, /id="ca-simplified-ui-script"/, 'simplified UI script was not injected');
assert.doesNotMatch(html, />NYC311 nearby</i, 'old NYC311 nearby block is still present');
assert.doesNotMatch(html, />NYC OPEN DATA</i, 'old NYC Open Data branding is still present');

let runtimeEdgeExists = true;
try {
  await access('netlify/edge-functions/community-assist-ui.ts');
} catch {
  runtimeEdgeExists = false;
}
assert.equal(runtimeEdgeExists, false, 'runtime Edge Function still exists after static build');

const dom = new JSDOM(html, {
  url: 'https://community-assist-pilot.netlify.app/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;
window.fetch = globalThis.fetch.bind(globalThis);
window.scrollTo = () => {};
window.alert = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};

const script = window.document.querySelector('#ca-simplified-ui-script')?.textContent || '';
assert.ok(script.trim().length > 100, 'simplified UI script is unexpectedly empty');
new Function(script);
window.eval(script);
window.dispatchEvent(new window.Event('load'));

assert.equal(window.document.querySelector('.hero h1')?.textContent.trim(), 'Report it. Track it. Get action.', 'hero was not simplified');
assert.ok(window.document.getElementById('caMoreBtn'), 'More button was not created');
assert.ok(window.document.getElementById('caBottomNav'), 'mobile bottom navigation was not created');
assert.ok(window.document.getElementById('caWatchSearch'), 'smart watch location field was not created');
assert.ok(window.document.getElementById('caWatchGPS'), 'device-location watch button was not created');

const watchInput = window.document.getElementById('caWatchSearch');
const watchFind = window.document.getElementById('caWatchFind');
watchInput.value = '11368';
watchFind.click();

const deadline = Date.now() + 15000;
while (!window.document.querySelector('.ca-place') && Date.now() < deadline) {
  await new Promise(resolve => setTimeout(resolve, 200));
}
const place = window.document.querySelector('.ca-place');
assert.ok(place, 'ZIP lookup did not render a location result');
const placeText = place.textContent.replace(/\s+/g, ' ').trim();
assert.match(placeText, /Corona/i, '11368 did not resolve to Corona');
assert.match(placeText, /Queens/i, '11368 did not resolve to Queens');
assert.ok(window.document.getElementById('caSaveArea'), 'ZIP watch action was not rendered');
assert.ok(window.document.querySelectorAll('[data-follow-agency]').length >= 1, 'agency context was not returned for 11368');
assert.ok(window.document.querySelectorAll('[data-follow-scope]').length >= 1, 'civic district context was not returned for 11368');

console.log('QA PASS: static delivery, simplified UI, mobile navigation, NYC311 removal, ZIP locality, agencies and civic context.');
