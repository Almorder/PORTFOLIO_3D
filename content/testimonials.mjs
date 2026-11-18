// Avis clients affichés sur le site (accueil, Work, Contact, À propos). Depuis l'admin (rubrique « Avis »),
// Nolan les ajoute, modifie, ordonne et masque ; « Enregistrer et publier » les met en ligne : au déploiement,
// tools/fetch-published.mjs écrit content/testimonials.published.json (non versionné), qui remplace alors la
// liste de départ ci-dessous (content/site.mjs). Images : seulement celles envoyées depuis l'admin, servies par le site.
import { readFileSync } from 'node:fs';
import { site } from './site.mjs';

let published = null;
try { published = JSON.parse(readFileSync(new URL('./testimonials.published.json', import.meta.url), 'utf8')).testimonials; } catch {}
// Liste de départ (code) : même forme que la version publiée, sans image (aucune adresse libre).
const fromCode = site.testimonials.map(({ quote, name, role = '', link = '', linkLabel = '' }) => ({ quote, name, role, image: null, alt: '', link, linkLabel }));
export const testimonials = Array.isArray(published) && published.length ? published : fromCode;
// Brouillon de l'admin (import) : l'image garde son identifiant et ses dimensions, rien d'autre.
export const testimonialsDraft = testimonials.map(({ image, ...t }) => ({ ...t, image: image ? { id: image.id, width: image.width, height: image.height, smallWidth: image.smallWidth, smallHeight: image.smallHeight } : null, visible: true }));
