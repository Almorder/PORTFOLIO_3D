import { rm, mkdir, writeFile, copyFile, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homePage, workPage, projectPage, servicesPage, marquesPage, momentsPage, aboutPage, journalPage, contactPage, legalPage, privacyPage, cookiesPage, cgvPage, withdrawalPage, notFoundPage } from '../templates/pages.mjs';
import { site } from '../content/site.mjs';

const root=new URL('../',import.meta.url).pathname;
const out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(join(out,'assets'),{recursive:true});

const pages = new Map([
  ['index.html',homePage()],
  ['work/index.html',workPage()],
  ['projet/le-bol-den-face/index.html',projectPage()],
  ['services/index.html',servicesPage()],
  ['services/marques/index.html',marquesPage()],
  ['services/moments/index.html',momentsPage()],
  ['a-propos/index.html',aboutPage()],
  ['journal/index.html',journalPage()],
  ['contact/index.html',contactPage()],
  ['mentions-legales/index.html',legalPage()],
  ['confidentialite/index.html',privacyPage()],
  ['cookies/index.html',cookiesPage()],
  ['cgv/index.html',cgvPage()],
  ['retractation/index.html',withdrawalPage()],
  ['404/index.html',notFoundPage()],
  ['404.html',notFoundPage()]
]);
for(const [file,html] of pages){ const dest=join(out,file); await mkdir(dirname(dest),{recursive:true}); await writeFile(dest,html,'utf8'); }
await copyFile(join(root,'src/styles.css'),join(out,'assets/site.css'));
await copyFile(join(root,'src/app.js'),join(out,'assets/app.js'));
await writeFile(join(out,'.nojekyll'),'','utf8');

const redirects = {
  'ma-demarche.html':'/a-propos/',
  'journal.html':'/journal/',
  'mentions-legales.html':'/mentions-legales/',
  'film-entreprise.html':'/services/marques/',
  'video-mariage-haut-de-gamme.html':'/services/moments/',
  'realisateur-paris.html':'/a-propos/',
  'court-metrage-independant.html':'/projet/le-bol-den-face/',
  'projet/film-de-marque/index.html':'/services/marques/',
  'projet/film-institutionnel/index.html':'/services/marques/',
  'projet/direction-artistique/index.html':'/services/marques/',
  'projet/contenu-social/index.html':'/services/marques/',
  'projet/strategie-visuelle/index.html':'/services/marques/',
  'projet/mariage/index.html':'/services/moments/',
  'projet/demande-en-mariage/index.html':'/services/moments/'
};
for(const [file,target] of Object.entries(redirects)){
  const dest=join(out,file); await mkdir(dirname(dest),{recursive:true});
  await writeFile(dest,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${site.domain}${target}"><title>Redirection — Nolan Arc</title></head><body><p>Cette page a changé. <a href="${target}">Continuer vers Nolan Arc</a>.</p></body></html>`,'utf8');
}

const routes=['/','/work/','/projet/le-bol-den-face/','/services/','/services/marques/','/services/moments/','/a-propos/','/journal/','/contact/','/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${site.domain}${r}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Built ${pages.size} pages + ${Object.keys(redirects).length} legacy redirects.`);
