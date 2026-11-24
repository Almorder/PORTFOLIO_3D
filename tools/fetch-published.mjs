// Copie sur le site ce qui a été publié depuis l'admin : photos de la page Work (section Photographie),
// projets de « Ma sélection » (bento), social media videos (fichiers vidéo compris), images du site
// (accueil) et avis clients (témoignages). Lancé au déploiement, avant le build (.github/workflows/pages.yml).
//
// Chemin d'une publication : l'admin envoie les images WebP dans l'espace Supabase « site-photos » et le
// texte dans les brouillons « photos », « projects », « instagram » et « images » (les vidéos dans « site-videos »). « Enregistrer une version » fige les brouillons dans
// content_snapshots. Ce script lit la dernière version (lecture publique, clé publique déjà dans le dépôt,
// aucun secret), nettoie chaque champ, télécharge les images et les range dans public/assets/photo/site/ :
// les visiteurs chargent ensuite tout depuis nolanarc.com, jamais depuis Supabase.
// Résultat : content/*.published.json (fichiers générés, non versionnés), lus par content/photos.mjs,
// projects.mjs, instagram.mjs et site-images.mjs ; content/published.json donne la version (version.json).
//
// Si Supabase ne répond pas (projet en pause, réseau), le script reprend la version déjà en ligne sur
// nolanarc.com : un déploiement ne fait jamais disparaître un contenu à cause d'une panne.
//
//   node tools/fetch-published.mjs           copie la version publiée (déploiement)
//   node tools/fetch-published.mjs --check   dit seulement si la version publiée a changé (changed=true/false)
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { site } from '../content/site.mjs';
import '../public/admin/categories.js';

// Catégories du catalogue cochées dans l'admin : gardées seulement si elles existent ; absentes, le site les déduit.
// Place choisie dans l'admin (rubrique « Ordre ») : un entier de 1 à 999, sinon rien.
const rankOf = value => Number.isInteger(value) && value >= 1 && value <= 999 ? { rank: value } : {};
const categoriesOf = value => Array.isArray(value) ? { categories: globalThis.NolanCategories.valid(value) } : {};

const root = new URL('../', import.meta.url).pathname;
const outDir = join(root, 'public/assets/photo/site');
const supabaseUrl = (process.env.PHOTOS_SUPABASE_URL || site.supabaseUrl || '').replace(/\/$/, '');
const liveUrl = (process.env.PHOTOS_LIVE_URL || site.domain).replace(/\/$/, '');
const key = site.supabasePublishableKey;
const BUCKET = 'site-photos';
const MAX_BYTES = 3 * 1024 * 1024;
const WEB_PATH = '/assets/photo/site/';

// Texte publié : propre, court, sans tiret long ni demi-cadratin (règle du site).
const clean = (value, max) => String(value ?? '').replace(/[\u2014\u2013]/g, '-').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const dim = value => Number.isInteger(value) && value >= 16 && value <= 8000 ? value : 0;
const yearOf = value => /^\d{4}$/.test(String(value || '').trim()) ? String(value).trim() : '';
const validId = id => /^[a-z0-9-]{8,64}$/.test(String(id || ''));
// Image envoyée depuis l'admin : identifiant et dimensions réelles des deux tailles.
const imageOf = it => {
  const id = String(it?.id || '');
  const width = dim(it?.width), height = dim(it?.height), smallWidth = dim(it?.smallWidth), smallHeight = dim(it?.smallHeight);
  if (!(validId(id) && width && height && smallWidth && smallHeight)) return null;
  // Original et recadrage (admin seulement, pour recadrer de nouveau) : gardés tels quels s'ils sont valides.
  const so = it.source, cr = it.crop, frac = v => typeof v === 'number' && v >= 0 && v <= 1;
  const source = so && validId(so.id) && dim(so.width) && dim(so.height) ? { id: so.id, width: so.width, height: so.height, ...(so.fromLarge === true ? { fromLarge: true } : {}) } : null;
  const crop = cr && ['x', 'y', 'w', 'h'].every(k => frac(cr[k])) ? { x: cr.x, y: cr.y, w: cr.w, h: cr.h } : null;
  return { id, src: `${WEB_PATH}${id}.webp`, srcSmall: `${WEB_PATH}${id}-s.webp`, width, height, smallWidth, smallHeight, ...(source ? { source } : {}), ...(crop ? { crop } : {}) };
};

