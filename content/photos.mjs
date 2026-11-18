// Photographies de Nolan affichées sur la page Work (tuile « Photographie » du bento et section dédiée).
//
// RÈGLE R1 : uniquement des photos réelles de Nolan, jamais d'image de stock. Tant qu'il y a moins de
// trois photos, la tuile et la section ne sont pas affichées (jamais de cadre vide en ligne).
//
// Les photos se gèrent depuis l'admin (/admin/, rubrique « Photos de la page Work ») : envoi, ordre,
// légendes, photo de la tuile. Au déploiement, tools/fetch-published.mjs copie la dernière version publiée
// dans public/assets/photo/site/ et écrit content/photos.published.json (fichiers générés, non versionnés).
import { readFileSync } from 'node:fs';

let published = { cover: '', items: [] };
try { published = JSON.parse(readFileSync(new URL('./photos.published.json', import.meta.url), 'utf8')); } catch {}

// Chaque photo : src (grande), srcSmall (petite), dimensions réelles des deux fichiers, alt obligatoire,
// series, place (facultatif), year.
export const photos = Array.isArray(published.items) ? published.items : [];

// Photo choisie pour la tuile du bento (la première sinon).
export const coverId = photos.some(p => p.id === published.cover) ? published.cover : (photos[0]?.id || '');

// Les trois photos de la mosaïque de la tuile : celle choisie d'abord, puis les suivantes dans l'ordre.
export const tilePhotos = [...photos.filter(p => p.id === coverId), ...photos.filter(p => p.id !== coverId)].slice(0, 3);

// Même liste, au format du brouillon de l'admin (pour « Importer le contenu actuel du site »).
export const photoDraft = { cover: coverId, items: photos.map(({ id, width, height, smallWidth, smallHeight, alt, series, place, year }) => ({ id, width, height, smallWidth, smallHeight, alt, series, place, year, visible: true })) };

export const MIN_PHOTOS = 3;
