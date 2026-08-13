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
  if(rel==='index.html' && !html.includes('data-brand-preloader')) errors.push(`${rel}: Home preloader missing`);
  if(rel!=='index.html' && html.includes('data-brand-preloader')) errors.push(`${rel}: preloader must not delay internal pages`);
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

// V15 visual/product grammar: Fabrica structure, Nolan Arc identity, performance and conversion.
for(const token of ['class="fab-hero"','class="fab-hero__wordmark"','class="fab-clients','id="work-preview"','class="fab-proof','class="brand-ecosystem','class="fab-services','class="home-pricing','class="fab-process','data-focus-testimonials','id="faq-home"','class="fab-contact-band']) if(!home.includes(token)) errors.push(`Home V15: missing ${token}`);
if((home.match(/<strong>(Ouilove Proposal|A One Permis|Carat Créations Paris|Reka Security)<\/strong>/g)||[]).length!==4) errors.push('Home V15: four documented collaborations expected');
for(const brand of ['SONY','SIGMA','Adobe','NiSi','SmallRig','PGYTECH']) if(!home.includes(`<strong>${brand}</strong>`)) errors.push(`Home V15: production ecosystem missing ${brand}`);
if(!home.includes('Ces marques ne sont pas présentées comme des clients')) errors.push('Home V15: production brands must not be presented as clients');
if(!home.includes('1 500 €')||!home.includes('30 min')||!home.includes('12 h → 00 h')||!home.includes('options choisies')) errors.push('Home V15: wedding pricing disclosure incomplete');
if((home.match(/class="fab-project-card/g)||[]).length<4) errors.push('Home V15: project grid incomplete');
if((home.match(/data-stat-card/g)||[]).length!==4) errors.push('Home V15: four proof stats expected');
if((home.match(/class="fab-service-row/g)||[]).length!==3) errors.push('Home V15: three service rows expected');
if(!home.includes('data-glass-showcase')) errors.push('Home V15: process showcase missing');
if(!css.includes('feTurbulence')||!css.includes('body::after')) errors.push('V15: global grain layer missing');

// Logo Preloader: Home only, no artificial percentage, hard fail-safe.
if(!home.includes('class="brand-preloader logo-preloader"')) errors.push('Preloader V15: minimalist Logo Preloader markup missing');
if(home.includes('data-preloader-percent')||components.includes('data-preloader-percent')||app.includes('percent.textContent')) errors.push('Preloader V15: percentage loader must be removed');
if(!css.includes('@keyframes v15PreloaderFailSafe')||!app.includes('setTimeout(leave,1320)')) errors.push('Preloader V15: fail-safe missing');
if(!components.includes("active==='/'?logoPreloader")) errors.push('Preloader V15: must only render on Home');

// Custom cursor + faster navigation.
if(!components.includes('data-custom-cursor')||!css.includes('.custom-cursor.is-interactive')||!app.includes("classList.add('has-custom-cursor')")) errors.push('V15: custom rounded orange cursor missing');
if(!app.includes("link.rel='prefetch'")||!components.includes('rel="prefetch" href="/contact/"')) errors.push('V15: internal route/contact prefetch missing');

// FAQ layout and interaction.
for(const page of [home,contact]) if(!page.includes('title:\'FAQ.\'') && !page.includes('<h2>FAQ.</h2>')) errors.push('V15: FAQ title/layout missing on Home or Contact');
if(!css.includes('grid-template-columns:minmax(280px,.55fr) minmax(520px,1fr)')||!css.includes('.faq-item button i')) errors.push('V15: split FAQ card layout missing');
if(!app.includes('data-faq-button')) errors.push('V15: dynamic FAQ engine missing');

// Work owns discovery carousel and stacked collaborations.
if(!work.includes('data-video-slide-show')) errors.push('Work V15: Video Slide Show missing');
if((work.match(/data-video-slide(?=\s|>)/g)||[]).length<5) errors.push('Work V15: five slideshow cards expected');
if(project.includes('data-video-slide-show')) errors.push('Project V15: Video Slide Show must remain in Work');
if(!work.includes('data-stacked-flow')) errors.push('Work V15: Stacked Flow missing');
if(!app.includes('drag.velocity')||!app.includes('projected=state.delta+state.velocity*240')||!app.includes('steps=clamp(steps,-3,3)')) errors.push('Video Slide Show: inertia engine missing');

// Project: film first, technical proof only once.
if(!project.includes('id="film"')||!project.includes('data-ambient-player')||!project.includes('data-hold-confirm')) errors.push('Project V15: film-first player missing');
if((project.match(/class="project-meta-list"/g)||[]).length!==1) errors.push('Project V15: metadata must appear once');
if(/Détails de production|La fiche technique/i.test(project)) errors.push('Project V15: redundant production-details wording found');

// Services / About must be distinct.
for(const id of ['marques','recits','moments']) if(!services.includes(`id="${id}"`)) errors.push(`Services V15: ${id} chapter missing`);
if((services.match(/<section class="fab-service-section/g)||[]).length!==3) errors.push('Services V15: three detailed service chapters expected');
if(!services.includes('Ce que vous gagnez')||!services.includes('Parler d’un projet de marque')) errors.push('Services V15: visitor-value framing incomplete');
if(!about.includes('data-line-toc')||!about.includes('data-glass-showcase')) errors.push('About V15: human story + method navigation missing');
if(about.includes('fab-about-stats')||about.includes('data-stat-card')) errors.push('About V15: Home proof stats must not be duplicated');
if(about.includes('Portrait de Nolan à ajouter')) errors.push('About V15: obsolete portrait placeholder copy found');
if(!about.includes('/assets/nolan-portrait.jpg')) errors.push('About V15: portrait asset path missing');
if(/animé|anime/i.test(about)) errors.push('About V15: unwanted anime wording must not return');

// Contact: immediate composer + FAQ, no preloader.
if(!contact.includes('class="contact-composer motion-gradient"')||!contact.includes('class="contact-form contact-form--composer')) errors.push('Contact V15: compact composer missing');
if(!contact.includes('id="faq-contact"')||!contact.includes('data-faq-section')) errors.push('Contact V15: FAQ missing');
if(contact.includes('data-brand-preloader')) errors.push('Contact V15: preloader must not delay Contact');
if(!contact.includes('https://formsubmit.co/ajax/')||!contact.includes('name="_honey"')||!contact.includes('href="/confidentialite/"')) errors.push('Contact V15: form wiring/privacy guard missing');

// Animated Stats and testimonial components remain real engines.
if(!app.includes('easeOutExpo')||!app.includes('IntersectionObserver')) errors.push('Animated Stats Pro: scroll engine missing');
for(const style of ['blur','slide','fade','scale']) if(!css.includes(`stat-style--${style}`)) errors.push(`Animated Stats Pro: ${style} engine missing`);
if(!app.includes('data-testimonials-toggle')) errors.push('Focus Testimonials: expander engine missing');
if(!css.includes('grid-template-columns:minmax(0,1fr) minmax(180px,270px)')) errors.push('Focus Testimonials V15: collision-safe row layout missing');
if(!app.includes('MeshPhysicalMaterial')) errors.push('Glass Showcase: WebGL material missing');
if(!app.includes("flow.addEventListener('wheel'")) errors.push('Stacked Flow: wheel interaction missing');
if(!css.includes('.line-toc{position:fixed')||!css.includes('left:14px')||!app.includes('scheduleClose(1900)')) errors.push('Line TOC: left hover behaviour missing');

// Nolan Arc identity restored on Fabrica structure.
for(const token of ['--ink:#080706','--paper:#f0ebe2','--ember:#cc460c',"--serif:'Yrsa'", "--ui:'Syne'", "--body:'DM Sans'"]) if(!css.includes(token)) errors.push(`V15 DA token missing: ${token}`);
if(!css.includes('V15 — Fabrica structure × Nolan Arc system polish')) errors.push('V15 integration block missing');
if(!components.includes('class="mobile-tabs"')) errors.push('V15 mobile glass dock markup missing');

// Cross-page pathing.
if(!journal.includes('journal-bridge')) errors.push('Journal V15: Work bridge missing');
if(!about.includes('/contact/')) errors.push('About V15: Contact continuation missing');
if(!work.includes('/services/')||!work.includes('/contact/')) errors.push('Work V15: Services/Contact continuations missing');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA OK — ${htmls.length} HTML files; V15 layout, Home-only preloader, custom cursor, pricing, FAQ, services/about separation and component engines verified.`);