// Photos : chaque photo a deux cases indépendantes, « Visible dans la section Photographie » (visible) et
// « Dans la tuile Photographie » (inTile). Une photo sans l'une ni l'autre, ou sans texte alternatif, n'est jamais
// publiée. Ancien brouillon sans inTile : la photo visible reste dans la tuile (comportement d'avant).
export function normalizePhotos(draft) {
  const seen = new Set(), list = [];
  for (const it of Array.isArray(draft?.items) ? draft.items : []) {
    const image = imageOf(it), alt = clean(it?.alt, 300);
    const inSection = it?.visible === true, inTile = typeof it?.inTile === 'boolean' ? it.inTile : inSection;
    if (!image || seen.has(image.id) || !(inSection || inTile) || !alt) continue;
    seen.add(image.id);
    list.push({ ...image, alt, series: clean(it.series, 80), place: clean(it.place, 80), year: yearOf(it.year), inSection, inTile, ...categoriesOf(it.categories), ...(it.featured === true ? { featured: true } : {}), ...rankOf(it.rank) });
  }
  // Place de la tuile Photographie (rubrique « Ordre »).
  const tile = rankOf(draft?.tileRank).rank;
  return { items: list, ...(tile ? { tileRank: tile } : {}) };
}

// Projets : seuls les champs éditables passent. Les champs techniques (adresse de la page, affiche, statut)
// restent ceux du code (content/projects.mjs) et ne peuvent pas venir de la base.
const TERRITORIES = ['Récits', 'Marques', 'Moments', 'Réseaux', 'Photographie'];
const link = value => { const v = String(value || '').trim(); return /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[\w.-]+(\/[\w\-./?=&#%~+]*)?$/.test(v) ? v.slice(0, 300) : ''; };
const VIDEO_EXT = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };
const MAX_VIDEO = 50 * 1024 * 1024;
const VIDEO_PATH = '/assets/video/site/';
const videoFileOf = v => {
  const ext = String(v?.ext || ''), width = dim(v?.width), height = dim(v?.height);
  if (!validId(v?.id) || !VIDEO_EXT[ext] || !width || !height || (Number(v?.bytes) || 0) > MAX_VIDEO) return null;
  return { id: v.id, ext, type: VIDEO_EXT[ext], src: `${VIDEO_PATH}${v.id}.${ext}`, width, height, duration: Math.max(0, Math.min(3600, Math.round(Number(v.duration) || 0))) };
};
// Un média de projet : photo envoyée, vidéo YouTube (affiche copiée au déploiement), publication Instagram
// (avec son image) ou fichier vidéo envoyé (avec sa miniature). Un média incomplet est écarté (jamais de faux média).
const MEDIA_KINDS = ['photo', 'youtube', 'instagram', 'file'];
export function normalizeMedia(m) {
  const kind = MEDIA_KINDS.includes(m?.kind) ? m.kind : '';
  const key = /^[\w-]{2,64}$/.test(String(m?.key || '')) ? String(m.key) : '';
  const image = imageOf(m?.image), alt = clean(m?.alt, 300);
  const videoId = /^[\w-]{11}$/.test(m?.videoId || '') ? m.videoId : '';
  const instagramId = /^[\w-]{5,40}$/.test(m?.instagramId || '') ? m.instagramId : '';
  const video = kind === 'file' ? videoFileOf(m?.video) : null;
  const ok = kind === 'photo' ? image && alt : kind === 'youtube' ? videoId && (!image || alt) : kind === 'instagram' ? instagramId && image && alt : kind === 'file' ? video && image && alt : false;
  if (!key || !ok) return null;
  return { key, kind, image: image || null, alt, caption: clean(m?.caption, 160), videoId: kind === 'youtube' ? videoId : '', instagramId: kind === 'instagram' ? instagramId : '', video };
}
// Ancien format (un seul média par projet : mediaKind, image, alt, videoId, instagramId) -> liste d'un média.
// Rien n'est perdu : un projet déjà publié garde exactement son média.
export function legacyMedia(p) {
  const kind = ['photo', 'youtube', 'instagram'].includes(p?.mediaKind) ? p.mediaKind : (/^[\w-]{11}$/.test(p?.videoId || '') ? 'youtube' : p?.image ? 'photo' : '');
  if (!kind) return [];
  return [{ key: 'm-1', kind, image: p.image || null, alt: p.alt || '', videoId: kind === 'youtube' ? p.videoId : '', instagramId: kind === 'instagram' ? p.instagramId : '' }];
}
// page : page projet au clic ; none : pas de page (fiche sous la grille) ; link : lien externe ;
// auto : ancien réglage, page dès deux médias.
const PAGE_MODES = ['page', 'none', 'link', 'auto'];
// Adresse de la page projet (/projet/<adresse>/) : choisie dans l'admin, sinon tirée du titre.
export const slugify = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
export function normalizeProjects(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Set(), out = [];
  for (const p of list.slice(0, 40)) {
    const slug = String(p?.slug || '');
    const title = clean(p?.title, 120);
    if (!/^[a-z0-9-]{2,60}$/.test(slug) || seen.has(slug) || !title) continue;
    seen.add(slug);
    const keys = new Set();
    const media = (Array.isArray(p.media) ? p.media : legacyMedia(p)).slice(0, 24).map(normalizeMedia).filter(m => m && !keys.has(m.key) && keys.add(m.key));
    const cover = media.find(m => m.key === p.cover) || media[0] || null;
    out.push({
      slug, title, visible: p.visible === true, ...categoriesOf(p.categories), ...(p.featured === true ? { featured: true } : {}), ...rankOf(p.rank),
      territory: TERRITORIES.includes(p.territory) ? p.territory : '',
      type: clean(p.type, 80), role: clean(p.role, 80), context: clean(p.context, 120), client: clean(p.client, 80),
      year: yearOf(p.year), result: clean(p.result, 200), link: link(p.link), summary: clean(p.summary, 400),
      // Tuile : « auto » = page projet dès qu'il y a plusieurs médias (sinon non cliquable), « page » = toujours
      // une page projet, « link » = le lien ci-dessus.
      // Ancien projet sans réglage : son lien s'il en a un ; une vidéo seule garde une page (sinon elle ne se regarderait plus).
      pageMode: PAGE_MODES.includes(p.pageMode) ? p.pageMode : link(p.link) ? 'link' : !Array.isArray(p.media) && ['youtube', 'instagram'].includes(media[0]?.kind) && slug !== 'le-bol-den-face' ? 'page' : 'auto',
      pageSlug: /^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(p.pageSlug || '') ? p.pageSlug : (slugify(title) || slug),
      media, cover: cover?.key || '',
      // Champs de l'ancien format, tirés de la couverture (lus par le reste du site) :
      mediaKind: cover?.kind || '', videoId: cover?.videoId || '', instagramId: cover?.instagramId || '',
      image: cover?.image || null, alt: cover?.alt || '',
      uploadDate: /^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate || '') ? p.uploadDate : '',
      duration: /^PT(\d+H)?(\d+M)?(\d+S)?$/.test(p.duration || '') && p.duration !== 'PT' ? p.duration : '',
      // Page projet :
      location: clean(p.location, 80), format: clean(p.format, 80), camera: clean(p.camera, 80),
      contextText: clean(p.contextText, 1500), intent: clean(p.intent, 300),
      decisions: (Array.isArray(p.decisions) ? p.decisions : []).slice(0, 8).map(d => ({ title: clean(d?.title, 160), text: clean(d?.text, 800) })).filter(d => d.title || d.text)
    });
  }
  return out;
}

// Social media videos : vidéo Instagram (lecteur chargé au clic) ou fichier vidéo envoyé depuis l'admin
// (copié sur le site). Miniature : image envoyée, sinon image tirée de la vidéo à l'import.
const TAGS = ['recits', 'marques', 'moments', 'reseaux', 'photo'];
const ratioOf = (w, h) => { const g = (a, b) => b ? g(b, a % b) : a; const k = g(w, h) || 1; return `${w / k}/${h / k}`; };
export function normalizeSocial(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Set(), out = [];
  for (const p of list.slice(0, 24)) {
    if (p?.visible === false) continue;
    const title = clean(p?.title, 120);
    const v = p?.video, ext = String(v?.ext || '');
    const file = p?.source === 'file' || Boolean(v);
    let video = null, id = '';
    if (file) {
      const width = dim(v?.width), height = dim(v?.height), bytes = Number(v?.bytes) || 0;
      if (!validId(v?.id) || !VIDEO_EXT[ext] || !width || !height || bytes > MAX_VIDEO) continue;
      video = { id: v.id, ext, type: VIDEO_EXT[ext], src: `${VIDEO_PATH}${v.id}.${ext}`, width, height, duration: Math.max(0, Math.min(3600, Math.round(Number(v.duration) || 0))) };
    } else {
      id = String(p?.id || '');
      if (!/^[\w-]{5,40}$/.test(id)) continue;
    }
    const key = String(p?.key || id || video?.id || '');
    if (!title || !/^[\w-]{2,64}$/.test(key) || seen.has(key)) continue;
    seen.add(key);
    const legacyCover = /^\/assets\/work\/[\w-]+\.(jpe?g|png|webp)$/.test(p.cover || '') ? p.cover : '';
    out.push({
      key, source: file ? 'file' : 'instagram', id, title, kind: clean(p.kind, 80), ...categoriesOf(p.categories), ...(p.featured === true ? { featured: true } : {}), ...rankOf(p.rank), ...rankOf(p.rank),
      ratio: video ? ratioOf(video.width, video.height) : /^\d{1,4}\/\d{1,4}$/.test(p.ratio || '') ? p.ratio : '9/16',
      tags: (Array.isArray(p.tags) ? p.tags : ['reseaux']).filter(t => TAGS.includes(t)).slice(0, 5),
      client: clean(p.client, 80), role: clean(p.role, 80), year: yearOf(p.year), result: clean(p.result, 200),
      uploadDate: /^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate || '') ? p.uploadDate : '',
      cover: legacyCover, image: imageOf(p.coverImage) || imageOf(p.autoCover), video
    });
  }
  return out;
}

