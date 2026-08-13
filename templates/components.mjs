import { site } from '../content/site.mjs';

export const esc = (value='') => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#039;');

export function head({ title, description, path='/', image='https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000', bodyClass='' }) {
  const canonical = `${site.domain}${path === '/' ? '/' : path}`;
  const schema = {
    '@context':'https://schema.org',
    '@type':'Person',
    name: site.legalName,
    alternateName: site.name,
    url: site.domain,
    jobTitle: site.role,
    email: `mailto:${site.email}`,
    sameAs: [site.instagram, site.youtube]
  };
  return `<!doctype html>
<html lang="fr" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#080706">
<meta name="nolanarc-supabase-url" content="${esc(process.env.SUPABASE_URL || '')}">
<meta name="nolanarc-supabase-key" content="${esc(process.env.SUPABASE_ANON_KEY || '')}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<link rel="preconnect" href="https://images.unsplash.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=Syne:wght@400..800&family=Yrsa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
<style id="critical-shell">.mobile-tabs{display:none}.mobile-menu[hidden]{display:none!important}</style>
<link rel="stylesheet" href="/__SITE_CSS__">
<script>document.documentElement.classList.remove('no-js');</script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="${bodyClass}">`;
}

const activeFor = (active, href) => {
  if (href === '/') return active === '/' ? 'is-active' : '';
  if (href === '/work/' && active.startsWith('/projet/')) return 'is-active';
  return active === href || active.startsWith(href) ? 'is-active' : '';
};

export function header(active='') {
  const nav = site.nav.map(item => `<a class="site-nav__link ${activeFor(active,item.href)}" href="${item.href}">${item.label}</a>`).join('');
  return `<div class="page-progress" aria-hidden="true"><i></i></div><header class="site-header" data-header>
    <a class="brand" href="/" aria-label="Nolan Arc — Accueil"><span>Nolan</span><b>.</b><span>Arc</span></a>
    <nav class="site-nav" aria-label="Navigation principale">${nav}</nav>
    <a class="header-cta" href="/contact/">Parler d’un projet <span aria-hidden="true">↗</span></a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button><span>Menu</span><i></i><i></i></button>
  </header>
  <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
    <div class="mobile-menu__inner">
      ${site.nav.map((item,i)=>`<a href="${item.href}"><small>0${i+1}</small>${item.label}</a>`).join('')}
      <a href="/contact/"><small>0${site.nav.length+1}</small>Contact</a>
      <div class="mobile-menu__meta"><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a></div>
    </div>
  </div>
  <nav class="mobile-tabs" aria-label="Navigation mobile rapide">
    <a class="${activeFor(active,'/')}" href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5v8.25A1.25 1.25 0 0 1 18.75 20h-13.5A1.25 1.25 0 0 1 4 18.75Z"/><path d="M9 20v-6h6v6"/></svg><small>Accueil</small></a>
    <a class="${activeFor(active,'/work/')}" href="/work/"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg><small>Work</small></a>
    <a class="${activeFor(active,'/services/')}" href="/services/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18"/><path d="m6.5 6.5 11 11m0-11-11 11"/></svg><small>Services</small></a>
    <a class="${activeFor(active,'/contact/')}" href="/contact/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M9 5h10v10"/></svg><small>Contact</small></a>
  </nav>`;
}


export function footer() {
  return `<footer class="site-footer">
    <div class="site-footer__lead"><span class="eyebrow">Un projet en tête ?</span><p>Vous pouvez m’écrire avec un brief précis ou simplement m’expliquer ce que vous cherchez.</p><a class="text-link text-link--large" href="/contact/">Parler à Nolan <span>↗</span></a></div>
    <div class="site-footer__cols">
      <div><strong>Nolan Arc</strong><span>${site.role}</span><span>${site.location}</span></div>
      <div><strong>Explorer</strong><a href="/work/">Work</a><a href="/services/">Services</a><a href="/a-propos/">À propos</a><a href="/journal/">Journal</a></div>
      <div><strong>Contact</strong><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a><a href="${site.youtube}" target="_blank" rel="noreferrer">YouTube ↗</a></div>
      <div><strong>Légal</strong><a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a><span>© Nolan Arc 2026</span></div>
    </div>
  </footer><script type="module" src="/__APP_JS__"></script></body></html>`;
}

