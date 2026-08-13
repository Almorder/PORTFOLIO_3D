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
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.remove('no-js');</script>
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="${bodyClass}">`;
}

export function header(active='') {
  const nav = site.nav.map(item => `<a class="site-nav__link ${active === item.href ? 'is-active':''}" href="${item.href}">${item.label}</a>`).join('');
  return `<header class="site-header" data-header>
    <a class="brand" href="/" aria-label="Nolan Arc — Accueil"><span>NOLAN</span><i></i><span>ARC</span></a>
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
  </div>`;
}

export function arcRail() {
  return `<div class="arc-rail" aria-hidden="true" data-arc-rail><svg viewBox="0 0 120 860" preserveAspectRatio="none"><path d="M18 0 C 125 180, -20 350, 88 520 S 18 760 100 860" pathLength="1"></path></svg><i data-arc-dot></i></div>`;
}

export function footer() {
  return `<footer class="site-footer">
    <div class="site-footer__lead"><span class="eyebrow">Un projet à raconter ?</span><p>On peut commencer par une idée, un brief ou simplement une question.</p><a class="text-link text-link--large" href="/contact/">Parler à Nolan <span>↗</span></a></div>
    <div class="site-footer__cols">
      <div><strong>Nolan Arc</strong><span>${site.role}</span><span>${site.location}</span></div>
      <div><strong>Explorer</strong><a href="/work/">Work</a><a href="/services/">Services</a><a href="/a-propos/">À propos</a><a href="/journal/">Journal</a></div>
      <div><strong>Contact</strong><a href="mailto:${site.email}">${site.email}</a><a href="${site.instagram}" target="_blank" rel="noreferrer">Instagram ↗</a><a href="${site.youtube}" target="_blank" rel="noreferrer">YouTube ↗</a></div>
      <div><strong>Légal</strong><a href="/mentions-legales/">Mentions légales</a><a href="/confidentialite/">Confidentialité</a><a href="/cgv/">CGV</a><a href="/cookies/">Cookies</a><a href="/retractation/">Rétractation</a><span>© Nolan Arc 2026</span></div>
    </div>
  </footer><script type="module" src="/assets/app.js"></script></body></html>`;
}

export function projectMeta(project) {
  return `<div class="project-meta"><span>${esc(project.type)}</span><span>${esc(project.role)}</span><span>${esc(project.context)}</span><span>${esc(project.year)}</span></div>`;
}

export function placeholderVisual(label, index=1) {
  return `<div class="media-placeholder" role="img" aria-label="Média à rattacher pour ${esc(label)}"><span>0${index}</span><strong>${esc(label)}</strong><small>${esc(label)}</small></div>`;
}