// Images du site : emplacements fixes ; sans image publiée, le site garde son image d'origine.
export const IMAGE_SLOTS = { 'home.dims.realisation': false, 'home.dims.direction': false, 'home.dims.strategie': false, 'home.wedding.0': true, 'home.wedding.1': true, 'home.wedding.2': true,
  'home.cards.mariage': false, 'home.cards.demande': false, 'home.cards.contenu': false, 'home.cards.film': false, 'home.cards.direction': false, 'home.cards.strategie': false, 'home.cards.dos': false,
  'services.reel.strategie': false };
// Bannière de l'accueil : vidéos hébergées par le site (ordinateur 16:9, téléphone 9:16), chacune avec son affiche.
// Une vidéo dans le mauvais sens (horizontale pour le téléphone, ou l'inverse) n'est pas publiée.
export const VIDEO_SLOTS = { 'home.hero.desktop': 'landscape', 'home.hero.mobile': 'portrait' };
export function normalizeImages(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const out = {};
  for (const [slot, sense] of Object.entries(VIDEO_SLOTS)) {
    const video = videoFileOf(map[slot]?.video), image = imageOf(map[slot]?.image);
    if (video && image && (sense === 'landscape') === (video.width >= video.height)) out[slot] = { video, image };
  }
  for (const [slot, needsAlt] of Object.entries(IMAGE_SLOTS)) {
    const image = imageOf(map[slot]?.image), alt = clean(map[slot]?.alt, 300);
    // Image de la section Mariage sans texte alternatif : description par défaut plutôt que d'écarter l'image.
    if (image) out[slot] = { image, alt: needsAlt ? (alt || 'Photo de mariage réalisée par Nolan Arc') : alt };
  }
  return out;
}

