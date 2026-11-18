import { readFile as readFileRaw, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { legalRequiredFields } from '../content/legal.mjs';
import { site as siteData } from '../content/site.mjs';
import { projects as projectData } from '../content/projects.mjs';

const root=new URL('../',import.meta.url).pathname;
const dist=join(root,'dist');
const errors=[];
const fail=(message)=>errors.push(message);
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
for(const source of [pagesSource,siteSource,legalSource]){
  if(/1\s+all[eé]e\s+Mirabeau/i.test(source)) fail('Privacy: private street address found in source');
  if(/(?:\+33\s*\(0\)?\s*7|07[ .-]?82[ .-]?04[ .-]?89[ .-]?25|0782048925)/i.test(source)) fail('Privacy: private phone number found in source');
}

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
if(!home.includes('class="wedding-wall')||(home.match(/class="polaroid"/g)||[]).length!==3||(!weddingPhotos.length&&/<a class="polaroid"[^>]*><img/.test(home))) fail('Home: wedding wall shows three polaroids, and no stand-in photo while none is provided');
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
  const order=['supabase.js','doc-models.js','messages.js','cockpit.js','photos.js','admin.js'].map(f=>adminHtml.indexOf(`/admin/${f}?v=`));
  if(order.some(i=>i<0)||order.some((i,k)=>k&&i<order[k-1])) fail('Admin: scripts must load in order supabase, doc-models, messages, cockpit, photos, admin');
  if(!adminHtml.includes('/admin/admin.css?v=')||!/data-docs="[a-f0-9]{10}"/.test(adminHtml)) fail('Admin: admin.css and the documents version must be on /admin/');
  for(const [name,src] of [['doc-models.js',models],['messages.js',msgs],['photos.js',await readFile(join(root,'public/admin/photos.js'),'utf8')],['admin.js',await readFile(join(root,'public/admin/admin.js'),'utf8')]]) if(/innerHTML|insertAdjacentHTML|document\.write|eval\(/.test(src)) fail(`Admin: ${name} must not inject HTML`);
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
  if(pics.length>=3&&!/<section class="wk-photo" id="photo"/.test(workHtml)) fail('Work: three published photos must show the photography section');
  if(/<img[^>]+supabase\.co/i.test(workHtml)) fail('Photos: visitors must never load a photo from Supabase'); }
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
if(!work.includes('data-load-instagram')||!work.includes('DYriAZ_IKrU')||!work.includes('DewEcSOCFV2')) fail('Instagram: the 4 click-to-load cards must be on Work');
// Work : le travail réel d'abord (film, puis vidéos sociales), les images d'ambiance ensuite.
if(!(work.indexOf('data-bento')>0&&work.indexOf('data-bento')<work.indexOf('class="ig-section'))) fail('Work: projects bento must come before the social videos');
if((work.match(/class="ig-card ps-card"/g)||[]).length!==8||!existing.has('assets/work/phone.webp')||!existing.has('assets/work/stage.webp')) fail('Work: four phone cards and their rendered assets expected');
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
if(!app.includes('data-offer-input')||!(await readFile(join(dist,'contact/index.html'),'utf8')).includes('data-offers=')) fail('Contact: offers data and prefill handler expected');
if(app.indexOf('const showcaseState=new WeakMap();')<0||app.indexOf('const showcaseState=new WeakMap();')>app.indexOf('updateScroll();')) fail('Home V18: showcase state must exist before initial scroll choreography runs');
if(!app.includes("$$('[data-price-proof]').forEach")||!app.includes("$$('[data-faq-section]').forEach")) fail('Home: pricing/FAQ interaction handlers missing');
if(!home.includes('data-morph-list')||(home.match(/data-morph-open=/g)||[]).length!==(home.match(/<dialog class="morph-panel"/g)||[]).length||!(home.match(/data-morph-open=/g)||[]).length) fail('Home: each testimonial row needs its panel (morphing list)');
if(!app.includes("bento.addEventListener('dblclick'")) fail('Work: double click on a bento tile must open the project');
if(!home.includes('/assets/pgytech-logo.png')||!existing.has('assets/pgytech-logo.png')) fail('Home V19: local PGYTECH logo asset missing');
if(!home.includes('is-sony')||!css.includes('.v16-logo-card.is-sony img{max-width:50%')) fail('Home V19: Sony optical size correction missing');
if(!home.includes('Coucouuuu elle est vraiment super stylé !! T’es plans nous mettent grave en valeur ça fait plaisir hahaha')||!home.includes('>Lola<')) fail('Home V19: Lola testimonial missing');
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
if(heroFile&&/youtube/i.test(home.slice(home.indexOf('class="v16-hero"'),home.indexOf('class="hero-copy"')))) fail('Home: self-hosted hero must not call YouTube');
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
if((work.match(/data-bento-tile/g)||[]).length!==5||(work.match(/data-bento-focus/g)||[]).length!==5||!work.includes('view-transition-name:bento-4')) fail('Work: bento expects five tiles, each focusable');
if((work.match(/data-stack-card=/g)||[]).length!==8||(work.match(/data-stack-dot=/g)||[]).length!==4||!work.includes('phone-stack__frame')||(work.match(/class="ig-card__link"/g)||[]).length<4||!app.includes("$$('[data-phone-stack]').forEach")) fail('Work: one phone with the four social videos sliding inside, each keeping its Instagram link');
if(!home.includes('v16-testimonial-bento')||!home.includes('is-featured')||!home.includes('class="v16-stars"')) fail('Home: testimonials keep their original card layout');
if(/Ouverture|Le repas|Les indices|Le silence|La résolution/.test(work)) fail('Work V17: Bol slideshow labels must not remain');
if(project.includes('data-video-slide-show')) fail('Project V17: Video Slide Show must not live in project page');
if(!app.includes('drag.velocity')||!app.includes('projected=state.delta+state.velocity*240')||!app.includes('steps=clamp(steps,-3,3)')) fail('Work V17: velocity/inertia slideshow engine missing');
const visibleCards=1+projectData.filter(p=>p.visible&&p.card&&p.card.image).length;
if(!app.includes('[data-gradient-motion]')||!app.includes("getContext('webgl'")||!css.includes('.gradient-motion-bg.has-mesh i')) fail('Mesh gradient: WebGL layer with CSS fallback expected');
if((home.match(/<a class="fab-project-card[\s"]/g)||[]).length!==visibleCards) fail(`Home: ${visibleCards} carte(s) projet attendue(s) (projets visibles), trouvé autre chose`);
for(const p of projectData){ if(p.visible&&p.slug!=='le-bol-den-face'&&!(p.card&&p.card.image&&!/unsplash|temporaire/i.test(p.card.image+' '+(p.card.alt||'')))) fail(`Projet « ${p.title} » visible sans média réel (R1) : mettre card.image réel ou visible:false`); }
for(const file of htmls){ if(/Illustration temporaire/i.test(await readFile(file,'utf8'))) fail(`Placeholder « Illustration temporaire » visible (${relative(dist,file)}) — R1`); }
// WORK V2 : « Ma sélection » (grille par défaut, liste filtrable), fiche, avis de l'accueil, accès direct au contact.
if(!work.includes('data-work-views')||!/data-work-view="grid" aria-pressed="true"/.test(work)||!/data-work-panel="list" hidden/.test(work)||!work.includes('data-work-filter="tout"')||!work.includes('data-fiche')) fail('Work V2: grid/list toggle (grid by default), filters and project sheet expected');
if(!app.includes("$$('[data-work-views]').forEach")||!app.includes("'bento:focus'")||!app.includes('[data-stack-goto]')) fail('Work V2: toggle, filters, sheet sync and phone targeting handlers missing in app.js');
if(work.indexOf('id="social"')<work.indexOf('id="selection"')||work.indexOf('id="social"')>work.indexOf('id="retours"')) fail('Work V2: social videos must sit right under « Ma sélection »');
if(!work.includes('data-morph-list')||(work.match(/data-morph-open=/g)||[]).length!==siteData.testimonials.length||(work.match(/<dialog class="morph-panel"/g)||[]).length!==siteData.testimonials.length) fail('Work V2: same testimonials component as Home, each with its panel');
for(const intent of ['moment','brand','story']) if(!work.includes(`href="/contact/?intent=${intent}"`)) fail(`Work V2: contact entry ${intent} missing`);
if(/href="\/services\/#/.test(work)) fail('Work V2: no link to a Services anchor that may not exist');
{ const sel=work.slice(work.indexOf('id="selection"'),work.indexOf('id="social"')); for(const p of projectData.filter(p=>!p.visible)) if(sel.includes(`>${p.title}<`)||sel.includes(`"${p.title}"`)) fail(`Work V2: hidden project « ${p.title} » must not appear in the selection (R1)`); }
if(/data-expertise-switcher/.test(work)) fail('Work V2: the three-hat switcher moved out (it stays on Services)');
{ const photoCount=(await import('../content/photos.mjs')).photos.length; if(photoCount<3&&/id="photo"|data-title="Photographie"/.test(work)) fail('Work V2: photography appears only with at least three real photos (R1)'); }
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


// Public privacy preference.
for(const html of [home,work,project,services,about,journal,contact,privacy]){
  if(/1\s+all[eé]e\s+Mirabeau/i.test(html)) fail('Privacy V17: street address exposed in built HTML');
  if(/(?:\+33\s*\(0\)?\s*7|07[ .-]?82[ .-]?04[ .-]?89[ .-]?25|0782048925)/i.test(html)) fail('Privacy V17: phone exposed in built HTML');
}

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
  for(const rel of indexable){ const h=await readFile(join(dist,rel),'utf8'), title=h.match(/<title>([^<]*)<\/title>/)[1], desc=h.match(/<meta name="description" content="([^"]*)"/)?.[1]||'';
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

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
if(/mediator:\s*\{[\s\S]*?name:\s*''/.test(legalSource)) console.warn('LEGAL ACTION REQUIRED — consumer mediator is not configured; complete adhesion before concluding B2C contracts.');
if(/publicLegalContactsConfirmed:\s*false/.test(legalSource)) console.warn('LEGAL ACTION REQUIRED — public professional address and phone are not confirmed; add publishable business contact details before release.');
console.log(`QA OK — ${htmls.length} HTML files; V20 copy, OG Home, accessibility relations, consent-gated hero video and stability guardrails verified.`);
