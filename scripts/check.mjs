import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';

const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
const errors=[];

try{execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'});}catch{process.exit(1)}
execFileSync(process.execPath,['--check',join(root,'src/app.js')],{stdio:'inherit'});

async function walk(dir){let out=[];for(const name of await readdir(dir)){const file=join(dir,name),info=await stat(file);out=out.concat(info.isDirectory()?await walk(file):file)}return out}
const files=await walk(dist);
const existing=new Set(files.map(f=>relative(dist,f).replaceAll('\\','/')));
const htmls=files.filter(f=>f.endsWith('.html'));
const css=await readFile(join(root,'src/styles.css'),'utf8');
const app=await readFile(join(root,'src/app.js'),'utf8');
const components=await readFile(join(root,'templates/components.mjs'),'utf8');

const requiredLegalLinks=['/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
const mainPages=[];
for(const file of htmls){
  const html=await readFile(file,'utf8');
  const rel=relative(dist,file).replaceAll('\\','/');
  const redirect=html.includes('http-equiv="refresh"');
  if(!/<title>.+<\/title>/.test(html)) errors.push(`${rel}: title missing`);
  if(redirect) continue;
  mainPages.push({rel,html});
  if(!/<meta name="description"/.test(html)) errors.push(`${rel}: meta description missing`);
  if((html.match(/<h1[\s>]/g)||[]).length!==1) errors.push(`${rel}: expected one H1`);
  if(!html.includes('id="main-content"')) errors.push(`${rel}: main-content missing`);
  if(!html.includes('class="skip-link"')) errors.push(`${rel}: skip link missing`);
  if(!html.includes('name="referrer" content="strict-origin-when-cross-origin"')) errors.push(`${rel}: referrer policy missing`);
  if(!html.includes('class="site-header fab-header"')) errors.push(`${rel}: Fabrica header missing`);
  if(!html.includes('class="site-footer fab-footer"')) errors.push(`${rel}: Fabrica footer missing`);
  if(!html.includes('data-brand-preloader')) errors.push(`${rel}: global preloader missing`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(dup.length) errors.push(`${rel}: duplicate ids ${dup.join(', ')}`);
  for(const img of html.matchAll(/<img\s[^>]*>/g)) if(!/\salt="[^"]*"/.test(img[0])) errors.push(`${rel}: image missing alt`);
  for(const m of html.matchAll(/href="(\/[^"#?]*(?:[?#][^"]*)?)"/g)){
    const raw=m[1].split('#')[0].split('?')[0]; if(!raw||raw==='/') continue;
    let target=raw.replace(/^\//,''); if(target.endsWith('/')) target+='index.html'; else if(!/\.[a-z0-9]+$/i.test(target)) target+='/index.html';
    if(!existing.has(target)) errors.push(`${rel}: broken internal href ${raw}`);
  }
  const cssMatch=html.match(/href="\/(assets\/site\.[a-f0-9]{10}\.css)"/),jsMatch=html.match(/src="\/(assets\/app\.[a-f0-9]{10}\.js)"/);
  if(!cssMatch||!existing.has(cssMatch?.[1])) errors.push(`${rel}: hashed CSS missing/broken`);
  if(!jsMatch||!existing.has(jsMatch?.[1])) errors.push(`${rel}: hashed JS missing/broken`);
  for(const href of requiredLegalLinks) if(!html.includes(`href="${href}"`)) errors.push(`${rel}: legal footer link missing ${href}`);
  if(/<iframe[^>]+youtube/i.test(html)) errors.push(`${rel}: YouTube iframe preloaded before user action`);
  if(/animé|anime/i.test(html)) errors.push(`${rel}: unwanted anime wording found`);
  if(html.includes('site-footer__lead')) errors.push(`${rel}: obsolete oversized footer CTA found`);
}

// Privacy / legal / maintainability guardrails.
if(/sessionStorage|localStorage/.test(app)) errors.push('app.js: browser storage detected');
if(/googletagmanager|google-analytics|gtag\(/i.test(app)) errors.push('app.js: analytics detected');
for(const [field,value] of legalRequiredFields) if(!String(value||'').trim()) errors.push(`legal.mjs: required ${field} empty`);
if(css.includes('var(--ember-soft;')) errors.push('styles.css: malformed CSS variable');

const home=await readFile(join(dist,'index.html'),'utf8');
const work=await readFile(join(dist,'work/index.html'),'utf8');
const project=await readFile(join(dist,'projet/le-bol-den-face/index.html'),'utf8');
const services=await readFile(join(dist,'services/index.html'),'utf8');
const about=await readFile(join(dist,'a-propos/index.html'),'utf8');
const journal=await readFile(join(dist,'journal/index.html'),'utf8');
const contact=await readFile(join(dist,'contact/index.html'),'utf8');

// V14 visual grammar: Fabrica structure, Nolan Arc identity and components.
for(const token of ['class="fab-hero"','class="fab-hero__wordmark"','class="fab-clients','id="work-preview"','class="fab-proof','class="fab-services','class="fab-process','data-focus-testimonials','id="faq-home"','class="fab-contact-band']) if(!home.includes(token)) errors.push(`Home V14: missing ${token}`);
if((home.match(/class="fab-client-grid[\s\S]*?<div>/g)||[]).length===0 || (home.match(/<strong>(Ouilove Proposal|A One Permis|Carat Créations Paris|Reka Security)<\/strong>/g)||[]).length!==4) errors.push('Home V14: four documented client proofs expected');
if((home.match(/class="fab-project-card/g)||[]).length<4) errors.push('Home V14: project grid incomplete');
if((home.match(/data-stat-card/g)||[]).length!==4) errors.push('Home V14: four proof stats expected');
if((home.match(/class="fab-service-row/g)||[]).length!==3) errors.push('Home V14: three service rows expected');
if(!home.includes('data-glass-showcase')) errors.push('Home V14: process showcase missing');
if(!css.includes('feTurbulence')||!css.includes('body::after')) errors.push('V14: global grain layer missing');
if(!css.includes('.fab-hero')||!css.includes('.fab-project-grid')||!css.includes('.fab-service-row')) errors.push('V14: core Fabrica-style system missing');

// Preloader: global, percentage + hard fail-safe.
if(!components.includes('data-preloader-percent')||!css.includes('@keyframes preloaderFailsafe')) errors.push('Preloader V14: percentage/failsafe missing');
if(!app.includes('data-preloader-percent')||!app.includes('percent.textContent')) errors.push('Preloader V14: percentage animation missing');

// Work owns discovery carousel and stacked collaborations.
if(!work.includes('data-video-slide-show')) errors.push('Work V14: Video Slide Show missing');
if((work.match(/data-video-slide(?=\s|>)/g)||[]).length<5) errors.push('Work V14: five slideshow cards expected');
if(project.includes('data-video-slide-show')) errors.push('Project V14: Video Slide Show must remain in Work');
if(!work.includes('data-stacked-flow')) errors.push('Work V14: Stacked Flow missing');
if(!app.includes('drag.velocity')||!app.includes('projected=state.delta+state.velocity*240')||!app.includes('steps=clamp(steps,-3,3)')) errors.push('Video Slide Show: inertia engine missing');

// Project: film first, technical proof only once, contextual navigation.
if(!project.includes('id="film"')||!project.includes('data-ambient-player')||!project.includes('data-hold-confirm')) errors.push('Project V14: film-first player missing');
if((project.match(/class="project-meta-list"/g)||[]).length!==1) errors.push('Project V14: metadata must appear once');
if(/Détails de production|La fiche technique/i.test(project)) errors.push('Project V14: redundant production-details wording found');
if(!project.includes('data-page-view-counter')) errors.push('Project V14: page view counter hook missing');

// Services / About: one strong page grammar, left TOC, clear chapters.
for(const id of ['marques','recits','moments']) if(!services.includes(`id="${id}"`)) errors.push(`Services V14: ${id} chapter missing`);
if(!services.includes('data-line-toc')) errors.push('Services V14: left TOC missing');
if((services.match(/<section class="fab-service-section/g)||[]).length!==3) errors.push('Services V14: three detailed service sections expected');
if(!about.includes('data-line-toc')||!about.includes('data-glass-showcase')) errors.push('About V14: TOC/process showcase missing');
if((about.match(/data-stat-card/g)||[]).length<3) errors.push('About V14: proof stats missing');
if(/animé|anime/i.test(about)) errors.push('About V14: anime wording must not return');

// Contact: compact form + FAQ, no qualification maze.
if(!contact.includes('class="contact-composer motion-gradient"')||!contact.includes('class="contact-form contact-form--composer')) errors.push('Contact V14: V11 composer layout missing');
if(!contact.includes('id="faq-contact"')||!contact.includes('data-faq-section')) errors.push('Contact V14: FAQ missing');
if(!contact.includes('https://formsubmit.co/ajax/')||!contact.includes('name="_honey"')||!contact.includes('href="/confidentialite/"')) errors.push('Contact V14: form wiring/privacy guard missing');

// Interactive component engines preserved under the new skin.
if(!app.includes('easeOutExpo')||!app.includes('IntersectionObserver')) errors.push('Animated Stats Pro: scroll engine missing');
for(const style of ['blur','slide','fade','scale']) if(!css.includes(`stat-style--${style}`)) errors.push(`Animated Stats Pro: ${style} engine missing`);
if(!app.includes('data-testimonials-toggle')) errors.push('Focus Testimonials: expander missing');
if(!app.includes('MeshPhysicalMaterial')) errors.push('Glass Showcase: WebGL material missing');
if(!app.includes("flow.addEventListener('wheel'")) errors.push('Stacked Flow: wheel interaction missing');
if(!css.includes('.line-toc{position:fixed')||!css.includes('left:14px')||!app.includes('scheduleClose(1900)')) errors.push('Line TOC: left hover behaviour missing');
for(const style of ['radial','conic','mesh','linear','diamond']) if(!css.includes(`data-gradient-style="${style}"`)) errors.push(`Gradient Motion: ${style} engine missing`);

// Nolan Arc identity restored on Fabrica structure.
for(const token of ['--ink:#080706','--paper:#f0ebe2','--ember:#cc460c',"--serif:'Yrsa'", "--ui:'Syne'", "--body:'DM Sans'"]) if(!css.includes(token)) errors.push(`V14 DA token missing: ${token}`);
if(!css.includes('V14 — FABRICA STRUCTURE × NOLAN ARC DA')) errors.push('V14 theme integration block missing');
if(!components.includes('class="mobile-tabs"')) errors.push('V14 mobile glass dock markup missing');
if(!css.includes('.mobile-tabs{position:fixed')||!css.includes('backdrop-filter:blur(24px)')) errors.push('V14 mobile glass dock styling missing');
if(!css.includes('.fab-testimonials .focus-testimonials__stream.has-focus')) errors.push('V14 Focus Testimonials fluid interaction styling missing');
if(!contact.includes('data-gradient-host')||!contact.includes('Budget / entreprise')) errors.push('Contact V14: gradient composer / optional fields missing');

// Cross-page pathing.
if(!journal.includes('journal-bridge')) errors.push('Journal V14: Work bridge missing');
if(!about.includes('/contact/')) errors.push('About V14: Contact continuation missing');
if(!work.includes('/services/')||!work.includes('/contact/')) errors.push('Work V14: Services/Contact continuations missing');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA OK — ${htmls.length} HTML files; V14 Fabrica structure × Nolan Arc DA, mobile dock, contact composer, routes and component engines verified.`);
