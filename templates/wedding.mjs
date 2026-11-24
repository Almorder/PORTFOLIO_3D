import { weddingPhotos, weddingOffers } from '../content/wedding.mjs';
import { siteImage } from '../content/site-images.mjs';

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const offerHref = photo => `/services/#${(weddingOffers[photo.offer] || weddingOffers.mariage).id}`;
const captionOf = photo => photo.caption || (weddingOffers[photo.offer] || weddingOffers.mariage).title;

// Les trois images de la section : photo remplacée depuis l'admin (Images du site > Accueil · Mariage,
// emplacements home.wedding.0/1/2), sinon texture de la DA (jamais de fausse photo).
const SLOT_DEFAULTS = [{ offer: 'mariage' }, { offer: 'demande' }, { offer: 'mariage', caption: 'Le jour J' }];
const slotPhoto = index => { const s = siteImage(`home.wedding.${index}`); return s ? { ...SLOT_DEFAULTS[index], src: s.image.srcSmall, srcset: `${s.image.srcSmall} ${s.image.smallWidth}w, ${s.image.src} ${s.image.width}w`, width: s.image.smallWidth, height: s.image.smallHeight, alt: s.alt } : null; };

const shot = (photo, i) => photo.src
  ? `<img class="wed__shot${i ? '' : ' is-on'}" data-wed-shot src="${esc(photo.src)}"${photo.srcset ? ` srcset="${esc(photo.srcset)}" sizes="(max-width: 760px) 92vw, 460px"` : ''}${photo.width ? ` width="${photo.width}" height="${photo.height}"` : ''} alt="${esc(photo.alt || '')}"${i ? ' aria-hidden="true"' : ''} loading="lazy" decoding="async">`
  : `<span class="wed__shot wed__shot--da${i ? '' : ' is-on'}" data-wed-shot style="--k:${i}" aria-hidden="true"></span>`;

// Accueil : le grand titre (prestations), un seul cadre et trois intitulés qui choisissent la photo affichée.
// Le cadre ouvre le catalogue Work filtré sur Mariage ; « Voir l'offre » suit l'intitulé actif (Services).
export function weddingWall() {
  const photos = [0, 1, 2].map(i => slotPhoto(i) || weddingPhotos[i] || SLOT_DEFAULTS[i]);
  return `<section class="wedding-wall motion-reveal" aria-labelledby="wedding-wall-title" data-wed>
      <h2 class="wedding-wall__title" id="wedding-wall-title"><a href="/services/#mariage">Mariage<span class="sr-only"> : voir les prestations mariage et demande en mariage</span></a></h2>
      <div class="wed">
        <div class="wed__picks" role="group" aria-label="Choisir la photo affichée">${photos.map((photo, i) => `<button type="button" class="wed__pick" aria-pressed="${i ? 'false' : 'true'}" aria-controls="wed-frame" data-wed-pick data-href="${offerHref(photo)}"><span class="wed__n" aria-hidden="true">0${i + 1}</span><span class="wed__label">${esc(captionOf(photo))}</span></button>`).join('')}</div>
        <a class="wed__frame" id="wed-frame" href="/work/?categorie=mariage">${photos.map(shot).join('')}<span class="sr-only"> : voir les réalisations mariage</span></a>
        <a class="wed__go" href="${offerHref(photos[0])}" data-wed-go>Voir l’offre<span class="sr-only"> : <span data-wed-go-name>${esc(captionOf(photos[0]))}</span></span> <span aria-hidden="true">↗</span></a>
      </div>
      <a class="wedding-wall__cta" href="/services/#mariage">Voir les formules mariage <span aria-hidden="true">↗</span></a>
    </section>`;
}
