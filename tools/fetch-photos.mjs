// Copie sur le site les photos publiées depuis l'admin (page Work, section Photographie).
// Lancé au déploiement, avant le build (voir .github/workflows/pages.yml).
//
// Chemin d'une photo : l'admin envoie les fichiers WebP dans l'espace Supabase « site-photos » et la liste
// (ordre, légendes, photo de la tuile) dans le brouillon « photos ». « Enregistrer une version » fige ce
// brouillon dans content_snapshots. Ce script lit la dernière version (lecture publique, clé publique déjà
// dans le dépôt, aucun secret), télécharge les fichiers et les range dans public/assets/photo/site/ :
// les visiteurs chargent ensuite les photos depuis nolanarc.com, jamais depuis Supabase.
//
// Si Supabase ne répond pas (projet en pause, réseau), le script reprend les photos déjà en ligne sur
// nolanarc.com : un déploiement ne fait jamais disparaître les photos à cause d'une panne.
//
//   node tools/fetch-photos.mjs           copie les photos (déploiement)
//   node tools/fetch-photos.mjs --check   dit seulement si les photos publiées ont changé (changed=true/false)
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { site } from '../content/site.mjs';

const root = new URL('../', import.meta.url).pathname;
const outDir = join(root, 'public/assets/photo/site');
const publishedFile = join(root, 'content/photos.published.json');
const supabaseUrl = (process.env.PHOTOS_SUPABASE_URL || site.supabaseUrl || '').replace(/\/$/, '');
const liveUrl = (process.env.PHOTOS_LIVE_URL || site.domain).replace(/\/$/, '');
const key = site.supabasePublishableKey;
const BUCKET = 'site-photos';
const MAX_BYTES = 3 * 1024 * 1024;
const WEB_PATH = '/assets/photo/site/';

// Texte publié : propre, court, sans tiret long ni demi-cadratin (règle du site).
const clean = (value, max) => String(value ?? '').replace(/[\u2014\u2013]/g, '-').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const dim = value => Number.isInteger(value) && value >= 16 && value <= 8000 ? value : 0;

// Brouillon de l'admin -> liste publiée. Une photo masquée ou sans texte alternatif n'est jamais publiée.
export function normalize(draft) {
  const items = Array.isArray(draft?.items) ? draft.items : [];
  const seen = new Set();
  const list = [];
  for (const it of items) {
    const id = String(it?.id || '');
    if (!/^[a-z0-9-]{8,64}$/.test(id) || seen.has(id)) continue;
    seen.add(id);
    const alt = clean(it.alt, 300);
    const width = dim(it.width), height = dim(it.height), smallWidth = dim(it.smallWidth), smallHeight = dim(it.smallHeight);
    if (it.visible !== true || !alt || !width || !height || !smallWidth || !smallHeight) continue;
    const year = /^\d{4}$/.test(String(it.year || '').trim()) ? String(it.year).trim() : '';
    list.push({ id, src: `${WEB_PATH}${id}.webp`, srcSmall: `${WEB_PATH}${id}-s.webp`, width, height, smallWidth, smallHeight, alt, series: clean(it.series, 80), place: clean(it.place, 80), year });
  }
  const cover = list.some(p => p.id === draft?.cover) ? draft.cover : (list[0]?.id || '');
  const hash = createHash('sha256').update(JSON.stringify({ cover, list })).digest('hex').slice(0, 16);
  return { cover, items: list, hash };
}

const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${res.status} sur ${url}`);
  return res.json();
};
// Dernière version publiée depuis l'admin (null si aucune version ne contient encore de photos).
async function latestSnapshot() {
  if (!supabaseUrl || !key) throw new Error('adresse Supabase absente');
  const rows = await getJson(`${supabaseUrl}/rest/v1/content_snapshots?select=id,photos:content->photos&order=id.desc&limit=1`, { apikey: key, authorization: `Bearer ${key}` });
  return { snapshot: rows[0]?.id || null, ...normalize(rows[0]?.photos) };
}
// Photos actuellement en ligne (secours, et comparaison pour --check).
async function liveManifest() {
  const m = await getJson(`${liveUrl}${WEB_PATH}manifest.json`);
  const live = normalize({ cover: m.cover, items: (m.items || []).map(p => ({ ...p, visible: true })) });
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
catch (error) { console.warn(`Photos : version publiée illisible (${error.message}).`); }

if (check) {
  // Changement = la liste publiée depuis l'admin diffère de celle en ligne. En cas de doute : on ne relance rien.
  let live = null;
  try { live = await liveManifest(); } catch { live = { hash: normalize({}).hash }; }
  const changed = Boolean(published && published.hash !== (live.published || live.hash));
  console.log(`Photos : ${changed ? 'nouvelle version à mettre en ligne' : 'rien de nouveau'} (publié ${published?.hash || 'inconnu'}, en ligne ${live.published || live.hash}).`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
  process.exit(0);
}

let base = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
if (!published) {
  try { published = await liveManifest(); source = 'site en ligne'; base = `${liveUrl}${WEB_PATH}`; }
  catch (error) { console.warn(`Photos : aucune copie de secours (${error.message}). La section Photographie reste masquée.`); published = { snapshot: null, ...normalize({}) }; source = 'aucune'; }
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
const kept = [];
for (const photo of published.items) {
  try {
    const [large, small] = await Promise.all([download(`${base}${photo.id}.webp`), download(`${base}${photo.id}-s.webp`)]);
    await writeFile(join(outDir, `${photo.id}.webp`), large);
    await writeFile(join(outDir, `${photo.id}-s.webp`), small);
    kept.push(photo);
  } catch (error) {
    console.warn(`Photo ${photo.id} non copiée (${error.message}) : elle n'apparaîtra pas sur le site.`);
  }
}
// published : empreinte de la version source, pour que --check ne relance pas sans fin si un fichier manque.
const final = { snapshot: published.snapshot, published: published.published || published.hash, ...normalize({ cover: published.cover, items: kept.map(p => ({ ...p, visible: true })) }) };
await writeFile(publishedFile, JSON.stringify(final, null, 1) + '\n');
await writeFile(join(outDir, 'manifest.json'), JSON.stringify(final) + '\n');
console.log(`Photos copiées : ${final.items.length} (source : ${source}${final.snapshot ? `, version n° ${final.snapshot}` : ''}).`);
