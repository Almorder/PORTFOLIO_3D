import { site } from '../content/site.mjs';
import { projects } from '../content/projects.mjs';
import { notes } from '../content/journal.mjs';
import { existsSync } from 'node:fs';
import { legal } from '../content/legal.mjs';
import { instagramPosts } from '../content/instagram.mjs';
import { photos, tilePhotos, tileRank, MIN_PHOTOS } from '../content/photos.mjs';
import { testimonials } from '../content/testimonials.mjs';
import { siteImage, siteVideo } from '../content/site-images.mjs';
import { gearBoard } from './gear.mjs';
import { workAssets } from '../content/work-assets.mjs';
import { focusText, morphTestimonials, morphPanel, bentoFocus, bentoMore } from './showcase.mjs';
import { weddingWall } from './wedding.mjs';
import { weddingOffers } from '../content/wedding.mjs';
import { pricing, pricingHref, pricingMessage, contactTopics, pricingDetails, pricingCommon } from '../content/pricing.mjs';
import { pricingSection } from './pricing.mjs';
import '../public/admin/categories.js';
const Cat = globalThis.NolanCategories;
import { head, header, footer, esc, projectMeta, lineToc, animatedStats, glassShowcase, stackedFlow, videoSlideShow, gradientMotionBackground, faqAccordion, faqSchema, contactDialog } from './components.mjs';

// Fond d'un dossier « Trois dimensions » : image remplacée depuis l'admin (petite et grande taille), sinon texture d'origine (CSS).
const folderArt = key => { const s=siteImage(`home.dims.${key}`); return s ? ` data-lazy-bg style="--bg:image-set(url('${esc(s.image.srcSmall)}') 1x,url('${esc(s.image.src)}') 2x)"` : ''; };
// Le portrait n'est affiché que si le fichier existe : jamais d'image cassée ni de visage de substitution.
const hasPortrait = existsSync(new URL('../public/assets/nolan-portrait.jpg', import.meta.url));
const bol = projects.find(p=>p.slug==='le-bol-den-face');
// Accueil, « Tarifs » : une carte par offre, sur le modèle d'un mur de témoignages vidéo.

// Accueil, « Trois dimensions » : le besoin du visiteur, dans ses mots, et un repère de prix déjà publié dans les tarifs.
const dimNeeds = {
  realisation: { need: 'J’ai un film à faire.', text: 'Pas besoin d’avoir tout prévu. On part de ce que le film doit faire ressentir ; je m’occupe du tournage jusqu’au montage, et vous gardez la main sur les choix qui comptent.', price: '1 500 €' },
  direction: { need: 'J’ai un univers à rendre cohérent.', text: 'Vos images, vos vidéos et vos supports ne se ressemblent pas toujours. On cherche ensemble ce qui les relie, pour que votre univers se reconnaisse au premier regard.', price: '200 €' },
  strategie: { need: 'J’ai une marque à clarifier.', text: 'Vous savez ce que vous faites, moins comment le dire. On remet à plat ce que vous voulez transmettre, et à qui, pour savoir par quoi commencer.', price: '89 € / h' },
};
// Affiche du film hébergée sur le site quand le fichier existe (récupéré au déploiement), sinon celle de YouTube.
const bolPosterLocal = existsSync(new URL(`../public${bol.posterFile}`, import.meta.url));
const bolPoster = bolPosterLocal ? bol.posterFile : bol.poster;
const bolPosterAbs = bolPosterLocal ? `${site.domain}${bol.posterFile}` : bol.poster;
const showPhotos = photos.length >= MIN_PHOTOS;

// Page Work : un projet = une tuile de la sélection, une ligne de la liste et une fiche.
// Seul ce qui est renseigné s'affiche ; un projet masqué (visible:false) n'apparaît nulle part.
const igUrl = id => `https://www.instagram.com/p/${id}/`;
// Projets mis en avant (admin, rubrique « Projets du portfolio ») : un ou plusieurs médias (photo, YouTube,
// Instagram, fichier vidéo), dont un média principal qui fait la tuile. Aucun lecteur n'est chargé dans le bento :
// la tuile montre une image servie par le site et ouvre la page projet (ou le lien choisi), sinon ne s'ouvre pas.
// Un projet sans média réel (image envoyée ou affiche copiée au déploiement) n'apparaît pas (règle R1).
const publicFile = src => typeof src==='string' && /^\/(?!\/)/.test(src) && existsSync(new URL(`../public${src}`, import.meta.url));
const mediaKind = p => p.mediaKind || (p.videoId ? 'youtube' : '');
const videoUrl = p => mediaKind(p)==='youtube'&&p.videoId ? `https://www.youtube.com/watch?v=${p.videoId}` : mediaKind(p)==='instagram'&&p.instagramId ? igUrl(p.instagramId) : '';
const territoryTag = { 'Récits':'recits', 'Marques':'marques', 'Moments':'moments', 'Réseaux':'reseaux', 'Photographie':'photo' };
// Médias d'un projet réellement présents sur le site (fichier copié au déploiement), dans l'ordre de l'admin.
// Une vidéo YouTube sans image envoyée prend son affiche copiée, sinon l'affiche publique de YouTube.
const ytPoster = id => { const local=`/assets/work/yt-${id}.jpg`; return publicFile(local) ? { src:local, abs:`${site.domain}${local}` } : { src:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, abs:`https://i.ytimg.com/vi/${id}/hqdefault.jpg` }; };
const shownMedia = p => (p.media||[]).map(m=>{
  const img = m.image && publicFile(m.image.srcSmall) ? m.image : null;
  if (m.kind==='photo') return img && m.alt ? { ...m, img } : null;
  if (m.kind==='youtube') { const poster = img ? null : p.slug==='le-bol-den-face' ? { src:bolPoster, abs:bolPosterAbs } : ytPoster(m.videoId); return { ...m, img, poster, alt:m.alt||`${p.title}, image de la vidéo` }; }
  if (m.kind==='instagram') return img && m.alt ? { ...m, img } : null;
  if (m.kind==='file') return img && m.alt && publicFile(m.video?.src) ? { ...m, img } : null;
  return null;
}).filter(Boolean);
// Page projet -> Contact : la catégorie du projet présélectionne le type de demande.
const contactFor = p => { const c=Cat.project(p); return c.includes('mariage') ? '/contact/?intent=moment' : c.includes('direction-artistique') ? '/contact/?intent=brand&amp;offre=direction' : c.includes('video') ? '/contact/?intent=story&amp;offre=film' : '/contact/'; };
// Nombre de médias d'un projet : toujours calculé depuis les médias réellement en ligne, jamais saisi.
const mediaCount = list => { const v=list.filter(m=>m.kind!=='photo').length, ph=list.length-v; return [ph&&`${ph} photo${ph>1?'s':''}`, v&&`${v} vidéo${v>1?'s':''}`].filter(Boolean).join(' · '); };
// Page projet générée (/projet/<adresse>/) : dès qu'il y a plusieurs médias, ou si l'admin le demande (« page »).
// Le bol d'en face garde sa page. Sans page ni lien, la tuile reste visible mais ne s'ouvre pas.
const RESERVED_PAGES = new Set(['le-bol-den-face','film-de-marque','film-institutionnel','direction-artistique','contenu-social','strategie-visuelle','mariage','demande-en-mariage']);
const usedPages = new Set();
const pageOf = new Map(projects.filter(p=>p.visible).map(p=>{
  if (p.slug==='le-bol-den-face') return [p.slug,'/projet/le-bol-den-face/'];
  const count = shownMedia(p).length;
  if (!count || !(p.pageMode==='page' || (p.pageMode==='auto' && count>1))) return [p.slug,''];
  let slug = p.pageSlug || p.slug, n = 2;
  while (RESERVED_PAGES.has(slug) || usedPages.has(slug)) slug = `${p.pageSlug||p.slug}-${n++}`;
  usedPages.add(slug);
  return [p.slug,`/projet/${slug}/`];
}));
const projectHref = p => pageOf.get(p.slug) || (p.pageMode==='link' && p.link) || '';
const projectMedia = (p,large) => {
  const m = shownMedia(p).find(x=>x.key===p.cover) || shownMedia(p)[0];
  if (!m) return null;
  if (m.img) return { image:large?m.img.src:m.img.srcSmall, width:large?m.img.width:m.img.smallWidth, height:large?m.img.height:m.img.smallHeight, alt:m.alt, full:m.img.src, srcset:`${m.img.srcSmall} ${m.img.smallWidth}w, ${m.img.src} ${m.img.width}w` };
  if (m.kind==='youtube' && (p.slug==='le-bol-den-face' || publicFile(m.poster.src))) return { image:m.poster.src, width:1280, height:720, alt:m.alt };
  return null;
};
const featured = projects.filter(p=>p.visible&&projectMedia(p,false));
const projectItem = (p,i) => {
  const m = projectMedia(p,i===0), kind = mediaKind(p), own = projectHref(p), count = shownMedia(p).length;
  return { title:p.title, type:p.type||'', tags:[territoryTag[p.territory]||(kind==='photo'?'photo':'recits')], role:p.role||'', context:p.context||'', client:p.client||'', year:p.year||'', result:p.result||'',
    label:[p.type,p.year].filter(Boolean).join(' · ')||p.title, text:p.summary||'', image:m.image, width:m.width, height:m.height, alt:m.alt, srcset:m.srcset,
    href: own, cta: !own ? '' : p.slug==='le-bol-den-face' ? 'Voir le film' : pageOf.get(p.slug) ? (count>1 ? `Voir le projet · ${mediaCount(shownMedia(p))}` : 'Voir le projet') : 'Voir le projet',
    ...(kind==='instagram'&&p.instagramId ? { instagram:igUrl(p.instagramId) } : {}), project:p };
};
// Miniature d'une vidéo sociale : image envoyée depuis l'admin (ou tirée de la vidéo), sinon couverture du code.
const socialThumb = p => p.image && publicFile(p.image.srcSmall) ? { src:p.image.srcSmall, large:publicFile(p.image.src)?p.image.src:'', width:p.image.smallWidth, height:p.image.smallHeight } : p.cover && publicFile(p.cover) ? { src:p.cover } : null;
// Ordre du site (admin, rubrique « Ordre ») : le numéro choisi (rank) d'abord ; sans numéro, l'ancienne mise en avant,
// puis l'ordre de chaque bloc. Même règle pour « Ma sélection » (accueil) et le catalogue Work.
const featuredFirst = list => list.map((x,i)=>[x,i]).sort(([a,i],[b,j])=>(a.rank??Infinity)-(b.rank??Infinity) || (a.featured?0:1)-(b.featured?0:1) || i-j).map(([x])=>x);
const rankOf = x => Number.isInteger(x?.rank) ? x.rank : null;
const workItems = featuredFirst([
  ...featured.map(p=>({ ...projectItem(p,1), featured:Boolean(p.featured), rank:rankOf(p) ?? undefined })),
  // Tuile « Photographie » : un seul bloc avec toutes les photos cochées « Dans la tuile » (diaporama lent).
  // Elle ouvre la section Photographie si elle existe ; sinon elle s'affiche sans s'ouvrir. Aucune photo : pas de tuile.
  ...(tilePhotos.length ? [{ title:'Photographie', type:'Série photo', tags:['photo'], role:'Photographie', context:[...new Set(tilePhotos.map(p=>p.series).filter(Boolean))].join(', '), year:[...new Set(tilePhotos.map(p=>p.year).filter(Boolean))].sort().join(', '), result:'',
    label:'Photographie', text:'', images:tilePhotos.map(p=>({ src:p.srcSmall||p.src, alt:p.alt, width:p.smallWidth||p.width, height:p.smallHeight||p.height, srcset:p.srcSmall?`${p.srcSmall} ${p.smallWidth}w, ${p.src} ${p.width}w`:'' })), href:'/work/?categorie=photo', cta:'Voir les photos', featured:tilePhotos.some(p=>p.featured), rank:tileRank ?? undefined }] : []),
  ...instagramPosts.map((p,i)=>{ const thumb=socialThumb(p), file=p.source==='file';
    return { title:p.title, type:'Vidéo verticale', tags:p.tags?.length?p.tags:['reseaux'], role:p.role||'', context:p.client||p.kind||'', year:p.year||'', result:p.result||'',
    label:p.kind||'Vidéo verticale', text:p.kind?`${p.kind}, vidéo verticale${file?'':' publiée sur Instagram'}.`:`Vidéo verticale${file?'':' publiée sur Instagram'}.`, image:thumb?.src||'', width:thumb?.width, height:thumb?.height, alt:thumb?`${p.title}, vidéo verticale`:'', href:'#social', cta:'Voir la vidéo', stack:i, featured:Boolean(p.featured), rank:rankOf(p) ?? undefined, ...(file?{}:{ instagram:igUrl(p.id) }) }; }),
]);
// La première tuile du bento est la grande : image en grande taille.
if (workItems[0]?.project) workItems[0] = { ...projectItem(workItems[0].project,0), featured:workItems[0].featured, rank:workItems[0].rank };
const ficheFields = [['type','Type'],['role','Rôle'],['context','Contexte'],['client','Client'],['year','Année'],['result','Résultat'],['text','Description']];
const withFiche = item=>({ ...item, data:Object.fromEntries([['title',item.title],...ficheFields.map(([k])=>[k,item[k]])]) });
const bentoTiles = workItems.slice(0,5).map(withFiche);
// Plus de 5 projets mis en avant : les suivants dans une grille sous le bento, ouverte par « Voir plus de projets ».
const moreTiles = workItems.slice(5).filter(it=>it.project).map(withFiche);

