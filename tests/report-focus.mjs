import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile('dist/index.html', 'utf8');

// The real Report handler must focus synchronously. Delayed focus is not a reliable
// user gesture on iOS and can leave the keyboard closed.
assert.match(
  html,
  /\$\('startReport'\)\.onclick=\(\)=>\{setStep\(1\);const d=\$\('description'\);if\(d\)d\.focus\(\{preventScroll:true\}\);document\.getElementById\('reportFlowCard'\)\?\.scrollIntoView/,
  'Report handler does not synchronously focus the description field.'
);
assert.doesNotMatch(
  html,
  /setTimeout\([^\n]*description[^\n]*focus/i,
  'Report focus is delayed with setTimeout, which is unsafe for iOS keyboard activation.'
);

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

const simplified = window.document.querySelector('#ca-simplified-ui-script')?.textContent || '';
assert.ok(simplified.length > 100, 'Simplified UI script is missing.');
new Function(simplified);
window.eval(simplified);
window.dispatchEvent(new window.Event('load'));
await new Promise(resolve => setTimeout(resolve, 20));

const description = window.document.getElementById('description');
const bottomReport = window.document.querySelector('#caBottomNav [data-bottom="report"]');
assert.ok(description, 'Description field is missing.');
assert.ok(bottomReport, 'Mobile Report button is missing.');

description.blur();
bottomReport.click();
assert.equal(
  window.document.activeElement,
  description,
  'Mobile Report tap did not immediately focus the description field.'
);

console.log('QA PASS: iOS-safe Report tap focuses the description synchronously.');
