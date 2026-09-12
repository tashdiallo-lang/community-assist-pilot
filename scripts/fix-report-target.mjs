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
html = html.replaceAll(brittleTarget, stableTarget);
if (html.includes(brittleTarget)) throw new Error('A brittle Report navigation selector is still present.');
if (!html.includes(stableTarget)) throw new Error('Report button does not target reportFlowCard.');

await writeFile(path, html, 'utf8');
console.log('Hardened all Report navigation paths to the stable reportFlowCard target.');
