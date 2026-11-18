import { site } from '../content/site.mjs';
import { offerCatalog, officialProfiles, jobTitle } from './seo.mjs';

export const esc = (value='') => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#039;');

// Politique de sécurité du contenu : le navigateur refuse tout script, cadre ou envoi qui ne vient pas
// d'une source listée ici. GitHub Pages ne permet pas d'en-têtes HTTP : la règle est posée en balise meta
// (frame-ancestors, lui, se règle dans Cloudflare, voir SECURITY.md).
const supabaseOrigin = (site.supabaseUrl||'').replace(/\/$/,'');
export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'sha256-tuKyZn/3ycw/MNMDii/kvSPrelo6SCsJSecqb1n2neg=' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://img.youtube.com https://i.ytimg.com https://images.unsplash.com https://upload.wikimedia.org https://images.squarespace-cdn.com https://static.smallrig.com",
  "media-src 'self' blob:",
  // 'self' : l'admin affiche ses modèles de documents (public/admin/docs/) dans un cadre de même origine.
  "frame-src 'self' https://www.youtube-nocookie.com https://www.instagram.com",
  `connect-src 'self' https://formsubmit.co https://cloudflareinsights.com${supabaseOrigin ? ` ${supabaseOrigin} ${supabaseOrigin.replace('https://','wss://')}` : ''}`,
  "form-action 'self' https://formsubmit.co",
  "base-uri 'self'",
  "object-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "upgrade-insecure-requests",
].join('; ');

export function head({ title, description, path='/', image=`${site.domain}/assets/og-home.png`, imageAlt='Nolan Arc, halo elliptique noir, blanc et orange', imageWidth='1024', imageHeight='1024', bodyClass='', extraSchema=[], robots='' }) {
  const canonical = `${site.domain}${path === '/' ? '/' : path}`;
  const personId = `${site.domain}/#nolan`;
  const businessId = `${site.domain}/#business`;
  const sameAs = officialProfiles;
  // Données structurées : ce que Google, Bing (ChatGPT, Copilot), Gemini, Claude ou Perplexity lisent
  // sans exécuter la page. Tout est tiré des contenus publiés (offres, FAQ, projets) : rien d'inventé.
  const graph = [
    { '@type':'WebSite', '@id':`${site.domain}/#website`, url:`${site.domain}/`, name:site.name, alternateName:['Nolan.Arc','Nolan Ribeiro'], inLanguage:'fr-FR', publisher:{ '@id':businessId }, about:{ '@id':personId } },
    { '@type':'Person', '@id':personId, name:site.legalName, givenName:'Nolan', familyName:'Ribeiro', alternateName:[site.name,'Nolan.Arc'], url:`${site.domain}/`, mainEntityOfPage:`${site.domain}/a-propos/`, jobTitle, description:`${site.legalName}, vidéaste, photographe et réalisateur, travaille sous le nom ${site.name} : films de mariage, films de marque, courts métrages, direction artistique et stratégie de marque.`, knowsAbout:['Réalisation vidéo','Film de mariage','Court métrage','Direction artistique','Stratégie de marque','Montage vidéo'], knowsLanguage:['fr'], sameAs, worksFor:{ '@id':businessId } },
    { '@type':'ProfessionalService', '@id':businessId, name:site.name, alternateName:[`${site.name}, ${site.legalName}`,'Nolan.Arc'], url:`${site.domain}/`, description:'Réalisation photo et vidéo (films de mariage, films de marque, courts métrages, contenus pour les réseaux sociaux), direction artistique et stratégie de marque.', slogan:site.principle, image:`${site.domain}/assets/og-home.png`, logo:{ '@type':'ImageObject', url:`${site.domain}/assets/icons/icon-512.png`, width:512, height:512 }, founder:{ '@id':personId }, sameAs,
      areaServed:[{ '@type':'City', name:'Paris' },{ '@type':'AdministrativeArea', name:'Île-de-France' },{ '@type':'Country', name:'France' }],
      priceRange:'À partir de 89 €', currenciesAccepted:'EUR', availableLanguage:['fr'],
      contactPoint:{ '@type':'ContactPoint', contactType:'Demande de projet', url:`${site.domain}/contact/`, availableLanguage:['fr'] },
      knowsAbout:['Vidéo de mariage','Film de marque','Réalisation vidéo','Direction artistique','Stratégie de marque'],
      hasOfferCatalog:offerCatalog(businessId) },
    { '@type':'WebPage', '@id':`${canonical}#page`, url:canonical, name:title, description, inLanguage:'fr-FR', isPartOf:{ '@id':`${site.domain}/#website` }, about:{ '@id':businessId } },
    ...extraSchema,
  ];
  const schema = { '@context':'https://schema.org', '@graph':graph };
  const schemaJson = JSON.stringify(schema).replaceAll('<','\\u003c');
  return `<!doctype html>
<html lang="fr" class="no-js">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#080706">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="nolanarc-audience-token" content="${esc(site.analyticsToken || '')}">
<meta name="nolanarc-supabase-url" content="${esc(process.env.SUPABASE_URL || '')}">
<meta name="nolanarc-supabase-key" content="${esc(process.env.SUPABASE_ANON_KEY || '')}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${robots ? `<meta name="robots" content="${esc(robots)}">` : `<link rel="canonical" href="${canonical}">`}
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/icon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192.png">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${esc(imageAlt)}">
${imageWidth?`<meta property="og:image:width" content="${esc(imageWidth)}">`:``}
${imageHeight?`<meta property="og:image:height" content="${esc(imageHeight)}">`:``}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(imageAlt)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${path !== '/contact/' ? '<link rel="prefetch" href="/contact/" as="document">' : ''}
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=Syne:wght@400..800&family=Yrsa:ital,wght@0,300..700;1,300..700&display=swap" rel="stylesheet">
<style id="critical-shell">.mobile-menu[hidden]{display:none!important}</style>
<link rel="stylesheet" href="/__SITE_CSS__">
<script>document.documentElement.classList.remove('no-js');</script>
<script type="application/ld+json">${schemaJson}</script>
</head>
<body class="${bodyClass}">`;
}

