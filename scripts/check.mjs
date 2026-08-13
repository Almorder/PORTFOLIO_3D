import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';

const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
const errors=[];
const fail=(message)=>errors.push(message);

try{execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'});}catch{process.exit(1)}
execFileSync(process.execPath,['--check',join(root,'src/app.js')],{stdio:'inherit'});

async function walk(dir){let out=[];for(const name of await readdir(dir)){const file=join(dir,name),info=await stat(file);out=out.concat(info.isDirectory()?await walk(file):file)}return out}
const files=await walk(dist);
const existing=new Set(files.map(f=>relative(dist,f).replaceAll('\\','/')));
const htmls=files.filter(f=>f.endsWith('.html'));
const css=await readFile(join(root,'src/styles.css'),'utf8');
const app=await readFile(join(root,'src/app.js'),'utf8');
const components=await readFile(join(root,'templates/components.mjs'),'utf8');
const pagesSource=await readFile(join(root,'templates/pages.mjs'),'utf8');
const siteSource=await readFile(join(root,'content/site.mjs'),'utf8');
const legalSource=await readFile(join(root,'content/legal.mjs'),'utf8');

const requiredLegalLinks=['/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
for(const file of htmls){
  const html=await readFile(file,'utf8');
  const rel=relative(dist,file).replaceAll('\\','/');
  const redirect=html.includes('http-equiv="refresh"');
  if(!/<title>.+<\/title>/.test(html)) fail(`${rel}: title missing`);
  if(redirect) continue;
  if(!/<meta name="description"/.test(html)) fail(`${rel}: meta description missing`);
  if((html.match(/<h1[\s>]/g)||[]).length!==1) fail(`${rel}: expected exactly one H1`);
  if(!html.includes('id="main-content"')) fail(`${rel}: main-content missing`);
  if(!html.includes('class="skip-link"')) fail(`${rel}: skip link missing`);
  if(!html.includes('name="referrer" content="strict-origin-when-cross-origin"')) fail(`${rel}: referrer policy missing`);
  if(!html.includes('class="site-header fab-header"')) fail(`${rel}: common header missing`);
  if(!html.includes('class="site-footer fab-footer"')) fail(`${rel}: common footer missing`);
  if(rel==='index.html' && !html.includes('data-brand-preloader')) fail('Home: preloader missing');
  if(rel!=='index.html' && html.includes('data-brand-preloader')) fail(`${rel}: preloader must be Home-only`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  const dup=[...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
  if(dup.length) fail(`${rel}: duplicate ids ${dup.join(', ')}`);
  for(const img of html.matchAll(/<img\s[^>]*>/g)) if(!/\salt="[^"]*"/.test(img[0])) fail(`${rel}: image missing alt`);
  for(const m of html.matchAll(/href="(\/[^"#?]*(?:[?#][^"]*)?)"/g)){
    const raw=m[1].split('#')[0].split('?')[0]; if(!raw||raw==='/') continue;
    let target=raw.replace(/^\//,''); if(target.endsWith('/')) target+='index.html'; else if(!/\.[a-z0-9]+$/i.test(target)) target+='/index.html';
    if(!existing.has(target)) fail(`${rel}: broken internal href ${raw}`);
  }
  const cssMatch=html.match(/href="\/(assets\/site\.[a-f0-9]{10}\.css)"/),jsMatch=html.match(/src="\/(assets\/app\.[a-f0-9]{10}\.js)"/);
  if(!cssMatch||!existing.has(cssMatch?.[1])) fail(`${rel}: hashed CSS missing/broken`);
  if(!jsMatch||!existing.has(jsMatch?.[1])) fail(`${rel}: hashed JS missing/broken`);
  for(const href of requiredLegalLinks) if(!html.includes(`href="${href}"`)) fail(`${rel}: legal footer link missing ${href}`);
  if(/<iframe[^>]+youtube/i.test(html) && !(rel==='index.html' && html.includes('class="v16-hero__video"'))) fail(`${rel}: YouTube iframe preloaded before user action`);
  if(/animé|anime/i.test(html)) fail(`${rel}: unwanted anime wording found`);
  if(html.includes('site-footer__lead')) fail(`${rel}: obsolete oversized footer CTA found`);
}

// Privacy and operational guardrails.
if(/sessionStorage|localStorage/.test(app)) fail('app.js: browser storage detected');
if(/googletagmanager|google-analytics|gtag\(/i.test(app)) fail('app.js: analytics detected');
for(const [field,value] of legalRequiredFields) if(!String(value||'').trim()) fail(`legal.mjs: required ${field} empty`);
if(css.includes('var(--ember-soft;')) fail('styles.css: malformed CSS variable');
for(const source of [pagesSource,siteSource,legalSource]){
  if(/1\s+all[eé]e\s+Mirabeau/i.test(source)) fail('Privacy: private street address found in source');
  if(/(?:\+33\s*\(0\)?\s*7|07[ .-]?82[ .-]?04[ .-]?89[ .-]?25|0782048925)/i.test(source)) fail('Privacy: private phone number found in source');
}
if(/registeredAddress|\bphone\s*:/.test(legalSource)) fail('Privacy: address/phone fields must not exist in public legal data');

const home=await readFile(join(dist,'index.html'),'utf8');
const work=await readFile(join(dist,'work/index.html'),'utf8');
const project=await readFile(join(dist,'projet/le-bol-den-face/index.html'),'utf8');
const services=await readFile(join(dist,'services/index.html'),'utf8');
const about=await readFile(join(dist,'a-propos/index.html'),'utf8');
const journal=await readFile(join(dist,'journal/index.html'),'utf8');
const contact=await readFile(join(dist,'contact/index.html'),'utf8');
const privacy=await readFile(join(dist,'confidentialite/index.html'),'utf8');

// V17 HOME — locked order / product logic.
for(const token of ['class="v16-hero"','id="work-preview"','class="v16-proof"','class="v16-dimensions"','data-scene="journey"','class="brand-ecosystem v16-ecosystem','data-pricing-switcher','class="v16-testimonials"','id="faq-home"','id="quick-contact"']) if(!home.includes(token)) fail(`Home V17: missing ${token}`);
if(home.includes('fab-clients')||/Collaborations documentées/i.test(home)) fail('Home V17: old collaborations strip must be removed');
if((home.match(/data-stat-card/g)||[]).length!==4) fail('Home V17: exactly four stats expected');
for(const token of ['50','2022','+105','photo + vidéo']) if(!home.includes(token)) fail(`Home V17: proof stat/context missing ${token}`);
if(!home.includes('croissance de chiffre d’affaires observée sur Ouilove')) fail('Home V17: +105% must be contextualized as Ouilove observation');
if((home.match(/class="v16-dimension/g)||[]).length<3) fail('Home V17: three professional dimensions missing');
for(const label of ['Réalisation','Direction artistique','Stratégie de marque']) if(!home.includes(label)) fail(`Home V17: professional dimension missing ${label}`);
if(!home.includes('data-glass-showcase')) fail('Home V17: Comprendre/Choisir/Tenir le fil visual engine missing');
if(!home.includes('class="journey v17-journey scroll-scene"')||!css.includes('.v17-journey .journey__sticky{position:sticky')) fail('Home V17: restored sticky journey choreography missing');
if(!app.includes('--journey-shift')||!app.includes('--journey-ring')) fail('Home V17: journey motion variables missing');
if((home.match(/data-journey-step/g)||[]).length!==3) fail('Home V17: three journey steps expected');
for(const brand of ['Sony','Sigma','Adobe','NiSi','SmallRig','PGYTECH']) if(!home.includes(`Logo ${brand}`) && !home.includes(`>${brand}<`)) fail(`Home V17: ecosystem missing ${brand}`);
if((home.match(/class="v16-logo-card/g)||[]).length!==6) fail('Home V17: six ecosystem cards expected');
for(const price of ['1 500 €','200 €','89 € / heure']) if(!home.includes(price)) fail(`Home V17: pricing missing ${price}`);
if((home.match(/data-pricing-tab=/g)||[]).length!==3||(home.match(/data-pricing-panel=/g)||[]).length!==3) fail('Home V17: three-tab pricing switcher incomplete');
if(app.indexOf('const showcaseState=new WeakMap();')<0||app.indexOf('const showcaseState=new WeakMap();')>app.indexOf('updateScroll();')) fail('Home V18: showcase state must exist before initial scroll choreography runs');
if(!app.includes("$('[data-pricing-switcher]').forEach")||!app.includes("$('[data-faq-section]').forEach")) fail('Home V18: pricing/FAQ interaction handlers missing');
if(!home.includes('v16-testimonial-bento')||!home.includes('is-featured')) fail('Home V18: V16 testimonial bento must be restored');
if(!css.includes('.v16-testimonial-bento:has(article:hover) article:not(:hover)')) fail('Home V18: testimonial hover focus/blur interaction missing');
if(!home.includes('data-contact-form')||!home.includes('Message rapide — nolanarc.com')) fail('Home V17: quick contact form missing');

// Navigation hierarchy: Journal footer-only.
const headerChunk=home.slice(home.indexOf('<header'),home.indexOf('</header>')+9);
if(/Journal/.test(headerChunk)) fail('Navigation V17: Journal must not be in main header');
if(!home.includes('href="/journal/">Journal</a>')) fail('Navigation V17: Journal must remain in footer');

// WORK — exploration first, projects, compact 3-hat selector.
if(!work.includes('data-video-slide-show')) fail('Work V17: Video Slide Show missing');
if((work.match(/data-video-slide(?=\s|>)/g)||[]).length<5) fail('Work V17: five slideshow cards expected');
for(const src of ['photo-1727451139462-cd34008cd50b','photo-1709316132989-55ef2437b920','photo-1740350631567-5d813fe78adf','photo-1779896412277-c4fd15c7a89c']) if(!work.includes(src)) fail(`Work V17: mood image missing ${src}`);
if(/Ouverture|Le repas|Les indices|Le silence|La résolution/.test(work)) fail('Work V17: Bol slideshow labels must not remain');
if(project.includes('data-video-slide-show')) fail('Project V17: Video Slide Show must not live in project page');
if(!app.includes('drag.velocity')||!app.includes('projected=state.delta+state.velocity*240')||!app.includes('steps=clamp(steps,-3,3)')) fail('Work V17: velocity/inertia slideshow engine missing');
if((work.match(/class="fab-project-card/g)||[]).length<4) fail('Work V17: temporary project gallery incomplete');
if(!work.includes('data-expertise-switcher')||(work.match(/data-expertise-tab=/g)||[]).length!==3||(work.match(/data-expertise-panel=/g)||[]).length!==3) fail('Work V17: compact three-expertise switcher incomplete');
if(work.includes('data-stacked-flow')) fail('Work V17: obsolete stacked collaboration component should not render');

// PROJECT — film first, one compact technical grid.
if(!project.includes('id="film"')||!project.includes('data-ambient-player')||!project.includes('data-hold-confirm')) fail('Project V17: film-first player missing');
if((project.match(/class="project-meta-list"/g)||[]).length!==1) fail('Project V17: project metadata must appear once');
if(/Détails de production|La fiche technique/i.test(project)) fail('Project V17: duplicate production-detail section found');

// SERVICES — one compact switcher, deeper value, combined expertise, dedicated FAQ.
if(!services.includes('data-expertise-switcher')||(services.match(/data-expertise-tab=/g)||[]).length!==3||(services.match(/data-expertise-panel=/g)||[]).length!==3) fail('Services V17: three-expertise switcher incomplete');
if(!services.includes('v16-combined-expertise')) fail('Services V17: combined-expertise value section missing');
if(!services.includes('id="faq-services"')||!services.includes('data-faq-section')) fail('Services V17: dedicated FAQ missing');
for(const q of ['Pouvez-vous prendre en charge toute la production vidéo ?','Une direction artistique peut-elle être commandée sans réalisation vidéo ?','Que contient une session de stratégie à 89 € ?']) if(!services.includes(q)) fail(`Services V17: FAQ question missing ${q}`);
if(/id="marques"|id="recits"|id="moments"/.test(services)) fail('Services V17: obsolete stacked context chapters found');

// ABOUT — human, portrait, no duplicated sales proof.
if(!about.includes('/assets/nolan-portrait.jpg')) fail('About V17: Nolan portrait path missing');
for(const token of ['v17-about-hero','v17-about-origin','v17-about-turn','v17-about-lenses','v17-about-curiosity','v17-about-workstyle']) if(!about.includes(token)) fail(`About V17: missing ${token}`);
if(about.includes('data-stat-card')) fail('About V17: commercial stats must not be duplicated');
if(/animé|anime/i.test(about)) fail('About V17: unwanted anime wording found');
if(!about.includes('/work/')||!about.includes('/contact/')) fail('About V17: Work/Contact continuations missing');

// CONTACT — immediate split composer + optional details + dedicated FAQ.
if(!contact.includes('contact-composer')||!contact.includes('contact-form--composer')) fail('Contact V17: restored composer missing');
for(const name of ['name="nom"','name="email"','name="message"']) if(!contact.includes(name)) fail(`Contact V17: immediate field missing ${name}`);
if(!contact.includes('Budget / entreprise')||!contact.includes('data-form-intent')) fail('Contact V17: V15 optional detail/intent system missing');
if(!contact.includes('id="faq-contact"')) fail('Contact V17: dedicated FAQ missing');
if(contact.includes('data-brand-preloader')) fail('Contact V17: preloader must not delay internal route');

// Public privacy preference.
for(const html of [home,work,project,services,about,journal,contact,privacy]){
  if(/1\s+all[eé]e\s+Mirabeau/i.test(html)) fail('Privacy V17: street address exposed in built HTML');
  if(/(?:\+33\s*\(0\)?\s*7|07[ .-]?82[ .-]?04[ .-]?89[ .-]?25|0782048925)/i.test(html)) fail('Privacy V17: phone exposed in built HTML');
}

// Component engines and design system.
if(!app.includes('easeOutExpo')||!app.includes('IntersectionObserver')) fail('Animated Stats Pro: scroll/count engine missing');
for(const style of ['blur','slide','fade','scale']) if(!css.includes(`stat-style--${style}`)) fail(`Animated Stats Pro: ${style} mode missing`);
if(!app.includes('MeshPhysicalMaterial')) fail('Glass Showcase: WebGL material engine missing');
if(!components.includes('data-custom-cursor')||!css.includes('.custom-cursor.is-interactive')) fail('Custom cursor missing');
if(!components.includes('class="mobile-tabs"')) fail('Mobile glass dock missing');
if(!css.includes('.line-toc{position:fixed')||!css.includes('left:14px')||!app.includes('scheduleClose(1900)')) fail('Line TOC: left hover/reclose behavior missing');
for(const token of ['--ink:#080706','--paper:#f0ebe2','--ember:#cc460c',"--serif:'Yrsa'", "--ui:'Syne'", "--body:'DM Sans'"]) if(!css.includes(token)) fail(`Nolan Arc DA token missing: ${token}`);
if(!css.includes('V17 —')) fail('V17 integration CSS block missing');
if(!css.includes('content-visibility:auto')) fail('V16 performance: offscreen rendering guard missing');
if(!app.includes("link.rel='prefetch'")) fail('V16 performance: internal route prefetch missing');

// Form wiring and external-content restraint.
for(const page of [home,contact]) if(!page.includes('https://formsubmit.co/ajax/')||!page.includes('name="_honey"')||!page.includes('href="/confidentialite/"')) fail('Forms V17: FormSubmit/privacy guard incomplete');

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA OK — ${htmls.length} HTML files; V18 V16 testimonial bento, pricing/FAQ runtime fix, Sony hero video, logo integration and core product guardrails verified.`);
