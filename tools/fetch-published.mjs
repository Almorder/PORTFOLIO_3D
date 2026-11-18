// Copie sur le site ce qui a été publié depuis l'admin : photos de la page Work (section Photographie),
// projets de « Ma sélection » (bento), social media videos (fichiers vidéo compris) et images du site
// (accueil). Lancé au déploiement, avant le build (.github/workflows/pages.yml).
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
import { site } from '../content/site.mjs';

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
  return validId(id) && width && height && smallWidth && smallHeight ? { id, src: `${WEB_PATH}${id}.webp`, srcSmall: `${WEB_PATH}${id}-s.webp`, width, height, smallWidth, smallHeight } : null;
};

// Photos : une photo masquée ou sans texte alternatif n'est jamais publiée.
export function normalizePhotos(draft) {
  const seen = new Set(), list = [];
  for (const it of Array.isArray(draft?.items) ? draft.items : []) {
    const image = imageOf(it), alt = clean(it?.alt, 300);
    if (!image || seen.has(image.id) || it.visible !== true || !alt) continue;
    seen.add(image.id);
    list.push({ ...image, alt, series: clean(it.series, 80), place: clean(it.place, 80), year: yearOf(it.year) });
  }
  return { cover: list.some(p => p.id === draft?.cover) ? draft.cover : (list[0]?.id || ''), items: list };
}