const activeFor = (active, href) => {
  if (href === '/') return active === '/' ? 'is-active' : '';
  if (href === '/work/' && active.startsWith('/projet/')) return 'is-active';
  return active === href || active.startsWith(href) ? 'is-active' : '';
};

export function header(active='') {
  const nav = site.nav.map(item => `<a class="fab-nav__link ${activeFor(active,item.href)}" href="${item.href}" data-fnb-item>${item.label}</a>`).join('');
  return `${active==='/'?logoPreloader({hold:240}):''}<a class="skip-link" href="#main-content">Aller au contenu</a><div class="page-progress" aria-hidden="true"><i></i></div><div class="custom-cursor" data-custom-cursor aria-hidden="true"><i></i></div>
  <header class="site-header fab-header" data-header data-fnb>
    <div class="fnb-bg" data-fnb-bg aria-hidden="true"></div><div class="fnb-ring" aria-hidden="true"></div>
    <div class="fnb-row" data-fnb-row>
      <a class="brand fab-brand" href="/" aria-label="Nolan Arc, accueil" data-fnb-item><span>N</span><span class="fnb-tail"><span>olan</span></span><span class="fnb-rest"><b>.</b><span class="fnb-tail"><span>Arc</span></span></span></a>
      <nav class="site-nav fab-nav" aria-label="Navigation principale">${nav}</nav>
      <a class="fab-nav__link fab-nav__contact ${activeFor(active,'/contact/')}" href="/contact/" data-fnb-item>Contact</a>
      <button class="menu-button fab-menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button data-fnb-item><span data-menu-label>Menu</span></button>
    </div>
  </header>
  <div class="mobile-menu fab-mobile-menu" id="mobile-menu" data-mobile-menu hidden>
    <div class="mobile-menu__inner fab-mobile-menu__inner">
      <a href="/"><small>01</small>Accueil</a>
      ${site.nav.map((item,i)=>`<a href="${item.href}"><small>0${i+2}</small>${item.label}</a>`).join('')}
      <a href="/contact/"><small>0${site.nav.length+2}</small>Contact</a>
      <div class="mobile-menu__meta"><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a></div>
    </div>
  </div>`;
}