// Catalogue de la page Work : tous les projets visibles, toutes les vidéos courtes et les photos du catalogue,
// chacun dans une ou plusieurs catégories (public/admin/categories.js). Mêmes données que l'accueil (admin).
// Une photo déjà présente dans un projet n'a pas de deuxième carte.
const projectImageIds = new Set(projects.filter(p=>p.visible).flatMap(p=>(p.media||[]).map(m=>m.image?.id).filter(Boolean)));
// Format réel de chaque aperçu (largeur / hauteur) : image envoyée, affiche YouTube 16:9, vidéo verticale 9:16 par défaut.
const ratioOf = (w,h,fallback) => w&&h ? `${w}/${h}` : fallback;
const catalogItems = featuredFirst([
  ...featured.map(p=>{ const m=projectMedia(p,false), href=projectHref(p), all=shownMedia(p);
    return { kind:'project', title:p.title, cats:Cat.project(p), year:p.year||'', type:p.type||'', client:p.client||'', image:m, href, count:all.length>1?mediaCount(all):'', project:p, featured:Boolean(p.featured), rank:rankOf(p) ?? undefined, ratio:ratioOf(m.width,m.height,'16/9') }; }),
  ...instagramPosts.map(p=>{ const thumb=socialThumb(p); return { kind:'social', title:p.title, cats:Cat.social(p), year:p.year||'', type:p.kind||'Vidéo verticale', client:p.client||'', thumb, post:p, featured:Boolean(p.featured), rank:rankOf(p) ?? undefined,
    ratio: p.source==='file'&&p.video ? ratioOf(p.video.width,p.video.height) : thumb?.width ? ratioOf(thumb.width,thumb.height) : (p.ratio||'9/16') }; }),
  ...photos.filter(ph=>!projectImageIds.has(ph.id)).map(ph=>({ kind:'photo', title:ph.series||'Photographie', cats:Cat.photo(ph), year:ph.year||'', type:ph.place||'', client:'', ph, featured:Boolean(ph.featured), rank:rankOf(ph) ?? undefined, ratio:ratioOf(ph.width,ph.height,'4/5') })),
]);
const catalogCount = key => catalogItems.filter(it=>it.cats.includes(key)).length;
const catalogHref = key => key ? `/work/?categorie=${key}` : '/work/';
// VideoObject : publié seulement quand la date de mise en ligne et une vignette existent (exigence de Google).
const videoSchema = ({ name, description, thumbnail, uploadDate, duration, embedUrl, url }) => (uploadDate && thumbnail) ? { '@type':'VideoObject', name, description, thumbnailUrl:[thumbnail], uploadDate, ...(duration?{duration}:{}), embedUrl, url } : null;
const bolVideo = () => videoSchema({ name:bol.title, description:bol.summary, thumbnail:bolPosterAbs, uploadDate:bol.uploadDate, duration:bol.duration, embedUrl:`https://www.youtube-nocookie.com/embed/${bol.videoId}`, url:`https://www.youtube.com/watch?v=${bol.videoId}` });
// Vidéos des projets mis en avant (Le bol d'en face compris) : publiées seulement avec date et vignette.
const projectVideos = () => workItems.filter(it=>it.project&&mediaKind(it.project)!=='photo').map(({project:p,image,href})=>{ const k=mediaKind(p), cover=(p.media||[]).find(m=>m.key===p.cover), page=href&&href.startsWith('/')?`${site.domain}${href}`:'';
  const v=videoSchema({ name:p.title, description:p.summary||`${p.title}, vidéo de Nolan Ribeiro.`, thumbnail:/^https?:/.test(image)?image:`${site.domain}${image}`, uploadDate:p.uploadDate, duration:p.duration, embedUrl:k==='youtube'?`https://www.youtube-nocookie.com/embed/${p.videoId}`:k==='instagram'?`${igUrl(p.instagramId)}embed/`:undefined, url:k==='file'?(page||`${site.domain}/work/#selection`):videoUrl(p) });
  return v&&k==='file'&&cover?.video ? { ...v, contentUrl:`${site.domain}${cover.video.src}`, ...(cover.video.duration&&!p.duration?{ duration:`PT${cover.video.duration}S` }:{}) } : v; }).filter(Boolean);
const igVideos = () => instagramPosts.map(p=>{ const thumb=socialThumb(p), file=p.source==='file';
  const v=videoSchema({ name:p.title, description:p.kind?`${p.kind}, vidéo verticale de Nolan Ribeiro.`:'Vidéo verticale de Nolan Ribeiro.', thumbnail:thumb?`${site.domain}${thumb.src}`:'', uploadDate:p.uploadDate, embedUrl:file?undefined:`${igUrl(p.id)}embed/`, url:file?`${site.domain}/work/#social`:igUrl(p.id) });
  return v&&file ? { ...v, contentUrl:`${site.domain}${p.video.src}`, ...(p.video.duration?{ duration:`PT${p.video.duration}S` }:{}) } : v; }).filter(Boolean);


// Bannière de l'accueil. Vidéos hébergées par le site, envoyées depuis l'admin (Images > Accueil · Bannière) :
// une pour l'ordinateur (16:9), une pour le téléphone (9:16), chacune avec son affiche. Aucune requête tierce :
// elles démarrent seules (muettes), sans demande d'autorisation. Sans fichier publié, la bannière garde le film
// YouTube d'origine (Sony France, vitrine Alpha 7 IV), chargé seulement après autorisation.
const homeHeroVideo = { id:'xAapoE5OKIk', title:'Vidéo de fond | Nolan Arc' };
const heroWide = siteVideo('home.hero.desktop'), heroNarrow = siteVideo('home.hero.mobile');
// Ordinateur sans YouTube dès que la vidéo 16:9 est publiée (le téléphone prend alors la 9:16, sinon la 16:9).
const heroSelfHosted = Boolean(heroWide);
// Image vide (1 pixel) : une couche masquée sur cet écran ne télécharge pas son affiche.
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
const heroFileLayer = () => { const main = heroWide || heroNarrow, only = !heroWide;
  const poster = img => `${esc(img.srcSmall)} ${img.smallWidth}w, ${esc(img.src)} ${img.width}w`;
  return `<div class="v16-hero__media v16-hero__media--file${heroNarrow?' has-narrow':''}${only?' is-narrow-only':''}" aria-hidden="true"><picture>${heroWide&&heroNarrow?`<source media="(max-width: 760px)" srcset="${poster(heroNarrow.image)}" sizes="100vw" width="${heroNarrow.image.width}" height="${heroNarrow.image.height}">`:''}${only?`<source media="(min-width: 761px)" srcset="${BLANK}">`:''}<img class="v16-hero__poster" src="${esc(main.image.src)}" srcset="${poster(main.image)}" sizes="100vw" width="${main.image.width}" height="${main.image.height}" alt="" fetchpriority="high" decoding="async"></picture><video class="v16-hero__file" data-hero-file autoplay muted loop playsinline disablepictureinpicture preload="none"${heroWide?` data-src-wide="${esc(heroWide.video.src)}" data-type-wide="${esc(heroWide.video.type)}"`:''}${heroNarrow?` data-src-narrow="${esc(heroNarrow.video.src)}" data-type-narrow="${esc(heroNarrow.video.type)}"`:''}></video></div>`; };
// YouTube : sous-titres coupés (cc_load_policy=0), aucune commande ; le titre affiché par YouTube au lancement
// reste couvert par l'affiche (src/app.js). YouTube ne permet ni de retirer son titre ni de fixer la qualité.
const heroYoutube = () => `<div class="v16-hero__media v16-hero__media--video${heroNarrow?' has-narrow-file':''}" aria-hidden="true" data-hero-video data-video-src="https://www.youtube-nocookie.com/embed/${homeHeroVideo.id}?autoplay=1&mute=1&loop=1&playlist=${homeHeroVideo.id}&controls=0&rel=0&playsinline=1&iv_load_policy=3&cc_load_policy=0&disablekb=1&fs=0&vq=hd2160" data-video-title="${esc(homeHeroVideo.title)}">${heroNarrow?`<picture><source media="(max-width: 760px)" srcset="${BLANK}">`:''}<img class="v16-hero__poster" src="https://img.youtube.com/vi/${homeHeroVideo.id}/maxresdefault.jpg" data-fallback="https://img.youtube.com/vi/${homeHeroVideo.id}/hqdefault.jpg" alt="" fetchpriority="high" decoding="async">${heroNarrow?'</picture>':''}<div class="v16-hero__video-slot" data-hero-video-slot></div></div>`;
// Affiche de la bannière annoncée dès l'en-tête : elle se télécharge en même temps que la feuille de style (LCP).
const heroPreload = () => [[heroWide, heroNarrow ? '(min-width: 761px)' : ''], [heroNarrow, heroWide ? '(max-width: 760px)' : '(max-width: 760px)']].filter(([v])=>v).map(([v,media])=>`<link rel="preload" as="image" href="${esc(v.image.src)}" imagesrcset="${esc(v.image.srcSmall)} ${v.image.smallWidth}w, ${esc(v.image.src)} ${v.image.width}w" imagesizes="100vw"${media?` media="${media}"`:''} fetchpriority="high">\n`).join('');
const heroMedia = () => heroWide ? heroFileLayer() : heroNarrow ? heroYoutube() + heroFileLayer() : heroYoutube();


const workMoodSlides = [
  { poster:'https://images.unsplash.com/photo-1727451139462-cd34008cd50b?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'center', kicker:'Plateau', title:'Lumière & espace', credit:'Joshua Wann · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1709316132989-55ef2437b920?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'50% center', kicker:'Image', title:'Caméra & rig', credit:'Redd Francisco · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1740350631567-5d813fe78adf?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'58% center', kicker:'Tournage', title:'Cadre en situation', credit:'Alex Lam · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1779896412277-c4fd15c7a89c?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'48% center', kicker:'Post-production', title:'Montage & étalonnage', credit:'SanDisk · Unsplash' },
  { poster:'https://images.unsplash.com/photo-1772945492345-ee8d17e9a74b?auto=format&fit=crop&fm=jpg&q=72&w=1600', position:'center', kicker:'Moment', title:'Événement & émotion', credit:'Brooke Balentine · Unsplash' },
];

const expertiseTabs = [
  {
    key:'realisation', label:'Réalisation', index:'01',
    headline:'Prendre le film du concept au fichier final.',
    text:'Je peux garder une seule direction sur la préparation, le tournage, le montage et la livraison. Le bénéfice n’est pas de multiplier les tâches : c’est d’éviter que l’idée se dilue entre les étapes.',
    value:'Une continuité de vision, une vraie expérience terrain et des fichiers pensés pour leur support final.',
    href:'/services/#realisation'
  },
  {
    key:'direction', label:'Direction artistique', index:'02',
    headline:'Faire tenir l’univers jusque dans les détails.',
    text:'Je construis un langage visuel cohérent pour que l’image, la typographie, la couleur, le rythme et la matière donnent l’impression de venir de la même idée.',
    value:'Plus de cohérence, des choix créatifs plus simples et une identité plus reconnaissable.',
    href:'/services/#direction-artistique'
  },
  {
    key:'strategie', label:'Stratégie de marque', index:'03',
    headline:'Transformer l’analyse en décisions qui bougent.',
    text:'J’audite ce qui bloque, je priorise ce qui mérite d’être accéléré et je préfère exécuter, mesurer puis ajuster plutôt que laisser une stratégie attendre dans un document.',
    value:'Des priorités plus nettes, une mise en action plus rapide et une création reliée aux objectifs de l’entreprise.',
    href:'/services/#strategie-de-marque'
  }
];

const ecosystem = [
  {name:'Sony', role:'Boîtiers · optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', logoClass:'is-sony'},
  {name:'Sigma', role:'Optiques', logo:'https://upload.wikimedia.org/wikipedia/commons/8/8f/Sigma%27s_new_updated_logo_revealed%2C_February_2025.svg'},
  {name:'Adobe', role:'Post-production', logo:'https://upload.wikimedia.org/wikipedia/commons/f/fe/Adobe_Logo_Standard.svg'},
  {name:'NiSi', role:'Filtres', logo:'https://images.squarespace-cdn.com/content/v1/5abbd54bd274cb288dbee575/1580147234198-OZKG3ETPSV8IJXDIYUFM/NiSi-logo-2018-01%403x-1.png'},
  {name:'SmallRig', role:'Rig · lumière · accessoires', logo:'https://static.smallrig.com/mall/static/pc/common/svg/logo2023.svg', logoClass:'is-smallrig'},
  {name:'PGYTECH', role:'Workflow média', logo:'/assets/pgytech-logo.png', logoClass:'is-pgytech'}
];


// Accueil, « Work » : la sélection (bento, fiche) et les vidéos courtes (téléphone), avec le catalogue à portée de clic.
const homeCatalogNav = () => `<nav class="home-catalog motion-reveal" aria-label="Explorer le catalogue des réalisations"><a class="home-catalog__all" href="/work/">Voir tout le catalogue <sup>${catalogItems.length}</sup> <span aria-hidden="true">↗</span></a><ul>${Cat.LIST.filter(([k])=>catalogCount(k)).map(([k,label])=>`<li><a href="${catalogHref(k)}">${esc(label)} <sup>${catalogCount(k)}</sup></a></li>`).join('')}</ul></nav>`;

