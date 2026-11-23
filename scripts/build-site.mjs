import { rm, mkdir, writeFile, cp, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homePage, workPage, projectPage, projectPages, servicesPage, aboutPage, journalPage, contactPage, legalPage, privacyPage, cookiesPage, cgvPage, withdrawalPage, notFoundPage, adminPage } from '../templates/pages.mjs';
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
  ['admin/index.html',adminPage()],
  ['404/index.html',notFoundPage()],
  ['404.html',notFoundPage()]
]);
// Pages projet générées depuis l'admin (plusieurs médias ou réglage « page projet ») : /projet/<adresse>/.
const generated=projectPages();
for(const [file,html] of generated) if(!pages.has(file)) pages.set(file,html);
const cssSource=await readFile(join(root,'src/styles.css'),'utf8');
const jsSource=await readFile(join(root,'src/app.js'),'utf8');
const cssHash=createHash('sha256').update(cssSource).digest('hex').slice(0,10);
const jsHash=createHash('sha256').update(jsSource).digest('hex').slice(0,10);
const cssAsset=`assets/site.${cssHash}.css`;
const jsAsset=`assets/app.${jsHash}.js`;

const adminVersion=createHash('sha256').update(await readFile(join(root,'public/admin/admin.js'),'utf8')).digest('hex').slice(0,10);
const cockpitVersion=createHash('sha256').update(await readFile(join(root,'public/admin/cockpit.js'),'utf8')).digest('hex').slice(0,10);
const fileVersion=async rel=>createHash('sha256').update(await readFile(join(root,rel),'utf8')).digest('hex').slice(0,10);
const modelsVersion=await fileVersion('public/admin/doc-models.js'), msgVersion=await fileVersion('public/admin/messages.js'), adminCssVersion=await fileVersion('public/admin/admin.css'), photosVersion=await fileVersion('public/admin/photos.js'), projectsVersion=await fileVersion('public/admin/projects.js'), mediaVersion=await fileVersion('public/admin/media.js'), videosVersion=await fileVersion('public/admin/videos.js'), imagesVersion=await fileVersion('public/admin/images.js'), testiVersion=await fileVersion('public/admin/testimonials.js'), cropVersion=await fileVersion('public/admin/cropper.js'), catVersion=await fileVersion('public/admin/categories.js');
// Modèles de documents (HTML, CSS, polices) : une seule version pour tout le dossier, l'aperçu de l'admin ne garde jamais un ancien modèle en cache.
const { readdir } = await import('node:fs/promises');
const docsHash=createHash('sha256');
for(const name of (await readdir(join(root,'public/admin/docs'),{recursive:true})).sort()){ try{ docsHash.update(name).update(await readFile(join(root,'public/admin/docs',name))); }catch{} }
const docsVersion=docsHash.digest('hex').slice(0,10);
// Typographie française : un montant ou une durée ne se coupe jamais en fin de ligne (« 1 500 € », « 48 h »).
// Appliqué au seul texte visible, entre les balises ; les scripts et styles ne sont pas touchés.
function keepUnitsTogether(html){
  return html.replace(/(<(script|style)\b[\s\S]*?<\/\2>)|>([^<]+)</g,(match,block,_tag,text)=>{
    if(block) return block;
    return '>'+text
      .replace(/(\d) (\d{3})(?!\d)/g,'$1\u202f$2')
      .replace(/(\d) (€|h|min|%)(?=[\s.,;:!?)\/]|$)/g,'$1\u00a0$2')
      .replace(/€ \/ h/g,'€\u00a0/\u00a0h')+'<';
  });
}
for(const [file,rawHtml] of pages){
  const html=keepUnitsTogether(rawHtml.replaceAll('__SITE_CSS__',cssAsset).replaceAll('__APP_JS__',jsAsset).replaceAll('__ADMIN_V__',adminVersion).replaceAll('__COCKPIT_V__',cockpitVersion).replaceAll('__MODELS_V__',modelsVersion).replaceAll('__MSG_V__',msgVersion).replaceAll('__ADMINCSS_V__',adminCssVersion).replaceAll('__DOCS_V__',docsVersion).replaceAll('__PHOTOS_V__',photosVersion).replaceAll('__PROJECTS_V__',projectsVersion).replaceAll('__MEDIA_V__',mediaVersion).replaceAll('__VIDEOS_V__',videosVersion).replaceAll('__IMAGES_V__',imagesVersion).replaceAll('__TESTI_V__',testiVersion).replaceAll('__CROP_V__',cropVersion).replaceAll('__CAT_V__',catVersion));
  const dest=join(out,file); await mkdir(dirname(dest),{recursive:true}); await writeFile(dest,html,'utf8');
}
await writeFile(join(out,cssAsset),cssSource,'utf8');
await writeFile(join(out,jsAsset),jsSource,'utf8');
await writeFile(join(out,'.nojekyll'),'','utf8');
// Version en ligne, lue par l'admin après « Enregistrer et publier » (« En ligne : version n° … »).
{ const v=(await import('../content/site-images.mjs')).publishedVersion; await writeFile(join(out,'version.json'),JSON.stringify({ snapshot:v.snapshot||null, published:v.published||'', builtAt:new Date().toISOString(), commit:(process.env.GITHUB_SHA||'').slice(0,12) })+'\n'); }
// Contenu actuel du site, importable dans les brouillons du dashboard (données déjà publiques).
const { projects } = await import('../content/projects.mjs');
const { instagramPosts } = await import('../content/instagram.mjs');
const { legal } = await import('../content/legal.mjs');
const { photoDraft } = await import('../content/photos.mjs');
let imagesDraft = {};
try { imagesDraft = JSON.parse(await readFile(join(root,'content/images.published.json'),'utf8')).images || {}; } catch {}
// Vidéos publiées -> format du brouillon de l'admin (miniature envoyée, fichier vidéo).
const socialDraft = instagramPosts.map(({ image, video, ...p }) => ({ ...p, coverImage: image || null, video: video ? { id: video.id, ext: video.ext, type: video.type, width: video.width, height: video.height, duration: video.duration, bytes: 0 } : null, visible: true }));
const { testimonials: _codeTestimonials, ...siteSettings } = site;
const { testimonialsDraft: testimonials } = await import('../content/testimonials.mjs');
await writeFile(join(out,'admin/seed.json'),JSON.stringify({ projects, testimonials, instagram: socialDraft, legal, site: siteSettings, photos: photoDraft, images: imagesDraft }),'utf8');

