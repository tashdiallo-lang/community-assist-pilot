import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile('dist/index.html', 'utf8');
assert.match(html, /id="ca-simplified-ui"/, 'simplified UI styles were not injected');
assert.match(html, /id="ca-simplified-ui-script"/, 'simplified UI script was not injected');
assert.match(html, /id="ca-action-ui"/, 'report/action simplification styles were not injected');
assert.match(html, /id="ca-action-ui-script"/, 'report/action simplification script was not injected');
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
const actionScript = window.document.querySelector('#ca-action-ui-script')?.textContent || '';
assert.ok(script.trim().length > 100, 'simplified UI script is unexpectedly empty');
assert.ok(actionScript.trim().length > 100, 'report/action UI script is unexpectedly empty');
assert.match(script, /if\(b\.textContent!==label\)/, 'action-label observer is not guarded against self-triggered mutation loops');
new Function(script);
new Function(actionScript);
window.eval(script);
window.eval(actionScript);
window.dispatchEvent(new window.Event('load'));
await new Promise(resolve => setTimeout(resolve, 20));

assert.equal(window.document.querySelector('.hero h1')?.textContent.trim(), 'Report it. Track it. Get action.', 'hero was not simplified');
assert.ok(window.document.getElementById('caMoreBtn'), 'More button was not created');
assert.ok(window.document.getElementById('caBottomNav'), 'mobile bottom navigation was not created');
assert.ok(window.document.getElementById('caWatchSearch'), 'smart watch location field was not created');
assert.ok(window.document.getElementById('caWatchGPS'), 'device-location watch button was not created');

// Report flow must be shorter without removing the original functional controls.
assert.equal(window.document.getElementById('s1')?.textContent, '1 What', 'report step 1 was not simplified');
assert.equal(window.document.getElementById('s2')?.textContent, '2 Where', 'report step 2 was not simplified');
assert.equal(window.document.getElementById('s3')?.textContent, '3 Same issue?', 'report step 3 was not simplified');
assert.equal(window.document.getElementById('s4')?.textContent, '4 Done', 'report step 4 was not simplified');
assert.equal(window.document.querySelector('#description')?.placeholder, "What's happening?", 'report prompt was not simplified');
const reportMore = window.document.getElementById('caReportMore');
assert.ok(reportMore, 'optional report details expander was not created');
assert.equal(reportMore.open, false, 'optional report details should start collapsed');
assert.ok(reportMore.contains(window.document.getElementById('publicSummary')), 'public summary control was lost');
assert.ok(reportMore.contains(window.document.getElementById('reportPhoto')), 'photo control was lost');
assert.ok(reportMore.contains(window.document.getElementById('categoryOverride')), 'category correction control was lost');
reportMore.open = true;
assert.equal(reportMore.open, true, 'optional report details could not be opened');
assert.ok(window.document.getElementById('caAddressMore'), 'address search expander was not created');
assert.ok(window.document.getElementById('caPrivacyMore'), 'location privacy expander was not created');
assert.ok(window.document.getElementById('toLocation'), 'continue control was removed');
assert.ok(window.document.getElementById('submitCheck'), 'review report control was removed');

// Simulate signed-in issue actions arriving after initial render. This previously
// caused a MutationObserver loop that froze touch/input handling on mobile.
const dynamicAction = window.document.createElement('button');
dynamicAction.dataset.progress = 'test';
dynamicAction.textContent = 'View progress';
window.document.body.appendChild(dynamicAction);
await new Promise(resolve => setTimeout(resolve, 30));
assert.equal(dynamicAction.textContent, 'Track', 'dynamic action label was not compacted');

// A tracked case should keep the core action row simple and move secondary controls under More.
const issue = window.document.createElement('article');
issue.className = 'issue';
const issueActions = window.document.createElement('div');
issueActions.className = 'issue-actions';
for (const [attr, value, label] of [
  ['progress','x','Case progress'],['fieldUpdate','x','Add field update'],['shareVerify','x','Ask neighbor to verify'],['e','x','Prepare escalation draft'],
  ['shareCase','x','Share case'],['timeline','x','Details & timeline'],['notifyToggle','x','Mute updates']
]) {
  const b = window.document.createElement('button');
  b.dataset[attr] = value;
  b.textContent = label;
  issueActions.appendChild(b);
}
issue.appendChild(issueActions);
window.document.body.appendChild(issue);
await new Promise(resolve => setTimeout(resolve, 40));
assert.ok(issue.classList.contains('ca-case-simple'), 'tracked case was not simplified');
assert.ok(issue.querySelector(':scope > .issue-actions [data-progress]'), 'Track action disappeared');
assert.ok(issue.querySelector(':scope > .issue-actions [data-field-update]'), 'Update action disappeared');
assert.ok(issue.querySelector(':scope > .issue-actions [data-share-verify]'), 'Invite action disappeared');
assert.ok(issue.querySelector(':scope > .issue-actions [data-e]'), 'Take action disappeared');
const caseMore = issue.querySelector(':scope > .ca-case-more');
assert.ok(caseMore, 'secondary case actions were not moved under More');
assert.ok(caseMore.querySelector('[data-share-case]'), 'Share action disappeared');
assert.ok(caseMore.querySelector('[data-timeline]'), 'History action disappeared');
assert.ok(caseMore.querySelector('[data-notify-toggle]'), 'notification action disappeared');

const watchInput = window.document.getElementById('caWatchSearch');
const watchFind = window.document.getElementById('caWatchFind');
watchInput.focus();
assert.equal(window.document.activeElement, watchInput, 'watch input could not receive focus');
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

const advanced = window.document.getElementById('caAdvancedWatch');
advanced.open = true;
assert.equal(advanced.open, true, 'advanced options could not be opened');

console.log('QA PASS: static mobile delivery, simplified report flow, case actions, ZIP watch, civic context and interaction stability.');
