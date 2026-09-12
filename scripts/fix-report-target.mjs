import { readFile, writeFile } from 'node:fs/promises';

const path = 'dist/index.html';
let html = await readFile(path, 'utf8');

const reportMarker = '<section class="card"><div class="head"><div><div class="eyebrow">LIVE REPORT FLOW</div><h2>Report a neighborhood problem</h2>';
const reportMarkerWithId = '<section id="reportFlowCard" class="card"><div class="head"><div><div class="eyebrow">LIVE REPORT FLOW</div><h2>Report a neighborhood problem</h2>';
if (!html.includes('id="reportFlowCard"')) {
  if (!html.includes(reportMarker)) throw new Error('Could not identify the report flow card.');
  html = html.replace(reportMarker, reportMarkerWithId);
}

const brittleTarget = "document.querySelector('.card:nth-of-type(2)')?.scrollIntoView({behavior:'smooth'})";
const stableTarget = "document.getElementById('reportFlowCard')?.scrollIntoView({behavior:'smooth',block:'start'})";
if (html.includes(brittleTarget)) html = html.replace(brittleTarget, stableTarget);
if (!html.includes(stableTarget)) throw new Error('Report button does not target reportFlowCard.');

await writeFile(path, html, 'utf8');
console.log('Hardened Report navigation to a stable reportFlowCard target.');