const redirects = {
  'ma-demarche.html':'/a-propos/',
  'journal.html':'/journal/',
  'mentions-legales.html':'/mentions-legales/',
  'film-entreprise.html':'/services/#realisation',
  'video-mariage-haut-de-gamme.html':'/services/#mariage',
  'realisateur-paris.html':'/a-propos/',
  'court-metrage-independant.html':'/projet/le-bol-den-face/',
  'services/marques/index.html':'/services/#direction-artistique',
  'services/moments/index.html':'/services/#mariage',
  'projet/film-de-marque/index.html':'/services/#realisation',
  'projet/film-institutionnel/index.html':'/services/#realisation',
  'projet/direction-artistique/index.html':'/services/#direction-artistique',
  'projet/contenu-social/index.html':'/services/#strategie-de-marque',
  'projet/strategie-visuelle/index.html':'/services/#strategie-de-marque',
  'projet/mariage/index.html':'/services/#mariage',
  'projet/demande-en-mariage/index.html':'/services/#demande-en-mariage'
};
for(const [file,target] of Object.entries(redirects)){
  const dest=join(out,file); await mkdir(dirname(dest),{recursive:true});
  const canonicalTarget=target.split(/[?#]/)[0] || '/services/';
  await writeFile(dest,`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${site.domain}${canonicalTarget}"><title>Redirection | Nolan Arc</title></head><body><p>Cette page a changé. <a href="${target}">Continuer vers Nolan Arc</a>.</p></body></html>`,'utf8');
}

// Vraies redirections 301 (Cloudflare Pages lit dist/_redirects, et les suit même si un fichier existe à l'adresse).
// Chaque ancienne adresse est déclarée sous toutes ses formes (avec ou sans « / » final, avec « .html » ou « index.html ») :
// une seule redirection, directement vers la page définitive, jamais vers une autre ancienne adresse.
// Les pages HTML de secours ci-dessus restent pour GitHub Pages (copie de secours), qui ne lit pas ce fichier.
const sourcesOf = file => file.endsWith('/index.html') ? [`/${file.slice(0,-'index.html'.length)}`, `/${file.slice(0,-'/index.html'.length)}`, `/${file}`] : [`/${file}`, `/${file.replace(/\.html$/,'')}`, `/${file.replace(/\.html$/,'')}/`];
const bare = path => path.split(/[?#]/)[0].replace(/(.)\/$/,'$1');
// Une forme qui est déjà l'adresse définitive (ex. /journal/) n'est pas redirigée : jamais de boucle.
const redirectLines = Object.entries(redirects).flatMap(([file,target])=>sourcesOf(file).filter(src=>bare(src)!==bare(target)).map(src=>`${src} ${target} 301`));
await writeFile(join(out,'_redirects'),`# Anciennes adresses -> pages définitives (généré par scripts/build-site.mjs)\n${redirectLines.join('\n')}\n`);

const routes=['/','/work/','/projet/le-bol-den-face/',...generated.map(([,,path])=>path),'/services/','/a-propos/','/journal/','/contact/','/mentions-legales/','/confidentialite/','/cookies/','/cgv/','/retractation/'];
const today=new Date().toISOString().slice(0,10);
// Icône du site (onglet, résultats Google, écran d'accueil du téléphone).
await writeFile(join(out,'site.webmanifest'),JSON.stringify({name:'Nolan Arc',short_name:'Nolan Arc',start_url:'/',display:'browser',background_color:'#080706',theme_color:'#080706',icons:[{src:'/assets/icons/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/assets/icons/icon-512.png',sizes:'512x512',type:'image/png'}]})+'\n');
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${site.domain}${r}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
// Robots : tout est ouvert (moteurs et assistants IA), sauf l'espace d'administration.
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${site.domain}/sitemap.xml\n`);
// llms.txt (fiche courte) et llms-full.txt (version détaillée) : ce que les assistants IA (ChatGPT, Claude,
// Perplexity, Gemini) lisent en une fois. Générés depuis les contenus publiés, voir templates/seo.mjs.
const { llmsTxt, llmsFullTxt } = await import('../templates/seo.mjs');
const { projectLinks, catalogSummary } = await import('../templates/pages.mjs');
const llmsData = { projects: projectLinks(), catalog: catalogSummary() };
await writeFile(join(out,'llms.txt'),llmsTxt(llmsData));
await writeFile(join(out,'llms-full.txt'),llmsFullTxt(llmsData));

console.log(`Built ${pages.size} pages + ${Object.keys(redirects).length} legacy redirects. Assets: ${cssAsset}, ${jsAsset}`);