// Projets : seuls les champs éditables passent. Les champs techniques (adresse de la page, affiche, statut)
// restent ceux du code (content/projects.mjs) et ne peuvent pas venir de la base.
const TERRITORIES = ['Récits', 'Marques', 'Moments', 'Réseaux', 'Photographie'];
const link = value => { const v = String(value || '').trim(); return /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[\w.-]+(\/[\w\-./?=&#%~+]*)?$/.test(v) ? v.slice(0, 300) : ''; };
export function normalizeProjects(list) {
  if (!Array.isArray(list)) return null;
  const seen = new Set(), out = [];
  for (const p of list.slice(0, 40)) {
    const slug = String(p?.slug || '');
    const title = clean(p?.title, 120);
    if (!/^[a-z0-9-]{2,60}$/.test(slug) || seen.has(slug) || !title) continue;
    seen.add(slug);
    const mediaKind = ['photo', 'youtube', 'instagram'].includes(p.mediaKind) ? p.mediaKind : (/^[\w-]{11}$/.test(p.videoId || '') ? 'youtube' : '');
    const image = imageOf(p.image);
    out.push({
      slug, title, visible: p.visible === true,
      territory: TERRITORIES.includes(p.territory) ? p.territory : '',
      type: clean(p.type, 80), role: clean(p.role, 80), context: clean(p.context, 120), client: clean(p.client, 80),
      year: yearOf(p.year), result: clean(p.result, 200), link: link(p.link), summary: clean(p.summary, 400),
      mediaKind,
      videoId: /^[\w-]{11}$/.test(p.videoId || '') ? p.videoId : '',
      instagramId: /^[\w-]{5,40}$/.test(p.instagramId || '') ? p.instagramId : '',
      image, alt: clean(p.alt, 300),
      uploadDate: /^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate || '') ? p.uploadDate : '',
      duration: /^PT(\d+H)?(\d+M)?(\d+S)?$/.test(p.duration || '') && p.duration !== 'PT' ? p.duration : '',
      // Page projet (Le bol d'en face) :
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
const VIDEO_EXT = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm' };
const MAX_VIDEO = 50 * 1024 * 1024;
const VIDEO_PATH = '/assets/video/site/';
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
      key, source: file ? 'file' : 'instagram', id, title, kind: clean(p.kind, 80),
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
  'home.cards.mariage': false, 'home.cards.demande': false, 'home.cards.contenu': false, 'home.cards.film': false, 'home.cards.direction': false, 'home.cards.strategie': false, 'home.cards.dos': false };
export function normalizeImages(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const out = {};
  for (const [slot, needsAlt] of Object.entries(IMAGE_SLOTS)) {
    const image = imageOf(map[slot]?.image), alt = clean(map[slot]?.alt, 300);
    if (image && (!needsAlt || alt)) out[slot] = { image, alt };
  }
  return out;
}

const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
const prepare = (photos, projects, social = null, images = null) => {
  const p = normalizePhotos(photos), pr = normalizeProjects(projects), so = normalizeSocial(social), im = normalizeImages(images);
  return { ...p, projects: pr, social: so, images: im, hash: fingerprint({ cover: p.cover, list: p.items, projects: pr, ...(so ? { social: so } : {}), ...(im && Object.keys(im).length ? { images: im } : {}) }) };
};

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} sur ${url}`);
  return res.json();
};
// Dernière version publiée depuis l'admin.
async function latestSnapshot() {
  if (!supabaseUrl || !key) throw new Error('adresse Supabase absente');
  const rows = await getJson(`${supabaseUrl}/rest/v1/content_snapshots?select=id,photos:content->photos,projects:content->projects,social:content->instagram,images:content->images&order=id.desc&limit=1`, { apikey: key, authorization: `Bearer ${key}` });
  const r = rows[0] || {};
  return { snapshot: r.id || null, ...prepare(r.photos, r.projects, r.social, r.images) };
}
// Version actuellement en ligne (secours, et comparaison pour --check).
async function liveManifest() {
  const m = await getJson(`${liveUrl}${WEB_PATH}manifest.json`);
  const social = Array.isArray(m.social) ? m.social.map(p => ({ ...p, coverImage: p.image, video: p.video })) : null;
  const live = prepare({ cover: m.cover, items: (m.items || []).map(p => ({ ...p, visible: true })) }, m.projects ?? null, social, m.images ?? null);
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
  process.exit(0);
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
const keptProjects = published.projects && [];
for (const project of published.projects || []) {
  // Image d'un projet masqué : gardée dans la liste mais pas copiée. Image manquante : le projet perd son image (masqué s'il n'a pas d'autre média).
  const image = !project.image ? null : !project.visible ? project.image : await copy(project.image, `Image du projet ${project.slug}`) ? project.image : null;
  keptProjects.push({ ...project, image });
}
// Vidéos : 600 Mo au total au maximum (GitHub Pages limite le site à 1 Go).
const keptSocial = published.social && [];
let videoBytes = 0;
for (const post of published.social || []) {
  const image = post.image && await copy(post.image, `Miniature de ${post.title}`) ? post.image : null;
  if (post.video) {
    try {
      const body = await download(`${videoBase}${post.video.id}.${post.video.ext}`, post.video.ext === 'webm' ? 'webm' : 'mp4', MAX_VIDEO);
      if (videoBytes + body.length > 600 * 1024 * 1024) throw new Error('limite de 600 Mo de vidéos atteinte');
      await writeFile(join(videoDir, `${post.video.id}.${post.video.ext}`), body);
      videoBytes += body.length;
    } catch (error) { console.warn(`Vidéo ${post.title} non copiée (${error.message}) : elle n'apparaîtra pas sur le site.`); continue; }
  }
  keptSocial.push({ ...post, image });
}
const keptImages = published.images && {};
for (const [slot, value] of Object.entries(published.images || {})) if (await copy(value.image, `Image ${slot}`)) keptImages[slot] = value;
const photos = normalizePhotos({ cover: published.cover, items: keptPhotos.map(p => ({ ...p, visible: true })) });
// published : empreinte de la version source, pour que --check ne relance pas sans fin si un fichier manque.
const manifest = { snapshot: published.snapshot, published: published.published || published.hash, ...photos, projects: keptProjects, social: keptSocial, images: keptImages };
const write = (file, data) => writeFile(join(root, 'content', file), JSON.stringify({ snapshot: manifest.snapshot, ...data }, null, 1) + '\n');
await write('photos.published.json', photos);
await write('projects.published.json', { projects: keptProjects });
await write('social.published.json', { social: keptSocial });
await write('images.published.json', { images: keptImages });
await write('published.json', { published: manifest.published });
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest) + '\n');
console.log(`Publication copiée (source : ${source}${manifest.snapshot ? `, version n° ${manifest.snapshot}` : ''}) : ${photos.items.length} photo(s), ${keptProjects ? `${keptProjects.length} projet(s)` : 'projets du code'}, ${keptSocial ? `${keptSocial.length} vidéo(s) sociale(s) dont ${keptSocial.filter(p => p.video).length} fichier(s) (${Math.round(videoBytes / 1048576)} Mo)` : 'vidéos sociales du code'}, ${keptImages ? Object.keys(keptImages).length : 0} image(s) du site remplacée(s).`);