export function projectMeta(project) {
  return `<dl class="project-meta-list">
    <div><dt>Contexte</dt><dd>${esc(project.context)}</dd></div>
    <div><dt>Rôle</dt><dd>${esc(project.role)}</dd></div>
    <div><dt>Année</dt><dd>${esc(project.year)}</dd></div>
    ${project.location ? `<div><dt>Lieu</dt><dd>${esc(project.location)}</dd></div>` : ''}
    ${project.format ? `<div><dt>Format</dt><dd>${esc(project.format)}</dd></div>` : ''}
    ${project.camera ? `<div><dt>Caméra</dt><dd>${esc(project.camera)}</dd></div>` : ''}
  </dl>`;
}

export function placeholderVisual(label, index=1) {
  return `<div class="media-placeholder" role="img" aria-label="Média à rattacher pour ${esc(label)}"><span>0${index}</span><strong>${esc(label)}</strong><small>${esc(label)}</small></div>`;
}

export function logoPreloader({hold=180}={}){
  return `<div class="brand-preloader" data-brand-preloader data-preloader-hold="${Number(hold)||180}" aria-hidden="true"><div class="brand-preloader__spotlight"></div><div class="brand-preloader__mark"><span>Nolan</span><b>.</b><span>Arc</span></div><i></i></div>`;
}

export function lineToc(items=[]){
  if(!items.length) return '';
  return `<nav class="line-toc" data-line-toc aria-label="Sommaire de la page">${items.map((item,i)=>`<a href="#${esc(item.id)}" data-toc-target="${esc(item.id)}"><span class="line-toc__line"><i></i></span><small>${esc(item.label)}</small><b>0${i+1}</b></a>`).join('')}</nav>`;
}

export function animatedStats(stats=[], {theme='dark', layout='auto', replay=false}={}){
  if(!stats.length) return '';
  const styles=['blur','slide','fade','scale'];
  return `<section class="animated-stats animated-stats--${esc(theme)} motion-reveal" data-animated-stats data-layout="${esc(layout)}" data-replay="${replay?'true':'false'}" aria-label="Repères concrets">${stats.map((stat,i)=>{
    const value=Number(stat.value)||0;
    const decimals=Number.isInteger(value)?0:String(value).split('.')[1]?.length||0;
    const style=stat.animation || styles[i%styles.length];
    return `<article class="stat-style--${esc(style)}" data-stat-card data-stat-order="${i}" data-stat-style="${esc(style)}"><strong><span>${esc(stat.prefix||'')}</span><b data-counter data-counter-target="${value}" data-counter-decimals="${decimals}">0${decimals?'.'+'0'.repeat(decimals):''}</b><span>${esc(stat.suffix||'')}</span></strong><small>${esc(stat.label)}</small></article>`;
  }).join('')}</section>`;
}

export function focusTestimonials(items=[], {maxVisible=2}={}){
  if(!items.length) return '';
  const max=Math.max(1,Math.min(items.length,Number(maxVisible)||items.length));
  return `<section class="focus-testimonials motion-reveal" data-focus-testimonials data-max-visible="${max}" aria-labelledby="focus-testimonials-title"><div class="focus-testimonials__head"><span class="eyebrow">Retours</span><h2 id="focus-testimonials-title">Quelques phrases<br><em>qui comptent.</em></h2></div><div class="focus-testimonials__stream">${items.map((item,i)=>`${i?'<i class="focus-testimonials__sep" aria-hidden="true"> / </i>':''}<button type="button" data-testimonial-index="${i}"${i>=max?' hidden':''}><span>« ${esc(item.quote)} »</span><small class="focus-testimonials__author">${esc(item.name)} · ${esc(item.role)}</small></button>`).join('')}</div>${items.length>max?`<button class="focus-testimonials__more" type="button" data-testimonials-toggle aria-expanded="false"><span>Voir tous les retours</span><i aria-hidden="true">+</i></button>`:''}</section>`;
}