// Avis clients : texte et nom obligatoires, nettoyés ; image facultative, seulement une image envoyée depuis l'admin
// (WebP du stockage site-photos, copiée sur le site), avec son texte alternatif ; aucune adresse d'image libre.
// Photo de la personne (facultative, bulle ronde à côté de son nom) : même règle, carrée, petite (96 et 192 px) ;
// décorative (le nom est écrit juste à côté), donc sans texte alternatif.
// Un avis masqué n'est jamais publié. Aucun avis n'est ajouté ni modifié ici : seulement ceux saisis dans l'admin.
export function normalizeTestimonials(list) {
  if (!Array.isArray(list)) return null;
  const out = [], seen = new Set();
  for (const t of list.slice(0, 60)) {
    if (t?.visible === false) continue;
    const quote = clean(t?.quote, 600), name = clean(t?.name, 80);
    if (!quote || !name || seen.has(`${name}|${quote}`)) continue;
    seen.add(`${name}|${quote}`);
    const image = imageOf(t?.image), alt = clean(t?.alt, 300), href = link(t?.link);
    const photo = imageOf(t?.photo);
    out.push({ quote, name, role: clean(t?.role, 80), image: image && alt ? image : null, alt: image && alt ? alt : '', ...(photo ? { photo } : {}), link: href, linkLabel: href ? clean(t?.linkLabel, 60) : '' });
  }
  return out;
}

