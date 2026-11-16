import { gearItems, gearNotes, gearTitle, gearBoardMm } from '../content/gear.mjs';
import { gearAssets } from '../content/gear-assets.mjs';

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pct = value => `${Math.round(value * 100) / 100}%`;
// Largeur à l'écran = taille réelle × coefficient ÷ largeur réelle de la planche.
const width = (asset, scale, layout) => pct(asset.mm * scale / gearBoardMm[layout] * 100);
const place = (asset, scale, desk, mobile, index) => `--x:${desk.x}%;--y:${desk.y}%;--w:${width(asset, scale, 'desk')};--mx:${mobile.x}%;--my:${mobile.y}%;--mw:${width(asset, scale, 'mobile')};--i:${index}`;
const img = (name, asset) => `<img src="/assets/gear/${name}.webp" alt="" width="${asset.w}" height="${asset.h}" loading="lazy" decoding="async">`;

// La planche : un tapis de découpe orange, le matériel rendu en 3D posé dessus, le titre en bandes de papier déchiré.
export function gearBoard(titleId) {
  return `<div class="gear-board" data-gear-board>
    <h2 class="gear-title" id="${titleId}">${gearTitle.map((line, i) => { const a = gearAssets[`strip-${i + 1}`]; return `<span class="gear-strip gear-strip--${i + 1}" style="--pw:${a.pw};--ph:${a.ph};--i:${i}"><span>${esc(line)}</span></span>`; }).join(' ')}</h2>
    <ul class="gear-list" aria-label="Matériel utilisé sur les tournages">${gearItems.map((item, i) => { const a = gearAssets[item.key]; return `<li class="gear-item gear-item--${item.key} gear-tag--${item.desk.tag} gear-mtag--${item.mobile.tag}" style="${place(a, item.scale, item.desk, item.mobile, i + 3)}">${img(item.key, a)}<p class="gear-tag"><b>${esc(item.category)}</b><span>${esc(item.name)}</span></p></li>`; }).join('')}</ul>
    <div class="gear-notes" aria-hidden="true">${gearNotes.map((note, i) => { const a = gearAssets[note.sprite]; return `<span class="gear-note" style="${place(a, 1, note.desk, note.mobile, gearItems.length + 3 + i)};--r:${note.r}deg;--pw:${a.pw};--ph:${a.ph};--ink:${note.ink}">${img(note.sprite, a)}<i>${esc(note.text)}</i></span>`; }).join('')}</div>
  </div>`;
}