export function footer() {
  return `<footer class="site-footer fab-footer">
    <div class="fab-footer__brand"><a href="/">Nolan<span>.</span>Arc</a><p>Nolan Ribeiro. Réalisation, direction artistique et stratégie de marque.</p></div>
    <div class="fab-footer__grid">
      <div><small>Navigation</small><a href="/work/">Work</a><a href="/services/">Services</a><a href="/a-propos/">À propos</a><a href="/journal/">Journal</a></div>
      <div><small>Contact</small><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a><a href="${site.youtube}" target="_blank" rel="noreferrer">YouTube ↗</a></div>
      <div><small>Légal</small><a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><button class="footer-cookie-link" type="button" data-cookie-settings>Préférences vidéo</button><a href="/retractation/">Rétractation</a></div>
    </div>
    <div class="fab-footer__bottom"><span>© Nolan Arc 2026</span><span>L’intention avant l’image.</span></div>
  </footer><div class="cookie-consent" data-cookie-consent hidden role="dialog" aria-modal="false" aria-labelledby="cookie-consent-title"><div><strong id="cookie-consent-title">Vidéo externe</strong><p>Le fond vidéo Sony utilise YouTube. Il reste désactivé tant que vous ne l’autorisez pas. Votre choix peut être modifié depuis le footer.</p></div><div class="cookie-consent__actions"><button type="button" data-cookie-reject>Continuer sans vidéo</button><button type="button" data-cookie-accept>Autoriser la vidéo</button></div></div><script type="module" src="/__APP_JS__"></script></body></html>`;
}