const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
const prepare = (photos, projects, social = null, images = null, testimonials = null) => {
  const p = normalizePhotos(photos), pr = normalizeProjects(projects), so = normalizeSocial(social), im = normalizeImages(images), te = normalizeTestimonials(testimonials);
  return { ...p, projects: pr, social: so, images: im, testimonials: te, hash: fingerprint({ list: p.items, ...(p.tileRank ? { tileRank: p.tileRank } : {}), projects: pr, ...(so ? { social: so } : {}), ...(im && Object.keys(im).length ? { images: im } : {}), ...(te ? { testimonials: te } : {}) }) };
};

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} sur ${url}`);
  return res.json();
};
// Dernière version publiée depuis l'admin.
async function latestSnapshot() {
  if (!supabaseUrl || !key) throw new Error('adresse Supabase absente');
  const rows = await getJson(`${supabaseUrl}/rest/v1/content_snapshots?select=id,photos:content->photos,projects:content->projects,social:content->instagram,images:content->images,testimonials:content->testimonials&order=id.desc&limit=1`, { apikey: key, authorization: `Bearer ${key}` });
  const r = rows[0] || {};
  return { snapshot: r.id || null, ...prepare(r.photos, r.projects, r.social, r.images, r.testimonials) };
}
// Version actuellement en ligne (secours, et comparaison pour --check).
async function liveManifest() {
  const m = await getJson(`${liveUrl}${WEB_PATH}manifest.json`);
  const social = Array.isArray(m.social) ? m.social.map(p => ({ ...p, coverImage: p.image, video: p.video })) : null;
  const live = prepare({ items: (m.items || []).map(p => ({ ...p, visible: p.inSection ?? true, inTile: p.inTile ?? true })), tileRank: m.tileRank }, m.projects ?? null, social, m.images ?? null, m.testimonials ?? null);
  return { snapshot: m.snapshot || null, ...live, published: /^[a-f0-9]{16}$/.test(m.published || '') ? m.published : live.hash };
}
const signature = (body, kind) => kind === 'webp'
  ? body.length > 12 && body.toString('latin1', 0, 4) === 'RIFF' && body.toString('latin1', 8, 12) === 'WEBP'
  : kind === 'webm' ? body.length > 4 && body.readUInt32BE(0) === 0x1a45dfa3
  : body.length > 12 && ['ftyp', 'moov', 'mdat', 'wide', 'free'].includes(body.toString('latin1', 4, 8));
async function download(url, kind = 'webp', max = MAX_BYTES) {
  const res = await fetch(url, { signal: AbortSignal.timeout(kind === 'webp' ? 30000 : 180000) });
  const body = Buffer.from(await res.arrayBuffer());
  const ok = signature(body, kind);
  if (!res.ok || !ok || body.length > max) throw new Error(`${res.status}, ${body.length} o${ok ? '' : `, pas un fichier ${kind}`}`);
  return body;
}

// Les fonctions de normalisation s'importent sans rien lancer (tests) ; le script ne tourne que lancé directement.
async function main() {
const check = process.argv.includes('--check');
let published = null, source = '';
try { published = await latestSnapshot(); source = 'supabase'; }
catch (error) { console.warn(`Publication : version publiée illisible (${error.message}).`); }

if (check) {
  // Changement = la version publiée depuis l'admin diffère de celle en ligne. En cas de doute : on ne relance rien.
  let live = null;
  try { live = await liveManifest(); } catch { live = { hash: prepare(null, null).hash }; }
  const changed = Boolean(published && published.hash !== (live.published || live.hash));
  console.log(`Publication : ${changed ? 'nouvelle version à mettre en ligne' : 'rien de nouveau'} (publié ${published?.hash || 'inconnu'}, en ligne ${live.published || live.hash}).`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  return;
}

let base = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`, videoBase = `${supabaseUrl}/storage/v1/object/public/site-videos/`;
if (!published) {
  try { published = await liveManifest(); source = 'site en ligne'; base = `${liveUrl}${WEB_PATH}`; videoBase = `${liveUrl}${VIDEO_PATH}`; }
  catch (error) { console.warn(`Publication : aucune copie de secours (${error.message}). Le site garde le contenu du code.`); published = { snapshot: null, ...prepare(null, null) }; source = 'aucune'; }
}