export function homePage(){
  const stats = site.proofStats;
  const first = bentoTiles[0];
  return head({
    title:'Nolan Ribeiro, vidéaste, photographe et réalisateur | Nolan Arc',
    description:'Nolan Ribeiro (Nolan Arc), vidéaste, photographe et réalisateur en Île-de-France : films de mariage dès 1 500 €, films de marque, direction artistique et stratégie.',
    extraSchema:faqSchema(site.faqs.home,'/'),
    path:'/', image:`${site.domain}/assets/og-home.png`, imageAlt:'Nolan Arc, halo elliptique noir, blanc et orange', imageWidth:'1024', imageHeight:'1024', bodyClass:`page-home page-fabrica page-v16${heroWide||heroNarrow?' has-hero-file':''}`, preload:heroPreload()
  }) + header('/') + `
  <main id="main-content" class="v16-home">
    <div class="hero-stack" data-hero-stack>
    <section class="v16-hero" aria-labelledby="v16-hero-title">
      ${heroMedia()}
      <h1 class="sr-only" id="v16-hero-title">Nolan Ribeiro, vidéaste, photographe et réalisateur. Nolan Arc : réalisation, direction artistique et stratégie de marque</h1>
      <div class="hero-copy">
        <p class="hero-roles">Réalisation, direction artistique et stratégie de marque</p>
      </div>
    </section>

    <section class="fab-projects v16-work-preview home-work" id="work-preview" aria-labelledby="home-work-title">
      <header class="fab-section-heading work-heading motion-reveal"><h2 id="home-work-title">Work<span class="title-dot">.</span></h2><p>Mes réalisations et projets</p></header>
      <div class="wk-selection home-selection" id="selection" data-work-views>
      <div class="wk-panel" data-work-panel="grid">
        <div class="bento-section">${bentoFocus(bentoTiles,{eager:false})}${bentoMore(moreTiles)}</div>
        <dl class="wk-fiche" data-fiche aria-live="polite" aria-label="Fiche du projet mis en avant">
          <div class="wk-fiche__title"><dt>Projet</dt><dd data-fiche-field="title">${esc(first.title)}</dd></div>
          ${ficheFields.map(([k,l])=>`<div data-fiche-row="${k}"${first[k]?'':' hidden'}><dt>${l}</dt><dd data-fiche-field="${k}">${esc(first[k]||'')}</dd></div>`).join('')}
        </dl>
      </div>
      </div>
      ${homeCatalogNav()}
    </section>
    </div>

    <section class="ig-section ig-stage home-social motion-reveal" id="social" aria-labelledby="ig-title">
      <header><h2 id="ig-title">Social media videos.</h2><a class="ig-info" href="/cookies/#instagram" aria-label="Informations sur le chargement des vidéos Instagram">i</a></header>
      <div class="phone-stack" data-phone-stack tabindex="0" role="group" aria-roledescription="carrousel" aria-label="Vidéos social media : glissez, utilisez les flèches ou cliquez sur une miniature" style="--sx:${workAssets.phone.screen[0]}%;--sy:${workAssets.phone.screen[1]}%;--sw:${workAssets.phone.screen[2]}%;--sh:${workAssets.phone.screen[3]}%;--pr:${workAssets.phone.w}/${workAssets.phone.h}">
        <div class="phone-stack__stage" data-stack-stage>
          <ul class="phone-stack__cards">${[...instagramPosts,...instagramPosts].map((p,i)=>{ const file=p.source==='file', thumb=socialThumb(p);
            return `<li class="ig-card ps-card" ${file?`data-video-file data-video-src="${esc(p.video.src)}" data-video-type="${esc(p.video.type)}"`:`data-instagram-post data-post-id="${esc(p.id)}"`} data-stack-card="${i}"${i>=instagramPosts.length?' data-stack-copy':''} data-post-title="${esc(p.title)}" aria-label="${i%instagramPosts.length+1} sur ${instagramPosts.length} : ${esc(p.title)}">
            <div class="ps-card__screen"><div class="ig-card__cover"${thumb?` data-lazy-bg style="--bg:linear-gradient(180deg,transparent 45%,rgba(8,7,6,.72)),${thumb.large?`image-set(url('${esc(thumb.src)}') 1x,url('${esc(thumb.large)}') 2x)`:`url('${esc(thumb.src)}')`}"`:''}><strong>${esc(p.title)}</strong>${p.kind?`<small>${esc(p.kind)}</small>`:''}${file?`<button type="button" class="ig-card__play" data-load-file aria-label="Lire la vidéo ${esc(p.title)}">▶</button>`:`<button type="button" class="ig-card__play" data-load-instagram aria-label="Lire la vidéo ${esc(p.title)} (chargée depuis Instagram)">▶</button>`}</div></div>
            ${file?'':`<a class="ig-card__link" href="https://www.instagram.com/p/${esc(p.id)}/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>`}
          </li>`; }).join('')}</ul>
          <img class="phone-stack__frame" src="/assets/work/phone.webp" alt="" width="${workAssets.phone.w}" height="${workAssets.phone.h}" loading="lazy" decoding="async">
        </div>
        <div class="phone-stack__nav"><button type="button" data-stack-prev aria-label="Vidéo précédente">←</button><span class="phone-stack__dots">${instagramPosts.map((p,i)=>`<button type="button" data-stack-dot="${i}" aria-label="Voir ${esc(p.title)}"></button>`).join('')}</span><button type="button" data-stack-next aria-label="Vidéo suivante">→</button></div>
      </div>
    </section>

    ${weddingWall()}

    ${focusText(site.manifesto)}

    <section class="dims" id="dimensions" aria-labelledby="dims-title">
      <header class="dims__head motion-reveal"><h2 id="dims-title">Trois dimensions.<br><em>Une seule vision.</em></h2><p>Partez de votre besoin.</p></header>
      <div class="dims__grid">
        ${expertiseTabs.map((x,i)=>`<a class="folder motion-reveal" href="${x.href}" style="--i:${i}">
          <span class="folder__art" aria-hidden="true"${folderArt(x.key)}></span>
          <span class="folder__front">
            <span class="folder__tab">${esc(x.label)}</span>
            <span class="folder__top"><strong>${esc(dimNeeds[x.key].need)}</strong><i aria-hidden="true">↗</i></span>
            <span class="folder__more">${esc(dimNeeds[x.key].text)}</span>
            <span class="folder__foot"><span>À partir de</span><b>${esc(dimNeeds[x.key].price)}</b></span>
          </span>
        </a>`).join('')}
      </div>
    </section>

    ${pricingSection({ workCount: catalogCount })}

    <section class="ring-section" id="journey" aria-labelledby="ring-title" data-ring>
      <div class="ring-section__head motion-reveal"><h2 id="ring-title">Comment je travaille.</h2></div>
      <div class="ring motion-reveal">
        <div class="ring__figure">
          <div class="orb" role="img" aria-label="Trois façons de travailler : comprendre, choisir, tenir le fil"><div class="orb__spin" data-orb-spin><span class="orb__glow"></span><span class="orb__body"></span><span class="orb__rim"></span></div><span class="ring__arc orb__dot" data-ring-arc="0" style="left:85.36%;top:14.64%"></span><span class="ring__arc orb__dot" data-ring-arc="1" style="left:62.94%;top:98.30%"></span><span class="ring__arc orb__dot" data-ring-arc="2" style="left:1.70%;top:37.06%"></span></div>
          <div class="ring__center" aria-hidden="true"><span data-ring-count>1</span><small data-ring-name>Comprendre</small></div>
        </div>
        <div class="ring__side">
          <ul class="ring__legend"><li><button type="button" data-ring-step="0" aria-pressed="true"><b aria-hidden="true"></b>Comprendre</button></li><li><button type="button" data-ring-step="1" aria-pressed="false"><b aria-hidden="true"></b>Choisir</button></li><li><button type="button" data-ring-step="2" aria-pressed="false"><b aria-hidden="true"></b>Tenir le fil</button></li></ul>
          <div class="ring__panels" aria-live="polite"><article class="ring__panel is-active" data-ring-panel="0"><small>Comprendre</small><h3>Qu’est-ce que le projet doit faire comprendre ou ressentir ?</h3><p>Je pars de l’effet recherché avant de choisir le format, le cadre ou le rythme.</p><p class="ring__get"><b>Vous avez</b> mes premières questions utiles, généralement sous 48 h.</p></article><article class="ring__panel" data-ring-panel="1"><small>Choisir</small><h3>Le cadre vient après.</h3><p>Lumière, mouvement, son, typographie ou montage servent cette direction.</p><p class="ring__get"><b>Vous avez</b> une direction claire, ce qu’il faut faire et dans quel ordre.</p></article><article class="ring__panel" data-ring-panel="2"><small>Tenir le fil</small><h3>La même idée, jusqu’au rendu.</h3><p>Je garde la direction entre réflexion, production et livraison pour éviter qu’elle se dilue.</p><p class="ring__get"><b>Vous avez</b> des fichiers pensés pour leur support final.</p></article></div>
        </div>
      </div>
    </section>

    <section class="v16-proof" aria-labelledby="v16-proof-title">
      <header class="v16-proof__head motion-reveal"><span class="fab-dot-label">Datas utiles</span><h2 id="v16-proof-title">Quelques chiffres pour situer ma pratique.</h2></header>
      ${animatedStats(stats,{theme:'light',layout:'grid',replay:true,animation:'blur'})}
    </section>

    <section class="brand-ecosystem v16-ecosystem v20-ecosystem--breather gear-section motion-reveal" aria-labelledby="brand-ecosystem-title">
      <h2 class="sr-only" id="brand-ecosystem-title">Des outils que je connais vraiment sur le terrain</h2>
      <figure class="gear-photo"><img src="/assets/gear/desk.webp" srcset="/assets/gear/desk-900.webp 900w, /assets/gear/desk.webp 1672w" sizes="100vw" width="1672" height="941" alt="Tablette Samsung et stylet, écouteurs, micro Sennheiser MKE 600, boîtier Sony Alpha 7 IV, objectif Sony G Master et stabilisateur DJI RS 3 Pro posés sur un tapis de découpe orange" loading="lazy" decoding="async"></figure>
      <div class="brand-ecosystem__head"><p>Le matériel avec lequel je conçois, je tourne et je monte. Rien n’est laissé au hasard, car chacun d’entre eux me donne les moyens d’exprimer ma vision.</p></div>
      <div class="brand-ecosystem__grid v16-logo-grid" aria-label="Marques et outils de production">${ecosystem.map(b=>`<div class="v16-logo-card ${b.logoClass||''}">${b.logo?`<span class="v16-logo-media"><img src="${b.logo}" alt="Logo ${b.name}" loading="lazy"><b aria-hidden="true">${b.name}</b></span>`:`<strong class="v16-wordmark">${b.wordmark}</strong>`}<small>${b.role}</small></div>`).join('')}</div>
    </section>

    <section class="v16-testimonials" id="retours">
      <header class="fab-section-heading motion-reveal"><div><h2>Avis.</h2></div><p>Ce qu’ils ont apprécié chez moi.</p></header>
      ${morphTestimonials(testimonials)}
    </section>

    ${faqAccordion(site.faqs.home,{id:'faq-home',eyebrow:'FAQ',title:'FAQ.',intro:'Au cas où une question vous passe par la tête.'})}

    <section class="v16-quick-contact final-cta" id="quick-contact">
      <form class="v16-quick-contact__form motion-reveal" data-contact-form action="https://formsubmit.co/ajax/${site.email}" method="POST">
        <input type="text" name="_honey" aria-label="Ne pas remplir" tabindex="-1" autocomplete="off" class="honeypot"><input type="hidden" name="_subject" value="Message rapide | nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/"><input type="hidden" name="_template" value="table">
        <small>Nolan.Arc</small><h2>Un message suffit.</h2>
        <label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label>
        <label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label>
        <label><span>Message</span><textarea required name="message" rows="4" placeholder="Ce que vous préparez, même si c’est encore flou."></textarea></label>
        <button type="submit" data-submit>Envoyer le message <span aria-hidden="true">↗</span></button><p class="form-status" role="status" data-form-status></p><p class="v16-contact-privacy">Vos informations servent uniquement à répondre à votre message. <a href="/confidentialite/">Confidentialité</a>.</p>
      </form>
      <div class="final-cta__copy motion-reveal"><h2>Parlons de votre projet.</h2><p>Un brief précis ou simplement une idée : les deux me vont.</p><ul><li><strong>Réponse généralement sous 48 h</strong><span>Je reviens avec les premières questions utiles.</span></li><li><strong>Une suite claire</strong><span>Si le projet colle, on définit ce qu’il faut faire et dans quel ordre.</span></li></ul><p class="final-cta__alt">Ou par e-mail : <a href="mailto:${site.email}">${site.email}</a></p></div>
    </section>
  </main>${contactDialog()}` + footer();
}

