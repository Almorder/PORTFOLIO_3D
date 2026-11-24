import { readFile as readFileRaw, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';
import { site as siteData } from '../content/site.mjs';
import { projects as projectData } from '../content/projects.mjs';

const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
const errors=[];
const fail=(message)=>errors.push(message);
const require_=f=>{ try{ return readFileSync(join(root,'public/admin',f),'utf8'); }catch{ return ''; } };
// Les espaces insécables posés au build (« 1 500 € ») se comparent comme des espaces simples.
const readFile=async(file,enc)=>{const text=await readFileRaw(file,enc);return file.toString().endsWith('.html')?text.replace(/[\u00a0\u202f]/g,' '):text;};

try{execFileSync(process.execPath,[join(root,'scripts/build.mjs')],{stdio:'inherit'});}catch{process.exit(1)}
execFileSync(process.execPath,['--check',join(root,'src/app.js')],{stdio:'inherit'});

async function walk(dir){let out=[];for(const name of await readdir(dir)){const file=join(dir,name),info=await stat(file);out=out.concat(info.isDirectory()?await walk(file):file)}return out}
const files=await walk(dist);
const existing=new Set(files.map(f=>relative(dist,f).replaceAll('\\','/')));
// Les modèles de documents de l'admin (admin/docs/) ne sont pas des pages du site : contrôles dédiés plus bas.
const htmls=files.filter(f=>f.endsWith('.html')&&!relative(dist,f).replaceAll('\\','/').startsWith('admin/docs/'));
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
  const isAdmin=rel==='admin/index.html';
  if(!isAdmin && !html.includes('class="site-header fab-header"')) fail(`${rel}: common header missing`);
  if(!isAdmin && !html.includes('class="site-footer fab-footer"')) fail(`${rel}: common footer missing`);
  // Navigation flottante : chaque page porte le fond repliable, la marque pliable et ses éléments mesurables.
  if(!isAdmin && !(html.includes('data-header data-fnb') && html.includes('data-fnb-bg') && html.includes('class="fnb-tail"') && (html.match(/data-fnb-item/g)||[]).length>=6)) fail(`${rel}: floating navbar markup incomplete`);
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
  if(!isAdmin && (!jsMatch||!existing.has(jsMatch?.[1]))) fail(`${rel}: hashed JS missing/broken`);
  if(!isAdmin) for(const href of requiredLegalLinks) if(!html.includes(`href="${href}"`)) fail(`${rel}: legal footer link missing ${href}`);
  if(/<iframe[^>]+youtube/i.test(html) && !(rel==='index.html' && html.includes('class="v16-hero__video"'))) fail(`${rel}: YouTube iframe preloaded before user action`);
  if(/animé|anime/i.test(html)) fail(`${rel}: unwanted anime wording found`);
  if(html.includes('site-footer__lead')) fail(`${rel}: obsolete oversized footer CTA found`);
}

