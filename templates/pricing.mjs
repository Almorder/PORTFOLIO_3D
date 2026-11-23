// Section « Tarifs » : un seul composant pour l'accueil et la page Work (même source : content/pricing.mjs).
// Les cartes à jouer (pioche, inertie, src/app.js) restent courtes : titre, prix, CTA. Le détail de chaque offre
// (« Ce qui est inclus ») se lit juste dessous, replié, avec deux chemins distincts : voir des réalisations du
// même type (découverte, page Work filtrée) et écrire avec l'offre déjà choisie (conversion, page Contact).
import { esc } from './components.mjs';
import { siteImage } from '../content/site-images.mjs';
import { pricing, pricingHref, pricingDetails, pricingCommon } from '../content/pricing.mjs';

// Cartes des tarifs : visuel remplaçable depuis l'admin (« Images du site », emplacements home.cards.*), sinon carte d'origine.
const cardArt = key => { const s=siteImage(`home.cards.${key}`); return s ? `src="${esc(s.image.srcSmall)}" srcset="${esc(s.image.srcSmall)} ${s.image.smallWidth}w, ${esc(s.image.src)} ${s.image.width}w" sizes="(max-width: 620px) 160px, 230px" ` : `src="/assets/cards/${key}.webp" `; };

const list = (title, items=[]) => items.length ? `<div><h4>${esc(title)}</h4><ul>${items.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></div>` : '';

/** workCount(categorie) : nombre de réalisations du catalogue dans cette catégorie (lien affiché seulement s'il y en a). */
export function pricingSection({ workCount = () => 0, heading = 'Un ordre de grandeur<br><em>avant de parler.</em>', intro = 'De quoi répondre à tout.' } = {}){
  return `<section class="price-proof" id="pricing" aria-labelledby="pricing-title" data-price-proof>
      <div class="price-proof__grid" aria-hidden="true" data-price-grid></div>
      <header class="price-proof__head motion-reveal"><span class="price-proof__chip"><i aria-hidden="true"></i>Tarifs</span><h2 id="pricing-title">${heading}</h2><p>${esc(intro)}</p></header>
      <div class="price-tools" data-price-tools hidden>
        <p class="price-tools__hint"><span class="price-tools__fine">Piochez une carte, ou faites-la glisser hors de la main.</span><span class="price-tools__touch">Touchez une carte pour la piocher. Appui long pour la déplacer.</span></p>
        <button type="button" class="price-tools__btn" data-price-deal>Voir toutes les offres</button>
        <button type="button" class="price-tools__btn price-tools__btn--quiet" data-price-stow hidden><span aria-hidden="true">↺</span> Ranger les cartes</button>
      </div>
      <ul class="price-arena" data-price-arena aria-label="Offres et tarifs">
        ${pricing.map((c,i)=>{ const art=cardArt(c.key), back=cardArt('dos'), price=`${c.from?'à partir de ':''}${c.price}`; return `<li class="price-card" data-price-card data-key="${esc(c.key)}" style="--i:${i}">
          <button type="button" class="price-card__draw" data-price-draw hidden aria-label="${esc(`Piocher la carte ${c.title}, ${price}`)}"></button>
          <div class="price-card__lift"><div class="price-card__flip">
            <div class="price-card__face price-card__face--front">
              <img class="price-card__art" ${art}width="290" height="430" alt="" loading="lazy" decoding="async">
              <div class="price-card__label">
                ${c.showTag?`<p class="price-card__tag">${esc(c.tag)}</p>`:''}
                <h3>${esc(c.title)}</h3>
                <div class="price-card__row">
                  <p class="price-card__price">${c.from?'<small>À partir de</small>':''}<strong>${esc(c.price)}</strong></p>
                  <a class="price-card__cta" href="${esc(pricingHref(c))}">${esc(c.cta)}<span class="sr-only"> : ${esc(c.title)}</span> <span aria-hidden="true">↗</span></a>
                </div>
                <div class="price-card__more"><p>${c.showTag?'':`${esc(c.tag)}. `}${esc(c.text)}</p>${c.facts?`<ul>${c.facts.map(([v,l])=>`<li>${esc(v)} ${esc(l)}</li>`).join('')}</ul>`:''}</div>
              </div>
            </div>
            <div class="price-card__face price-card__face--back" aria-hidden="true"><img ${back}width="251" height="425" alt="" loading="lazy" decoding="async"></div>
          </div></div>
        </li>`; }).join('')}
      </ul>
      <div class="price-details motion-reveal" data-price-details>
        <h3 class="price-details__title">Ce qui est inclus</h3>
        <div class="price-details__grid">${pricing.map(c=>{ const d=pricingDetails[c.key]||{}, n=d.work?workCount(d.work):0;
          return `<details class="price-detail" data-price-detail="${esc(c.key)}">
          <summary><span class="price-detail__name"><small>${esc(c.tag)}</small>${esc(c.title)}</span><b>${c.from?'dès ':''}${esc(c.price)}</b><i aria-hidden="true"></i></summary>
          <div class="price-detail__body">
            <p>${esc(c.text)}</p>
            ${list('Inclus',d.includes)}${list('Vous recevez',d.deliverables)}${list('Périmètre',d.scope)}${list('Ce qui fait évoluer le prix',d.varies)}
            <div class="price-detail__actions">${n?`<a class="price-detail__btn" href="/work/?categorie=${esc(d.work)}">Voir des réalisations <span aria-hidden="true">↗</span></a>`:''}<a class="price-detail__btn price-detail__btn--go" href="${esc(pricingHref(c))}">${esc(c.cta)}<span class="sr-only"> : ${esc(c.title)}</span> <span aria-hidden="true">↗</span></a></div>
          </div>
        </details>`; }).join('')}</div>
        <div class="price-details__common"><p class="price-details__common-title">Pour toutes les offres</p><ul>${pricingCommon.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><a href="/cgv/">Conditions générales de vente <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>`;
}
