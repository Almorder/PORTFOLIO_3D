// Copie sur le site ce qui a été publié depuis l'admin : photos de la page Work (section Photographie)
// et projets de « Ma sélection » (bento). Lancé au déploiement, avant le build (.github/workflows/pages.yml).
//
// Chemin d'une publication : l'admin envoie les images WebP dans l'espace Supabase « site-photos » et le
// texte dans les brouillons « photos » et « projects ». « Enregistrer une version » fige les brouillons dans
// content_snapshots. Ce script lit la dernière version (lecture publique, clé publique déjà dans le dépôt,
// aucun secret), nettoie chaque champ, télécharge les images et les range dans public/assets/photo/site/ :
// les visiteurs chargent ensuite tout depuis nolanarc.com, jamais depuis Supabase.
// Résultat : content/photos.published.json et content/projects.published.json (fichiers générés, non versionnés),
// lus par content/photos.mjs et content/projects.mjs.
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
const photosFile = join(root, 'content/photos.published.json');
const projectsFile = join(root, 'content/projects.published.json');
const supabaseUrl = (process.env.PHOTOS_SUPABASE_URL || site.supabaseUrl || '').replace(/\/$/, '');
const liveUrl = (process.env.PHOTOS_LIVE_URL || site.domain).replace(/\/$/, '');
const key = site.supabasePublishableKey;
const BUCKET = 'site-photos';
const MAX_BYTES = 3 * 1024 * 1024;
const WEB_PATH = '/assets/photo/site/';

// Texte publié : propre, court, sans tiret long ni demi-cadratin (règle du site).
const clean = (value, max) => String(value ?? '').replace(/[—–]/g, '-').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
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

const fingerprint = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
const prepare = (photos, projects) => { const p = normalizePhotos(photos), pr = normalizeProjects(projects); return { ...p, projects: pr, hash: fingerprint({ cover: p.cover, list: p.items, projects: pr }) }; };

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} sur ${url}`);
  return res.json();
};
// Dernière version publiée depuis l'admin.
async function latestSnapshot() {
  if (!supabaseUrl || !key) throw new Error('adresse Supabase absente');
  const rows = await getJson(`${supabaseUrl}/rest/v1/content_snapshots?select=id,photos:content->photos,projects:content->projects&order=id.desc&limit=1`, { apikey: key, authorization: `Bearer ${key}` });
  return { snapshot: rows[0]?.id || null, ...prepare(rows[0]?.photos, rows[0]?.projects) };
}
// Version actuellement en ligne (secours, et comparaison pour --check).
async function liveManifest() {
  const m = await getJson(`${liveUrl}${WEB_PATH}manifest.json`);
  const live = prepare({ cover: m.cover, items: (m.items || []).map(p => ({ ...p, visible: true })) }, m.projects ?? null);
  return { snapshot: m.snapshot || null, ...live, published: /^[a-f0-9]{16}$/.test(m.published || '') ? m.published : live.hash };
}
async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const body = Buffer.from(await res.arrayBuffer());
  const webp = body.length > 12 && body.toString('latin1', 0, 4) === 'RIFF' && body.toString('latin1', 8, 12) === 'WEBP';
  if (!res.ok || !webp || body.length > MAX_BYTES) throw new Error(`${res.status}, ${body.length} o${webp ? '' : ', pas un fichier WebP'}`);
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

let base = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
if (!published) {
  try { published = await liveManifest(); source = 'site en ligne'; base = `${liveUrl}${WEB_PATH}`; }
  catch (error) { console.warn(`Publication : aucune copie de secours (${error.message}). Le site garde le contenu du code.`); published = { snapshot: null, ...prepare(null, null) }; source = 'aucune'; }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
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
const photos = normalizePhotos({ cover: published.cover, items: keptPhotos.map(p => ({ ...p, visible: true })) });
// published : empreinte de la version source, pour que --check ne relance pas sans fin si un fichier manque.
const manifest = { snapshot: published.snapshot, published: published.published || published.hash, ...photos, projects: keptProjects };
await writeFile(photosFile, JSON.stringify({ snapshot: manifest.snapshot, ...photos }, null, 1) + '\n');
await writeFile(projectsFile, JSON.stringify({ snapshot: manifest.snapshot, projects: keptProjects }, null, 1) + '\n');
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest) + '\n');
console.log(`Publication copiée (source : ${source}${manifest.snapshot ? `, version n° ${manifest.snapshot}` : ''}) : ${photos.items.length} photo(s), ${keptProjects ? `${keptProjects.length} projet(s)` : 'projets du code'}.`);
