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
// Image d'un avis : seulement une image envoyée depuis l'admin et copiée sur le site (srcSmall), avec son texte alternatif.
const media=(t,cls)=>t.image&&t.image.srcSmall
  ? `<span class="${cls}"><img src="${esc(t.image.srcSmall)}" srcset="${esc(t.image.srcSmall)} ${t.image.smallWidth}w, ${esc(t.image.src)} ${t.image.width}w" sizes="(max-width: 760px) 90vw, 420px" alt="${esc(t.alt||'')}" width="${t.image.smallWidth}" height="${t.image.smallHeight}" loading="lazy" decoding="async"></span>`
  : `<span class="${cls} is-blank" aria-hidden="true">${initial(t.name)}</span>`;

/** Panneau d'un avis (dialog natif) : partagé par l'accueil, Work et Contact, ouvert par [data-morph-open]. */
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

// Grille des avis : la section garde la même hauteur quel que soit le nombre d'avis ; ce sont les cartes qui
// rétrécissent. Une grande carte à gauche (le premier avis), les autres en lignes et colonnes à droite.
// Au-delà de TM_DESK avis (TM_MOB sur téléphone), « Voir plus d'avis » agrandit la section (src/app.js).
export const TM_DESK=10, TM_MOB=6;
// Nombre d'avis à droite de la grande carte -> [lignes, colonnes].
const DESK_GRID={0:[1,0],1:[1,1],2:[2,1],3:[3,1],4:[2,2],5:[3,2],6:[3,2],7:[3,3],8:[3,3],9:[3,3]};
const tmLayout=n=>{
  const k=Math.min(n,TM_DESK), m=k-1, [r,c]=DESK_GRID[m], f=c===0?1:c===1?1.67:c===2?1.25:1.35;
  const km=Math.min(n,TM_MOB), mm=km-1, single=km<=3;
  return { k, r, c, span:1+(r*c-m), tpl:c?`minmax(0,${f}fr) repeat(${c},minmax(0,1fr))`:'minmax(0,1fr)', km, single, mrows:single?km:1+Math.ceil(mm/2), modd:!single&&mm%2===1,
    size: k<=3?'l':k<=6?'m':'s', msize: km<=3?'l':'s' };
};
const tmCard=(t,i,L)=>`<article class="motion-reveal${i===0?' is-featured':''}${i>0&&i===L.k-1&&L.span>1?' tm-span':''}${i>=L.km&&i<L.k?' tm-m-extra':''}${!L.single&&L.modd&&i===L.km-1?' tm-m-span':''}"${i>0&&i===L.k-1&&L.span>1?` style="--tm-span:${L.span}"`:''}>
      <div class="v16-stars" aria-hidden="true">★★★★★</div>
      <blockquote>« ${esc(t.quote)} »</blockquote>
      <footer><strong>${esc(t.name)}</strong>${t.role?`<span>${esc(t.role)}</span>`:''}</footer>
      <button type="button" class="morph-hit" data-morph-open="morph-panel-${i}" aria-haspopup="dialog" aria-label="Lire l’avis de ${esc(t.name)}"></button>
    </article>`;

/** Avis en cartes : un clic ouvre la carte en grand panneau (phrase entière, image, lien). */
export function morphTestimonials(items=[], id='avis'){
  if(!items.length) return '';
  const L=tmLayout(items.length), extra=items.slice(L.k), more=items.length>L.km;
  return `<div class="tm-wrap" data-tm>
    <div class="v16-testimonial-bento tm-grid" data-morph-list data-count="${items.length}" data-size="${L.size}" data-msize="${L.msize}" style="--tm-tpl:${L.tpl};--tm-rows:${L.r};--tm-mrows:${L.mrows};--tm-mcols:${L.single?1:2}">${items.slice(0,L.k).map((t,i)=>tmCard(t,i,L)).join('')}</div>
    ${extra.length?`<div class="v16-testimonial-bento tm-extra" id="${esc(id)}-plus" data-tm-extra hidden>${extra.map((t,j)=>tmCard(t,L.k+j,{...L,k:Infinity,km:Infinity,single:true})).join('')}</div>`:''}
    ${more?`<button type="button" class="tm-toggle${extra.length?'':' tm-toggle--mobile'}" data-tm-toggle aria-expanded="false" aria-controls="${esc(id)}-grille${extra.length?` ${esc(id)}-plus`:''}"><span data-tm-label>Voir plus d’avis</span> <b aria-hidden="true">+</b></button>`:''}
  </div>
    ${items.map((t,i)=>morphPanel(t,i)).join('')}`.replace('data-morph-list data-count',`id="${esc(id)}-grille" data-morph-list data-count`);
}

