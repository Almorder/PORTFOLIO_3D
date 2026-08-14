import { rm, mkdir, writeFile, cp, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homePage, workPage, projectPage, servicesPage, aboutPage, journalPage, contactPage, legalPage, privacyPage, cookiesPage, cgvPage, withdrawalPage, notFoundPage } from '../templates/pages.mjs';
import { site } from '../content/site.mjs';

const root=new URL('../',import.meta.url).pathname;
const out=join(root,'dist');
await rm(out,{recursive:true,force:true});
await mkdir(join(out,'assets'),{recursive:true});
// Copy user-owned static assets (portrait, future project media, etc.) before rendering pages.
const publicDir=join(root,'public');
try{ await access(publicDir); await cp(publicDir,out,{recursive:true,force:true}); }catch{}

const pages = new Map([
  ['index.html',homePage()],
  ['work/index.html',workPage()],
  ['projet/le-bol-den-face/index.html',projectPage()],
  ['services/index.html',servicesPage()],
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
const cssSource=await readFile(join(root,'src/styles.css'),'utf8');
const jsSource=await readFile(join(root,'src/app.js'),'utf8');
const cssHash=createHash('sha256').update(cssSource).digest('hex').slice(0,10);
const jsHash=createHash('sha256').update(jsSource).digest('hex').slice(0,10);
const cssAsset=`assets/site.${cssHash}.css`;
const jsAsset=`assets/app.${jsHash}.js`;

for(const [file,rawHtml] of pages){
  const html=rawHtml.replaceAll('__SITE_CSS__',cssAsset).replaceAll('__APP_JS__',jsAsset);
  const dest=join(out,file); await mkdir(dirname(dest),{recursive:true}); await writeFile(dest,html,'utf8');
}
await writeFile(join(out,cssAsset),cssSource,'utf8');
await writeFile(join(out,jsAsset),jsSource,'utf8');
await writeFile(join(out,'.nojekyll'),'','utf8');

const redirects = {
  'ma-demarche.html':'/a-propos/',
  'journal.html':'/journal/',
  'mentions-legales.html':'/mentions-legales/',
  'film-entreprise.html':'/services/#marques',
  'video-mariage-haut-de-gamme.html':'/services/#moments',
  'realisateur-paris.html':'/a-propos/',
  'court-metrage-independant.html':'/projet/le-bol-den-face/',
  'services/marques/index.html':'/services/#marques',
  'services/moments/index.html':'/services/#moments',
  'projet/film-de-marque/index.html':'/services/#marques',
  'projet/film-institutionnel/index.html':'/services/#marques',
  'projet/direction-artistique/index.html':'/services/#marques',
  'projet/contenu-social/index.html':'/services/#marques',
  'projet/strategie-visuelle/index.html':'/services/#marques',
  'projet/mariage/index.html':'/services/#moments',
  'projet/demande-en-mariage/index.html':'/services/#moments'
};
for(const [file,target] of Object.entries(redirects)){
  const dest=join(out,file); await mkdir(dirname(dest),{recursive:true});
  const canonicalTarget=target.split('#')[0] || '/services/';
  await writeFile(dest,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${site.domain}${canonicalTarget}"><title>Redirection — Nolan Arc</title></head><body><p>Cette page a changé. <a href="${target}">Continuer vers Nolan Arc</a>.</p></body></html>`,'utf8');
}

const routes=['/','/work/','/projet/le-bol-den-face/','/services/','/a-propos/','/journal/','/contact/','/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${site.domain}${r}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`);

console.log(`Built ${pages.size} pages + ${Object.keys(redirects).length} legacy redirects. Assets: ${cssAsset}, ${jsAsset}`);
