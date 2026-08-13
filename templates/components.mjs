import { site } from '../content/site.mjs';

export const esc = (value='') => String(value)
  .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  .replaceAll('"','&quot;').replaceAll("'",'&#039;');

export function head({ title, description, path='/', image='https://img.youtube.com/vi/GbeOQ-hgrtU/maxresdefault.jpg', bodyClass='' }) {
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
  return `<header class="site-header" data-header>
    <a class="brand" href="/" aria-label="Nolan Arc — Accueil"><span>Nolan</span><b>.</b><span>Arc</span></a>
    <nav class="site-nav" aria-label="Navigation principale">${nav}</nav>
    <a class="header-cta" href="/contact/">Parler d’un projet <span aria-hidden="true">↗</span></a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button><span>Menu</span><i></i><i></i></button>
  </header>
  <div class="mobile-menu" id="mobile-menu" data-mobile-menu hidden>
    <div class="mobile-menu__inner">
      ${site.nav.map((item,i)=>`<a href="${item.href}"><small>0${i+1}</small>${item.label}</a>`).join('')}
      <a href="/contact/"><small>05</small>Contact</a>
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

export function arcRail() {
  return `<div class="arc-rail" aria-hidden="true" data-arc-rail><svg viewBox="0 0 120 860" preserveAspectRatio="none"><path d="M18 0 C 125 180, -20 350, 88 520 S 18 760 100 860" pathLength="1"></path></svg><i data-arc-dot></i></div>`;
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