// Une image du bento : dimensions déclarées quand on les connaît (pas de saut de mise en page).
// srcset : petite et grande taille envoyées depuis l'admin ; le navigateur charge la plus juste.
const tileImg=(src,alt,i,w,h,srcset)=>`<img src="${esc(src)}"${srcset?` srcset="${esc(srcset)}" sizes="(max-width: 700px) 100vw, 50vw"`:''} alt="${esc(alt||'')}"${w&&h?` width="${w}" height="${h}"`:''} loading="${i?'lazy':'eager'}"${i?'':' fetchpriority="high"'} decoding="async">`;

/** Projets en bento : une grande tuile et des petites ; un clic sur une petite la fait passer en grand.
 *  t.images : photos de la tuile Photographie, en diaporama lent (une à la fois, fondu) ; t.data : attributs data-* (fiche du projet) ;
 *  t.stack : numéro de la vidéo à afficher dans le téléphone quand on ouvre la tuile.
 *  Sans t.href (projet à un seul média, sans page ni lien) : la tuile se met en avant au clic mais ne s'ouvre pas. */
export function bentoFocus(tiles=[]){
  return `<div class="bento" data-bento style="--bento-n:${tiles.length}">${tiles.map((t,i)=>`<article class="bento__tile${t.image||t.images?'':' is-blank'}${t.images?' bento__tile--slides':''}" data-bento-tile data-slot="${i}"${Object.entries(t.data||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')} style="view-transition-name:bento-${i};--k:${i}">
      ${t.images?`<span class="bento__slides" data-bento-slides data-count="${t.images.length}">${t.images.map((p,k)=>tileImg(p.src,p.alt,1,p.width,p.height,p.srcset).replace('<img ',`<img class="${k?'':'is-on'}" `)).join('')}</span>`:t.image?tileImg(t.image,t.alt,i,t.width,t.height,t.srcset):''}
      <div class="bento__text">
        <span class="bento__label">${esc(t.label)}</span>
        <h3>${esc(t.title)}</h3>
        ${t.text?`<p>${esc(t.text)}</p>`:''}
        ${t.href?`<a class="bento__link" href="${esc(t.href)}"${Number.isInteger(t.stack)?` data-stack-goto="${t.stack}"`:''}>${esc(t.cta)} <span aria-hidden="true">↗</span></a>`:''}
      </div>
      <button type="button" class="bento__hit" data-bento-focus aria-label="Mettre en avant : ${esc(t.title)}"></button>
    </article>`).join('')}</div>`;
}

/** Projets au-delà des 5 du bento : même tuile, dans une grille ouverte par « Voir plus de projets » (src/app.js).
 *  Un clic met le projet dans la fiche, un double-clic l'ouvre (comme dans le bento). */
export function bentoMore(tiles=[]){
  if(!tiles.length) return '';
  return `<div class="bento-more" id="bento-plus" data-bento-more hidden>${tiles.map((t,i)=>`<article class="bento__tile bento-more__tile${t.image?'':' is-blank'}" data-bento-tile${Object.entries(t.data||{}).map(([k,v])=>` data-${k}="${esc(v)}"`).join('')}>
      ${t.image?tileImg(t.image,t.alt,1,t.width,t.height,t.srcset):''}
      <div class="bento__text"><span class="bento__label">${esc(t.label)}</span><h3>${esc(t.title)}</h3>${t.href?`<a class="bento__link" href="${esc(t.href)}">${esc(t.cta)} <span aria-hidden="true">↗</span></a>`:''}</div>
      <button type="button" class="bento__hit" data-bento-focus aria-label="Mettre en avant : ${esc(t.title)}"></button>
    </article>`).join('')}</div>
    <button type="button" class="tm-toggle bento-more__toggle" data-bento-more-toggle aria-expanded="false" aria-controls="bento-plus"><span data-bento-more-label>Voir plus de projets</span> <b aria-hidden="true">+</b></button>`;
}
