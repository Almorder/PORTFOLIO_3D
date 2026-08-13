import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';
const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
try{ execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'}); }catch{process.exit(1)}
execFileSync(process.execPath,['--check',join(root,'src/app.js')],{stdio:'inherit'});
async function walk(dir){let out=[];for(const n of await readdir(dir)){const p=join(dir,n);const s=await stat(p);if(s.isDirectory()) out=out.concat(await walk(p));else out.push(p)}return out}
const files=await walk(dist);const htmls=files.filter(f=>f.endsWith('.html'));let errors=[];const existing=new Set(files.map(f=>relative(dist,f).replaceAll('\\','/')));
for(const f of htmls){const html=await readFile(f,'utf8');if(!/<title>.+<\/title>/.test(html)) errors.push(`${relative(dist,f)}: missing title`);if(!/<meta name="description"/.test(html) && !html.includes('http-equiv="refresh"')) errors.push(`${relative(dist,f)}: missing description`);const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);const dups=ids.filter((id,i)=>ids.indexOf(id)!==i);if(dups.length)errors.push(`${relative(dist,f)} duplicate ids ${[...new Set(dups)].join(',')}`);
  if(!html.includes('http-equiv="refresh"')){
    const h1=(html.match(/<h1[\s>]/g)||[]).length; if(h1!==1) errors.push(`${relative(dist,f)}: expected 1 H1, got ${h1}`);
    for(const m of html.matchAll(/<img\s[^>]*>/g)){ if(!/\salt="[^"]*"/.test(m[0])) errors.push(`${relative(dist,f)}: image missing alt`); }
    for(const m of html.matchAll(/href="(\/[^"]*)"/g)){ const raw=m[1].split('#')[0].split('?')[0]; if(!raw||raw==='/' ) continue; let target=raw.replace(/^\//,''); if(target.endsWith('/')) target += 'index.html'; else if(!/\.[a-z0-9]+$/i.test(target)) target += '/index.html'; if(!existing.has(target)) errors.push(`${relative(dist,f)}: broken internal href ${raw}`); }
  }
}

// Deployment integrity: every rendered page must reference content-hashed assets that exist.
for(const f of htmls){
  const html=await readFile(f,'utf8');
  if(html.includes('__SITE_CSS__') || html.includes('__APP_JS__')) errors.push(`${relative(dist,f)}: unresolved asset placeholder`);
  if(!html.includes('http-equiv="refresh"')){
    const cssMatch=html.match(/href="\/(assets\/site\.[a-f0-9]{10}\.css)"/);
    const jsMatch=html.match(/src="\/(assets\/app\.[a-f0-9]{10}\.js)"/);
    if(!cssMatch) errors.push(`${relative(dist,f)}: hashed CSS reference missing`); else if(!existing.has(cssMatch[1])) errors.push(`${relative(dist,f)}: CSS asset not found ${cssMatch[1]}`);
    if(!jsMatch) errors.push(`${relative(dist,f)}: hashed JS reference missing`); else if(!existing.has(jsMatch[1])) errors.push(`${relative(dist,f)}: JS asset not found ${jsMatch[1]}`);
  }
}

const css=await readFile(join(root,'src/styles.css'),'utf8');if(css.includes('var(--ember-soft;'))errors.push('CSS malformed variable');
const app=await readFile(join(root,'src/app.js'),'utf8');
if(/sessionStorage|localStorage/.test(app)) errors.push('PRIVACY BLOCKER: browser storage detected in src/app.js');
if(/googletagmanager|google-analytics|gtag\(/i.test(app)) errors.push('PRIVACY BLOCKER: analytics code detected in src/app.js');
for(const [field,value] of legalRequiredFields){ if(!String(value||'').trim()) errors.push(`LEGAL BLOCKER: content/legal.mjs → ${field} is empty`); }
const requiredLegalLinks=['/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
for(const f of htmls){
  const html=await readFile(f,'utf8');
  const rel=relative(dist,f);
  if(html.includes('Article complet à intégrer') || html.includes('À compléter avant publication')) errors.push(`${rel}: visible production placeholder`);
  if(!html.includes('http-equiv=\"refresh\"') && !rel.startsWith('404')){
    for(const href of requiredLegalLinks){ if(!html.includes(`href=\"${href}\"`)) errors.push(`${rel}: missing footer/legal link ${href}`); }
  }
  if(rel==='contact/index.html'){
    if(!html.includes('https://formsubmit.co/ajax/')) errors.push('contact/index.html: FormSubmit AJAX endpoint missing');
    if(!html.includes('name=\"_honey\"')) errors.push('contact/index.html: honeypot missing');
    if(!html.includes('href=\"/confidentialite/\"')) errors.push('contact/index.html: privacy notice link missing');
  }
  if(/<iframe[^>]+youtube/i.test(html)) errors.push(`${rel}: YouTube iframe present before user consent`);
}


// V7 UX invariants: horizontal progress, no legacy rail, one project metadata grid,
// three desktop entry cards, value-first services/about, compact contact.
for(const f of htmls){
  const html=await readFile(f,'utf8');
  const rel=relative(dist,f);
  if(html.includes('http-equiv="refresh"')) continue;
  if(!html.includes('class="page-progress"')) errors.push(`${rel}: horizontal progress bar missing`);
  if(html.includes('class="arc-rail"')) errors.push(`${rel}: legacy vertical scroll rail still rendered`);
  if(rel==='index.html'){
    if(!html.includes('class="entry-grid"')) errors.push(`${rel}: three-card entry grid missing`);
    if(html.includes('data-entry-prev') || html.includes('data-entry-next')) errors.push(`${rel}: desktop entry carousel controls should be removed`);
  }
  if(rel==='services/index.html'){
    if(!html.includes('id="ouilove-proof"')) errors.push(`${rel}: Ouilove proof anchor missing`);
    if(!html.includes('class="service-value-list"')) errors.push(`${rel}: service value list missing`);
  }
  if(rel==='a-propos/index.html'){
    if(!html.includes('data-nolan-portrait')) errors.push(`${rel}: Nolan portrait slot missing`);
    if(!html.includes('class="about-client-value"')) errors.push(`${rel}: client-value section missing`);
  }
  if(rel==='projet/le-bol-den-face/index.html'){
    const metaCount=(html.match(/class="project-meta-list"/g)||[]).length;
    if(metaCount!==1) errors.push(`${rel}: expected project metadata once, got ${metaCount}`);
    if(/Détails de production|La fiche technique/i.test(html)) errors.push(`${rel}: duplicate production-details section still visible`);
  }
  if(rel==='contact/index.html'){
    if(!html.includes('Ça concerne quoi ?')) errors.push(`${rel}: compact contact intent heading missing`);
    if(!html.includes('name="message"')) errors.push(`${rel}: message field missing`);
    if(!html.includes('contact-more contact-more--composer')) errors.push(`${rel}: optional details disclosure missing`);
  }
}

// V10 component-system invariants: requested behaviours plus fail-safes and corrected placement.
{
  const home=await readFile(join(dist,'index.html'),'utf8');
  const work=await readFile(join(dist,'work/index.html'),'utf8');
  const project=await readFile(join(dist,'projet/le-bol-den-face/index.html'),'utf8');
  const services=await readFile(join(dist,'services/index.html'),'utf8');
  const about=await readFile(join(dist,'a-propos/index.html'),'utf8');

  // 1 Page View Counter
  if(!project.includes('data-page-view-counter')) errors.push('V10 Page View Counter: project markup missing');
  if(!app.includes('rest/v1/page_views')) errors.push('V10 Page View Counter: Supabase REST wiring missing');
  try{ await stat(join(root,'supabase/page_views.sql')); }catch{ errors.push('V10 Page View Counter: Supabase SQL setup missing'); }

  // 2 Hold Confirm
  if(!project.includes('data-hold-confirm')) errors.push('V10 Hold Confirm: project control missing');
  if(!app.includes("new CustomEvent('holdconfirm'")) errors.push('V10 Hold Confirm: completion event missing');

  // 3 Glassy Button
  if(!css.includes('.button::before') || !css.includes('.button:active')) errors.push('V10 Glassy Button: frosted hover/pressed styles missing');

  // 4 Focus Testimonials
  if(!home.includes('data-focus-testimonials')) errors.push('V10 Focus Testimonials: home markup missing');
  if(!home.includes('data-testimonials-toggle')) errors.push('V10 Focus Testimonials: expand control missing');
  if(!app.includes('positionBadge')) errors.push('V10 Focus Testimonials: smart badge positioning missing');

  // 5 Glass Showcase Pro behaviour recreation
  if(!home.includes('data-glass-showcase')) errors.push('V10 Glass Showcase: home markup missing');
  if(!home.includes('data-showcase-webgl')) errors.push('V10 Glass Showcase: WebGL mount missing');
  if(!app.includes('three@0.180.0')) errors.push('V10 Glass Showcase: pinned Three.js WebGL implementation missing');
  if(!app.includes('MeshPhysicalMaterial')) errors.push('V10 Glass Showcase: physical glass material missing');

  // 6 Logo Preloader
  if(!home.includes('data-brand-preloader')) errors.push('V10 Logo Preloader: home markup missing');
  if(!home.includes('data-preloader-hold')) errors.push('V10 Logo Preloader: hold configuration missing');
  if(!app.includes('Hard fallback: even if another module throws later')) errors.push('V10 Logo Preloader: JS hard fallback missing');
  if(!css.includes('@keyframes preloaderFailsafe')) errors.push('V10 Logo Preloader: CSS fail-safe missing');
  if(app.indexOf('Logo Preloader — fail-safe first')>app.indexOf('updateScroll();')) errors.push('V10 Logo Preloader: fail-safe is not initialized before scroll modules');

  // 7 Ambient Video Player
  if(!project.includes('data-ambient-player')) errors.push('V10 Ambient Video Player: project wrapper missing');
  if(!css.includes('.ambient-video-player.is-playing')) errors.push('V10 Ambient Video Player: active glow state missing');

  // 8 Stacked Flow
  if(!work.includes('data-stacked-flow')) errors.push('V10 Stacked Flow: work markup missing');
  if(!work.includes('data-stack-prev') || !work.includes('data-stack-next')) errors.push('V10 Stacked Flow: navigation controls missing');
  if(!app.includes("flow.addEventListener('wheel'")) errors.push('V10 Stacked Flow: wheel interaction missing');

  // 9 Video Slide Show
  if(!project.includes('data-video-slide-show')) errors.push('V10 Video Slide Show: project markup missing');
  if((project.match(/data-video-slide/g)||[]).length<5) errors.push('V10 Video Slide Show: expected 5 portrait slide entries');
  if(!project.includes('data-video-prev') || !project.includes('data-video-next')) errors.push('V10 Video Slide Show: arrow navigation missing');
  if(!project.includes('data-video-dot')) errors.push('V10 Video Slide Show: pagination dots missing');
  if(!project.includes('data-video-mute')) errors.push('V10 Video Slide Show: mute control missing');
  if(!css.includes('aspect-ratio:9/16')) errors.push('V10 Video Slide Show: portrait card ratio missing');
  if(!app.includes('dataAutoplayInterval') && !app.includes('autoplayInterval')) {
    // Source uses dataset.autoplayInterval; accept the explicit dataset access below.
    if(!app.includes('dataset.autoplayInterval')) errors.push('V10 Video Slide Show: autoplay timing missing');
  }

  // 10 Animated Stats Pro
  if(!home.includes('data-animated-stats')) errors.push('V10 Animated Stats: home markup missing');
  if(!home.includes('data-animation="blur"')) errors.push('V10 Animated Stats: chosen site animation missing');
  for(const style of ['blur','slide','fade','scale']) if(!css.includes(`stat-style--${style}`)) errors.push(`V10 Animated Stats: ${style} engine missing`);
  if(!app.includes('easeOutExpo')) errors.push('V10 Animated Stats: easeOutExpo missing');

  // 11 Line Menu TOC
  if((project.match(/data-line-toc/g)||[]).length!==1) errors.push('V10 Line TOC: project missing');
  if((services.match(/data-line-toc/g)||[]).length!==1) errors.push('V10 Line TOC: services missing');
  if((about.match(/data-line-toc/g)||[]).length!==1) errors.push('V10 Line TOC: about missing');
  if(!css.includes('.line-toc{position:fixed') || !css.includes('left:14px') || !css.includes('flex-direction:column')) errors.push('V10 Line TOC: desktop vertical-left layout missing');

  // 12 Gradient Motion BG
  const contact=await readFile(join(dist,'contact/index.html'),'utf8');
  const gradientHaystack=home+services+about+contact;
  if((gradientHaystack.match(/data-gradient-motion/g)||[]).length<4) errors.push('V10 Gradient Motion BG: expected placements missing');
  for(const style of ['radial','conic','mesh','linear','diamond']){
    if(!css.includes(`data-gradient-style="${style}"`)) errors.push(`V10 Gradient Motion BG: ${style} engine missing`);
  }
  if(!gradientHaystack.includes('data-gradient-style="diamond"')) errors.push('V10 Gradient Motion BG: contact diamond placement missing');

  // Audit document must say what is original/adapted instead of claiming copied proprietary source.
  const componentAudit=await readFile(join(root,'COMPONENT_IMPLEMENTATION_V11.md'),'utf8');
  if(!componentAudit.includes('12 composants')) errors.push('V11 component audit summary missing');
  if(!componentAudit.includes('code source propriétaire')) errors.push('V11 component audit does not disclose source-code limitation');
  if(!componentAudit.includes('Gradient Motion')) errors.push('V11 component audit does not document the requested background');
}


// V11 coherence + journey invariants from the latest UX audit.
{
  const home=await readFile(join(dist,'index.html'),'utf8');
  const work=await readFile(join(dist,'work/index.html'),'utf8');
  const project=await readFile(join(dist,'projet/le-bol-den-face/index.html'),'utf8');
  const services=await readFile(join(dist,'services/index.html'),'utf8');
  const about=await readFile(join(dist,'a-propos/index.html'),'utf8');
  const journal=await readFile(join(dist,'journal/index.html'),'utf8');
  const contact=await readFile(join(dist,'contact/index.html'),'utf8');

  for(const [rel,html] of [['home',home],['work',work],['project',project],['services',services],['about',about],['journal',journal],['contact',contact]]){
    if(!html.includes('id="main-content"')) errors.push(`V11 ${rel}: main-content anchor missing`);
    if(!html.includes('class="skip-link"')) errors.push(`V11 ${rel}: skip link missing`);
    if(html.includes('site-footer__lead')) errors.push(`V11 ${rel}: duplicated oversized footer CTA still rendered`);
    if(/animé|anime/i.test(html)) errors.push(`V11 ${rel}: unwanted anime reference still visible`);
  }
  if(!home.includes('class="proof-cluster"')) errors.push('V11 Home: collaborations + stats proof cluster missing');
  if(!home.includes('data-scene="journey"')) errors.push('V11 Home: journey scene missing');
  if(!app.includes('--journey-shift') || !app.includes('--journey-ring')) errors.push('V11 Home: journey scroll motion variables missing');
  if(!css.includes('@keyframes journeyHalo')) errors.push('V11 Home: journey ambient motion missing');
  if(!app.includes("counter.textContent=(0).toFixed(decimals)")) errors.push('V11 Stats: numeric count-up initialization missing');
  if(!css.includes('.animated-stats article{') || !css.includes('opacity:1')) errors.push('V11 Stats: no-JS readable fallback missing');
  if(!css.includes('.line-toc.is-open') || !app.includes('scheduleClose(1900)')) errors.push('V11 Line TOC: delayed hover expansion missing');
  if(!css.includes('grid-column:3') || !contact.includes('data-menu-label')) errors.push('V11 Mobile menu: top-right menu placement hook missing');
  if(!css.includes('.mobile-menu{position:fixed') || !css.includes('color:var(--paper)')) errors.push('V11 Mobile menu: readable overlay styling missing');
  if(!work.includes('class="work-route motion-reveal"')) errors.push('V11 Work: explicit Services/Contact continuation missing');
  if(!journal.includes('class="journal-bridge motion-reveal"')) errors.push('V11 Journal: bridge to concrete work missing');
  if(!about.includes('Parler d’un projet')) errors.push('V11 About: contact continuation missing');
}

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`QA OK — ${htmls.length} HTML files, hashed assets wired, JS syntax valid, no duplicate IDs.`);
