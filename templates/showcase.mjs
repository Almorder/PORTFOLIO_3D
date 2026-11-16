// Sections « vitrine » : phrase encadrée mot à mot, avis qui s'ouvrent en panneau, projets en bento.
// Effets inspirés de composants vus chez Annnimate, écrits ici sans dépendance (voir src/app.js).
import { esc } from './components.mjs';

/** Phrase lue mot à mot : quatre angles encadrent le mot net, le reste s'adoucit. */
export function focusText(text){
  const words=String(text).trim().split(/\s+/);
  return `<section class="focus-text" data-focus-text style="--ft-n:${words.length}" aria-label="En une phrase">
    <div class="focus-text__stage">
      <p class="focus-text__line">${words.map(w=>`<span data-ft-word>${esc(w)}</span>`).join(' ')}</p>
      <i class="focus-text__frame" data-ft-frame aria-hidden="true"><b></b><b></b><b></b><b></b></i>
    </div>
  </section>`;
}

const initial=name=>esc((String(name).trim()[0]||'·').toUpperCase());
const media=(t,cls)=>t.image
  ? `<span class="${cls}"><img src="${esc(t.image)}" alt="" loading="lazy" decoding="async"></span>`
  : `<span class="${cls} is-blank" aria-hidden="true">${initial(t.name)}</span>`;

/** Avis en liste : un clic ouvre la ligne en grand panneau (image du projet, phrase entière, lien). */
export function morphTestimonials(items=[]){
  return `<ul class="morph-list" data-morph-list>${items.map((t,i)=>`<li class="motion-reveal">
      <button type="button" class="morph-row" data-morph-open="morph-panel-${i}" aria-haspopup="dialog">
        ${media(t,'morph-row__thumb')}
        <strong>${esc(t.name)}</strong>
        <span class="morph-row__role">${esc(t.role||'')}</span>
        <span class="morph-row__quote">« ${esc(t.quote)} »</span>
        <i aria-hidden="true">Lire</i>
      </button>
      <dialog class="morph-panel" id="morph-panel-${i}" data-morph-panel aria-labelledby="morph-name-${i}">
        <div class="morph-panel__inner">
          ${media(t,'morph-panel__media')}
          <div class="morph-panel__body">
            <blockquote>« ${esc(t.quote)} »</blockquote>
            <p class="morph-panel__who"><strong id="morph-name-${i}">${esc(t.name)}</strong>${t.role?`<span>${esc(t.role)}</span>`:''}</p>
            ${t.link?`<a class="morph-panel__link" href="${esc(t.link)}"${/^https?:/.test(t.link)?' target="_blank" rel="noopener noreferrer"':''}>${esc(t.linkLabel||'Voir le projet')} <span aria-hidden="true">↗</span></a>`:''}
          </div>
          <button type="button" class="morph-panel__close" data-morph-close aria-label="Fermer">×</button>
        </div>
      </dialog>
    </li>`).join('')}</ul>`;
}

/** Projets en bento : une grande tuile et des petites ; un clic sur une petite la fait passer en grand. */
export function bentoFocus(tiles=[]){
  return `<div class="bento" data-bento style="--bento-n:${tiles.length}">${tiles.map((t,i)=>`<article class="bento__tile${t.image?'':' is-blank'}" data-bento-tile data-slot="${i}" style="view-transition-name:bento-${i};--k:${i}">
      ${t.image?`<img src="${esc(t.image)}" alt="${esc(t.alt||'')}" loading="${i?'lazy':'eager'}" decoding="async">`:''}
      <div class="bento__text">
        <span class="bento__label">${esc(t.label)}</span>
        <h3>${esc(t.title)}</h3>
        <p>${esc(t.text)}</p>
        <a class="bento__link" href="${esc(t.href)}">${esc(t.cta)} <span aria-hidden="true">↗</span></a>
      </div>
      <button type="button" class="bento__hit" data-bento-focus aria-label="Mettre en avant : ${esc(t.title)}"></button>
    </article>`).join('')}</div>`;
}