const videoDir = join(root, 'public', VIDEO_PATH);
for (const dir of [outDir, videoDir]) { await rm(dir, { recursive: true, force: true }); await mkdir(dir, { recursive: true }); }
const copied = new Set();
const copy = async (image, label) => {
  if (copied.has(image.id)) return true;
  try {
    const [large, small] = await Promise.all([download(`${base}${image.id}.webp`), download(`${base}${image.id}-s.webp`)]);
    await writeFile(join(outDir, `${image.id}.webp`), large);
    await writeFile(join(outDir, `${image.id}-s.webp`), small);
    copied.add(image.id); return true;
  } catch (error) { console.warn(`${label} ${image.id} non copiée (${error.message}) : elle n'apparaîtra pas sur le site.`); return false; }
};
const keptPhotos = [];
for (const photo of published.items) if (await copy(photo, 'Photo')) keptPhotos.push(photo);
// Vidéos : 600 Mo au total au maximum (vidéos sociales et vidéos des projets).
let videoBytes = 0;
const copyVideo = async (video, label) => {
  try {
    const body = await download(`${videoBase}${video.id}.${video.ext}`, video.ext === 'webm' ? 'webm' : 'mp4', MAX_VIDEO);
    if (videoBytes + body.length > 600 * 1024 * 1024) throw new Error('limite de 600 Mo de vidéos atteinte');
    await writeFile(join(videoDir, `${video.id}.${video.ext}`), body);
    videoBytes += body.length; return true;
  } catch (error) { console.warn(`Vidéo ${label} non copiée (${error.message}) : elle n'apparaîtra pas sur le site.`); return false; }
};
const keptProjects = published.projects && [];
for (const project of published.projects || []) {
  // Projet masqué : ses médias restent dans la liste sans être copiés. Un média dont un fichier manque est retiré
  // (le projet reste masqué s'il n'a plus aucun média réel).
  const media = [];
  for (const m of project.media || []) {
    if (!project.visible) { media.push(m); continue; }
    if (m.image && !await copy(m.image, `Image du projet ${project.slug}`)) { if (m.kind !== 'youtube') continue; media.push({ ...m, image: null }); continue; }
    if (m.video && !await copyVideo(m.video, `du projet ${project.slug}`)) continue;
    media.push(m);
  }
  keptProjects.push(normalizeProjects([{ ...project, media }])[0] || { ...project, media, image: null });
}
const keptSocial = published.social && [];
for (const post of published.social || []) {
  const image = post.image && await copy(post.image, `Miniature de ${post.title}`) ? post.image : null;
  if (post.video && !await copyVideo(post.video, post.title)) continue;
  keptSocial.push({ ...post, image });
}
const keptImages = published.images && {};
for (const [slot, value] of Object.entries(published.images || {})) if (await copy(value.image, `Image ${slot}`) && (!value.video || await copyVideo(value.video, `de la bannière (${slot})`))) keptImages[slot] = value;
// Avis : une image ou une photo qui ne se copie pas est retirée (l'avis reste, sans elle : initiales à la place).
const keptTestimonials = published.testimonials && [];
for (const t of published.testimonials || []) {
  const image = t.image && await copy(t.image, `Image de l'avis de ${t.name}`) ? t.image : null;
  const photo = t.photo && await copy(t.photo, `Photo de ${t.name}`) ? t.photo : null;
  const { photo: _, ...rest } = t;
  keptTestimonials.push({ ...rest, image, alt: image ? t.alt : '', ...(photo ? { photo } : {}) });
}
const photos = normalizePhotos({ items: keptPhotos.map(p => ({ ...p, visible: p.inSection })), tileRank: published.tileRank });
// published : empreinte de la version source, pour que --check ne relance pas sans fin si un fichier manque.
const manifest = { snapshot: published.snapshot, published: published.published || published.hash, ...photos, projects: keptProjects, social: keptSocial, images: keptImages, testimonials: keptTestimonials };
const write = (file, data) => writeFile(join(root, 'content', file), JSON.stringify({ snapshot: manifest.snapshot, ...data }, null, 1) + '\n');
await write('photos.published.json', photos);
await write('projects.published.json', { projects: keptProjects });
await write('social.published.json', { social: keptSocial });
await write('images.published.json', { images: keptImages });
await write('testimonials.published.json', { testimonials: keptTestimonials });
await write('published.json', { published: manifest.published });
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest) + '\n');
console.log(`Publication copiée (source : ${source}${manifest.snapshot ? `, version n° ${manifest.snapshot}` : ''}) : ${photos.items.length} photo(s), ${keptProjects ? `${keptProjects.length} projet(s)` : 'projets du code'}, ${keptSocial ? `${keptSocial.length} vidéo(s) sociale(s) dont ${keptSocial.filter(p => p.video).length} fichier(s) (${Math.round(videoBytes / 1048576)} Mo)` : 'vidéos sociales du code'}, ${keptImages ? Object.keys(keptImages).length : 0} image(s) du site remplacée(s), ${keptTestimonials ? `${keptTestimonials.length} avis` : 'avis du code'}.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