export function glassShowcase(images=[], {direction='ltr', transmission=.94, ior=1.45, thickness=.7, float=.08}={}){
  if(!images.length) return '';
  return `<div class="glass-showcase" data-glass-showcase data-showcase-direction="${esc(direction)}" data-transmission="${Number(transmission)}" data-ior="${Number(ior)}" data-thickness="${Number(thickness)}" data-float="${Number(float)}"><div class="glass-showcase__shell"><div class="glass-showcase__webgl" data-showcase-webgl aria-hidden="true"></div><div class="glass-showcase__fallback">${images.map((img,i)=>`<img class="glass-showcase__frame${i===0?' is-active':''}" data-showcase-frame="${i}" src="${esc(img)}" alt="Illustration visuelle ${i+1} de la démarche Nolan Arc">`).join('')}</div><canvas data-showcase-particles aria-hidden="true"></canvas><div class="glass-showcase__sheen" aria-hidden="true"></div></div></div>`;
}

export function stackedFlow(items=[], {active=0}={}){
  if(!items.length) return '';
  return `<div class="stacked-flow" data-stacked-flow data-stack-index="${Math.max(0,Math.min(items.length-1,active))}" role="region" aria-label="Collaborations en cartes empilées"><div class="stacked-flow__stage">${items.map((item,i)=>`<a class="stacked-flow__card${i===active?' is-active':''}" data-stack-card data-stack-index="${i}" href="${esc(item.href)}" style="--stack-image:url('${esc(item.image)}')"><span>0${i+1}</span><small>${esc(item.kicker)}</small><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p><i>Explorer →</i></a>`).join('')}</div><div class="stacked-flow__controls" aria-label="Navigation des collaborations"><button class="glassy-icon-button" type="button" data-stack-prev aria-label="Collaboration précédente">←</button><span><b data-stack-current>${String(active+1).padStart(2,'0')}</b> / ${String(items.length).padStart(2,'0')}</span><button class="glassy-icon-button" type="button" data-stack-next aria-label="Collaboration suivante">→</button></div></div>`;
}

export function videoSlideShow(slides=[], {autoplay=true, interval=5200, orientation='horizontal', muted=false, loop=false}={}){
  if(!slides.length) return '';
  return `<section class="video-showcase motion-reveal" id="extraits" aria-labelledby="video-showcase-title"><div class="video-showcase__head"><span class="eyebrow">Extraits</span><div><h2 id="video-showcase-title">Revenir au film<br><em>à trois moments.</em></h2><p>Chaque carte ouvre le même court métrage à un point différent.</p></div></div><div class="video-slide-show" data-video-slide-show data-orientation="${esc(orientation)}" data-autoplay="${autoplay?'true':'false'}" data-autoplay-interval="${Number(interval)||5200}" data-video-muted="${muted?'true':'false'}" data-video-loop="${loop?'true':'false'}" role="region" aria-roledescription="carousel" aria-label="Extraits du film"><div class="video-slide-show__stage">${slides.map((slide,i)=>`<article class="video-slide${i===0?' is-active':''}" data-video-slide data-slide-index="${i}" data-video-id="${esc(slide.videoId)}" data-video-start="${Number(slide.start)||0}" style="--slide-poster:url('${esc(slide.poster)}')"><div class="video-slide__media" data-slide-media><div class="video-slide__poster" aria-hidden="true"></div><div class="video-slide__frame" data-slide-frame></div></div><div class="video-slide__copy"><small>${esc(slide.kicker||`Extrait ${String(i+1).padStart(2,'0')}`)}</small><strong>${esc(slide.title||`Extrait ${String(i+1).padStart(2,'0')}`)}</strong><button type="button" data-slide-play aria-label="Lire ${esc(slide.title||`l’extrait ${i+1}`)}">Lire <span aria-hidden="true">▶</span></button></div><button class="video-slide__select" type="button" data-slide-select aria-label="Afficher ${esc(slide.title||`l’extrait ${i+1}`)}"></button></article>`).join('')}</div><div class="video-slide-show__nav"><button class="glassy-icon-button glassy-icon-button--dark" type="button" data-video-prev aria-label="Extrait précédent">←</button><div class="video-slide-show__dots" role="group" aria-label="Choisir un extrait">${slides.map((_,i)=>`<button type="button" data-video-dot="${i}" aria-label="Extrait ${i+1}"${i===0?' aria-current="true"':''}><i></i></button>`).join('')}</div><button class="glassy-icon-button glassy-icon-button--dark" type="button" data-video-next aria-label="Extrait suivant">→</button></div></div></section>`;
}

export function pageViewCounter(){
  return `<span class="page-view-counter" data-page-view-counter hidden aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg><b data-page-view-value>0</b><span>vues</span></span>`;
}