export function faqAccordion(items=[], {id='faq', eyebrow='Questions fréquentes', title='Avant de commencer.', intro='Les réponses utiles avant de parler du projet.'}={}){
  if(!items.length) return '';
  return `<section class="faq-section motion-reveal" id="${esc(id)}" data-faq-section><header class="faq-section__head"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${intro?`<p>${esc(intro)}</p>`:''}</header><div class="faq-list">${items.map((item,i)=>`<article class="faq-item${i===0?' is-open':''}" data-faq-item><h3><button id="${esc(id)}-question-${i}" type="button" data-faq-button aria-expanded="${i===0?'true':'false'}" aria-controls="${esc(id)}-answer-${i}"><span>${esc(item.question)}</span><i aria-hidden="true"></i></button></h3><div class="faq-answer" id="${esc(id)}-answer-${i}" role="region" aria-labelledby="${esc(id)}-question-${i}" data-faq-answer${i===0?'':' hidden'}><div><p>${esc(item.answer)}</p></div></div></article>`).join('')}</div></section>`;
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


export function logoPreloader({hold=240}={}){
  return `<div class="brand-preloader logo-preloader" data-brand-preloader data-preloader-hold="${Number(hold)||240}" aria-hidden="true"><div class="logo-preloader__grain"></div><div class="logo-preloader__halo"></div><div class="logo-preloader__mark"><span>Nolan</span><b>.</b><span>Arc</span></div></div>`;
}

export function lineToc(items=[]){
  if(!items.length) return '';
  return `<nav class="line-toc" data-line-toc aria-label="Sommaire de la page">${items.map((item,i)=>`<a href="#${esc(item.id)}" data-toc-target="${esc(item.id)}"><span class="line-toc__line"><i></i></span><small>${esc(item.label)}</small><b>0${i+1}</b></a>`).join('')}</nav>`;
}

export function animatedStats(stats=[], {theme='dark', layout='auto', replay=true, animation='blur'}={}){
  if(!stats.length) return '';
  const styles=['blur','slide','fade','scale'];
  const selected=styles.includes(animation)?animation:'blur';
  return `<section class="animated-stats animated-stats--${esc(theme)}" data-animated-stats data-layout="${esc(layout)}" data-replay="${replay?'true':'false'}" data-animation="${esc(selected)}" aria-label="Repères concrets"><div class="animated-stats__track" style="--stat-count:${stats.length}">${stats.map((stat,i)=>{
    const value=Number(stat.value)||0;
    const decimals=Number.isInteger(value)?0:String(value).split('.')[1]?.length||0;
    // Une année s'affiche telle quelle : la faire défiler de 0 à 2022 afficherait de fausses dates.
    const isYear=Number.isInteger(value)&&value>=1900&&value<=2100;
    const style=styles.includes(stat.animation)?stat.animation:selected;
    return `<article class="stat-style--${esc(style)}" data-stat-card data-stat-order="${i}" data-stat-style="${esc(style)}"><strong><span>${esc(stat.prefix||'')}</span><b data-counter${isYear?' data-counter-static':''} data-counter-target="${value}" data-counter-decimals="${decimals}">${value.toFixed(decimals)}</b><span>${esc(stat.suffix||'')}</span></strong><small>${esc(stat.label)}</small></article>`;
  }).join('')}</div></section>`;
}

export function gradientMotionBackground({style='mesh', speed=18, blur=68, opacity=.58, size=118, colors=['#CC460C','#E97736','#F0C7A5','#2B1710']}={}){
  const safeStyle=['radial','conic','mesh','linear','diamond'].includes(style)?style:'mesh';
  const palette=[...colors,'#CC460C','#E97736','#F0C7A5','#2B1710'].slice(0,4);
  return `<div class="gradient-motion-bg" data-gradient-motion data-gradient-style="${safeStyle}" style="--gm-speed:${Number(speed)||18}s;--gm-blur:${Number(blur)||68}px;--gm-opacity:${Number(opacity)||.58};--gm-scale:${(Number(size)||118)/100};--gm-c1:${esc(palette[0])};--gm-c2:${esc(palette[1])};--gm-c3:${esc(palette[2])};--gm-c4:${esc(palette[3])}" aria-hidden="true"><i></i><i></i><i></i><span></span></div>`;
}

export function focusTestimonials(items=[], {maxVisible=2}={}){
  if(!items.length) return '';
  const max=Math.max(1,Math.min(items.length,Number(maxVisible)||items.length));
  return `<section class="focus-testimonials motion-reveal" data-focus-testimonials data-max-visible="${max}" aria-labelledby="focus-testimonials-title"><div class="focus-testimonials__head"><span class="eyebrow">Retours</span><h2 id="focus-testimonials-title">Quelques phrases<br><em>qui comptent.</em></h2></div><div class="focus-testimonials__stream" id="focus-testimonials-stream" data-testimonials-stream>${items.map((item,i)=>`<button type="button" data-testimonial-index="${i}"${i>=max?' hidden':''}><span>« ${esc(item.quote)} »</span><small class="focus-testimonials__author">${esc(item.name)}<i>${esc(item.role)}</i></small></button>`).join('')}</div>${items.length>max?`<div class="focus-testimonials__actions"><button class="focus-testimonials__more glassy-control" type="button" data-testimonials-toggle aria-expanded="false" aria-controls="focus-testimonials-stream"><span>Voir tous les retours</span><i aria-hidden="true">+</i></button></div>`:''}</section>`;
}

export function glassShowcase(images=[], {direction='ltr', transmission=.94, ior=1.45, thickness=.7, float=.08}={}){
  if(!images.length) return '';
  return `<div class="glass-showcase" data-glass-showcase data-showcase-direction="${esc(direction)}" data-transmission="${Number(transmission)}" data-ior="${Number(ior)}" data-thickness="${Number(thickness)}" data-float="${Number(float)}"><div class="glass-showcase__shell"><div class="glass-showcase__webgl" data-showcase-webgl aria-hidden="true"></div><div class="glass-showcase__fallback">${images.map((img,i)=>`<img class="glass-showcase__frame${i===0?' is-active':''}" data-showcase-frame="${i}" src="${esc(img)}" alt="Illustration visuelle ${i+1} de la démarche Nolan Arc">`).join('')}</div><canvas data-showcase-particles aria-hidden="true"></canvas><div class="glass-showcase__sheen" aria-hidden="true"></div></div></div>`;
}

export function stackedFlow(items=[], {active=0}={}){
  if(!items.length) return '';
  return `<div class="stacked-flow" data-stacked-flow data-stack-index="${Math.max(0,Math.min(items.length-1,active))}" role="region" aria-label="Collaborations en cartes empilées"><div class="stacked-flow__stage">${items.map((item,i)=>`<a class="stacked-flow__card${i===active?' is-active':''}" data-stack-card data-stack-index="${i}" href="${esc(item.href)}" style="--stack-image:url('${esc(item.image)}')"><span>0${i+1}</span><small>${esc(item.kicker)}</small><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p><i>Explorer →</i></a>`).join('')}</div><div class="stacked-flow__controls" aria-label="Navigation des collaborations"><button class="glassy-icon-button" type="button" data-stack-prev aria-label="Collaboration précédente">←</button><span><b data-stack-current>${String(active+1).padStart(2,'0')}</b> / ${String(items.length).padStart(2,'0')}</span><button class="glassy-icon-button" type="button" data-stack-next aria-label="Collaboration suivante">→</button></div></div>`;
}

export function videoSlideShow(slides=[], {autoplay=true, interval=5200, orientation='horizontal', muted=true, loop=false, sectionId='video-showcase', eyebrow='Fragments', heading='Un film, plusieurs points d’entrée.', intro='Faites glisser les cartes ou utilisez les commandes pour parcourir les extraits.'}={}){
  if(!slides.length) return '';
  const hasAnyVideo=slides.some(slide=>Boolean(slide.videoId));
  return `<section class="video-showcase motion-reveal" id="${esc(sectionId)}" aria-labelledby="${esc(sectionId)}-title"><div class="video-showcase__head"><span class="eyebrow">${esc(eyebrow)}</span><div><h2 id="${esc(sectionId)}-title">${esc(heading)}</h2><p>${esc(intro)}</p></div></div><div class="video-slide-show" data-video-slide-show data-orientation="${esc(orientation)}" data-autoplay="${autoplay?'true':'false'}" data-autoplay-interval="${Number(interval)||5200}" data-video-muted="${muted?'true':'false'}" data-video-loop="${loop?'true':'false'}" role="region" aria-roledescription="carousel" aria-label="${esc(heading)}">${hasAnyVideo?`<button class="video-slide-show__sound${muted?' is-muted':''}" type="button" data-video-mute aria-pressed="${muted?'true':'false'}" aria-label="${muted?'Activer le son':'Couper le son'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="sound-body" d="M4 9.5h4L13 5v14l-5-4.5H4z"/><path class="sound-wave" d="M16 9c1.4 1.7 1.4 4.3 0 6"/><path class="sound-x" d="m17 8 5 8m0-8-5 8"/></svg></button>`:''}<div class="video-slide-show__stage" data-video-stage>${slides.map((slide,i)=>{const hasVideo=Boolean(slide.videoId);return `<article class="video-slide${i===0?' is-active':''}${hasVideo?'':' is-image-only'}" data-video-slide data-slide-index="${i}"${hasVideo?` data-video-id="${esc(slide.videoId)}" data-video-start="${Number(slide.start)||0}"`:''} style="--slide-poster:url('${esc(slide.poster)}');--slide-poster-position:${esc(slide.position||'center')}"><div class="video-slide__media" data-slide-media><div class="video-slide__poster" aria-hidden="true"></div><div class="video-slide__frame" data-slide-frame></div></div><div class="video-slide__copy"><small>${esc(slide.kicker||`Extrait ${String(i+1).padStart(2,'0')}`)}</small><strong>${esc(slide.title||`Extrait ${String(i+1).padStart(2,'0')}`)}</strong>${hasVideo?`<button type="button" data-slide-play aria-label="Lire ${esc(slide.title||`l’extrait ${i+1}`)}">Lire <span aria-hidden="true">▶</span></button>`:`<span class="video-slide__credit">${esc(slide.credit||'Illustration')}</span>`}</div><button class="video-slide__select" type="button" data-slide-select aria-label="Afficher ${esc(slide.title||`l’extrait ${i+1}`)}"></button></article>`}).join('')}</div><button class="video-slide-show__arrow video-slide-show__arrow--prev" type="button" data-video-prev aria-label="Extrait précédent">←</button><button class="video-slide-show__arrow video-slide-show__arrow--next" type="button" data-video-next aria-label="Extrait suivant">→</button><div class="video-slide-show__dots" role="group" aria-label="Choisir un extrait">${slides.map((_,i)=>`<button type="button" data-video-dot="${i}" aria-label="Extrait ${i+1}"${i===0?' aria-current="true"':''}><i></i></button>`).join('')}</div></div></section>`;
}

export function pageViewCounter(){
  return `<span class="page-view-counter" data-page-view-counter hidden aria-live="polite"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg><b data-page-view-value>0</b><span>vues</span></span>`;
}

/** FAQ en données structurées : les réponses restent lisibles par les robots même repliées à l'écran. */
export const faqSchema = (items=[], path='/') => items.length ? [{ '@type':'FAQPage', '@id':`${site.domain}${path}#faq`, mainEntity:items.map(item=>({ '@type':'Question', name:item.question, acceptedAnswer:{ '@type':'Answer', text:item.answer } })) }] : [];

/** Confirmation d'envoi du formulaire : carte vitrée sombre, lueur ember, grille fine ; une lettre lumineuse
 *  glisse dans l'enveloppe, qui se ferme sur un cachet brillant. Ouverte par src/app.js. */
export function contactDialog(){
  return `<div class="cx-dialog" data-contact-dialog hidden>
  <div class="cx-dialog__backdrop" data-dialog-close></div>
  <div class="cx-dialog__card" role="dialog" aria-modal="true" aria-labelledby="cx-dialog-state" aria-describedby="cx-dialog-label cx-dialog-title cx-dialog-sub cx-dialog-text" tabindex="-1">
    <div class="cx-dialog__grid" aria-hidden="true"></div>
    <div class="cx-dialog__top"><span>Nolan Arc · contact</span><span class="cx-dialog__pill" id="cx-dialog-state"><i aria-hidden="true"></i>Message reçu</span></div>
    <svg class="cx-envelope" viewBox="0 0 160 124" aria-hidden="true">
      <defs><linearGradient id="cx-env-line" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0c7a5"/><stop offset=".55" stop-color="#e97736"/><stop offset="1" stop-color="#cc460c"/></linearGradient></defs>
      <rect class="cx-envelope__back" x="20" y="46" width="120" height="72" rx="10"/>
      <path class="cx-envelope__flap cx-envelope__flap--open" d="M20 57 80 94 140 57v-5a6 6 0 0 0-6-6H26a6 6 0 0 0-6 6Z"/>
      <g class="cx-envelope__letter"><rect x="36" y="14" width="88" height="66" rx="6"/><path d="M50 32h46M50 44h60M50 56h38"/></g>
      <path class="cx-envelope__front" d="M20 58 80 94 140 58v50a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10Z"/>
      <path class="cx-envelope__flap" d="M20 57 80 94 140 57v-5a6 6 0 0 0-6-6H26a6 6 0 0 0-6 6Z"/>
      <circle class="cx-envelope__seal" cx="80" cy="91" r="6.5"/>
    </svg>
    <div class="cx-dialog__body">
      <p class="cx-dialog__label" id="cx-dialog-label">Je vous réponds sous</p>
      <h2 id="cx-dialog-title">48 h</h2>
      <p class="cx-dialog__sub" id="cx-dialog-sub">ouvrées, au plus tard.</p>
      <p id="cx-dialog-text" class="cx-dialog__text">Votre message est bien arrivé. Je le lis moi-même, puis je reviens vers vous avec les premières questions utiles.</p>
      <div class="cx-dialog__actions"><a href="/work/">Voir les réalisations <span aria-hidden="true">↗</span></a><button type="button" data-dialog-close>Fermer</button></div>
    </div>
  </div>
</div>`;
}