// Privacy and operational guardrails.
if(/sessionStorage|localStorage/.test(app)) fail('app.js: browser storage detected');
if(/googletagmanager|google-analytics|gtag\(/i.test(app)) fail('app.js: analytics detected');
if(!/cloudflareinsights\.com\/beacon\.min\.js/.test(app)||!app.includes('nolanarc_audience_optout')||!app.includes('doNotTrack')) fail('Audience: Cloudflare beacon must be loaded from app.js with opt-out and DNT');
for(const [field,value] of legalRequiredFields) if(!String(value||'').trim()) fail(`legal.mjs: required ${field} empty`);
if(css.includes('var(--ember-soft;')) fail('styles.css: malformed CSS variable');
{ const bare=css.replace(/\/\*[\s\S]*?\*\//g,''); if((bare.match(/\{/g)||[]).length!==(bare.match(/\}/g)||[]).length) fail('styles.css: unbalanced braces (everything after the gap is ignored by browsers)'); if(/^(<<<<<<<|=======|>>>>>>>)/m.test(css)) fail('styles.css: merge conflict markers'); }

const home=await readFile(join(dist,'index.html'),'utf8');
if(!/1\u202f500\u00a0€/.test(await readFileRaw(join(dist,'index.html'),'utf8'))) fail('Build: prices must keep non-breaking spaces (no « 1 / 500 € » line break)');
// Lisibilité par les moteurs et assistants IA
if(!existing.has('favicon.ico')||!existing.has('assets/icons/icon-512.png')||!home.includes('rel="icon" href="/favicon.ico"')||!home.includes('rel="apple-touch-icon"')) fail('SEO: site icon (favicon) missing, Google would show a blank globe');
// Aucun tiret long ni demi-cadratin dans ce qui est publié (signal « texte généré » pour certains lecteurs et outils).
for(const file of [...existing].filter(f=>/\.(html|txt|js|css|webmanifest)$/.test(f)&&!/supabase\.js$/.test(f))){ const raw=await readFileRaw(join(dist,file),'utf8'); if(/[\u2014\u2013]/.test(raw)) fail(`${file}: contains an em/en dash (— or –)`); }
for(const file of ['llms.txt','robots.txt','sitemap.xml']) if(!existing.has(file)) fail(`SEO/IA: ${file} missing`);
{ const ld=JSON.parse((home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1]||'{}'); const types=(ld['@graph']||[]).map(x=>x['@type']);
  for(const t of ['Person','ProfessionalService','FAQPage']) if(!types.includes(t)) fail(`SEO/IA: home JSON-LD lacks ${t}`);
  const biz=(ld['@graph']||[]).find(x=>x['@type']==='ProfessionalService')||{}; if(!biz.hasOfferCatalog||!biz.areaServed||!biz.contactPoint) fail('SEO/IA: business needs offers, area served and contact point'); }
// Planche matériel : six objets rendus en 3D, servis par le site (aucune ressource externe).
const gearHtml=home.slice(home.indexOf('class="gear-photo"'),home.indexOf('brand-ecosystem__head'));
if(!gearHtml.includes('/assets/gear/desk.webp')||!/alt="[^"]{20,}"/.test(gearHtml)) fail('Home: gear photo (with a real description) expected above the gear brands');
if(/https?:\/\//.test(gearHtml)) fail('Home: gear board must not load any external resource');
for(const m of gearHtml.matchAll(/<img src="([^"]+)"/g)){
  if(!m[1].startsWith('/assets/gear/')||!existing.has(m[1].slice(1))) fail(`Home: gear visual missing or outside /assets/gear/ (${m[1]})`);
}
for(const file of ['assets/gear/desk.webp','assets/gear/desk-900.webp','assets/da/texture.webp','assets/da/texture-wide.webp']) if(!existing.has(file)) fail(`Home: visual asset missing (${file})`);
// Mariage : jamais de cadre vide en ligne ; chaque photo déclarée doit exister et être décrite.
const {weddingPhotos}=await import('../content/wedding.mjs');
if(!home.includes('class="wedding-wall')||(home.match(/class="polaroid"/g)||[]).length!==3||[...home.matchAll(/class="polaroid__photo"><img src="([^"]+)"[^>]*alt="([^"]*)"/g)].some(([,src,alt])=>!existing.has(src.slice(1))||!alt.trim())) fail('Home: wedding wall shows three polaroids, and no stand-in photo while none is provided');
for(const photo of weddingPhotos){
  if(!existing.has(String(photo.src).replace(/^\//,''))) fail(`Wedding: missing photo file ${photo.src}`);
  if(!photo.alt) fail(`Wedding: photo ${photo.src} needs an alt description`);
  if(!['mariage','demande'].includes(photo.offer)) fail(`Wedding: photo ${photo.src} needs offer 'mariage' or 'demande'`);
}
const weddingServicesHtml=await readFile(join(dist,'services/index.html'),'utf8');
if(!weddingServicesHtml.includes('id="mariage"')||!weddingServicesHtml.includes('id="demande-en-mariage"')) fail('Services: wedding anchors missing (the home polaroids link to them)');
if(/<iframe[^>]+instagram\.com|<img[^>]+(instagram|cdninstagram|fbcdn)/i.test(weddingServicesHtml)) fail('Instagram: no Instagram request allowed on Services before click');
const adminHtml=await readFile(join(dist,'admin/index.html'),'utf8');
if(!adminHtml.includes('noindex,nofollow')) fail('Admin: page must be noindex');
if(!/admin\.js\?v=[a-f0-9]{10}"/.test(adminHtml)) fail('Admin: admin.js must carry a content hash (cache)');
if(/<script[^>]+src="https?:/i.test(adminHtml)) fail('Admin: no third-party script');
if(/service_role|sb_secret_/i.test(adminHtml+await readFile(join(root,'public/admin/admin.js'),'utf8')+JSON.stringify(siteData))) fail('Admin: a secret key must never be shipped');
if((await readFile(join(dist,'sitemap.xml'),'utf8')).includes('/admin')) fail('Admin: must not be in sitemap');
// Cockpit d'activité : chargé avant admin.js, aucune injection HTML, tables réservées à l'administrateur.
{ const ck=await readFile(join(root,'public/admin/cockpit.js'),'utf8'), sql=await readFile(join(root,'supabase/cockpit_schema.sql'),'utf8');
  if(!adminHtml.includes('/admin/cockpit.js?v=')||adminHtml.indexOf('cockpit.js')>adminHtml.indexOf('admin.js?v=')||!adminHtml.includes('data-offers=')||!adminHtml.includes('data-business=')) fail('Cockpit: script or data attributes missing on /admin/');
  if(/innerHTML|insertAdjacentHTML|document\.write|eval\(/.test(ck)) fail('Cockpit: HTML injection is forbidden, use textContent');
  for(const t of ['crm_contacts','crm_deals','crm_documents','crm_events','crm_settings']) if(!sql.includes(`'${t}'`)) fail(`Cockpit: ${t} missing from the RLS loop`);
  if(!/using \(\(select public\.is_admin\(\)\)\) with check \(\(select public\.is_admin\(\)\)\)/.test(sql)||!/revoke all on public\.%I from anon, authenticated/.test(sql)) fail('Cockpit: admin-only policy missing');
  if(!sql.includes('crm_protect_invoice')) fail('Cockpit: issued invoices must not be deletable'); }
// Documents : modèles d'origine de Nolan (public/admin/docs/), décrits dans doc-models.js, aucune coordonnée bancaire ni téléphone en dur (dépôt public), stockage privé.
{ const models=await readFile(join(root,'public/admin/doc-models.js'),'utf8'), msgs=await readFile(join(root,'public/admin/messages.js'),'utf8'), dsql=await readFile(join(root,'supabase/documents_schema.sql'),'utf8');
  const order=['supabase.js','doc-models.js','messages.js','cockpit.js','media.js','photos.js','projects.js','videos.js','images.js','admin.js'].map(f=>adminHtml.indexOf(`/admin/${f}?v=`));
  if(order.some(i=>i<0)||order.some((i,k)=>k&&i<order[k-1])) fail('Admin: scripts must load in order supabase, doc-models, messages, cockpit, media, photos, projects, videos, images, admin');
  if(!adminHtml.includes('/admin/admin.css?v=')||!/data-docs="[a-f0-9]{10}"/.test(adminHtml)) fail('Admin: admin.css and the documents version must be on /admin/');
  for(const [name,src] of [['doc-models.js',models],['messages.js',msgs],['photos.js',await readFile(join(root,'public/admin/photos.js'),'utf8')],['projects.js',await readFile(join(root,'public/admin/projects.js'),'utf8')],...await Promise.all(['media.js','videos.js','images.js','testimonials.js','cropper.js'].map(async f=>[f,await readFile(join(root,'public/admin',f),'utf8')])),['admin.js',await readFile(join(root,'public/admin/admin.js'),'utf8')]]) if(/innerHTML|insertAdjacentHTML|document\.write|eval\(/.test(src)) fail(`Admin: ${name} must not inject HTML`);
  global.window={}; new Function('window',models)(window); new Function('window',msgs)(window);
  const { models:list, settingsFields }=window.NolanDocModels, { steps, messages }=window.NolanMessages;
  const docFiles=[...existing].filter(f=>/^admin\/docs\/[^/]+\.html$/.test(f));
  if(docFiles.length!==7||!existing.has('admin/docs/legal-docs.css')||!existing.has('admin/docs/fill.css')) fail('Documents: the six original models, the pro forma invoice, legal-docs.css and fill.css are expected in admin/docs/');
  for(const m of list){
    const html=await readFile(join(dist,'admin/docs',m.file),'utf8').catch(()=>'');
    if(!html) { fail(`Documents: model file missing for ${m.id}`); continue; }
    if(/FR\d{2}[\s\d]{20,}|CEPAFRPP|Caisse d.Epargne|RIBEIRO NOLAN|\+33\s?\(0\)\s?7|07[\s.]?82[\s.]?04/i.test(html)) fail(`Documents: bank details or phone hard-coded in ${m.file} (public repo)`);
    if(/<script|\son[a-z]+\s*=|javascript:/i.test(html)) fail(`Documents: ${m.file} must not contain scripts or event handlers`);
    if(!html.includes('href="legal-docs.css"')) fail(`Documents: ${m.file} must use legal-docs.css`);
    const covered=new Set([...m.sections.flatMap(sec=>[...(sec.fields||[]),...(sec.flags||[])].map(f=>f.name)),...Object.keys(settingsFields),...(m.computed||[]),...(m.lines?m.lines.slots.flatMap(sl=>sl.rows.flatMap(n=>[`Ligne${n}`,`Qte${n}`,`Prix${n}`,`Total${n}`])):[])]);
    const checks=new Set(m.sections.flatMap(sec=>(sec.checks||[]).map(c=>c.name)));
    for(const [,f] of html.matchAll(/data-field="(\w+)"/g)) if(!covered.has(f)) fail(`Documents: field ${f} of ${m.file} is not in the admin form`);
    for(const [,c] of html.matchAll(/\[\[CHK:(\w+)\]\]/g)) if(!checks.has(c)) fail(`Documents: box ${c} of ${m.file} is not in the admin form`);
    for(const [,f] of html.matchAll(/data-if(?:not)?="(\w+)"/g)) if(!covered.has(f)) fail(`Documents: condition ${f} of ${m.file} has no value`);
  }
  const facture=await readFile(join(dist,'admin/docs/facture-pro-forma.html'),'utf8');
  if(!facture.includes('Document informatif.</strong> La facture officielle est émise via Indy, plateforme agréée de facturation électronique.')||!facture.includes('TVA non applicable, art. 293 B du CGI')||!/data-if="ClientPro">[^<]*40 €/.test(facture)) fail('Documents: pro forma must state Indy, art. 293 B, and the 40 € indemnity only for professionals');
  if(messages.length<18||messages.some(m=>!m.when||!m.why||!steps.some(st=>st.id===m.step))) fail('Messages: each message needs a step, a when and a why');
  if(!/insert into storage\.buckets[\s\S]+false/.test(dsql)||(dsql.match(/bucket_id = 'documents' and \(select public\.is_admin\(\)\)/g)||[]).length<5) fail('Documents: storage bucket must stay private and admin-only');
  const v2=await readFile(join(root,'supabase/admin_v2_schema.sql'),'utf8');
  if(!/alter table public\.crm_messages enable row level security/.test(v2)||!/using \(\(select public\.is_admin\(\)\)\) with check \(\(select public\.is_admin\(\)\)\)/.test(v2)||!/revoke all on public\.crm_messages from anon, authenticated/.test(v2)) fail('Admin v2: crm_messages must be admin-only');
  if(/\bdrop table\b|\bdelete from\b|\btruncate\b/i.test(v2)) fail('Admin v2: the migration must never delete data'); }
// Photos de la page Work : espace de fichiers public en lecture, écriture et liste réservées à l'administrateur ;
// sur le site, chaque photo est servie par nolanarc.com (copiée au déploiement), décrite et aux dimensions connues.
{ const psql=await readFile(join(root,'supabase/photos_schema.sql'),'utf8');
  if(!/values \('site-photos', 'site-photos', true, \d+, array\['image\/webp'\]\)/.test(psql)) fail('Photos: site-photos bucket must be public read, WebP only, with a size limit');
  if((psql.match(/bucket_id = 'site-photos' and \(select public\.is_admin\(\)\)/g)||[]).length<5||/to (anon|public)\b/.test(psql)) fail('Photos: storage policies must be admin-only (no anon policy, no public listing)');
  if(!/content_drafts_key_check[\s\S]+'photos'/.test(psql)) fail('Photos: the photos draft key must be allowed');
  if(/\bdrop table\b|\bdelete from\b|\btruncate\b/i.test(psql)) fail('Photos: the migration must never delete data');
  const { photos:pics }=await import('../content/photos.mjs'), workHtml=await readFile(join(dist,'work/index.html'),'utf8');
  for(const ph of pics){
    for(const src of [ph.src,ph.srcSmall]) if(!/^\/assets\/photo\/site\/[a-z0-9-]+(-s)?\.webp$/.test(src||'')||!existing.has(src.slice(1))) fail(`Photos: file missing or outside the site (${src})`);
    if(!String(ph.alt||'').trim()) fail(`Photos: ${ph.src} needs an alt text`);
    if(!(ph.width&&ph.height&&ph.smallWidth&&ph.smallHeight)) fail(`Photos: ${ph.src} needs its real dimensions`);
  }
  // Catalogue : chaque photo publiée y figure (ou dans un projet), en grand au clic.
  for(const ph of pics) if(!workHtml.includes(`data-src="${ph.src}"`)&&!workHtml.includes(ph.srcSmall)) fail(`Work: published photo ${ph.src} missing from the catalogue`);
  // Vidéos et images du site : espace vidéo public en lecture, admin seulement ; fonction de mise en ligne sans secret.
  const msql=await readFile(join(root,'supabase/medias_schema.sql'),'utf8'), fn=await readFile(join(root,'supabase/functions/publish-site/index.ts'),'utf8');
  if(!/values \('site-videos', 'site-videos', true, 52428800,/.test(msql)||(msql.match(/bucket_id = 'site-videos' and \(select public\.is_admin\(\)\)/g)||[]).length<5||/to (anon|public)\b/.test(msql)||!/'photos','images'\)/.test(msql)) fail('Medias: site-videos bucket and images draft must be admin-only');
  if(!fn.includes('/rest/v1/rpc/is_admin')||!fn.includes('GITHUB_DISPATCH_TOKEN')||/gh[pousr]_[A-Za-z0-9]{20,}|github_pat_/.test(fn)) fail('Medias: publish-site must check is_admin and read its token from the Supabase secrets');
  if(!existing.has('version.json')) fail('Medias: version.json missing (the admin shows when a version is online)');
  for(const [,src] of (await readFile(join(dist,'index.html'),'utf8')).matchAll(/(?:background-image:|--bg:[^"]*?)url\('([^']+)'\)/g)) if(!existing.has(src.slice(1))) fail(`Home: replaced image missing (${src})`);
  if(/<img[^>]+supabase\.co/i.test(workHtml)) fail('Photos: visitors must never load a photo from Supabase');
  // Projets de « Ma sélection » publiés depuis l'admin : image servie par le site (seule exception, l'affiche
  // YouTube du film tant qu'elle n'est pas copiée), texte alternatif présent, aucun lecteur chargé d'avance.
  const { projects:pj }=await import('../content/projects.mjs');
  const homeHtml=await readFile(join(dist,'index.html'),'utf8'), bento=homeHtml.slice(homeHtml.indexOf('data-bento'),homeHtml.indexOf('data-fiche'));
  for(const [,src,alt] of bento.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)){
    if(!(src.startsWith('/')&&existing.has(src.slice(1)))&&src!==pj.find(p=>p.slug==='le-bol-den-face')?.poster) fail(`Home: bento image not served by the site (${src})`);
    if(!alt.trim()) fail(`Home: bento image without alt (${src})`); }
  if(/<iframe|<video/i.test(bento)) fail('Home: no player may load in the bento before a click');
  if(/fetchpriority="high"/.test(bento)) fail('Home: the bento must not compete with the banner for loading priority');
  // Catalogue : images servies par le site, texte alternatif présent, aucun lecteur chargé d'avance.
  for(const [,src,alt] of workHtml.slice(workHtml.indexOf('data-cat-grid'),workHtml.indexOf('</ul>',workHtml.indexOf('data-cat-grid'))).matchAll(/<img src="([^"]+)"[^>]*alt="([^"]*)"/g)){ if(!(src.startsWith('/')&&existing.has(src.slice(1)))&&!/^https:\/\/(img\.youtube|i\.ytimg)\.com\//.test(src)) fail(`Work: catalogue image not served by the site (${src})`); if(!alt.trim()) fail(`Work: catalogue image without alt (${src})`); }
  if(!pj.some(p=>p.slug==='le-bol-den-face')||!existing.has('projet/le-bol-den-face/index.html')) fail('Work: Le bol d’en face and its page must always exist'); }
// Sécurité : politique de contenu sur chaque page, aucun script tiers importé à la volée, actions figées.
for(const f of ['index.html','404.html','admin/index.html','contact/index.html','work/index.html']){
  const h=await readFile(join(dist,f),'utf8');
  const csp=h.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  if(!csp) fail(`Security: CSP missing on ${f}`);
  else { if(/'unsafe-eval'/.test(csp[1])||/script-src[^;]*'unsafe-inline'/.test(csp[1])) fail(`Security: CSP too permissive on ${f}`);
    if(!/object-src 'none'/.test(csp[1])||!/base-uri 'self'/.test(csp[1])||!/form-action 'self' https:\/\/formsubmit\.co/.test(csp[1])) fail(`Security: CSP directives missing on ${f}`); }
  if(h.indexOf('Content-Security-Policy')>h.indexOf('<script')&&h.includes('<script')) fail(`Security: CSP must come before any script on ${f}`);
  if(csp && !/frame-src 'self' /.test(csp[1])) fail(`Security: frame-src must allow 'self' (admin document preview) on ${f}`);
  if(csp && /frame-src[^;]*(\*|https?:(?:;|\s))/.test(csp[1])) fail(`Security: frame-src must list exact origins on ${f}`);
}
{ const js=await readFile(join(root,'src/app.js'),'utf8');
  if(/import\(\s*['"]https?:/.test(js)) fail('Security: no third-party module import from a CDN');
  const wf=(await Promise.all((await readdir(join(root,'.github/workflows'))).map(f=>readFile(join(root,'.github/workflows',f),'utf8')))).join('\n');
  for(const m of wf.matchAll(/uses:\s*([^\s#]+)/g)) if(!/@[0-9a-f]{40}$/.test(m[1])) fail(`Security: action not pinned by SHA: ${m[1]}`);
  if(!/persist-credentials:\s*false/.test(wf)) fail('Security: checkout must not persist credentials');
  const sec=await readFile(join(dist,'.well-known/security.txt'),'utf8').catch(()=>'');
  const exp=sec.match(/^Expires: (.+)$/m); if(!/^Contact: /m.test(sec)||!exp||new Date(exp[1])<new Date()) fail('Security: security.txt missing or expired'); }
// Sécurité (audit du 24/11/2026) : en-têtes HTTP, fichiers publiés, secrets, base de données, formulaire, admin.
{ // 1. En-têtes Cloudflare Pages : présents, et même politique de contenu qu'en balise meta (plus frame-ancestors).
  const hdr=await readFile(join(dist,'_headers'),'utf8').catch(()=>''), meta=(home.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)||[])[1]||'';
  for(const h of ['Strict-Transport-Security: max-age=','X-Content-Type-Options: nosniff','X-Frame-Options: SAMEORIGIN','Referrer-Policy: strict-origin-when-cross-origin','Permissions-Policy: camera=()','! Access-Control-Allow-Origin']) if(!hdr.includes(h)) fail(`Security: dist/_headers lacks « ${h} »`);
  const cspHeader=(hdr.match(/^\s+Content-Security-Policy: (.+)$/m)||[])[1]||'';
  if(!meta||cspHeader!==`${meta.replaceAll('&#039;',"'")}; frame-ancestors 'self'`) fail('Security: the CSP header (dist/_headers) must equal the meta CSP plus frame-ancestors \'self\'');
  if(/Referrer-Policy: (no-referrer|same-origin)\b/.test(hdr)) fail('Security: Referrer-Policy too strict, YouTube embeds would stop playing');
  // 2. Rien d'interne dans ce qui est publié (sources, SQL, documentation, cartes de code, secrets locaux).
  for(const f of existing) if(/(^|\/)(\.env|\.git|node_modules)(\/|$|\.)|\.(map|sql|ts|mjs|md|pem|key|log)$|(^|\/)package(-lock)?\.json$/.test(f)) fail(`Security: internal file published: ${f}`);
  // 3. Aucun secret dans le dépôt ni dans le site (jetons GitHub, clés secrètes Supabase, JWT, clés privées, deploy hooks).
  const secretRe=/\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sb_secret_[A-Za-z0-9_-]{10,}|eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|deploy_hooks\/[0-9a-f-]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}/;
  let tracked=[]; try{ tracked=execFileSync('git',['-C',root,'ls-files'],{encoding:'utf8'}).split('\n').filter(Boolean).map(f=>join(root,f)); }catch{}
  for(const f of [...tracked,...files]){ if(/\.(png|jpe?g|webp|avif|gif|ico|woff2?|mp4|mov|webm|pdf)$/i.test(f)) continue; const t=await readFileRaw(f,'utf8').catch(()=>''); if(secretRe.test(t)) fail(`Security: secret-like value in ${relative(root,f)}`); }
  // 4. Base : RLS sur chaque table, fonctions SECURITY DEFINER à search_path vide, rien d'écrivable par anon.
  const sqlFiles=(await readdir(join(root,'supabase'))).filter(f=>f.endsWith('.sql')), sql=(await Promise.all(sqlFiles.map(f=>readFile(join(root,'supabase',f),'utf8')))).join('\n').replace(/--[^\n]*/g,'');
  for(const [,t] of sql.matchAll(/create table if not exists (public\.\w+)/gi)) if(!new RegExp(`alter table ${t.replace('.','\\.')} enable row level security|'${t.split('.')[1]}'[^\\n]*\\]\\s*loop`,'i').test(sql)) fail(`Security: ${t} without row level security`);
  for(const [fn] of sql.matchAll(/create or replace function[\s\S]*?\$\$/gi)) if(/security definer/i.test(fn)&&!/set search_path = ''/i.test(fn)) fail(`Security: SECURITY DEFINER function without an empty search_path: ${fn.match(/function ([\w.]+)/)[1]}`);
  if(/grant (?!select on public\.content_snapshots to anon)[^;]*\bto anon\b|for (all|insert|update|delete) to (anon|public)\b|create (or replace )?function public\.increment_page_view/i.test(sql)) fail('Security: the database must give anon read access to published snapshots only');
  // 5. Fonction de mise en ligne : CORS limité au site, administrateur seulement.
  const fn=await readFile(join(root,'supabase/functions/publish-site/index.ts'),'utf8');
  if(!/const ORIGINS = \['https:\/\/nolanarc\.com', 'https:\/\/www\.nolanarc\.com'\]/.test(fn)||/Access-Control-Allow-Origin':\s*'\*'/.test(fn)||!/ORIGINS\.includes\(origin\) \? origin : ORIGINS\[0\]/.test(fn)) fail('Security: publish-site CORS must allow nolanarc.com only');
  // 6. Formulaire : champ piège, longueurs bornées, envoi nettoyé. Admin : aucun HTML injecté, aucun journal de débogage.
  if(!app.includes(`form.querySelector('[name="_honey"]')?.value) return;`)||!app.includes('f.maxLength=LIMITS[f.name]||200')||!app.includes(".slice(0,k==='message'?5000:500)")) fail('Security: contact form must drop bots and bound every field');
  for(const f of (await readdir(join(root,'public/admin'))).filter(f=>f.endsWith('.js')&&f!=='supabase.js')){ const t=await readFile(join(root,'public/admin',f),'utf8');
    if(/\.innerHTML\s*=|insertAdjacentHTML|outerHTML\s*=|document\.write|\beval\(|new Function\(/.test(t)) fail(`Security: admin/${f} must build the page with textContent, never with HTML strings`);
    if(/console\.(log|debug)|debugger/.test(t)) fail(`Security: admin/${f} contains debug output`); }
  if(/console\.(log|debug)|debugger/.test(app)) fail('Security: app.js contains debug output'); }
const cookiesHtml=await readFile(join(dist,'cookies/index.html'),'utf8');
// Pages légales : fiche en bref, sommaire, date à jour, vérification publique de l'entreprise.
for(const f of ['mentions-legales','confidentialite','cgv','cookies','retractation']){ const h=await readFile(join(dist,f,'index.html'),'utf8'); if(!h.includes('class="lg-brief"')||!h.includes('data-legal-toc')||!h.includes('aria-current="page"')||!/Mise à jour le \d/.test(h)) fail(`Legal: ${f} must keep its summary, table of contents and update date`); }
if(!(await readFile(join(dist,'mentions-legales/index.html'),'utf8')).includes('annuaire-entreprises.data.gouv.fr/entreprise/')) fail('Legal: public registry link missing on mentions');
if(!home.includes('nolanarc-audience-token" content="1c1cf63d191049d8acc58b62961377c6"')) fail('Audience: token meta missing on home');
if(/<script[^>]+static\.cloudflareinsights\.com/.test(home)) fail('Audience: beacon must not be hard-coded in HTML (opt-out must run first)');
if(!cookiesHtml.includes('data-audience-optout')||!cookiesHtml.includes('Cloudflare Web Analytics')) fail('Audience: cookies page must document Cloudflare and offer opt-out');
if(!cookiesHtml.includes('Vidéos Instagram')) fail('Instagram: cookies page must document the Instagram embeds');
const work=await readFile(join(dist,'work/index.html'),'utf8');
if(/<iframe[^>]+instagram\.com|<script[^>]+instagram\.com|<img[^>]+(instagram|cdninstagram|fbcdn)/i.test(work)) fail('Instagram: no Instagram request allowed in HTML before click');
// Social media videos (code ou admin) : données valides, chaque carte jouable au clic, fichiers vidéo servis par le site.
{ const { instagramPosts:posts }=await import('../content/instagram.mjs');
  if(!posts.length) fail('Social: at least one video expected on Work');
  for(const p of posts){
    if(!String(p.title||'').trim()) fail('Social: each video needs a title');
    if(p.source==='file'){ if(!/^\/assets\/video\/site\/[a-z0-9-]+\.(mp4|mov|webm)$/.test(p.video?.src||'')||!existing.has(p.video.src.slice(1))||!home.includes(`data-video-src="${p.video.src}"`)||!work.includes(`data-src="${p.video.src}"`)) fail(`Social: video file missing for ${p.title}`); }
    else if(!/^[\w-]{5,40}$/.test(p.id||'')||!home.includes(`data-post-id="${p.id}"`)||!work.includes(`data-post-id="${p.id}"`)) fail(`Social: Instagram card invalid for ${p.title} (phone on Home, catalogue on Work)`);
    if(p.image&&!existing.has(String(p.image.srcSmall||'').slice(1))) fail(`Social: thumbnail missing for ${p.title}`);
  }
  if((home.match(/class="ig-card ps-card"/g)||[]).length!==posts.length*2) fail('Social: the phone shows each video twice (loop)');
  if(/<video[^>]+src=/i.test(work+home)) fail('Social: no video element before the visitor clicks'); }
// Accueil : le travail réel d'abord (sélection, puis vidéos sociales).
if(!(home.indexOf('data-bento')>0&&home.indexOf('data-bento')<home.indexOf('class="ig-section'))) fail('Home: projects bento must come before the social videos');
if(!existing.has('assets/work/phone.webp')||!existing.has('assets/work/stage.webp')) fail('Work: phone rendered assets expected');
if(!app.includes('instagram.com/p/${id}/embed/')) fail('Instagram: embed must be created from app.js on click');
const project=await readFile(join(dist,'projet/le-bol-den-face/index.html'),'utf8');
const services=await readFile(join(dist,'services/index.html'),'utf8');
const about=await readFile(join(dist,'a-propos/index.html'),'utf8');
const journal=await readFile(join(dist,'journal/index.html'),'utf8');
const contact=await readFile(join(dist,'contact/index.html'),'utf8');
const privacy=await readFile(join(dist,'confidentialite/index.html'),'utf8');

// V17 HOME — locked order / product logic.
for(const token of ['class="v16-hero"','id="work-preview"','class="v16-proof"','class="dims"','class="ring-section"','data-hero-stack','class="brand-ecosystem v16-ecosystem','data-price-proof','class="v16-testimonials"','id="faq-home"','id="quick-contact"']) if(!home.includes(token)) fail(`Home V17: missing ${token}`);
if(home.includes('fab-clients')||/Collaborations documentées/i.test(home)) fail('Home V17: old collaborations strip must be removed');
if((home.match(/data-stat-card/g)||[]).length!==4) fail('Home V17: exactly four stats expected');
for(const token of ['50','2022','photo + vidéo','marques accompagnées']) if(!home.includes(token)) fail(`Home V17: proof stat/context missing ${token}`);
if(/105\s?%/.test(home)) fail('Home: the +105 % claim must stay hidden until a proof is documented');
if((home.match(/<a class="folder /g)||[]).length!==3||(home.match(/class="folder__tab"/g)||[]).length!==3) fail('Home: three folder cards expected for the dimensions');
for(const label of ['Réalisation','Direction artistique','Stratégie de marque']) if(!home.includes(label)) fail(`Home V17: professional dimension missing ${label}`);
if(/images\.unsplash\.com/.test((home.split('id="dimensions"')[1]||'').split('class="brand-ecosystem')[0])) fail('Home: no stock image in dimensions / method sections (R1)');
if((home.match(/data-ring-arc=/g)||[]).length!==3||(home.match(/data-ring-step=/g)||[]).length!==3||(home.match(/data-ring-panel=/g)||[]).length!==3||!css.includes('.no-js .ring__panel{')) fail('Home: method ring needs three arcs, three buttons and three panels, readable without JS');
if((home.match(/class="ring__get"/g)||[]).length!==3) fail('Home: each method step says what the client gets');
if(!home.includes('class="v16-quick-contact final-cta"')||!home.includes('Envoyer le message')||!home.includes('class="hero-copy"')||/v16-hero__actions|data-hero-video-toggle/.test(home)) fail('Home: hero stays bare (no buttons over the video) and the final CTA keeps its form');
for(const brand of ['Sony','Sigma','Adobe','NiSi','SmallRig','PGYTECH']) if(!home.includes(`Logo ${brand}`) && !home.includes(`>${brand}<`)) fail(`Home V17: ecosystem missing ${brand}`);
if((home.match(/class="v16-logo-card/g)||[]).length!==6) fail('Home V17: six ecosystem cards expected');
for(const price of ['1 500 €','250 €','200 €','89 € / h','Accompagnement sur devis','Sur devis']) if(!home.includes(price)) fail(`Home: pricing missing ${price}`);
if(home.includes('Session ciblée —')) fail('Home: « Session ciblée » without dash');
if((home.match(/data-price-card/g)||[]).length!==6||!home.includes('data-price-arena')||!home.includes('data-price-grid')||!/href="\/contact\/\?intent=\w+&amp;offre=\w+"/.test(home)||/home-pricing__backdrop/.test(home)) fail('Home: six floating pricing cards on the grid, each linking to a prefilled contact form');
// Tarifs : six cartes à jouer (recto propre à l'offre avec son index de coin, dos commun), chacune piochable au clavier,
// prix dans le nom accessible du bouton, CTA prérempli vers Contact ; pioche, rangement, mise en veille, mouvement réduit.
{
  const { pricing:offers, pricingHref:hrefOf }=await import('../content/pricing.mjs');
  const items=home.split('data-price-card data-key="').slice(1);
  if(items.length!==offers.length) fail('Home: one playing card per offer');
  for(const o of offers){
    const li=items.find(x=>x.startsWith(`${o.key}"`))||'';
    const label=(li.match(/data-price-draw hidden aria-label="([^"]+)"/)||[])[1]||'';
    if(!li||!label.includes(o.title)||!/€|devis/i.test(label)) fail(`Home: card « ${o.key} » needs a hidden draw button named with its title and price`);
    if(!li.includes(`href="${hrefOf(o).replace(/&/g,'&amp;')}"`)) fail(`Home: card « ${o.key} » CTA must link to ${hrefOf(o)}`);
    if(!/class="price-card__face price-card__face--back" aria-hidden="true"/.test(li)) fail(`Home: card « ${o.key} » needs its back face`);
    // Carte lisible d'un coup d'œil : titre, prix, CTA court ; la description reste pour les lecteurs d'écran.
    const band=li.slice(li.indexOf('class="price-card__label"'),li.indexOf('class="price-card__more"'));
    if(!li.includes(`<h3>${o.title}</h3>`)||band.includes(o.text)||o.cta.length>18||!li.slice(li.indexOf('class="price-card__more"')).includes(o.text)) fail(`Home: card « ${o.key} » shows title, price and a short CTA; its description stays screen-reader only`);
    const art=(li.match(/class="price-card__art" src="([^"]+)"/)||[])[1]||'';
    if(!art||!existing.has(art.replace(/^\//,''))) fail(`Home: card « ${o.key} » art missing (${art})`);
  }
  if(!existing.has('assets/cards/dos.webp')) fail('Home: card back image missing');
  const block=app.slice(app.indexOf("$$('[data-price-proof]').forEach"),app.indexOf("// Work, « Social media videos »"));
  for(const token of ['if(reduced) return;','[data-price-draw]','[data-price-stow]','[data-price-deal]','is-down','if(active) raf=requestAnimationFrame(step)','Math.exp(-k*dt)']) if(!block.includes(token)) fail(`Home: pricing cards script lacks ${token}`);
  if(/priceFloat/.test(await readFile(join(root,'src/styles.css'),'utf8'))) fail('Home: pricing cards must not run an idle CSS animation');
  const adminImages=await readFile(join(root,'public/admin/images.js'),'utf8'), slotsSrc=await readFile(join(root,'tools/fetch-published.mjs'),'utf8');
  for(const key of [...offers.map(o=>o.key),'dos']) if(!adminImages.includes(`'home.cards.${key}'`)||!slotsSrc.includes(`'home.cards.${key}'`)) fail(`Admin: card image slot home.cards.${key} missing`);
}
if(!app.includes('data-offer-input')||!(await readFile(join(dist,'contact/index.html'),'utf8')).includes('data-offers=')) fail('Contact: offers data and prefill handler expected');
if(app.indexOf('const showcaseState=new WeakMap();')<0||app.indexOf('const showcaseState=new WeakMap();')>app.indexOf('updateScroll();')) fail('Home V18: showcase state must exist before initial scroll choreography runs');
if(!app.includes("$$('[data-price-proof]').forEach")||!app.includes("$$('[data-faq-section]').forEach")) fail('Home: pricing/FAQ interaction handlers missing');
if(!home.includes('data-morph-list')||(home.match(/data-morph-open=/g)||[]).length!==(home.match(/<dialog class="morph-panel"/g)||[]).length||!(home.match(/data-morph-open=/g)||[]).length) fail('Home: each testimonial row needs its panel (morphing list)');
if(!app.includes("bento.addEventListener('dblclick'")) fail('Work: double click on a bento tile must open the project');
if(/page-view-counter|data-page-view|>vues</.test(home+work+project)) fail('Projects: no public view counter');
if(!home.includes('/assets/pgytech-logo.png')||!existing.has('assets/pgytech-logo.png')) fail('Home V19: local PGYTECH logo asset missing');
if(!home.includes('is-sony')||!css.includes('.v16-logo-card.is-sony img{max-width:50%')) fail('Home V19: Sony optical size correction missing');
// Avis : ceux du code ou ceux publiés depuis l'admin. On vérifie leur validité, pas leur texte.
{ const { testimonials:tms }=await import('../content/testimonials.mjs');
  if(!tms.length) fail('Testimonials: at least one testimonial is required');
  for(const t of tms){ if(!String(t.quote||'').trim()||!String(t.name||'').trim()) fail('Testimonials: each testimonial needs a quote and a name'); if(/[\u2014\u2013]/.test(t.quote+t.name+(t.role||''))) fail('Testimonials: no long dash'); if(t.image&&(!/^\/assets\/photo\/site\/[a-z0-9-]+-s\.webp$/.test(t.image.srcSmall||'')||!String(t.alt||'').trim())) fail('Testimonials: images must be uploaded from the admin, with an alt text'); if(t.link&&!/^(\/(?!\/)|https:\/\/)/.test(t.link)) fail('Testimonials: link must be a site page or https'); }
  for(const t of tms) if(!home.includes(`>${t.name.replace(/&/g,'&amp;')}<`)) fail(`Home: testimonial of ${t.name} missing`);
  if(/"@type":"(Review|AggregateRating)"/.test(home)) fail('Testimonials: no self-served Review/AggregateRating markup (Google rules)'); }
const heroFile=home.includes('data-hero-file');
if(heroFile ? !/<video class="v16-hero__file" data-hero-file autoplay muted loop playsinline/.test(home) : (!home.includes('data-hero-video')||home.includes('<iframe class="v16-hero__video"'))) fail('Home: hero video must be a muted self-hosted loop, or the consent-gated YouTube facade');
if(!app.includes("requestIdleCallback")||!app.includes("heroVideo.dataset.videoMounted")) fail('Home V19: stability/lazy-media guards missing');
if(!app.includes("panel.showModal()")||!app.includes("panel.addEventListener('cancel'")) fail('Home: testimonial panel must open as a modal dialog and close with Escape');
if(!home.includes('/assets/og-home.png')||!existing.has('assets/og-home.png')) fail('Home V20: local OG image missing');
if(!home.includes('class="hero-roles"')||home.includes('v20-hero__line')) fail('Home: hero keeps one sober line (the three roles), no slogan over the video');
if(/\.focus-text\.is-live\{height:calc\((?!100svh)/.test(css)) fail('Focus text: the live section must stay taller than the screen (100svh + words), or scrolling cannot move the frame');
if(!home.includes('data-focus-text')||!/<p class="focus-text__line">(<span data-ft-word>[^<]+<\/span> ?){6,}<\/p>/.test(home)||!css.includes('.focus-text.is-live .focus-text__line span{')) fail('Home: focus text must stay readable without JS (blur only once live)');
if(!components.includes('data-cookie-settings')||!components.includes('data-cookie-consent')) fail('V20 privacy: consent UI missing');
if(/if\(!readConsent\(\)\)\s*showConsent\(\)/.test(app)) fail('Home: the video consent must not open by itself (it covered the hero buttons and the mobile dock)');
if(!heroFile&&!home.includes('data-cookie-settings')) fail('Home: video consent must stay reachable (footer « Préférences vidéo ») while the hero uses YouTube');
if(home.includes('data-src-wide=')&&/youtube/i.test(home.slice(home.indexOf('class="v16-hero"'),home.indexOf('class="hero-copy"')))) fail('Home: self-hosted hero must not call YouTube');
// Bannière hébergée (admin) : fichiers présents, affiche prioritaire (LCP), aucune vidéo chargée avant le script.
if(heroFile){ const hero=home.slice(home.indexOf('class="v16-hero"'),home.indexOf('class="hero-copy"'));
  for(const [,src] of hero.matchAll(/data-src-(?:wide|narrow)="([^"]+)"/g)) if(!existing.has(src.slice(1))) fail(`Home: banner video missing (${src})`);
  if(!/data-hero-file[^>]*preload="none"/.test(hero)||/<video[^>]+\ssrc=/.test(hero)||!/class="v16-hero__poster" src="\/assets\/photo\/site\/[^"]+" [^>]*fetchpriority="high"/.test(hero)) fail('Home: banner poster first (fetchpriority), video loaded by the script only'); }
if(!(app.includes("classList.toggle('is-docked'") && app.includes('is-measuring-dock') && css.includes('.is-docked .fnb-bg{') && css.includes('.no-js .fnb-bg{'))) fail('Floating navbar: dock logic, pill style or no-JS fallback missing');
if(/\bgsap\b|ScrollTrigger/.test(app)) fail('app.js: no animation library dependency (constitution)');
if(/\.page-(contact|legal) \.site-header:not\(\.is-scrolled\)/.test(await readFile(join(root,'src/styles.css'),'utf8'))) fail('Header: no light variant per page (it made the navigation unreadable)');
if(/<b data-counter data-counter-target="(19|20)\d\d"/.test(home)) fail('Home: a year must not be animated as a counter');
if(!app.includes("readConsent()!=='accepted'")||!app.includes("Max-Age=15552000")||!app.includes('unmountHeroVideo')) fail('V20 privacy/performance: consent-gated hero engine missing');
if(!components.includes('role="region"')||!components.includes('aria-labelledby="${esc(id)}-question-${i}"')) fail('V20 a11y: FAQ region relationships missing');
if(!home.includes('data-contact-form')||!home.includes('Message rapide | nolanarc.com')) fail('Home V17: quick contact form missing');

// Navigation hierarchy: Journal footer-only.
const headerChunk=home.slice(home.indexOf('<header'),home.indexOf('</header>')+9);
if(/Journal/.test(headerChunk)) fail('Navigation V17: Journal must not be in main header');
if(!home.includes('href="/journal/">Journal</a>')) fail('Navigation V17: Journal must remain in footer');

// WORK — exploration first, projects, compact 3-hat selector.
if(work.includes('data-video-slide-show')||/images\.unsplash\.com/.test(work.split('<main')[1]||'')) fail('Work: stock mood carousel must not come back (R1: real work only)');
if((home.match(/data-bento-tile/g)||[]).length<5||(home.match(/data-bento-tile/g)||[]).length!==(home.match(/data-bento-focus/g)||[]).length||!home.includes('view-transition-name:bento-4')) fail('Home: bento expects five tiles, each focusable');
{ const { instagramPosts:posts }=await import('../content/instagram.mjs'), igCount=posts.filter(p=>p.source!=='file').length;
  if((home.match(/data-stack-card=/g)||[]).length!==posts.length*2||(home.match(/data-stack-dot=/g)||[]).length!==posts.length||!home.includes('phone-stack__frame')||(home.match(/class="ig-card__link"/g)||[]).length<igCount*2||!app.includes("$$('[data-phone-stack]').forEach")) fail('Home: one phone with every social video sliding inside, each Instagram video keeping its link'); }
if(!home.includes('v16-testimonial-bento')||!home.includes('is-featured')||!home.includes('class="v16-stars"')) fail('Home: testimonials keep their original card layout');
if(/Ouverture|Le repas|Les indices|Le silence|La résolution/.test(work)) fail('Work V17: Bol slideshow labels must not remain');
if(project.includes('data-video-slide-show')) fail('Project V17: Video Slide Show must not live in project page');
if(!app.includes('drag.velocity')||!app.includes('projected=state.delta+state.velocity*240')||!app.includes('steps=clamp(steps,-3,3)')) fail('Work V17: velocity/inertia slideshow engine missing');
if(!app.includes('[data-gradient-motion]')||!app.includes("getContext('webgl'")||!css.includes('.gradient-motion-bg.has-mesh i')) fail('Mesh gradient: WebGL layer with CSS fallback expected');
// Accueil (parcours 23/11) : les réalisations tout de suite sous la bannière, catalogue à portée de clic.
if(!home.includes('id="selection"')||!/class="home-catalog[\s"][\s\S]*?href="\/work\/"/.test(home)) fail('Home: selection and a visible link to the Work catalogue expected right under the banner');
{ const at=t=>home.indexOf(t), order=['class="v16-hero"','id="work-preview"','class="wedding-wall','data-focus-text','class="dims"','data-price-proof','class="ring-section"','class="v16-testimonials"','id="faq-home"','id="quick-contact"'];
  for(let i=1;i<order.length;i++) if(at(order[i-1])<0||at(order[i])<at(order[i-1])) fail(`Home: section order broken (${order[i-1]} must come before ${order[i]})`);
  const between=home.slice(at('class="v16-testimonials"'),home.lastIndexOf('<section',at('id="faq-home"'))); if(/<section\b/.test(between.slice(between.indexOf('</section>')+10))) fail('Home: testimonials must sit right above the FAQ');
  if(/v16-hero__veil|gradient-motion-bg/.test(home.slice(at('class="v16-hero"'),at('class="hero-copy"')))) fail('Home: banner must show the video as shot (no veil, no colour layer)');
  for(const a of home.matchAll(/<a class="polaroid" href="([^"]+)"/g)) if(a[1]!=='/work/?categorie=mariage') fail('Home: wedding photos must open the Work catalogue filtered on Mariage'); }
// Média réel : image du code (card.image), image envoyée depuis l'admin (copiée dans le site) ou vidéo YouTube / Instagram
// (la page n'affiche ces projets qu'avec une image servie par le site, voir templates/pages.mjs).
const realMedia=p=>(p.card&&p.card.image&&!/unsplash|temporaire/i.test(p.card.image+' '+(p.card.alt||'')))||(p.image&&existing.has(String(p.image.srcSmall||'').slice(1)))||/^[\w-]{11}$/.test(p.videoId||'')||(p.mediaKind==='instagram'&&p.instagramId&&p.image);
for(const p of (await import('../content/projects.mjs')).projects){ if(p.visible&&p.slug!=='le-bol-den-face'&&!realMedia(p)) fail(`Projet « ${p.title} » visible sans média réel (R1) : mettre card.image réel ou visible:false`); }
for(const file of htmls){ if(/Illustration temporaire/i.test(await readFile(file,'utf8'))) fail(`Placeholder « Illustration temporaire » visible (${relative(dist,file)}) — R1`); }
// WORK V2 : « Ma sélection » (grille par défaut, liste filtrable), fiche, avis de l'accueil, accès direct au contact.
if(!home.includes('data-fiche')||!app.includes("$$('[data-work-views]').forEach")||!app.includes("'bento:focus'")||!app.includes('[data-stack-goto]')) fail('Home: project sheet, sheet sync and phone targeting handlers expected');
if(home.indexOf('id="social"')<home.indexOf('id="selection"')||home.indexOf('id="social"')>home.indexOf('class="wedding-wall')) fail('Home: social videos must sit right under « Ma sélection »');
// WORK = catalogue (23/11) : filtres en haut (liens partageables), catégories multiples, tarifs sous le catalogue.
{ const { KEYS }=globalThis.NolanCategories||(await import('../public/admin/categories.js'),globalThis.NolanCategories);
  if(!work.includes('data-catalog')||!/<div class="cat-filters" role="group"[^>]*><a href="\/work\/" role="button" data-cat-filter="" aria-pressed="true">Tous/.test(work)) fail('Work: catalogue with « Tous » pressed by default expected (toggle buttons, aria-pressed)');
  for(const k of KEYS) if(!work.includes(`href="/work/?categorie=${k}" role="button" data-cat-filter="${k}" aria-pressed="false"`)&&!work.includes(`data-cat-filter-empty="${k}"`)) fail(`Work: filter ${k} missing`);
  // Aperçus au format réel du média (plus de 4:5 imposé) : chaque carte déclare son ratio.
  if((work.match(/class="cat-card__media[^"]*" style="aspect-ratio:\d+\/\d+"/g)||[]).length!==(work.match(/<li class="cat-item[ "]/g)||[]).length) fail('Work: every catalogue preview needs its real aspect ratio');
  if(!app.includes("split(',')")||!app.includes('gridRowEnd')) fail('Work: multiple filters (?categorie=a,b) and masonry packing expected');
  if(work.indexOf('data-cat-grid')>work.indexOf('data-price-proof')||work.indexOf('data-cat-filter')>work.indexOf('data-cat-grid')) fail('Work: filters first, then the catalogue, then the pricing');
  if(!app.includes("history.pushState(null,''")||!app.includes("addEventListener('popstate'")||!app.includes("get('categorie')")) fail('Work: filter must live in the URL (reload, back/forward, share)');
  const { instagramPosts:posts }=await import('../content/instagram.mjs'), items=(work.match(/<li class="cat-item[ "]/g)||[]).length;
  if(items<posts.length+projectData.filter(p=>p.visible&&p.slug==='le-bol-den-face').length) fail('Work: every social video and every visible project belongs to the catalogue');
  for(const m of work.matchAll(/data-cats="([^"]*)"/g)) if(m[1]&&m[1].split(' ').some(k=>!KEYS.includes(k))) fail(`Work: unknown category ${m[1]}`);
  const price=h=>{ const i=h.indexOf('<section class="price-proof"'); return h.slice(i,h.indexOf('</section>',h.indexOf('data-price-details',i))).replace(/<header class="price-proof__head[\s\S]*?<\/header>/,''); };
  if(price(home)!==price(work)) fail('Work: pricing must be the same component and data as Home');
  const { pricing:offersList }=await import('../content/pricing.mjs');
  for(const o of offersList) if(!home.includes(`data-price-detail="${o.key}"`)) fail(`Pricing: « Ce qui est inclus » missing for ${o.key}`);
  if(!home.includes('Acompte de 40 %')||!home.includes('href="/cgv/">Conditions générales de vente')) fail('Pricing: common conditions (deposit, CGV) expected under the offers'); }
{ const sel=home.slice(home.indexOf('id="selection"'),home.indexOf('id="social"')); const shown=new Set(projectData.filter(p=>p.visible).map(p=>p.title)); const series=new Set((await import('../content/photos.mjs')).photos.map(x=>x.series)); for(const p of projectData.filter(p=>!p.visible&&!shown.has(p.title)&&!series.has(p.title))) if(sel.includes(`>${p.title}<`)||sel.includes(`"${p.title}"`)) fail(`Work V2: hidden project « ${p.title} » must not appear in the selection (R1)`); }
if(/data-expertise-switcher/.test(work)) fail('Work V2: the three-hat switcher moved out (it stays on Services)');
{ const { tilePhotos:tiles }=await import('../content/photos.mjs'); if(!tiles.length&&/data-title="Photographie"/.test(home)) fail('Home: photography tile appears only with real photos (R1)'); if(tiles.length&&!/data-title="Photographie"/.test(home)) fail('Home: photos checked for the tile must show the Photographie tile'); }
if(work.includes('data-stacked-flow')) fail('Work V17: obsolete stacked collaboration component should not render');

// PROJECT — film first, one compact technical grid.
if(!project.includes('id="film"')||!project.includes('data-ambient-player')||!project.includes('data-load-video')||project.includes('data-hold-confirm')) fail('Project: film-first player, one single click to play (no press-and-hold)');
if((project.match(/class="project-meta-list"/g)||[]).length!==1) fail('Project V17: project metadata must appear once');
if(/Détails de production|La fiche technique/i.test(project)) fail('Project V17: duplicate production-detail section found');

// SERVICES — one compact switcher, deeper value, combined expertise, dedicated FAQ.
if(!services.includes('data-expertise-switcher')||(services.match(/data-expertise-tab=/g)||[]).length!==3||(services.match(/data-expertise-panel=/g)||[]).length!==3) fail('Services V17: three-expertise switcher incomplete');
if(!services.includes('v16-combined-expertise')) fail('Services V17: combined-expertise value section missing');
if(!services.includes('id="faq-services"')||!services.includes('data-faq-section')) fail('Services V17: dedicated FAQ missing');
for(const q of ['Pouvez-vous prendre en charge toute la production vidéo ?','Une direction artistique peut-elle être commandée sans réalisation vidéo ?','Que contient une session ciblée de stratégie à 89 € / h ?']) if(!services.includes(q)) fail(`Services V17: FAQ question missing ${q}`);
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
// CONTACT V2 — quatre portes d'entrée, formulaire en trois étapes, confirmation accessible.
if(!contact.includes('data-copy-email=')||!contact.includes(`href="mailto:${siteData.email}?subject=`)) fail('Contact V2: email channel must copy the address and open mail with a subject');
if(!/href="https:\/\/ig\.me\/m\/[\w.]+"[^>]*data-copy-ig=/.test(contact)) fail('Contact V2: Instagram channel must open ig.me and copy the opening message');
if(!contact.includes(`href="${siteData.calendly}"`)) fail('Contact V2: Calendly channel missing');
if((contact.match(/class="cx-step/g)||[]).length!==3) fail('Contact V2: the form keeps three targeted steps');
for(const page of [contact,home]) if(!page.includes('data-contact-dialog')||!/role="dialog" aria-modal="true"/.test(page)||!page.includes('48 h')) fail('Contact V2: confirmation dialog (role, aria-modal, 48 h) missing');
if(!app.includes("e.key==='Escape'){e.preventDefault();close()")||!app.includes('role="alert"')) fail('Contact V2: dialog must close on Escape and failures must be announced');


// Vie privée : aucun numéro de téléphone ni adresse postale française dans ce qui est publié ou dans les contenus
// du dépôt (public), sauf les coordonnées professionnelles validées (content/legal.mjs). Contrôle générique : le
// dépôt ne contient jamais la donnée qu'il protège.
{ const { legal:legalData }=await import('../content/legal.mjs');
  const norm=t=>String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
  const digits=t=>norm(t).replace(/^\s*\+33\s*(\(0\)\s*)?/,'0').replace(/\D/g,'');
  const okPhone=digits(legalData.professionalPhone), okAddress=norm(legalData.professionalAddress);
  const phoneRe=/(?:\+33\s*(?:\(0\)\s*)?|\b0)[1-9](?:[\s.\-  ]?\d{2}){4}\b/g;
  const streetRe=/\b\d{1,4}(?:\s?(?:bis|ter))?,?\s+(?:rue|allee|avenue|boulevard|impasse|chemin|quai|place|square|route|cours|passage|villa|residence|sentier)\s+[a-z][a-z' -]{2,}/g;
  const sources=files.filter(f=>/\.(html|js|json|txt|css|xml|webmanifest)$/.test(f)).map(f=>[relative(dist,f),f]);
  for(const dir of ['content','templates','src','public']) for(const f of await walk(join(root,dir))) if(/\.(mjs|js|html|css|json|txt)$/.test(f)) sources.push([relative(root,f),f]);
  for(const [rel,f] of sources){ if(/(^|\/)supabase\.js$/.test(rel)) continue; const t=norm(await readFileRaw(f,'utf8'));
    for(const m of t.match(phoneRe)||[]) if(!okPhone||digits(m)!==okPhone) { fail(`Privacy: phone number in ${rel}`); break; }
    for(const m of t.match(streetRe)||[]) if(!okAddress||!okAddress.includes(m.trim())) { fail(`Privacy: street address in ${rel}`); break; } } }

// Component engines and design system.
if(!app.includes('easeOutExpo')||!app.includes('IntersectionObserver')) fail('Animated Stats Pro: scroll/count engine missing');
for(const style of ['blur','slide','fade','scale']) if(!css.includes(`stat-style--${style}`)) fail(`Animated Stats Pro: ${style} mode missing`);
if(app.includes('MeshPhysicalMaterial')) fail('Glass Showcase: WebGL engine must stay removed (no CDN library)');
if(!components.includes('data-custom-cursor')||!css.includes('.custom-cursor.is-interactive')) fail('Custom cursor missing');
if(components.includes('mobile-tabs')||css.includes('.mobile-tabs')) fail('Mobile bottom dock was removed on purpose (it repeated the menu)');
if(!css.includes('.line-toc{position:fixed')||!css.includes('left:14px')||!app.includes('scheduleClose(1900)')) fail('Line TOC: left hover/reclose behavior missing');
for(const token of ['--ink:#080706','--paper:#f0ebe2','--ember:#cc460c',"--serif:'Yrsa'", "--ui:'Syne'", "--body:'DM Sans'"]) if(!css.includes(token)) fail(`Nolan Arc DA token missing: ${token}`);
if(!css.includes('V17: ')) fail('V17 integration CSS block missing');
if(!css.includes('content-visibility:auto')) fail('V16 performance: offscreen rendering guard missing');
if(!app.includes("link.rel='prefetch'")) fail('V16 performance: internal route prefetch missing');

// Form wiring and external-content restraint.
for(const page of [home,contact]) if(!page.includes('https://formsubmit.co/ajax/')||!page.includes('name="_honey"')||!page.includes('href="/confidentialite/"')) fail('Forms V17: FormSubmit/privacy guard incomplete');

// Données structurées et aperçus de lien : JSON-LD valide, sans email en clair, jamais de photo de stock comme image de partage.
for(const file of htmls){
  const html=await readFile(file,'utf8'),label=relative(dist,file);
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){
    try{JSON.parse(m[1])}catch{fail(`JSON-LD invalide : ${label}`);continue}
    if(m[1].includes('mailto:')||m[1].includes(siteData.email)) fail(`JSON-LD : email publié en clair (${label})`);
  }
  const og=html.match(/property="og:image" content="([^"]+)"/)?.[1];
  if(og&&/images\.unsplash\.com/.test(og)) fail(`Image de partage = photo de stock (${label}) : utiliser un visuel Nolan Arc`);
}

// SEO et IA : sitemap lisible par la Search Console, entité « Nolan Ribeiro » reliée, fiches IA à jour.
{ const domain=siteData.domain, sitemap=await readFile(join(dist,'sitemap.xml'),'utf8'), robots=await readFile(join(dist,'robots.txt'),'utf8');
  if(!/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(sitemap)||!sitemap.trim().endsWith('</urlset>')||(sitemap.match(/<url>/g)||[]).length!==(sitemap.match(/<\/url>/g)||[]).length) fail('Sitemap: XML header, namespace or <url> blocks malformed');
  const locs=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)].map(m=>m[1]);
  if(!locs.length||locs.length!==(sitemap.match(/<loc>/g)||[]).length) fail('Sitemap: every <url> needs one absolute <loc> and a YYYY-MM-DD <lastmod>');
  const indexable=[];
  for(const file of htmls){ const rel=relative(dist,file).replaceAll('\\','/'), h=await readFile(file,'utf8');
    if(h.includes('http-equiv="refresh"')||/<meta name="robots" content="[^"]*noindex/.test(h)) continue;
    indexable.push(rel);
    const canon=h.match(/<link rel="canonical" href="([^"]+)">/)?.[1]; if(!canon) fail(`SEO: ${rel} is indexable but has no canonical`);
    else if(!locs.includes(canon)) fail(`Sitemap: indexable page ${rel} (${canon}) is not listed`); }
  for(const loc of locs){ if(!loc.startsWith(`${domain}/`)||/[?#\s&]/.test(loc)) { fail(`Sitemap: ${loc} must be an absolute https URL on ${domain}, without query or anchor`); continue; }
    const target=loc.slice(domain.length+1).replace(/(^|\/)$/,'$1index.html');
    if(!indexable.includes(target)) fail(`Sitemap: ${loc} does not point to an indexable page`); }
  for(const f of ['404.html','404/index.html']){ const h=await readFile(join(dist,f),'utf8'); if(!h.includes('<meta name="robots" content="noindex">')||h.includes('rel="canonical"')) fail(`SEO: ${f} must be noindex without canonical (soft 404)`); }
  if(!robots.split('\n').includes(`Sitemap: ${domain}/sitemap.xml`)) fail('robots.txt: absolute Sitemap line missing');
  if(/^Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt: the site must stay open to search engines and AI assistants');
  // Entité : une seule personne, ses comptes réels (content/site.mjs), la marque reliée par founder.
  const graph=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const person=graph.find(x=>x['@type']==='Person')||{}, biz=graph.find(x=>x['@type']==='ProfessionalService')||{};
  if(person.name!==siteData.legalName||!(person.alternateName||[]).includes(siteData.name)||!/vidéaste/i.test(person.jobTitle||'')||person['@id']!==biz.founder?.['@id']) fail('SEO/IA: Person Nolan Ribeiro must carry alternateName Nolan Arc, a jobTitle with vidéaste, and be the founder of the business');
  const profiles=[siteData.instagram,siteData.youtube].filter(Boolean);
  if(!profiles.length||(person.sameAs||[]).some(u=>!profiles.includes(u))||(biz.sameAs||[]).some(u=>!profiles.includes(u))) fail('SEO/IA: sameAs may only list the accounts published in content/site.mjs');
  if(person.address||biz.address) fail('SEO/IA: no postal address in JSON-LD while legal.publicLegalContactsConfirmed is false');
  const { pricing:pricingData }=await import('../content/pricing.mjs');
  const catalog=biz.hasOfferCatalog?.itemListElement||[];
  if(catalog.length!==pricingData.length||pricingData.some(c=>!catalog.find(o=>o.name===c.title))) fail('SEO/IA: JSON-LD offers must match content/pricing.mjs');
  // Le nom complet se lit dans le contenu (hors pied de page) de l'accueil et de la page À propos.
  for(const [label,h] of [['Home',home],['About',about]]){ const main=(h.split('id="main-content"')[1]||'').split(label==='Home'?'</body>':'<footer')[0].replace(/<script[\s\S]*?<\/script>/g,'').replace(/<(\w+)[^>]*class="sr-only"[^>]*>[\s\S]*?<\/\1>/g,'').replace(/<[^>]+>/g,' '); if(!main.includes(siteData.legalName)) fail(`SEO: ${label} must show « ${siteData.legalName} » in its visible content (Home: footer included, the banner text is fixed by Nolan)`); }
  // Bannière : Nolan a fixé le texte (réalisation, direction artistique, stratégie) ; son nom passe par le titre accessible, le titre de page et les données structurées.
  if(!/id="v16-hero-title">Nolan Ribeiro/.test(home)||home.includes('hero-roles__name')) fail('Home: Nolan Ribeiro must be in the accessible hero title, the visible banner text stays as Nolan set it');
  // Titres et descriptions : uniques, assez courts pour ne pas être coupés, orientés recherche.
  const seen=new Map();
  // Longueurs mesurées sur le texte lu (entités HTML décodées : « &#039; » compte pour une apostrophe).
  const decode=t=>t.replace(/&(#039|quot|amp|lt|gt);/g,'_');
  for(const rel of indexable){ const h=await readFile(join(dist,rel),'utf8'), title=decode(h.match(/<title>([^<]*)<\/title>/)[1]), desc=decode(h.match(/<meta name="description" content="([^"]*)"/)?.[1]||'');
    if(seen.has(title)) fail(`SEO: title duplicated on ${rel} and ${seen.get(title)}`); seen.set(title,rel);
    if(title.length>65) fail(`SEO: title too long on ${rel} (${title.length} > 65)`);
    if(desc.length<70||desc.length>170) fail(`SEO: description length on ${rel} (${desc.length}, expected 70 to 170)`); }
  if(!/vidéaste/.test(home.match(/<title>([^<]*)/)[1])||!/Nolan Ribeiro/.test(home.match(/<title>([^<]*)/)[1])) fail('SEO: home title must name Nolan Ribeiro and say vidéaste');
  // Fiches IA : générées depuis les contenus, tous les tarifs y figurent, liens absolus.
  for(const f of ['llms.txt','llms-full.txt']){ if(!existing.has(f)) { fail(`SEO/IA: ${f} missing`); continue; } const t=await readFile(join(dist,f),'utf8');
    if(!t.startsWith('# ')||!t.includes(siteData.legalName)||!t.includes(siteData.name)||!t.includes(`${domain}/contact/`)) fail(`SEO/IA: ${f} must open with a title and name Nolan Ribeiro, Nolan Arc and the contact page`);
    for(const c of pricingData) if(!t.includes(c.title)||(c.price!=='Sur devis'&&!t.includes(c.price.replace('€ / h','€ de l’heure')))) fail(`SEO/IA: ${f} lacks the offer « ${c.title} » or its price`);
    if(/\]\(\//.test(t)) fail(`SEO/IA: ${f} must use absolute links`); }
  if(!(await readFile(join(dist,'llms.txt'),'utf8')).includes(`${domain}/llms-full.txt`)) fail('SEO/IA: llms.txt must point to llms-full.txt');
  // IndexNow (Bing) : une seule clé, servie à la racine, dont le fichier contient exactement la clé.
  const keys=[...existing].filter(f=>/^[0-9a-f]{32}\.txt$/.test(f));
  if(keys.length!==1) fail(`IndexNow: exactly one key file expected at the root, found ${keys.length}`);
  else if((await readFile(join(dist,keys[0]),'utf8'))!==keys[0].slice(0,-4)) fail('IndexNow: the key file must contain only its own key'); }

// Miniatures des vidéos : l'outil de recadrage de l'admin suit le vrai ratio de l'écran du téléphone, et le site
// remplit cet écran (cover, centré), comme l'aperçu.
{ const { workAssets:wa }=await import('../content/work-assets.mjs'); const real=(wa.phone.screen[2]*wa.phone.w)/(wa.phone.screen[3]*wa.phone.h);
  const m=(await readFile(join(root,'public/admin/cropper.js'),'utf8')).match(/PHONE_SCREEN = (\d+) \/ (\d+)/);
  if(!m||Math.abs(m[1]/m[2]/real-1)>0.01) fail(`Videos: the admin crop ratio must match the phone screen (${real.toFixed(3)})`);
  if(!/\.ps-card \.ig-card__cover\{background-size:cover;background-position:center/.test(await readFile(join(root,'src/styles.css'),'utf8'))) fail('Videos: phone thumbnails must fill the screen (cover, centered)'); }

// Ancres internes : chaque lien /page/#ancre pointe vers un id qui existe dans la page visée.
for(const file of htmls){ const html=await readFile(file,'utf8'), rel=relative(dist,file).replaceAll('\\','/');
  for(const [,path,id] of html.matchAll(/href="(\/[^"#?]*)(?:\?[^"#]*)?#([\w-]+)"/g)){ const target=join(dist,path.endsWith('/')?`${path}index.html`:path); const t=await readFile(target,'utf8').catch(()=>''); if(t&&!t.includes(`id="${id}"`)) fail(`${rel}: anchor #${id} missing on ${path}`); } }
// Redirections Cloudflare Pages : vraies 301, sans boucle ni chaîne, vers des pages existantes.
{ const lines=(await readFile(join(dist,'_redirects'),'utf8').catch(()=>'')).split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>l.trim().split(/\s+/));
  if(!lines.length) fail('Redirects: dist/_redirects missing');
  const sources=new Set(lines.map(l=>l[0]));
  for(const [from,to,code] of lines){ const page=to.split(/[?#]/)[0];
    if(code!=='301') fail(`Redirects: ${from} must be a 301`);
    if(sources.has(page)||sources.has(page.replace(/\/$/,''))) fail(`Redirects: chain or loop on ${from} -> ${to}`);
    if(!existing.has(`${page.replace(/^\//,'')}index.html`)) fail(`Redirects: ${from} points to a missing page ${to}`); }
  for(const file of htmls){ const html=await readFile(file,'utf8'); if(html.includes('http-equiv="refresh"')) continue; for(const [,href] of html.matchAll(/href="(\/[^"#?]*)/g)) if(sources.has(href)) fail(`${relative(dist,file)}: internal link to an old address ${href}`); } }
// llms.txt (https://llmstxt.org/) : H1, résumé en citation, listes de liens Markdown vers des pages réelles.
{ const t=await readFile(join(dist,'llms.txt'),'utf8'); const lines=t.split('\n');
  if(!/^# \S/.test(lines[0])||!lines.some(l=>l.startsWith('> '))||(t.match(/^# /gm)||[]).length!==1) fail('llms.txt: one H1 title and a quoted summary expected');
  const links=[...t.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)];
  if(links.length<5) fail('llms.txt: Markdown links expected (bare URLs are not read as links)');
  for(const [,label,href] of links){ if(!href.startsWith(siteData.domain)) continue; const path=new URL(href).pathname; const f=path.endsWith('/')?`${path.slice(1)}index.html`:path.slice(1); if(!existing.has(f)) fail(`llms.txt: link « ${label} » points to a missing page ${href}`); }
  for(const sec of t.split(/^## /m).slice(1)) if(!/\]\(https?:/.test(sec)) fail(`llms.txt: section « ${sec.split('\n')[0]} » must list links`); }

// Lot 3 : polices servies par le site, cache des fichiers versionnés, images de fond différées, ordre de l'admin.
{ if(/fonts\.googleapis\.com\/css|rel="preconnect" href="https:\/\/fonts/.test(home)) fail('Fonts: the DA fonts are self-hosted (no Google Fonts request)');
  for(const f of ['dm-sans-latin-opsz-normal','yrsa-latin-wght-normal','yrsa-latin-wght-italic','syne-latin-wght-normal']) if(!existing.has(`assets/fonts/${f}.woff2`)||!home.includes(`/assets/fonts/${f}.woff2`)) fail(`Fonts: ${f}.woff2 missing`);
  if(!/font-display:swap/.test(home)) fail('Fonts: font-display swap expected');
  const hd=await readFile(join(dist,'_headers'),'utf8').catch(()=>''); if(!/\/assets\/site\.\*\n\s+Cache-Control: public, max-age=31536000, immutable/.test(hd)) fail('Cache: versioned assets need a long cache (dist/_headers)');
  if(/style="background-image:url\(/.test(home)) fail('Home: below-the-fold background images must be deferred (data-lazy-bg)');
  if(!adminHtml.includes('/admin/order.js?v=')||!(await readFile(join(root,'public/admin/admin.js'),'utf8')).includes("id: 'order'")) fail('Admin: « Ordre » section expected');
  if(/Mis en avant/.test(['projects.js','videos.js','photos.js'].map(f=>require_(f)).join(''))) fail('Admin: the « Mis en avant » box was replaced by « Ordre »'); }
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
if(/mediator:\s*\{[\s\S]*?name:\s*''/.test(legalSource)) console.warn('LEGAL ACTION REQUIRED — consumer mediator is not configured; complete adhesion before concluding B2C contracts.');
if(/publicLegalContactsConfirmed:\s*false/.test(legalSource)) console.warn('LEGAL ACTION REQUIRED — public professional address and phone are not confirmed; add publishable business contact details before release.');
console.log(`QA OK — ${htmls.length} HTML files; V20 copy, OG Home, accessibility relations, consent-gated hero video and stability guardrails verified.`);
