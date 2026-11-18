// Images du site remplaçables depuis l'admin (rubrique « Images du site ») : accueil, « Trois dimensions »
// (fond des trois dossiers) et « Mariage » (trois polaroids). Sans image publiée, chaque emplacement garde
// son image d'origine. Fichier généré au déploiement : content/images.published.json (non versionné).
import { readFileSync } from 'node:fs';

let published = {};
try { published = JSON.parse(readFileSync(new URL('./images.published.json', import.meta.url), 'utf8')).images || {}; } catch {}

// Emplacement -> { image: { src, srcSmall, width, height, smallWidth, smallHeight }, alt } ou null.
export const siteImage = slot => published[slot]?.image ? published[slot] : null;

// Version publiée copiée sur le site (affichée par l'admin via /version.json).
export let publishedVersion = { snapshot: null, published: '' };
try { publishedVersion = JSON.parse(readFileSync(new URL('./published.json', import.meta.url), 'utf8')); } catch {}
