import { weddingPhotos, weddingOffers } from '../content/wedding.mjs';

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tilts = [-7, 3, 8, -4, 6, -2];
const offerHref = photo => `/services/#${(weddingOffers[photo.offer] || weddingOffers.mariage).id}`;

const polaroid = (photo, index) => `<li style="--r:${tilts[index % tilts.length]}deg;--i:${index}"><a class="polaroid" href="${offerHref(photo)}"><span class="polaroid__photo">${photo.src ? `<img src="${esc(photo.src)}" alt="${esc(photo.alt || '')}" loading="lazy" decoding="async">` : `<span class="polaroid__blank" style="--k:${index}" aria-hidden="true"></span>`}</span><span class="polaroid__caption">${esc(photo.caption || (weddingOffers[photo.offer] || weddingOffers.mariage).title)}</span></a></li>`;

// Accueil : un grand titre cliquable et trois polaroids. Rien n'est rendu tant qu'aucune photo n'est fournie.
export function weddingWall() {
  // Sans photo fournie : trois polaroids aux tons de la DA, sans fausse image, qui mènent déjà aux prestations.
  const photos = weddingPhotos.length ? weddingPhotos.slice(0, 3) : [{ offer: 'mariage' }, { offer: 'demande' }, { offer: 'mariage', caption: 'Le jour J' }];
  return `<section class="wedding-wall motion-reveal" aria-labelledby="wedding-wall-title">
      <h2 class="wedding-wall__title" id="wedding-wall-title"><a href="/services/#mariage">Mariage<span class="sr-only"> : voir les prestations mariage et demande en mariage</span></a></h2>
      <ul class="wedding-wall__photos">${photos.map(polaroid).join('')}</ul>
      <a class="wedding-wall__cta" href="/services/#mariage">Voir les formules mariage <span aria-hidden="true">↗</span></a>
    </section>`;
}

// Services : les deux prestations côte à côte, puis toutes les photos quand elles existent.
export function weddingOffersSection() {
  const { mariage, demande } = weddingOffers;
  return `<section class="wedding-offers motion-reveal" id="${mariage.id}" aria-labelledby="wedding-offers-title">
      <h2 class="wedding-offers__title" id="wedding-offers-title">Mariage et demande en mariage.</h2>
      <div class="wedding-offers__grid">
        <article class="wedding-offer"><h3>${esc(mariage.title)}</h3><strong>${esc(mariage.price)}</strong><ul>${mariage.facts.map(([value, label]) => `<li><b>${esc(value)}</b><span>${esc(label)}</span></li>`).join('')}</ul><a class="wedding-offer__cta" href="${mariage.href}">${esc(mariage.cta)}</a></article>
        <article class="wedding-offer" id="${demande.id}"><h3>${esc(demande.title)}</h3><strong>${esc(demande.price)}</strong><a class="wedding-offer__cta" href="${demande.href}">${esc(demande.cta)}</a></article>
        <div class="ig-card wedding-offers__film" data-instagram-post data-post-id="${esc(demande.instagramId)}" data-post-title="${esc(demande.title)}" style="--ig-ratio:9/16"><div class="ig-card__cover"><strong>${esc(demande.title)}</strong><button type="button" class="ig-card__play" data-load-instagram aria-label="Lire la vidéo ${esc(demande.title)} (chargée depuis Instagram)">▶</button></div><a class="ig-card__link" href="https://www.instagram.com/p/${esc(demande.instagramId)}/" target="_blank" rel="noopener noreferrer">Instagram ↗</a></div>
      </div>
      ${weddingPhotos.length ? `<ul class="wedding-offers__photos">${weddingPhotos.map(polaroid).join('')}</ul>` : ''}
    </section>`;
}
