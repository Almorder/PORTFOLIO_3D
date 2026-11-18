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

/** Panneau d'un avis (dialog natif) : partagé par l'accueil et la page Contact, ouvert par [data-morph-open]. */
export const morphPanel=(t,i)=>`<dialog class="morph-panel" id="morph-panel-${i}" data-morph-panel aria-labelledby="morph-name-${i}">
        <div class="morph-panel__inner">
          ${media(t,'morph-panel__media')}
          <div class="morph-panel__body">
            <blockquote>« ${esc(t.quote)} »</blockquote>
            <p class="morph-panel__who"><strong id="morph-name-${i}">${esc(t.name)}</strong>${t.role?`<span>${esc(t.role)}</span>`:''}</p>
            ${t.link?`<a class="morph-panel__link" href="${esc(t.link)}"${/^https?:/.test(t.link)?' target="_blank" rel="noopener noreferrer"':''}>${esc(t.linkLabel||'Voir le projet')} <span aria-hidden="true">↗</span></a>`:''}
          </div>
          <button type="button" class="morph-panel__close" data-morph-close aria-label="Fermer">×</button>
        </div>
      </dialog>`;

/** Avis en cartes (forme d'origine) : un clic ouvre la carte en grand panneau (image du projet, phrase entière, lien). */
export function morphTestimonials(items=[]){
  return `<div class="v16-testimonial-bento" data-morph-list>${items.map((t,i)=>`<article class="motion-reveal ${i===0?'is-featured':''}">
      <div class="v16-stars" aria-label="Retour client positif">★★★★★</div>
      <blockquote>« ${esc(t.quote)} »</blockquote>
      <footer><strong>${esc(t.name)}</strong>${t.role?`<span>${esc(t.role)}</span>`:''}</footer>
      <button type="button" class="morph-hit" data-morph-open="morph-panel-${i}" aria-haspopup="dialog" aria-label="Ouvrir le retour de ${esc(t.name)}"></button>
    </article>`).join('')}</div>
    ${items.map((t,i)=>morphPanel(t,i)).join('')}`;
}

// Une image du bento : dimensions déclarées quand on les connaît (pas de saut de mise en page).
// srcset : petite et grande taille envoyées depuis l'admin ; le navigateur charge la plus juste.
const tileImg=(src,alt,i,w,h,srcset)=>`<img src="${esc(src)}"${srcset?` srcset="${esc(srcset)}" sizes="(max-width: 700px) 100vw, 50vw"`:''} alt="${esc(alt||'')}"${w&&h?` width="${w}" height="${h}"`:''} loading="${i?'lazy':'eager'}"${i?'':' fetchpriority="high"'} decoding="async">`;

/** Projets en bento : une grande tuile et des petites ; un clic sur une petite la fait passer en grand.
 *  t.images (au moins trois) : mosaïque de photos ; t.data : attributs data-* (fiche du projet) ;
 *  t.stack : numéro de la vidéo à afficher dans le téléphone quand on ouvre la tuile.
 *  Sans t.href (projet à un seul média, sans page ni lien) : la tuile se met en avant au clic mais ne s'ouvre pas. */
export function bentoFocus(tiles=[]){
  return `<div class="bento" data-bento style="--bento-n:${tiles.length}">${tiles.map((t,i)=>`<article class="bento__tile${t.image||t.images?'':' is-blank'}${t.images?' bento__tile--mosaic':''}" data-bento-tile data-slot="${i}"${Object.entries(t.data||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')} style="view-transition-name:bento-${i};--k:${i}">
      ${t.images?`<span class="bento__mosaic" data-count="${t.images.length}">${t.images.map(p=>tileImg(p.src,p.alt,1,p.width,p.height,p.srcset)).join('')}</span>`:t.image?tileImg(t.image,t.alt,i,t.width,t.height,t.srcset):''}
      <div class="bento__text">
        <span class="bento__label">${esc(t.label)}</span>
        <h3>${esc(t.title)}</h3>
        ${t.text?`<p>${esc(t.text)}</p>`:''}
        ${t.href?`<a class="bento__link" href="${esc(t.href)}"${Number.isInteger(t.stack)?` data-stack-goto="${t.stack}"`:''}>${esc(t.cta)} <span aria-hidden="true">↗</span></a>`:''}
      </div>
      <button type="button" class="bento__hit" data-bento-focus aria-label="Mettre en avant : ${esc(t.title)}"></button>
    </article>`).join('')}</div>`;
}
