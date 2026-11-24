// Photographies de Nolan affichées sur la page Work (tuile « Photographie » du bento et section dédiée).
//
// RÈGLE R1 : uniquement des photos réelles de Nolan, jamais d'image de stock. Sans aucune photo publiée,
// la tuile et la section ne sont pas affichées (jamais de cadre vide en ligne) ; une seule photo suffit.
//
// Les photos se gèrent depuis l'admin (/admin/, rubrique « Photos ») : envoi, ordre,
// légendes, section et tuile. Au déploiement, tools/fetch-published.mjs copie la dernière version publiée
// dans public/assets/photo/site/ et écrit content/photos.published.json (fichiers générés, non versionnés).
import { readFileSync } from 'node:fs';

let published = { items: [] };
try { published = JSON.parse(readFileSync(new URL('./photos.published.json', import.meta.url), 'utf8')); } catch {}
const items = Array.isArray(published.items) ? published.items : [];
// Ancienne version publiée (sans les deux cases) : toutes les photos étaient dans la section et dans la tuile.
const inSection = p => p.inSection !== false, inTile = p => p.inTile ?? true;

// Section Photographie : photos cochées « Visible dans la section Photographie ».
// Chaque photo : src (grande), srcSmall (petite), dimensions réelles, alt obligatoire, series, place, year.
export const photos = items.filter(inSection);

// Tuile « Photographie » de Ma sélection : un seul bloc, toutes les photos cochées « Dans la tuile », dans l'ordre.
// Aucune photo cochée : pas de tuile.
export const tilePhotos = items.filter(inTile);
// Place de la tuile Photographie dans « Ma sélection » (admin, rubrique « Ordre »), sinon null.
export const tileRank = Number.isInteger(published.tileRank) ? published.tileRank : null;

// Même liste, au format du brouillon de l'admin (pour « Importer le contenu actuel du site »).
export const photoDraft = { ...(tileRank ? { tileRank } : {}), items: items.map(({ id, width, height, smallWidth, smallHeight, source, crop, alt, series, place, year, ...p }) => ({ id, width, height, smallWidth, smallHeight, ...(source ? { source } : {}), ...(crop ? { crop } : {}), alt, series, place, year, visible: inSection(p), inTile: inTile(p), ...(Array.isArray(p.categories) ? { categories: p.categories } : {}), ...(p.featured ? { featured: true } : {}), ...(Number.isInteger(p.rank) ? { rank: p.rank } : {}) })) };

export const MIN_PHOTOS = 1;