// Page Work : le catalogue. Filtres en haut (lien partageable ?categorie=…), toutes les réalisations, puis les tarifs.
export function workPage(){
  const listed = catalogItems.filter(it=>it.kind!=='photo').map((it,i)=>({ '@type':'ListItem', position:i+1, name:it.title,
    url: it.kind==='social' ? (it.post.source==='file' ? `${site.domain}/work/` : igUrl(it.post.id)) : !it.href ? `${site.domain}/work/` : /^https?:/.test(it.href) ? it.href : `${site.domain}${it.href}` }));
  const filters = [['', 'Tous'], ...Cat.LIST].map(([key,label])=>({ key, label, count: key ? catalogCount(key) : catalogItems.length }));
  const chips = cats => cats.map(k=>Cat.label(k)).join(', ');
  const meta = it => [it.type, it.client, it.year, it.count].filter(Boolean).map(esc).join(' · ');
  const img = (src, srcset, w, h, alt, sizes='(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw') => `<img src="${esc(src)}"${srcset?` srcset="${esc(srcset)}" sizes="${sizes}"`:''} alt="${esc(alt)}"${w&&h?` width="${w}" height="${h}"`:''} loading="lazy" decoding="async">`;
  const card = (it,i) => {
    let media='', action='', extra='', label='';
    if(it.kind==='project'){
      const m=it.image; media=img(m.image, m.srcset, m.width, m.height, m.alt);
      if(it.href){ const ext=/^https?:/.test(it.href); label=ext?'Voir le projet':(it.project.slug==='le-bol-den-face'?'Voir le film':'Voir le projet');
        action=`<a class="cat-card__hit" href="${esc(it.href)}"${ext?' target="_blank" rel="noopener noreferrer"':''}><span class="sr-only">${esc(label)} : ${esc(it.title)}${ext?' (nouvel onglet)':''}</span></a>`; label+=ext?' ↗':' →'; }
      else if(m.full){ label='Agrandir'; action=`<button type="button" class="cat-card__hit" data-cat-open="photo" data-src="${esc(m.full)}" data-alt="${esc(m.alt)}" data-title="${esc(it.title)}"><span class="sr-only">Agrandir : ${esc(it.title)}</span></button>`; }
    } else if(it.kind==='social'){
      const p=it.post, t=it.thumb, file=p.source==='file';
      media=t?img(t.src, t.large?`${t.src} ${t.width||540}w, ${t.large} ${(t.width||540)*2}w`:'', t.width, t.height, `${it.title}, vidéo verticale`):'';
      label='▶ Lire la vidéo';
      action=`<button type="button" class="cat-card__hit" data-cat-open="${file?'file':'instagram'}" ${file?`data-src="${esc(p.video.src)}" data-type="${esc(p.video.type)}"`:`data-post-id="${esc(p.id)}"`} data-title="${esc(it.title)}"><span class="sr-only">Lire la vidéo ${esc(it.title)}${file?'':' (chargée depuis Instagram)'}</span></button>`;
      if(!file) extra=`<a class="cat-card__ext" href="${esc(igUrl(p.id))}" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span><span class="sr-only"> : ${esc(it.title)} (nouvel onglet)</span></a>`;
    } else {
      const ph=it.ph; media=img(ph.srcSmall||ph.src, ph.srcSmall?`${ph.srcSmall} ${ph.smallWidth}w, ${ph.src} ${ph.width}w`:'', ph.smallWidth||ph.width, ph.smallHeight||ph.height, ph.alt);
      label='Agrandir'; action=`<button type="button" class="cat-card__hit" data-cat-open="photo" data-src="${esc(ph.src)}" data-alt="${esc(ph.alt)}" data-title="${esc([ph.series,ph.place,ph.year].filter(Boolean).join(' · ')||it.title)}"><span class="sr-only">Agrandir : ${esc(ph.alt)}</span></button>`;
    }
    const [rw,rh]=String(it.ratio).split('/').map(Number), wide=rw/rh>=1.2;
    return `<li class="cat-item${wide?' cat-item--wide':''}" data-cats="${esc(it.cats.join(' '))}" style="--i:${i}"><article class="cat-card cat-card--${it.kind}">
        <div class="cat-card__media${media?'':' is-blank'}" style="aspect-ratio:${esc(it.ratio)}">${media}</div>
        <div class="cat-card__body"><h3>${esc(it.title)}</h3>${meta(it)?`<p class="cat-card__meta">${meta(it)}</p>`:''}${it.cats.length?`<p class="cat-card__cats">${esc(chips(it.cats))}</p>`:''}${label?`<span class="cat-card__go" aria-hidden="true">${esc(label)}</span>`:''}</div>
        ${action}${extra}
      </article></li>`;
  };
  return head({title:'Réalisations : Nolan Ribeiro, vidéaste et photographe | Nolan Arc', description:'Toutes les réalisations de Nolan Ribeiro : films, vidéos pour les réseaux sociaux, photographie, mariages et direction artistique, à filtrer par catégorie.', path:'/work/', image:bolPosterAbs, imageWidth:'1280', imageHeight:'720', imageAlt:'Le bol d’en face, court métrage de Nolan Ribeiro', extraSchema:[{ '@type':'ItemList', '@id':`${site.domain}/work/#projets`, name:'Réalisations de Nolan Ribeiro', itemListElement:listed }, ...projectVideos(), ...igVideos(), { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Accueil', item:`${site.domain}/` },{ '@type':'ListItem', position:2, name:'Work', item:`${site.domain}/work/` }] }], bodyClass:'page-work page-fabrica page-v16'}) + header('/work/') + `<main id="main-content" class="fab-work-page v16-work-page wk-page">
    <section class="cat" id="catalogue" aria-labelledby="cat-title" data-catalog>
      <header class="cat__head"><h1 id="cat-title">Work<span class="title-dot">.</span></h1>
        <div class="cat-filters" role="group" aria-label="Filtrer les réalisations par catégorie, plusieurs choix possibles">${filters.map(f=>f.count||!f.key?`<a href="${catalogHref(f.key)}" role="button" data-cat-filter="${f.key}" aria-pressed="${f.key?'false':'true'}">${esc(f.label)}<sup>${f.count}</sup></a>`:`<span class="is-empty" data-cat-filter-empty="${f.key}" aria-disabled="true">${esc(f.label)}<sup>0</sup></span>`).join('')}</div>
      </header>
      <p class="cat__status" data-cat-status aria-live="polite">${catalogItems.length} réalisations</p>
      <ul class="cat-grid" data-cat-grid>${catalogItems.map(card).join('')}</ul>
      <p class="cat__empty" data-cat-empty hidden>Rien dans cette catégorie pour l’instant. <a href="/work/" data-cat-reset>Voir toutes les réalisations</a></p>
    </section>
    <dialog class="cat-viewer" data-cat-viewer aria-labelledby="cat-viewer-title"><div class="cat-viewer__inner"><div class="cat-viewer__stage" data-cat-stage></div><p class="cat-viewer__caption"><strong id="cat-viewer-title" data-cat-title></strong></p><button type="button" class="cat-viewer__close" data-cat-close aria-label="Fermer">×</button></div></dialog>
    ${pricingSection({ workCount: catalogCount })}
    <section class="wk-cta" id="contact-cta" aria-labelledby="wk-cta-title">
      <div class="wk-cta__copy motion-reveal"><h2 id="wk-cta-title">Un projet <em>en tête&nbsp;?</em></h2><p>Une idée, une date ou un problème à résoudre suffisent. ${esc(site.responseTime)}.</p><a class="wk-cta__alt" href="/services/">Voir les services <span aria-hidden="true">↗</span></a></div>
      <nav class="wk-cta__card motion-reveal" aria-label="Choisir le type de projet"><p class="wk-cta__q">Ça concerne quoi&nbsp;?</p>
        ${[['moment','Mariage / moment','Mariage, demande en mariage'],['brand','Marque','Contenu, direction artistique, stratégie'],['story','Film / récit','Film de marque, court métrage']].map(([intent,t,x])=>`<a href="/contact/?intent=${intent}"><strong>${esc(t)}</strong><small>${esc(x)}</small><b aria-hidden="true">↗</b></a>`).join('')}
        <a class="is-alt" href="/contact/"><strong>Autre</strong><small>Une idée à cadrer</small><b aria-hidden="true">↗</b></a>
      </nav>
    </section>
  </main>` + footer();
}

export function projectPage(){
  return head({title:`${bol.title} | court métrage de Nolan Ribeiro`, description:bol.summary, path:'/projet/le-bol-den-face/', extraSchema:[{ '@type':'Movie', '@id':`${site.domain}/projet/le-bol-den-face/#film`, name:bol.title, description:bol.summary, dateCreated:bol.year, genre:'Court métrage', inLanguage:'fr', countryOfOrigin:{ '@type':'Country', name:'France' }, image:bolPosterAbs, url:`${site.domain}/projet/le-bol-den-face/`, sameAs:'https://www.youtube.com/watch?v=GbeOQ-hgrtU', director:{ '@id':`${site.domain}/#nolan` }, author:{ '@id':`${site.domain}/#nolan` } }, ...[bolVideo()].filter(Boolean), { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Work', item:`${site.domain}/work/` },{ '@type':'ListItem', position:2, name:bol.title, item:`${site.domain}/projet/le-bol-den-face/` }] }], image:bolPosterAbs, imageWidth:'1280', imageHeight:'720', imageAlt:'Le bol d’en face, court métrage de Nolan Ribeiro', bodyClass:'page-project page-fabrica'}) + header('/projet/le-bol-den-face/') + `<main id="main-content" class="fab-project-page">
    <section class="fab-project-title motion-reveal"><a href="/work/">← Work</a><div><span>${bol.type} · ${bol.year}</span><h1>${bol.title}.</h1></div><p>${bol.summary}</p></section>
    ${lineToc([{id:'film',label:'Film'},{id:'story',label:'Intention'},{id:'next',label:'Suite'}])}
    <section class="fab-project-film" id="film"><div class="external-media project-player ambient-video-player" data-ambient-player data-external-video data-video-id="${bol.videoId}" data-video-title="${bol.title}" style="--poster:url('${bolPoster}')"><div class="external-media__gate"><small>Film · ${bol.year}</small><h2>Regarder<br>${bol.title}</h2><button class="hold-confirm" type="button" data-load-video><span>Lire sur YouTube</span><b aria-hidden="true">▶</b></button><p class="external-media__privacy">Ce geste autorise le chargement du lecteur YouTube et de ses traceurs pour cette lecture. <a href="/cookies/">En savoir plus</a>.</p></div></div><div class="fab-project-meta-head"><span>Fiche du film</span></div>${projectMeta(bol)}</section>
    ${gallerySection(bol, shownMedia(bol).filter(m=>m.key!==(bol.cover||'m-1')&&!(m.kind==='youtube'&&m.videoId===bol.videoId)))}
    <section class="fab-project-story" id="story"><header class="fab-section-heading motion-reveal"><div><h2>Intention.</h2></div><p>${bol.contextText}</p></header><div class="fab-project-story__statement motion-reveal"><span>Problème narratif</span><h3>${bol.intent}</h3></div><div class="fab-project-decisions">${bol.decisions.map((d,i)=>`<article class="motion-reveal"><span>0${i+1}</span><h3>${d.title}</h3><p>${d.text}</p></article>`).join('')}</div></section>
    <section class="fab-project-next" id="next"><header><small>Continuer</small><h2>Et ensuite ?</h2></header><a href="/work/"><span>01</span><strong>Voir les autres travaux.</strong><b>↗</b></a><a href="/services/"><span>02</span><strong>Voir comment j’interviens.</strong><b>↗</b></a><a href="${contactFor(bol)}"><span>03</span><strong>Parler du projet.</strong><b>↗</b></a></section>
  </main>` + footer();
}

// ---------------------------------------------------------------- Pages projet générées
// Même gabarit que « Le bol d’en face » : titre, média principal, fiche, galerie dans l’ordre de l’admin,
// intention si elle est écrite, suite. Les vidéos (YouTube, Instagram, fichier) ne se chargent qu’au clic.
const pImg = (img, alt, eager, sizes='(max-width: 700px) 100vw, 70vw') => `<img src="${esc(img.srcSmall)}" srcset="${esc(img.srcSmall)} ${img.smallWidth}w, ${esc(img.src)} ${img.width}w" sizes="${sizes}" alt="${esc(alt)}" width="${img.smallWidth}" height="${img.smallHeight}" loading="${eager?'eager':'lazy'}"${eager?' fetchpriority="high"':''} decoding="async">`;
const ratioStyle = m => { const w=m.img?.width||m.video?.width||16, h=m.img?.height||m.video?.height||9; return `--pm-ratio:${w}/${h}`; };
const mediaBlock = (p, m, i, hero=false) => {
  const label = m.kind==='photo' ? '' : m.kind==='youtube' ? 'Vidéo YouTube' : m.kind==='instagram' ? 'Vidéo Instagram' : 'Vidéo';
  const cap = m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : '';
  if (m.kind==='photo') return `<figure class="pm-item pm-item--photo motion-reveal" style="${ratioStyle(m)}">${pImg(m.img,m.alt,hero)}${cap}</figure>`;
  if (m.kind==='youtube') { const poster = m.img ? m.img.src : m.poster.src;
    return `<figure class="pm-item pm-item--video motion-reveal"><div class="external-media project-player ambient-video-player" data-ambient-player data-external-video data-video-id="${esc(m.videoId)}" data-video-title="${esc(m.caption?`${p.title}, ${m.caption}`:p.title)}" style="--poster:url('${esc(poster)}')"><div class="external-media__gate"><small>${esc(label)}</small><h2>${hero?`Regarder<br>${esc(p.title)}`:esc(m.caption||'Regarder la vidéo')}</h2><button class="hold-confirm" type="button" data-load-video aria-label="Lire sur YouTube : ${esc(m.caption||p.title)}"><span>Lire sur YouTube</span><b aria-hidden="true">▶</b></button><p class="external-media__privacy">Ce geste autorise le chargement du lecteur YouTube et de ses traceurs pour cette lecture. <a href="/cookies/">En savoir plus</a>.</p></div></div>${cap}</figure>`; }
  const file = m.kind==='file';
  const ratio = file ? `${m.video.width}/${m.video.height}` : `${m.img.width}/${m.img.height}`;
  return `<figure class="pm-item pm-item--social motion-reveal"><div class="ig-card pm-card" ${file?`data-video-file data-video-src="${esc(m.video.src)}" data-video-type="${esc(m.video.type)}"`:`data-instagram-post data-post-id="${esc(m.instagramId)}"`} data-post-title="${esc(m.caption||p.title)}" style="--ig-ratio:${ratio}"><div class="ig-card__cover" style="background-image:linear-gradient(180deg,transparent 45%,rgba(8,7,6,.72)),url('${esc(m.img.srcSmall)}')" role="img" aria-label="${esc(m.alt)}"><strong>${esc(m.caption||p.title)}</strong><button type="button" class="ig-card__play" ${file?'data-load-file':'data-load-instagram'} aria-label="Lire la vidéo ${esc(m.caption||p.title)}${file?'':' (chargée depuis Instagram)'}">▶</button></div>${file?'':`<a class="ig-card__link" href="https://www.instagram.com/p/${esc(m.instagramId)}/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>`}</div>${cap}</figure>`;
};
const absImage = m => m.img ? `${site.domain}${m.img.src}` : m.poster?.abs || '';
const gallerySection = (p, list) => list.length ? `<section class="pm-gallery" id="galerie" aria-labelledby="pm-gallery-title"><header class="fab-section-heading motion-reveal"><div><h2 id="pm-gallery-title">Galerie.</h2></div></header><div class="pm-grid" data-count="${Math.min(list.length,3)}">${list.map((m,i)=>mediaBlock(p,m,i)).join('')}</div></section>` : '';
const projectFiche = (p, count='') => `<dl class="project-meta-list">${[['Type',p.type],['Contexte',p.context],['Client',p.client],['Rôle',p.role],['Année',p.year],['Lieu',p.location],['Format',p.format],['Caméra',p.camera],['Médias',count],['Résultat',p.result]].filter(([,v])=>v).map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
function generatedProjectPage(p, path){
  const all = shownMedia(p), cover = all.find(m=>m.key===p.cover) || all[0], rest = all.filter(m=>m!==cover);
  const hasStory = p.contextText || p.intent || (p.decisions||[]).length;
  const image = absImage(cover) || `${site.domain}/assets/og-home.png`;
  // Description : le résumé, complété pour rester entre 70 et 170 caractères (moteurs de recherche).
  const facts = `${[p.type,p.year].filter(Boolean).join(', ')}${p.type||p.year?' : ':''}projet de Nolan Ribeiro, vidéaste et photographe.`;
  const base = p.summary || `${p.title}.`;
  const fit = t => t.length <= 170 ? t : `${t.slice(0,168).replace(/\s+\S*$/,'')}…`;
  const desc = fit(base.length < 100 ? `${base} ${facts}` : base);
  const videos = all.filter(m=>m.kind!=='photo').map(m=>videoSchema({ name:m.caption?`${p.title} : ${m.caption}`:p.title, description:desc, thumbnail:absImage(m), uploadDate:p.uploadDate, duration:m===cover?p.duration:'', embedUrl:m.kind==='youtube'?`https://www.youtube-nocookie.com/embed/${m.videoId}`:m.kind==='instagram'?`${igUrl(m.instagramId)}embed/`:undefined, url:m.kind==='youtube'?`https://www.youtube.com/watch?v=${m.videoId}`:m.kind==='instagram'?igUrl(m.instagramId):`${site.domain}${path}` })).filter(Boolean)
    .map((v,i)=>{ const m=all.filter(x=>x.kind!=='photo')[i]; return m?.kind==='file' ? { ...v, contentUrl:`${site.domain}${m.video.src}` } : v; });
  const work = { '@type':'CreativeWork', '@id':`${site.domain}${path}#projet`, name:p.title, description:desc, url:`${site.domain}${path}`, ...(p.year?{ dateCreated:p.year }:{}), ...(p.type?{ genre:p.type }:{}), inLanguage:'fr', image:all.map(absImage).filter(Boolean).slice(0,12), author:{ '@id':`${site.domain}/#nolan` }, creator:{ '@id':`${site.domain}/#nolan` } };
  return head({ title:`${p.title} | ${p.type ? `${p.type.toLowerCase()} de ` : 'projet de '}Nolan Ribeiro`, description:desc, path, image, imageWidth:String(cover?.img?.width||1280), imageHeight:String(cover?.img?.height||720), imageAlt:cover?.alt||p.title, extraSchema:[work, ...videos, { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem', position:1, name:'Work', item:`${site.domain}/work/` },{ '@type':'ListItem', position:2, name:p.title, item:`${site.domain}${path}` }] }], bodyClass:'page-project page-fabrica' }) + header(path) + `<main id="main-content" class="fab-project-page pm-page">
    <section class="fab-project-title motion-reveal"><a href="/work/">← Work</a><div><span>${esc([p.type,p.year].filter(Boolean).join(' · ')||'Projet')}</span><h1>${esc(p.title)}.</h1></div>${p.summary?`<p>${esc(p.summary)}</p>`:''}</section>
    ${lineToc([{id:'media',label:'Projet'},...(rest.length?[{id:'galerie',label:'Galerie'}]:[]),...(hasStory?[{id:'story',label:'Intention'}]:[]),{id:'next',label:'Suite'}])}
    <section class="fab-project-film pm-hero" id="media">${mediaBlock(p,cover,0,true)}<div class="fab-project-meta-head"><span>Fiche du projet</span></div>${projectFiche(p, all.length>1?mediaCount(all):'')}</section>
    ${gallerySection(p, rest)}
    ${hasStory?`<section class="fab-project-story" id="story"><header class="fab-section-heading motion-reveal"><div><h2>Intention.</h2></div>${p.contextText?`<p>${esc(p.contextText)}</p>`:''}</header>${p.intent?`<div class="fab-project-story__statement motion-reveal"><span>Intention</span><h3>${esc(p.intent)}</h3></div>`:''}${(p.decisions||[]).length?`<div class="fab-project-decisions">${p.decisions.map((d,i)=>`<article class="motion-reveal"><span>0${i+1}</span><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></article>`).join('')}</div>`:''}</section>`:''}
    <section class="fab-project-next" id="next"><header><small>Continuer</small><h2>Et ensuite ?</h2></header><a href="/work/"><span>01</span><strong>Voir les autres travaux.</strong><b>↗</b></a><a href="/services/"><span>02</span><strong>Voir comment j’interviens.</strong><b>↗</b></a><a href="${contactFor(p)}"><span>03</span><strong>Parler du projet.</strong><b>↗</b></a></section>
  </main>` + footer();
}
/** Projets visibles du catalogue, avec leur adresse réelle (page projet, lien externe, sinon le catalogue filtré) : llms.txt. */
export function projectLinks(){
  return featured.map(p=>{ const href=projectHref(p), cats=Cat.project(p);
    return { title:p.title, year:p.year||'', type:p.type||'', summary:p.summary||'', client:p.client||'', url: !href ? `${site.domain}${catalogHref(cats[0]||'')}` : /^https?:/.test(href) ? href : `${site.domain}${href}` }; });
}
/** Catalogue (llms.txt) : catégories non vides et leur adresse. */
export const catalogSummary = () => Cat.LIST.filter(([k])=>catalogCount(k)).map(([k,label])=>({ label, count:catalogCount(k), url:`${site.domain}${catalogHref(k)}` }));
/** Pages projet à générer au build : [chemin du fichier, HTML, adresse publique]. */
export function projectPages(){
  return projects.filter(p=>p.visible&&p.slug!=='le-bol-den-face'&&pageOf.get(p.slug)&&shownMedia(p).length).map(p=>{ const path=pageOf.get(p.slug); return [`${path.slice(1)}index.html`, generatedProjectPage(p,path), path]; });
}

// Page Services : problème → solution → preuve → offre → contact, une section par besoin.
// Offres et prix : uniquement content/pricing.mjs (ceux de l'accueil). Preuves : réalisations réelles du catalogue
// Work (mêmes données que l'admin) ; sans média, l'emplacement n'est pas affiché. Les ancres #realisation,
// #mariage, #demande-en-mariage, #direction-artistique et #strategie-de-marque restent : l'accueil y renvoie.
const offerOf = key => pricing.find(o=>o.key===key);
const svcNeeds = [
  { id:'realisation', name:'Réalisation', need:dimNeeds.realisation.need, text:dimNeeds.realisation.text,
    get:['Une seule direction, de la préparation à la livraison','Le tournage seul ou le montage seul, si c’est ce qu’il vous faut','Des fichiers pensés pour leur support final'],
    offers:['film','contenu'], tones:['dark','red'], work:['video','reseaux-sociaux'] },
  { id:'mariage', name:'Mariage', need:'Un jour qui ne se rejoue pas.', text:`${offerOf('mariage').text} ${offerOf('demande').text}`,
    get:pricingDetails.mariage.includes.concat(pricingDetails.mariage.deliverables||[]),
    offers:['mariage','demande'], tones:['ivory','dark'], work:['mariage'] },
  { id:'direction-artistique', name:'Direction artistique', need:dimNeeds.direction.need, text:dimNeeds.direction.text,
    get:['La direction visuelle, la cohérence de marque ou un système créatif que votre équipe applique ensuite','Sans réalisation vidéo, si vous le souhaitez','Des choix créatifs plus simples, une identité qui se reconnaît'],
    offers:['direction'], tones:['ivory'], work:['direction-artistique'] },
  { id:'strategie-de-marque', name:'Stratégie de marque', need:dimNeeds.strategie.need, text:dimNeeds.strategie.text,
    get:pricingDetails.strategie.includes.concat('Un accompagnement plus large, chiffré sur devis'),
    offers:['strategie'], tones:['red'], work:[] },
];
// Miniature réelle d'une réalisation du catalogue (projet, vidéo courte ou photo), sinon null.
const proofThumb = it => {
  if(it.kind==='project'&&it.image?.image) return { src:it.image.image, srcset:it.image.srcset||'', alt:it.image.alt||it.title, w:it.image.width, h:it.image.height };
  if(it.kind==='social'&&it.thumb) return { src:it.thumb.src, srcset:it.thumb.large?`${it.thumb.src} ${it.thumb.width||540}w, ${it.thumb.large} ${(it.thumb.width||540)*2}w`:'', alt:`${it.title}, vidéo verticale`, w:it.thumb.width, h:it.thumb.height };
  if(it.kind==='photo') { const ph=it.ph; return { src:ph.srcSmall||ph.src, srcset:ph.srcSmall?`${ph.srcSmall} ${ph.smallWidth}w, ${ph.src} ${ph.width}w`:'', alt:ph.alt||it.title, w:ph.smallWidth||ph.width, h:ph.smallHeight||ph.height }; }
  return null;
};
const svcProof = cats => {
  const seen=new Set(), thumbs=[];
  for(const c of cats) for(const it of catalogItems.filter(x=>x.cats.includes(c))){ const t=proofThumb(it); if(t&&!seen.has(t.src)&&thumbs.length<3){ seen.add(t.src); thumbs.push({ ...t, title:it.title, cat:c }); } }
  const links=cats.filter(c=>catalogCount(c));
  if(!thumbs.length&&!links.length) return '';
  return `<div class="svc-proof">
          ${thumbs.length?`<ul class="svc-proof__grid">${thumbs.map(t=>`<li><a href="${catalogHref(t.cat)}"><img src="${esc(t.src)}"${t.srcset?` srcset="${esc(t.srcset)}" sizes="(max-width: 700px) 33vw, 240px"`:''} alt="${esc(t.alt)}"${t.w&&t.h?` width="${t.w}" height="${t.h}"`:''} loading="lazy" decoding="async"><span>${esc(t.title)}</span></a></li>`).join('')}</ul>`:''}
          <p class="svc-proof__links">${links.map(c=>`<a href="${catalogHref(c)}">Voir les réalisations ${esc(Cat.label(c))} <sup>${catalogCount(c)}</sup> <span aria-hidden="true">↗</span></a>`).join('')}</p>
        </div>`;
};
// Carte d'offre : le composant des « Trois dimensions » de l'accueil (dossier), prix repris tels quels.
const svcOffer = (key, i, tone='dark') => { const o=offerOf(key), id=key==='demande'?'demande-en-mariage':`offre-${key}`;
  return `<a class="folder svc-offer svc-offer--${tone}" id="${id}" href="${esc(pricingHref(o))}" style="--i:${i}">
            <span class="folder__art" aria-hidden="true"></span>
            <span class="folder__front">
              <span class="folder__tab">${esc(o.tag)}</span>
              <span class="folder__top"><strong>${esc(o.title)}</strong><i aria-hidden="true">↗</i></span>
              <span class="folder__more">${esc(o.text)}</span>
              <span class="folder__foot"><span>${o.from?'À partir de':esc(o.cta)}</span><b>${esc(o.price)}</b></span>
            </span>
          </a>`; };

export function servicesPage(){
  return head({title:'Vidéaste mariage et film de marque : tarifs | Nolan Arc',description:'Nolan Ribeiro, vidéaste : film de mariage dès 1 500 €, demande dès 250 €, contenu et direction artistique dès 200 €, stratégie de marque à 89 € / h.',path:'/services/',extraSchema:faqSchema(site.faqs.services,'/services/'),bodyClass:'page-services page-fabrica page-v16'}) + header('/services/') + `<main id="main-content" class="v16-services-page svc-page">
    <section class="svc-hero" aria-labelledby="svc-title">
      <h1 id="svc-title" class="motion-reveal">Services<span class="title-dot">.</span></h1>
      <p class="svc-hero__lead motion-reveal">Un film, un mariage, un univers, une marque. Partez de ce que vous voulez obtenir : le prix de départ est affiché, le reste se cadre en un message.</p>
      <nav class="svc-index motion-reveal" aria-label="Choisir votre besoin"><ul>${svcNeeds.map(n=>`<li><a href="#${n.id}"><small>${esc(n.name)}</small><strong>${esc(n.need)}</strong><i aria-hidden="true">↓</i></a></li>`).join('')}</ul></nav>
    </section>
    ${svcNeeds.map((n,k)=>`<section class="svc-need" id="${n.id}" aria-labelledby="svc-${n.id}-title">
      <header class="svc-need__head motion-reveal">
        <h2 id="svc-${n.id}-title">${esc(n.name)}.<br><em>${esc(n.need)}</em></h2>
        <p>${esc(n.text)}</p>
      </header>
      <div class="svc-need__body">
        <div class="svc-get motion-reveal"><h3>Vous obtenez</h3><ul>${n.get.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>
        <div class="svc-offers" data-count="${n.offers.length}">${n.offers.map((key,i)=>svcOffer(key,i,n.tones[i])).join('')}</div>
      </div>
      ${svcProof(n.work)}
    </section>`).join('')}
    <div class="price-details__common svc-common"><p class="price-details__common-title">Pour toutes les offres</p><ul>${pricingCommon.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a href="/cgv/">Conditions générales de vente <span aria-hidden="true">↗</span></a></div>
    <section class="v16-combined-expertise svc-together motion-reveal" aria-labelledby="svc-together-title"><h2 id="svc-together-title">Même quand vous n’en prenez qu’une,<br><em>les autres restent dans la pièce.</em></h2><div><article><strong>Un film de marque</strong><p>La stratégie définit ce qu’il doit accomplir, la direction artistique ce à quoi il doit ressembler, la réalisation comment le produire.</p></article><article><strong>Une direction artistique</strong><p>Elle tient compte de ce qui sera faisable sur un plateau et au montage.</p></article><article><strong>Une stratégie</strong><p>Elle reste reliée aux contenus que vous devrez réellement produire ensuite.</p></article></div></section>
    ${testimonials.length?`<section class="v16-testimonials" id="retours" aria-labelledby="svc-avis-title"><header class="fab-section-heading motion-reveal"><div><h2 id="svc-avis-title">Avis.</h2></div><p>Ce qu’ils ont apprécié chez moi.</p></header>${morphTestimonials(testimonials)}</section>`:''}
    ${faqAccordion(site.faqs.services,{id:'faq-services',eyebrow:'FAQ Services',title:'FAQ.',intro:'Ce qu’on me demande avant de commencer.'})}
    <section class="wk-cta svc-cta" id="contact-cta" aria-labelledby="svc-cta-title">
      <div class="wk-cta__copy motion-reveal"><h2 id="svc-cta-title">Un projet <em>en tête&nbsp;?</em></h2><p>Une idée, une date ou un problème à résoudre suffisent. ${esc(site.responseTime)}. Si le projet colle, on fixe le périmètre, les livrables, le calendrier, le prix et les droits avant de démarrer.</p><a class="wk-cta__alt" href="/work/">Voir les réalisations <span aria-hidden="true">↗</span></a></div>
      <nav class="wk-cta__card motion-reveal" aria-label="Choisir le type de projet"><p class="wk-cta__q">Ça concerne quoi&nbsp;?</p>
        ${[['moment','Mariage / moment','Mariage, demande en mariage'],['brand','Marque','Contenu, direction artistique, stratégie'],['story','Film / récit','Film de marque, court métrage']].map(([intent,t,x])=>`<a href="/contact/?intent=${intent}"><strong>${esc(t)}</strong><small>${esc(x)}</small><b aria-hidden="true">↗</b></a>`).join('')}
        <a class="is-alt" href="/contact/"><strong>Autre</strong><small>Une idée à cadrer</small><b aria-hidden="true">↗</b></a>
      </nav>
    </section>
  </main>` + footer();
}

export function aboutPage(){
  return head({title:'À propos de Nolan Ribeiro, vidéaste et photographe | Nolan Arc',description:'Nolan Ribeiro, vidéaste, photographe, réalisateur et directeur artistique derrière Nolan Arc : parcours, pratique de la vidéo depuis 2022 et manière de travailler.',path:'/a-propos/',extraSchema:[{ '@type':'AboutPage', '@id':`${site.domain}/a-propos/#about`, url:`${site.domain}/a-propos/`, mainEntity:{ '@id':`${site.domain}/#nolan` } }],bodyClass:'page-about page-fabrica page-v17'}) + header('/a-propos/') + `<main id="main-content" class="v17-about-page">
    <section class="v17-about-hero" id="nolan">
      <figure class="v17-about-portrait"><img src="/assets/nolan-portrait.jpg" alt="Portrait de Nolan Ribeiro" data-nolan-portrait></figure>
      <div class="v17-about-hero__copy"><span class="fab-dot-label">Nolan Ribeiro · Nolan Arc</span><h1>Je ne suis pas arrivé à ces trois disciplines <em>par plan de carrière.</em></h1><p>J’ai surtout continué à suivre les problèmes que j’avais envie de résoudre : raconter mieux, rendre un univers cohérent, puis comprendre pourquoi certaines idées fonctionnent réellement.</p><p>Je m’appelle Nolan Ribeiro, je suis vidéaste, photographe et réalisateur, et Nolan Arc est le nom sous lequel je travaille.</p><div class="v17-about-hero__links"><a href="/work/">Voir le Work ↗</a><a href="/contact/">Parler d’un projet ↗</a></div></div>
    </section>

    <section class="v17-about-origin motion-reveal"><span class="fab-dot-label">Depuis 2022</span><div><h2>La vidéo m’a appris à penser avant, pendant et après l’image.</h2><p>Plus de cinquante vidéos plus tard, ce que je retiens n’est pas seulement la technique. C’est la capacité à anticiper ce qu’il faudra obtenir sur le terrain, à décider vite quand le réel ne suit pas le plan et à garder assez de matière pour réécrire proprement au montage.</p></div></section>

    <section class="v17-about-turn motion-reveal"><div class="v17-about-turn__statement"><small>Le tournant</small><h2>À force de produire des images, j’ai commencé à regarder ce qu’il y avait <em>autour.</em></h2></div><div class="v17-about-turn__copy"><p>Pourquoi une marque paraît cohérente avant même qu’on lise son nom ? Pourquoi deux contenus techniquement corrects ne racontent pas la même chose ? Pourquoi certaines idées avancent vite alors que d’autres restent bloquées dans une présentation ?</p><p>C’est ce qui m’a amené vers la direction artistique puis la stratégie : pas pour empiler des titres, mais parce que ces questions apparaissaient déjà dans mes projets.</p></div></section>

    <section class="v17-about-lenses"><header class="fab-section-heading motion-reveal"><div><h2>Trois angles.<br><em>La même personne.</em></h2></div><p>Les prestations sont détaillées dans Services. Ici, l’important est ce que ces trois regards changent dans ma manière d’aborder un sujet.</p></header><div class="v17-about-lenses__grid">
      <article class="motion-reveal"><span>01</span><h3>Construire</h3><p>J’aime partir d’une idée et lui donner une forme réelle, avec les contraintes du terrain plutôt qu’en restant au stade du concept.</p></article>
      <article class="motion-reveal"><span>02</span><h3>Relier</h3><p>Je remarque vite quand une image, un ton, une couleur ou un support ne semble plus appartenir au même univers.</p></article>
      <article class="motion-reveal"><span>03</span><h3>Décider</h3><p>Quand la direction est suffisamment claire, je préfère avancer, mesurer puis corriger plutôt que prolonger une réflexion qui n’ajoute plus de valeur.</p></article>
    </div></section>

    <section class="v17-about-curiosity motion-reveal"><div><span class="fab-dot-label">Curieux par nature</span><h2>Entrer dans un nouvel univers est souvent la partie qui m’intéresse le plus.</h2></div><div class="v17-about-curiosity__bento"><article><strong>Je creuse vite.</strong><p>Quand un sujet m’intéresse, comprendre son vocabulaire, ses références et ses contraintes ne ressemble pas à une corvée.</p></article><article><strong>Je change d’échelle.</strong><p>Je peux regarder un détail de cadre puis revenir à la perception globale d’une marque ou à son objectif business.</p></article><article><strong>Je reste concret.</strong><p>Une idée devient intéressante lorsqu’on sait comment la produire, où la diffuser et ce qu’elle doit améliorer.</p></article><article><strong>Je m’adapte sans lisser.</strong><p>Comprendre un nouvel univers ne veut pas dire le rendre générique : l’objectif est justement d’identifier ce qui lui appartient.</p></article></div></section>

    <section class="v17-about-workstyle motion-reveal"><span class="fab-dot-label">Travailler avec moi</span><h2>Direct quand il faut trancher.<br>Autonome quand il faut avancer.</h2><div><p>Je peux rejoindre un projet déjà lancé, travailler avec une équipe existante ou prendre davantage de responsabilités quand il faut garder une cohérence de bout en bout.</p><p>Je n’ai pas besoin qu’un projet soit parfaitement défini pour commencer à réfléchir. En revanche, une fois la direction choisie, j’aime que les décisions deviennent rapidement des actions.</p></div></section>

    ${testimonials[0]?`<section class="v17-about-proof motion-reveal"><small>Vu de l’extérieur</small><blockquote>« ${esc(testimonials[0].quote)} »</blockquote><span>${esc([testimonials[0].name,testimonials[0].role].filter(Boolean).join(' · '))}</span></section>`:''}
    <section class="fab-contact-band motion-reveal"><div><small>La suite dépend de ce que vous cherchez</small><h2>Regarder ou parler.</h2></div><p>Le Work montre ce que je produis. Services précise ce que je peux prendre en charge. Le contact sert à voir ce que cela peut devenir dans votre contexte.</p><div class="fab-contact-band__actions"><a href="/work/">Voir le Work <span>↗</span></a><a href="/services/">Voir les Services <span>↗</span></a><a href="/contact/">Parler du projet <span>↗</span></a></div></section>
  </main>` + footer();
}

export function journalPage(){
  return head({title:'Journal de tournage : préparation, cadrage, montage | Nolan Arc',description:'Notes pratiques de Nolan Ribeiro (Nolan Arc), vidéaste, photographe et réalisateur, sur la préparation, le cadrage et le montage d’un film.',path:'/journal/',bodyClass:'page-journal'}) + header('/journal/') + `<main id="main-content">
    <section class="journal-hero motion-reveal"><span class="eyebrow">Journal</span><h1>Ce que je regarde<br><em>avant d’appuyer sur REC.</em></h1><p>Préparation, cadrage, rythme : des décisions concrètes que j’utilise pour éviter de tourner ou monter au hasard.</p></section>
    <section class="journal-stack">${notes.map((n,i)=>`<article id="${n.slug}" class="motion-reveal"><span>0${i+1}</span><small>${n.category} · ${n.date}</small><h2>${n.title}</h2><p>${n.excerpt}</p></article>`).join('')}</section>
    <section class="journal-bridge motion-reveal"><span class="eyebrow">Dans un vrai projet</span><div><h2>Voir ces choix appliqués dans un film.</h2><a class="text-link" href="/projet/le-bol-den-face/">Le bol d’en face <span>↗</span></a></div></section>
  </main>` + footer();
}

// Contact : quatre portes d'entrée (formulaire, email, Instagram, appel) et une réassurance tirée des faits publiés ailleurs.
const contactIcons = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="m4.5 7.5 6.3 5a2 2 0 0 0 2.4 0l6.3-5"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="is-dot" cx="17.1" cy="6.9" r=".9"/></svg>',
  call: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 12.5v2.6l1.8 1.1"/></svg>',
};
const igHandle = site.instagram.split('/').filter(Boolean).pop();
const contactIntents = [
  { key:'moment', label:'Mariage / moment', hint:'Mariage, demande en mariage' },
  { key:'brand', label:'Marque', hint:'Contenu, direction artistique, stratégie' },
  { key:'story', label:'Film / récit', hint:'Film de marque, court métrage' },
  { key:'other', label:'Autre', hint:'Une idée à cadrer' },
];

export function contactPage(){
  const offers = Object.fromEntries([...pricing,...contactTopics].map(o=>[o.key,{title:o.title,intent:o.intent,price:o.price?`${o.from?'à partir de ':''}${o.price}`:'',message:pricingMessage(o)}]));
  const priceMarks = pricing.filter(o=>/€/.test(o.price)).slice(0,4).map(o=>`<li><span>${esc(o.tag)}</span><b>${o.from?'dès ':''}${esc(o.price)}</b></li>`).join('');
  const quote = testimonials[0];
  const igMessage = 'Salut Nolan, je viens de ton site nolanarc.com. Je voudrais te parler d’un projet : ';
  const mailSubject = encodeURIComponent('Un projet | nolanarc.com');
  return head({title:'Contacter Nolan Ribeiro, vidéaste et photographe | Nolan Arc',description:'Écrire à Nolan Ribeiro, vidéaste et photographe, pour un film de mariage, un film de marque, une direction artistique ou une stratégie. Réponse généralement sous 48 h.',path:'/contact/',extraSchema:[{ '@type':'ContactPage', '@id':`${site.domain}/contact/#contact`, url:`${site.domain}/contact/`, about:{ '@id':`${site.domain}/#business` } },...faqSchema(site.faqs.contact,'/contact/')],bodyClass:'page-contact page-fabrica page-v17'}) + header('/contact/') + `<main id="main-content" class="contact-page v17-contact-page cx-page">
    <section class="contact-composer cx-composer" aria-labelledby="cx-title">
      <div class="cx-bg" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="contact-composer__intro cx-intro">
        <span class="eyebrow">Contact</span>
        <h1 id="cx-title">Dites-moi simplement <em>ce que vous préparez.</em></h1>
        <p>Pas besoin d’un brief parfait. Une idée, une date ou un problème à résoudre suffisent pour commencer.</p>
        <ul class="cx-promise" aria-label="Ce qui se passe ensuite">
          <li><b>48 h</b><span>ouvrées pour vous répondre</span></li>
          <li><b>1</b><span>seul interlocuteur, moi</span></li>
          <li><b>0</b><span>brief à préparer</span></li>
        </ul>
      </div>
      <nav class="cx-channels" aria-label="Autres moyens de me contacter">
        <p class="cx-channels__label">Pas envie d’un formulaire ?</p>
        <a class="cx-channel cx-glass" href="mailto:${site.email}?subject=${mailSubject}" data-copy-email="${esc(site.email)}"><i>${contactIcons.mail}</i><span><strong>Email</strong><small data-channel-note>${esc(site.email)}</small></span></a>
        <a class="cx-channel cx-glass" href="https://ig.me/m/${esc(igHandle)}" target="_blank" rel="noreferrer" data-copy-ig="${esc(igMessage)}"><i>${contactIcons.instagram}</i><span><strong>Instagram</strong><small data-channel-note>Message privé à @${esc(igHandle)}</small></span></a>
        <a class="cx-channel cx-glass" href="${site.calendly}" target="_blank" rel="noreferrer"><i>${contactIcons.call}</i><span><strong>Appel<span class="cx-long"> de</span> 30 min</strong><small>Choisir un créneau</small></span></a>
        <p class="cx-channels__status" role="status" aria-live="polite" data-channel-status></p>
      </nav>
      <form class="contact-form contact-form--composer cx-form cx-glass" data-contact-form data-offers="${esc(JSON.stringify(offers))}" action="https://formsubmit.co/ajax/${site.email}" method="POST" aria-labelledby="cx-form-title">
        <input type="text" name="_honey" aria-label="Ne pas remplir" tabindex="-1" autocomplete="off" class="honeypot">
        <input type="hidden" name="_subject" value="Nouveau projet | nolanarc.com"><input type="hidden" name="_url" value="https://nolanarc.com/contact/"><input type="hidden" name="_template" value="table">
        <h2 class="cx-form__hook" id="cx-form-title">Plus court qu’un générique de fin.</h2>
        <fieldset class="cx-step contact-intent-card"><legend>Ça concerne quoi ?</legend>
          <div class="form-intent cx-intents">${contactIntents.map(i=>`<button type="button" data-form-intent="${i.key}" aria-pressed="false"><strong>${esc(i.label)}</strong><small>${esc(i.hint)}</small></button>`).join('')}</div>
          <input type="hidden" name="type_de_projet" data-intent-input value="Autre"><input type="hidden" name="offre" data-offer-input value="">
          <p class="cx-offer" data-offer-chip hidden></p>
        </fieldset>
        <fieldset class="cx-step cx-step--message"><legend class="cx-visually-hidden">Votre projet</legend>
          <label class="contact-message contact-message--composer"><span class="cx-visually-hidden">Votre message</span><textarea required name="message" rows="5" aria-describedby="cx-message-hint" placeholder="L’idée, la date si elle existe, le lieu et ce que vous attendez de moi."></textarea></label>
          <p class="cx-hint" id="cx-message-hint" data-message-hint>Quelques lignes suffisent. On précise le reste ensemble.</p>
        </fieldset>
        <fieldset class="cx-step"><legend class="cx-visually-hidden">Pour vous répondre</legend>
          <div class="contact-fields contact-fields--identity"><label><span>Nom</span><input required name="nom" autocomplete="name" placeholder="Votre nom"></label><label><span>Email</span><input required type="email" name="email" autocomplete="email" placeholder="vous@exemple.com"></label></div>
          <details class="contact-more contact-more--composer"><summary>Budget / entreprise <span>optionnel</span></summary><div class="contact-fields"><label><span>Entreprise</span><input name="entreprise" autocomplete="organization" placeholder="Nom de l’entreprise"></label><label><span>Budget</span><select name="budget"><option value="">Pas encore défini</option><option>&lt; 1 500 €</option><option>1 500 à 3 000 €</option><option>3 000 à 7 500 €</option><option>7 500 € +</option></select></label></div></details>
        </fieldset>
        <div class="contact-submit contact-submit--composer cx-submit"><button class="button button--light" type="submit" data-submit>Envoyer le projet <span aria-hidden="true">↗</span></button><p class="form-privacy">Vos informations servent uniquement à répondre à votre demande. <a href="/confidentialite/">Confidentialité</a>.</p><div class="form-status" role="status" aria-live="polite" data-form-status></div></div>
      </form>
    </section>
    <section class="cx-proof" aria-labelledby="cx-proof-title">
      <header class="cx-proof__head"><span class="eyebrow">Avant d’écrire</span><h2 id="cx-proof-title" class="cx-proof__title">Les infos utiles.</h2></header>
      <article class="cx-proof__card"><small>Les prix</small><ul class="cx-prices">${priceMarks}</ul><p>Le reste se fixe au devis, après un premier échange. <a href="/#pricing">Voir les offres</a></p></article>
      <article class="cx-proof__card"><small>Le délai</small><p class="cx-proof__big">48 h</p><p>Je lis chaque message moi-même et je réponds sous 48 h ouvrées, avec les premières questions utiles.</p></article>
      <article class="cx-proof__card cx-proof__quote"><small>Un retour</small><blockquote>« ${esc(quote.quote)} »</blockquote><footer><strong>${esc(quote.name)}</strong>${quote.role?`<span>${esc(quote.role)}</span>`:''}</footer><button type="button" class="morph-hit" data-morph-open="morph-panel-0" aria-haspopup="dialog" aria-label="Ouvrir le retour de ${esc(quote.name)}"></button></article>
    </section>
    ${morphPanel(quote,0)}
    ${faqAccordion(site.faqs.contact,{id:'faq-contact',eyebrow:'FAQ Contact',title:'FAQ.',intro:'Ce qu’il est utile de savoir avant d’envoyer votre message.'})}
  </main>${contactDialog()}` + footer();
}

// Pages légales : une structure commune (fiche « En bref », sommaire, sections ancrées, contact) pour des textes
// lisibles, vérifiables et imprimables. Le contenu juridique reste dans content/legal.mjs quand il dépend de Nolan.
const legalPagesNav = [['/mentions-legales/','Mentions légales'],['/confidentialite/','Confidentialité'],['/cgv/','CGV'],['/cookies/','Cookies'],['/retractation/','Rétractation']];
const legalUpdated = '24 novembre 2026';
const legalValue = (value, fallback='À compléter avant publication') => value ? esc(value) : `<strong class="legal-missing">${fallback}</strong>`;
const legalCompany = () => `${esc(site.legalName)}${legal.businessForm ? `, ${esc(legal.businessForm)}` : ''}`;
const legalMail = () => `<a href="mailto:${site.email}">${esc(site.email)}</a>`;

function legalDoc({path,metaTitle,description,eyebrow,title,lead,briefTitle='En bref',brief=[],briefHtml='',briefNote='',sections,question='Une question sur cette page ?'}){
  const words = sections.map(s=>s.html).join(' ').replace(/<[^>]+>/g,' ').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words/220));
  const pages = `<nav class="lg-pages" aria-label="Pages légales"><p class="lg-rail-title">Informations légales</p><ul>${legalPagesNav.map(([href,label])=>`<li><a href="${href}"${href===path?' aria-current="page"':''}>${label}</a></li>`).join('')}</ul></nav>`;
  const toc = `<details class="lg-toc" data-legal-toc open><summary>Sur cette page</summary><ul>${sections.map(s=>`<li><a href="#${s.id}">${s.title}</a></li>`).join('')}</ul></details>`;
  const briefBlock = `<section class="lg-brief" aria-labelledby="lg-brief-title"><h2 id="lg-brief-title">${briefTitle}</h2>${briefHtml || `<dl>${brief.map(([term,value])=>`<div><dt>${term}</dt><dd>${value}</dd></div>`).join('')}</dl>`}${briefNote ? `<p class="lg-brief-note">${briefNote}</p>` : ''}</section>`;
  const body = sections.map(s=>`<section class="lg-section" id="${s.id}" aria-labelledby="${s.id}-t"><h2 id="${s.id}-t">${s.title}</h2>${s.html}</section>`).join('');
  const ask = `<aside class="lg-ask" aria-label="Contact"><h2>${question}</h2><p>Je réponds personnellement à chaque message.</p><p class="lg-ask__actions"><a class="lg-ask__primary" href="mailto:${site.email}">Écrire à ${esc(site.email)}</a><a href="/contact/">Passer par le formulaire</a></p></aside>`;
  return head({title:metaTitle,description,path,bodyClass:'page-legal'}) + header() + `<main id="main-content" class="lg-shell"><div class="lg-rail">${pages}${toc}</div><article class="lg-doc"><header class="lg-head"><p class="lg-eyebrow">${eyebrow}</p><h1>${title}</h1><p class="lg-lead">${lead}</p><p class="lg-meta"><span>Mise à jour le ${legalUpdated}</span><span>Lecture : ${minutes} min</span><button type="button" class="lg-print" data-print>Imprimer ou enregistrer en PDF</button></p></header>${briefBlock}${body}${ask}</article></main>` + footer();
}

export function legalPage(){
  const vat = legal.vat ? esc(legal.vat) : 'Non renseigné, à confirmer selon le régime fiscal réel';
  const registry = legal.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${encodeURIComponent(legal.siren)}` : '';
  return legalDoc({path:'/mentions-legales/',metaTitle:'Mentions légales | Nolan Arc',description:'Mentions légales de nolanarc.com : éditeur, immatriculation, hébergement, propriété intellectuelle et signalements.',
    eyebrow:'Informations légales',title:'Mentions légales',
    lead:'Qui édite ce site, qui l’héberge, et comment vérifier en un clic que l’entreprise existe bien.',
    briefTitle:'Fiche d’identité',
    brief:[
      ['Éditeur', `${esc(site.legalName)}, sous le nom ${esc(site.name)}`],
      ['Statut', esc(legal.businessForm || 'À compléter')],
      ['SIREN', legalValue(legal.siren)],
      ['SIRET', legalValue(legal.siret)],
      ['Code APE', legal.ape ? `${esc(legal.ape)}, activités photographiques` : legalValue('')],
      ['TVA', vat],
      ['Contact', legalMail()],
      ['Hébergement', `${esc(legal.host.name)} (GitHub Pages)`],
    ],
    briefNote: registry ? `<a href="${registry}" rel="noreferrer">Vérifier ces informations sur l’Annuaire des Entreprises</a>, le service public qui recense les entreprises françaises.` : '',
    sections:[
      {id:'editeur',title:'Éditeur du site',html:`<p><strong>${esc(site.legalName)}</strong>${legal.businessForm ? `, ${esc(legal.businessForm)}` : ''}, exerçant sous l’identité professionnelle <strong>${esc(site.name)}</strong>.<br>Email : ${legalMail()}.${legal.publicLegalContactsConfirmed && legal.professionalAddress ? `<br>Adresse professionnelle : ${esc(legal.professionalAddress)}.` : ''}${legal.publicLegalContactsConfirmed && legal.professionalPhone ? `<br>Téléphone professionnel : ${esc(legal.professionalPhone)}.` : ''}<br>SIREN : ${legalValue(legal.siren)}.<br>SIRET : ${legalValue(legal.siret)}.<br>Code APE : ${legalValue(legal.ape)}.<br>TVA : ${vat}.</p>`},
      {id:'publication',title:'Directeur de la publication',html:`<p>${esc(legal.publicationDirector)}.</p>`},
      {id:'hebergement',title:'Hébergement et diffusion',html:`<p>Le site est hébergé par ${esc(legal.host.name)}, ${esc(legal.host.address)}, <a href="${esc(legal.host.website)}" rel="noreferrer">${esc(legal.host.website)}</a>.${legal.host.phone ? ` Téléphone : ${esc(legal.host.phone)}.` : legal.host.phoneNote ? ` ${esc(legal.host.phoneNote)}` : ''}</p><p>Il est diffusé par le réseau de Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis, qui assure son chiffrement, sa rapidité et sa protection contre les abus.</p>`},
      {id:'propriete',title:'Propriété intellectuelle et crédits',html:`<p>Sauf mention contraire, les textes, photographies, films, éléments graphiques et créations présentés sur ce site sont protégés par les droits de propriété intellectuelle de leurs auteurs et ayants droit. Toute réutilisation dépassant les exceptions prévues par la loi nécessite l’autorisation préalable du titulaire concerné.</p><p>Les projets clients sont présentés avec l’accord des personnes et des marques concernées. Les images d’ambiance de la page Services proviennent de la banque d’images Unsplash et sont utilisées selon sa licence. Les marques et logos de matériel cités appartiennent à leurs titulaires : ils indiquent l’équipement utilisé, sans partenariat commercial sauf mention contraire.</p>`},
      {id:'donnees',title:'Données personnelles et cookies',html:`<p>Les informations détaillées sur les traitements de données sont disponibles dans la <a href="/confidentialite/">politique de confidentialité</a>. Les choix relatifs aux contenus externes sont décrits dans la page <a href="/cookies/">Cookies et contenus externes</a>.</p>`},
      {id:'conditions',title:'Conditions commerciales',html:`<p>Les prestations sont encadrées par les <a href="/cgv/">conditions générales de vente et de prestation de services</a>, complétées par le devis ou le contrat accepté pour chaque projet.</p>`},
      {id:'signalement',title:'Signaler un contenu ou une faille',html:`<p>Un contenu vous semble inexact ou porte atteinte à vos droits, ou vous avez repéré une faille de sécurité : écrivez à ${legalMail()}. Chaque signalement reçoit une réponse. Les signalements de sécurité suivent les indications du fichier <a href="/.well-known/security.txt">security.txt</a>.</p>`},
    ]});
}

export function privacyPage(){
  return legalDoc({path:'/confidentialite/',metaTitle:'Confidentialité | Nolan Arc',description:'Politique de confidentialité de nolanarc.com : données collectées, finalités, durées de conservation, destinataires et droits.',
    eyebrow:'Vie privée',title:'Politique de confidentialité',
    lead:'Ce que le site collecte, pourquoi, combien de temps, et comment exercer vos droits. Version courte : seulement ce que vous écrivez, jamais pour de la publicité.',
    brief:[
      ['Données collectées','Uniquement ce que vous saisissez dans le formulaire de contact.'],
      ['Pourquoi','Vous répondre et préparer un éventuel devis.'],
      ['Publicité et revente','Aucune.'],
      ['Mesure d’audience','Sans cookie, agrégée, refusable en un clic.'],
      ['Conservation','3 ans après votre dernier message s’il n’y a pas de contrat.'],
      ['Vos droits',`Accès, rectification, effacement : ${legalMail()}`],
    ],
    sections:[
      {id:'responsable',title:'Responsable du traitement',html:`<p>${legalCompany()}. Contact pour toute demande relative aux données personnelles : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>.</p>`},
      {id:'formulaire',title:'Formulaire de contact',html:`<p>Lorsque vous utilisez le formulaire, sont traitées les informations que vous renseignez : nom, adresse email, entreprise éventuelle, catégorie et description du projet, offre choisie le cas échéant, budget éventuel, ainsi que les informations librement ajoutées dans le message. La finalité est de répondre à votre demande, d’évaluer la possibilité d’une collaboration et, le cas échéant, de prendre des mesures précontractuelles à votre demande.</p><p>Les champs obligatoires sont signalés dans le formulaire. Sans nom, adresse email et description du projet, il n’est pas possible de traiter correctement la demande.</p>`},
      {id:'base',title:'Base juridique',html:`<p>Lorsqu’une demande concerne la préparation d’un projet ou d’un devis, le traitement est fondé sur les mesures précontractuelles prises à votre demande. Pour une sollicitation générale sans perspective contractuelle immédiate, la réponse peut reposer sur l’intérêt légitime de Nolan Arc à traiter les messages qui lui sont adressés.</p>`},
      {id:'destinataires',title:'Destinataires et sous-traitant du formulaire',html:`<p>Les données sont accessibles à Nolan Arc et transitent, pour l’envoi technique du formulaire, par ${esc(legal.formProcessor.name)}. Ce service agit comme intermédiaire technique pour transmettre le message ; ses propres conditions de traitement et de sécurité s’appliquent également. Aucune donnée du formulaire n’est vendue, louée ni utilisée à des fins publicitaires.</p>`},
      {id:'journaux',title:'Journaux techniques',html:`<p>Comme pour tout site, l’affichage d’une page implique le traitement de votre adresse IP et d’informations techniques (navigateur, page demandée) par les serveurs qui acheminent le site, le temps nécessaire à son fonctionnement et à sa protection contre les abus. Ces traitements sont réalisés par l’hébergeur (GitHub) et par Cloudflare, sur le fondement de l’intérêt légitime à assurer la sécurité du site.</p>`},
      {id:'transferts',title:'Transferts hors de l’Union européenne',html:`<p>Certains prestataires utilisés par le site (GitHub, Cloudflare, et, seulement après votre clic, YouTube et Instagram) sont établis aux États-Unis. Les transferts reposent sur le cadre de protection des données UE États-Unis (Data Privacy Framework) pour les entreprises certifiées, ou sur les clauses contractuelles types adoptées par la Commission européenne.</p>`},
      {id:'conservation',title:'Durées de conservation',html:`<p>Les demandes de prospects qui ne débouchent pas sur une relation contractuelle sont conservées au maximum selon la règle suivante : ${esc(legal.prospectRetention)}. Lorsqu’une relation contractuelle est conclue, les données nécessaires à l’exécution, à la facturation et à la défense des droits sont conservées selon les durées légales applicables : ${esc(legal.clientRetention)}.</p>`},
      {id:'droits',title:'Vos droits',html:`<p>Vous pouvez demander l’accès, la rectification, l’effacement ou la limitation de vos données et exercer, selon le fondement du traitement, vos droits d’opposition et de portabilité. Pour exercer vos droits : <a href="mailto:${legal.privacyContact}">${esc(legal.privacyContact)}</a>. Une réponse vous est apportée dans un délai d’un mois. Vous pouvez également introduire une réclamation auprès de la CNIL, sur <a href="https://www.cnil.fr/" rel="noreferrer">cnil.fr</a>.</p>`},
      {id:'tiers',title:'Contenus et services tiers',html:`<p>${heroSelfHosted ? 'Le fond vidéo de l’accueil est hébergé sur ce site : il ne fait appel à aucun service tiers. Les lecteurs YouTube' : 'Le fond vidéo YouTube de l’accueil reste désactivé tant que vous n’avez pas autorisé les contenus vidéo externes. Les autres lecteurs YouTube'} et les vidéos hébergées sur Instagram (pages Work et Services) sont chargés uniquement après une action explicite dans leur emplacement ; Instagram est un service de Meta et ses propres conditions s’appliquent alors. Les polices Yrsa, Syne et DM Sans sont hébergées sur ce site : leur chargement ne contacte aucun service tiers. La fréquentation du site est mesurée avec Cloudflare Web Analytics, sans cookie et de façon agrégée ; vous pouvez vous y opposer depuis la page Cookies. Les liens vers Instagram, YouTube et Calendly ouvrent les services concernés ; leurs propres politiques s’appliquent lorsque vous quittez nolanarc.com.</p>`},
      {id:'securite',title:'Sécurité',html:`<p>Le site est chiffré (HTTPS). Une politique de sécurité du contenu empêche votre navigateur de charger un script ou un cadre qui ne vient pas d’une source autorisée. Aucun outil publicitaire n’est embarqué ; seule une mesure d’audience sans cookie est utilisée, avec possibilité de s’y opposer. Les échanges avec les services externes restent soumis aux mesures de sécurité et aux conditions propres de ces prestataires.</p>`},
      {id:'decisions',title:'Aucune décision automatisée',html:`<p>Aucune décision vous concernant n’est prise de façon automatisée et aucun profil n’est établi à partir de votre visite ou de votre message.</p>`},
    ]});
}

export function cookiesPage(){
  const rows = [
    ...(heroSelfHosted ? [] : [['nolanarc_external_video','Retient votre choix pour le fond vidéo de l’accueil','6 mois','Seulement si vous faites ce choix']]),
    ['nolanarc_audience_optout','Retient votre refus de la mesure d’audience','1 an','Seulement si vous cliquez sur « Ne pas compter ma visite »'],
  ];
  const table = `<div class="lg-table-wrap"><table class="lg-table"><caption>Cookies déposés par nolanarc.com</caption><thead><tr><th scope="col">Nom</th><th scope="col">Rôle</th><th scope="col">Durée</th><th scope="col">Quand</th></tr></thead><tbody>${rows.map(([n,r,d,w])=>`<tr><th scope="row"><code>${n}</code></th><td>${r}</td><td>${d}</td><td>${w}</td></tr>`).join('')}</tbody></table></div>`;
  return legalDoc({path:'/cookies/',metaTitle:'Cookies et contenus externes | Nolan Arc',description:'Cookies et contenus externes de nolanarc.com : liste exacte, durée, mesure d’audience sans cookie et choix.',
    eyebrow:'Traceurs',title:'Cookies et contenus externes',
    lead:'Aucun cookie publicitaire. Au plus deux petits cookies de préférence, déposés seulement après votre choix. Voici la liste exacte.',
    briefTitle:'Tout ce qui est déposé',briefHtml:table,
    briefNote:'YouTube et Instagram peuvent déposer leurs propres cookies, uniquement après votre clic sur leur lecteur.',
    sections:[
      {id:'principe',title:'Principe',html:`<p>Nolanarc.com n’utilise ni outil publicitaire ni profilage. Le site mesure uniquement son audience avec un outil sans cookie (voir ci-dessous) et n’enregistre pas votre parcours pour personnaliser la visite.</p>`},
      {id:'youtube',title:'Vidéo YouTube',html:`<p>${heroSelfHosted ? 'Aucun lecteur YouTube n’est chargé avant votre choix. Le fond vidéo de l’accueil est un fichier hébergé sur ce site : il ne dépose aucun cookie et ne contacte aucun service tiers. Sur les pages projet' : 'Aucun lecteur YouTube n’est chargé avant votre choix. Sur l’accueil, vous pouvez autoriser ou refuser le fond vidéo ; votre préférence est conservée dans un cookie fonctionnel pendant six mois et peut être modifiée à tout moment depuis « Préférences vidéo » dans le footer. Sur les pages projet'}, l’activation du lecteur constitue un choix contextuel pour la lecture demandée. Après autorisation, votre navigateur communique avec YouTube et ce service peut utiliser des traceurs selon ses propres règles.</p>`},
      {id:'audience',title:'Mesure d’audience',html:`<p>Le site utilise Cloudflare Web Analytics pour savoir combien de personnes le visitent et quelles pages sont consultées. Cet outil ne dépose aucun cookie, n’utilise pas d’identifiant publicitaire et ne vous suit pas d’un site à l’autre. Les statistiques sont agrégées et servent uniquement à améliorer le site. Vous pouvez vous y opposer à tout moment : le bouton ci-dessous désactive la mesure sur cet appareil en enregistrant un petit cookie fonctionnel d’opposition, conservé un an (le signal « Ne pas suivre » de votre navigateur est aussi respecté).</p><p><button type="button" class="legal-optout" data-audience-optout aria-pressed="false">Ne pas compter ma visite</button></p>`},
      {id:'instagram',title:'Vidéos Instagram (Social media videos)',html:`<p>Sur les pages Work et Services, des vidéos sont hébergées sur Instagram. Aucune connexion à Instagram n’est établie au chargement de la page. Le lecteur n’est créé qu’après votre clic sur le bouton de lecture de la vidéo ; votre navigateur communique alors avec Instagram (Meta), qui peut utiliser des cookies et traceurs selon ses propres règles. Sans clic, vous pouvez aussi ouvrir chaque publication directement sur Instagram.</p>`},
      {id:'polices',title:'Polices et liens externes',html:`<p>Les polices Yrsa, Syne et DM Sans sont hébergées sur ce site (licence SIL Open Font License) : leur chargement ne crée aucune connexion vers un service tiers. Les liens vers Instagram, YouTube et Calendly n’activent pas ces services tant que vous ne les ouvrez pas. Une fois le site tiers ouvert, ses propres règles en matière de cookies et de données personnelles s’appliquent.</p>`},
      {id:'choix',title:'Votre choix',html:`<p>Le refus est aussi simple que l’acceptation. Vous pouvez rouvrir le choix depuis « Préférences vidéo » dans le footer, à tout moment. Si vous retirez votre autorisation, le lecteur externe du fond d’accueil est déchargé et n’est plus recréé lors des visites suivantes.</p>`},
      {id:'evolution',title:'Évolution du site',html:`<p>Si un traceur non exempté (publicité, profilage, mesure avec cookie) devait être ajouté ultérieurement, le mécanisme de consentement serait adapté avant son activation, et cette page mise à jour.</p>`},
    ]});
}

export function cgvPage(){
  const mediator = legal.mediator.name ? `${esc(legal.mediator.name)}, ${esc(legal.mediator.address)}, <a href="${esc(legal.mediator.website)}" rel="noreferrer">${esc(legal.mediator.website)}</a>` : `Aucun médiateur de la consommation n’est actuellement indiqué, l’adhésion devant être conclue par le professionnel avant que ses coordonnées puissent être publiées. Pour toute réclamation préalable : ${legalMail()}.`;
  return legalDoc({path:'/cgv/',metaTitle:'CGV | Nolan Arc',description:'Conditions générales de vente et de prestation de services Nolan Arc : commande, acompte, annulation, report, livrables, droits et rétractation.',
    eyebrow:'Conditions commerciales',title:'Conditions générales de vente et de prestation de services',
    lead:'Les règles du jeu, écrites pour être lues. Le devis accepté précise chaque projet ; ces conditions encadrent tout le reste.',
    briefTitle:'L’essentiel',
    brief:[
      ['Commande','Devis et contrat signés, puis acompte de 40 % encaissé. La date est bloquée à ce moment.'],
      ['Solde','60 %, au plus tard avant le début de la prestation.'],
      ['Annulation','Plus de 2 mois avant : acompte remboursé. Moins de 2 mois : acompte conservé, solde non réclamé.'],
      ['Report','Une fois, au moins 14 jours avant, sur une nouvelle date dans les 6 mois.'],
      ['Fichiers','Livrables finaux remis après paiement complet. Rushes non livrés par défaut, copie de sécurité 6 mois.'],
      ['Droits d’auteur','Non cédés par défaut ; les usages autorisés sont écrits au devis.'],
      ['Particuliers','14 jours de rétractation pour un contrat conclu à distance, sauf exception légale.'],
      ['TVA', esc(legal.vat || 'À confirmer')],
    ],
    briefNote:'Ce résumé facilite la lecture. En cas de différence, le texte complet ci-dessous et le devis accepté font foi.',
    question:'Une question avant de signer ?',
    sections:[
      {id:'champ',title:'1. Prestataire et champ d’application',html:`<p>Les présentes conditions encadrent les prestations proposées par ${legalCompany()}, sous l’identité professionnelle ${esc(site.name)}. Elles s’appliquent aux clients professionnels et, lorsqu’une prestation est conclue avec un consommateur, sous réserve des dispositions impératives du Code de la consommation. Le devis ou contrat accepté précise le périmètre du projet et prévaut sur les présentes conditions pour les modalités particulières.</p>`},
      {id:'formation',title:'2. Formation du contrat',html:`<p>La prise de contact via le site ne vaut pas commande. Le contrat est formé lorsque le devis, bon de commande ou contrat transmis par Nolan Arc est accepté selon les modalités qui y sont indiquées. Le document accepté précise au minimum la nature de la mission, les livrables, le calendrier estimatif et le prix ou son mode de calcul.</p>`},
      {id:'prix',title:'3. Prix',html:`<p>Les prestations sont principalement réalisées sur devis, en fonction du périmètre, de la durée de production, des livrables, des droits demandés et des frais éventuels. Les prix « à partir de » affichés sur le site indiquent un point de départ ; le prix ferme est celui du devis accepté. Lorsque le prix exact ne peut être calculé à l’avance, son mode de calcul et les frais connus sont communiqués avant l’engagement du client. Pour les consommateurs, les montants communiqués sont exprimés TTC lorsque la TVA est applicable.</p>`},
      {id:'paiement',title:'4. Paiement',html:`<p>${legalValue(legal.paymentTerms, 'Conditions de paiement à définir : échéancier, acompte éventuel et date d’exigibilité.')}</p><p><strong>Clients professionnels :</strong> pénalités de retard : ${legalValue(legal.latePenaltyB2B, 'Taux de pénalités de retard B2B à définir dans le respect du minimum légal.')}. Une indemnité forfaitaire de 40 € pour frais de recouvrement est due dans les conditions prévues par la loi. Escompte : ${legalValue(legal.discountTerms, 'Conditions d’escompte à définir, ou indiquer explicitement « aucun escompte ».')}.</p><p><strong>Clients consommateurs :</strong> Nolan Arc n’applique pas de doublement automatique du prix ni de pénalité punitive forfaitaire. En cas d’impayé, Nolan Arc peut suspendre la prestation et/ou la livraison et exercer les voies de recouvrement permises par le droit applicable.</p>`},
      {id:'organisation',title:'5. Organisation, délais, livrables et collaboration',html:`<p>Le calendrier est défini au devis et dépend notamment de la remise des éléments par le client, des validations, des disponibilités de tournage et des éventuels prestataires tiers. Les retards causés par l’absence de validation ou de fourniture des éléments nécessaires peuvent entraîner un décalage raisonnable du calendrier.</p><p>${esc(legal.archivalPolicy)}</p>`},
      {id:'modifications',title:'6. Modifications et validations',html:`<p>Le nombre de versions, allers-retours et modifications inclus est celui prévu au devis. Toute demande hors périmètre peut faire l’objet d’un devis complémentaire avant exécution.</p>`},
      {id:'annulation',title:'7. Annulation, report ou fin anticipée',html:`<p>${legalValue(legal.cancellationPolicy, 'Politique d’annulation/report et sort des sommes versées à définir selon votre pratique commerciale.')}</p><p><strong>Missions continues :</strong> ${esc(legal.continuousCancellationPolicy)}</p><p>Les droits impératifs du consommateur, notamment le droit de rétractation lorsqu’il s’applique, restent réservés.</p>`},
      {id:'propriete',title:'8. Propriété intellectuelle et droit à l’image',html:`<p>${legalValue(legal.ipPolicy, 'Étendue de la cession/licence : supports, durée, territoire, exclusivité et usages à définir dans le devis ou contrat.')} Les éléments appartenant au client ou à des tiers restent la propriété de leurs titulaires. Le client garantit disposer des autorisations nécessaires pour les éléments qu’il fournit et informe Nolan Arc des contraintes spécifiques liées au droit à l’image, aux marques ou aux lieux.</p>`},
      {id:'retractation',title:'9. Droit de rétractation des consommateurs',html:`<p>Lorsqu’un contrat de prestation est conclu à distance avec un consommateur et qu’aucune exception légale ne s’applique, celui-ci dispose en principe d’un délai de quatorze jours à compter de la conclusion du contrat pour exercer son droit de rétractation. Les modalités et un modèle de formulaire sont disponibles sur la page <a href="/retractation/">Rétractation</a>. Une exécution avant la fin du délai ne peut être organisée que dans le respect des conditions légales applicables.</p>`},
      {id:'mediation',title:'10. Réclamations et médiation de la consommation',html:`<p>Pour toute réclamation : ${legalMail()}. Lorsqu’un litige avec un consommateur n’a pas pu être résolu directement, le consommateur peut saisir gratuitement le médiateur de la consommation désigné par le prestataire : ${mediator}</p>`},
      {id:'responsabilite',title:'11. Force majeure et responsabilité',html:`<p>${esc(legal.forceMajeurePolicy)}</p><p>La responsabilité de Nolan Arc s’apprécie au regard de la mission effectivement convenue, sans priver un consommateur des droits que la loi lui reconnaît.</p>`},
      {id:'droit',title:'12. Droit applicable et litiges',html:`<p>Les contrats sont soumis au droit français, sous réserve des protections impératives dont bénéficie un consommateur. Pour les clients professionnels, les modalités de règlement des litiges peuvent être précisées dans le devis ou contrat. Aucune clause ne peut priver un consommateur des règles de compétence juridictionnelle qui lui sont applicables.</p>`},
    ]});
}

export function withdrawalPage(){
  return legalDoc({path:'/retractation/',metaTitle:'Rétractation | Nolan Arc',description:'Droit de rétractation de 14 jours pour les contrats conclus à distance avec un consommateur : délai, démarche, remboursement et modèle de formulaire.',
    eyebrow:'Consommateurs',title:'Droit de rétractation',
    lead:'Vous êtes un particulier et vous avez signé à distance : vous disposez en principe de 14 jours pour changer d’avis, sans avoir à vous justifier.',
    brief:[
      ['Délai','14 jours à compter de la conclusion du contrat.'],
      ['Comment','Un email clair suffit, ou le modèle ci-dessous.'],
      ['Remboursement','Au plus tard 14 jours après réception de votre décision.'],
      ['Si la prestation a commencé','À votre demande, la part déjà réalisée reste due.'],
    ],
    question:'Une question sur votre contrat ?',
    sections:[
      {id:'principe',title:'Principe',html:`<p>Pour un contrat de prestation de services conclu à distance avec un consommateur, un droit de rétractation de quatorze jours à compter de la conclusion du contrat s’applique en principe, sauf exception prévue par la loi. Les conditions particulières applicables à votre projet sont rappelées avant la conclusion du contrat.</p>`},
      {id:'anticipee',title:'Demande d’exécution anticipée',html:`<p>Si vous souhaitez que la prestation commence avant l’expiration du délai de rétractation, une demande expresse peut être nécessaire. Lorsque les conditions légales d’une perte du droit de rétractation sont réunies après exécution complète, une information et un accord spécifiques sont recueillis avant le commencement de la prestation.</p>`},
      {id:'exercer',title:'Exercer votre droit',html:`<p>Vous pouvez envoyer une déclaration dénuée d’ambiguïté à ${legalMail()}, ou utiliser le modèle ci-dessous.</p><div class="withdrawal-model" id="modele-retractation"><h3>Modèle de formulaire</h3><p>À l’attention de ${esc(site.legalName)}, ${esc(site.email)} :</p><p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : […]</p><p>Contrat/devis accepté le : […]<br>Nom du consommateur : […]<br>Adresse du consommateur : […]<br>Date : […]<br>Signature (uniquement en cas de formulaire papier) : […]</p></div><p><button type="button" class="lg-copy" data-copy="modele-retractation">Copier le modèle</button></p>`},
      {id:'remboursement',title:'Remboursement',html:`<p>En cas de rétractation, les sommes versées sont remboursées au plus tard quatorze jours après réception de votre décision, par le même moyen de paiement, sauf accord de votre part pour un autre moyen. Si la prestation a commencé avant la fin du délai à votre demande expresse, un montant proportionnel à ce qui a déjà été réalisé reste dû.</p>`},
    ]});
}

export function adminPage(){
  return head({title:'Tableau de bord | Nolan Arc',description:'Espace d’administration réservé de nolanarc.com.',path:'/admin/',bodyClass:'page-admin'}).replace('<title>','<meta name="robots" content="noindex,nofollow">\n<title>').replace('</head>','<link rel="stylesheet" href="/admin/admin.css?v=__ADMINCSS_V__">\n</head>') + `<a class="skip-link" href="#main-content">Aller au contenu</a>
<main id="main-content" class="admin-ui"><h1 class="admin-sr">Tableau de bord Nolan Arc</h1>
<div class="admin-app" data-admin-app data-docs="__DOCS_V__" data-supabase-url="${esc(site.supabaseUrl)}" data-supabase-key="${esc(site.supabasePublishableKey)}" data-offers="${esc(JSON.stringify(pricing.map(o=>({key:o.key,label:o.title,from:o.from?Number(String(o.price).replace(/[^\d]/g,''))||0:0}))))}" data-business="${esc(JSON.stringify({name:site.name,legalName:site.legalName,email:site.email,siret:legal.siret}))}"><noscript><p>JavaScript est nécessaire pour cette page.</p></noscript></div>
</main><script src="/admin/supabase.js?v=2.119.0" defer></script><script src="/admin/doc-models.js?v=__MODELS_V__" defer></script><script src="/admin/messages.js?v=__MSG_V__" defer></script><script src="/admin/cockpit.js?v=__COCKPIT_V__" defer></script><script src="/admin/cropper.js?v=__CROP_V__" defer></script><script src="/admin/categories.js?v=__CAT_V__" defer></script><script src="/admin/media.js?v=__MEDIA_V__" defer></script><script src="/admin/photos.js?v=__PHOTOS_V__" defer></script><script src="/admin/projects.js?v=__PROJECTS_V__" defer></script><script src="/admin/videos.js?v=__VIDEOS_V__" defer></script><script src="/admin/images.js?v=__IMAGES_V__" defer></script><script src="/admin/testimonials.js?v=__TESTI_V__" defer></script><script src="/admin/order.js?v=__ORDER_V__" defer></script><script src="/admin/admin.js?v=__ADMIN_V__" defer></script></body></html>`;
}

export function notFoundPage(){
  return head({title:'Page introuvable | Nolan Arc',description:'Cette page n’existe pas ou a changé d’adresse. Retrouvez les réalisations, les services et le contact de Nolan Ribeiro.',path:'/404/',robots:'noindex',bodyClass:'page-404'}) + header() + `<main id="main-content" class="black-hole" data-black-hole>
    <canvas class="black-hole__canvas" aria-hidden="true"></canvas>
    <div class="black-hole__copy">
      <span class="black-hole__code">Erreur 404</span>
      <h1 class="black-hole__line" data-bh-line aria-live="polite">Mince, il semblerait que vous vous êtes fait aspirer jusqu’ici.</h1>
      <div class="black-hole__actions"><a class="black-hole__primary" href="/">Revenir à l’accueil <span aria-hidden="true">↗</span></a><a class="black-hole__secondary" href="/work/">ou voir le Work</a></div>
      <p class="black-hole__hint">Bougez la souris pour incliner la galaxie. Maintenez le clic, ou le doigt, pour accélérer la chute.</p>
    </div>
  </main>` + footer();
}
