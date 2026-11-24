import { weddingPhotos, weddingOffers } from '../content/wedding.mjs';
import { siteImage } from '../content/site-images.mjs';

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const captionOf = photo => photo.caption || (weddingOffers[photo.offer] || weddingOffers.mariage).title;

// Les trois images de la section : photo remplacée depuis l'admin (Images du site > Accueil · Mariage,
// emplacements home.wedding.0/1/2), sinon texture de la DA (jamais de fausse photo).
const SLOT_DEFAULTS = [{ offer: 'mariage' }, { offer: 'demande' }, { offer: 'mariage', caption: 'Le jour J' }];
const slotPhoto = index => { const s = siteImage(`home.wedding.${index}`); return s ? { ...SLOT_DEFAULTS[index], src: s.image.srcSmall, srcset: `${s.image.srcSmall} ${s.image.smallWidth}w, ${s.image.src} ${s.image.width}w`, width: s.image.smallWidth, height: s.image.smallHeight, alt: s.alt } : null; };

const tilts = [-7, 3, 8];
// Une photo : coins arrondis, ombre et grain des dossiers « Trois dimensions », format 4:5, un intitulé court
// posé en bas sur un léger dégradé. Chaque photo ouvre le catalogue Work filtré sur Mariage.
const card = (photo, i) => `<li style="--r:${tilts[i]}deg;--i:${i}"><a class="wed-card" href="/work/?categorie=mariage"><span class="wed-card__img">${photo.src
  ? `<img src="${esc(photo.src)}"${photo.srcset ? ` srcset="${esc(photo.srcset)}" sizes="(max-width: 760px) 46vw, 350px"` : ''}${photo.width ? ` width="${photo.width}" height="${photo.height}"` : ''} alt="${esc(photo.alt || '')}" loading="lazy" decoding="async">`
  : `<span class="wed-card__da" style="--k:${i}" aria-hidden="true"></span>`}</span><span class="wed-card__cap">${esc(captionOf(photo))}</span><span class="sr-only"> : voir les réalisations mariage</span></a></li>`;

// Accueil : le grand titre (prestations), trois photos posées en éventail qui se superposent, un seul bouton.
export function weddingWall() {
  const photos = [0, 1, 2].map(i => slotPhoto(i) || weddingPhotos[i] || SLOT_DEFAULTS[i]);
  return `<section class="wedding-wall motion-reveal" aria-labelledby="wedding-wall-title">
      <h2 class="wedding-wall__title" id="wedding-wall-title"><a href="/services/#mariage">Mariage<span class="sr-only"> : voir les prestations mariage et demande en mariage</span></a></h2>
      <ul class="wedding-wall__photos">${photos.map(card).join('')}</ul>
      <a class="wedding-wall__cta" href="/services/#mariage">Voir les formules mariage <span aria-hidden="true">↗</span></a>
    </section>`;
}
