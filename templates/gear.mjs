import { gearItems, gearNotes, gearTitle } from '../content/gear.mjs';

const esc = value => String(value).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const svg = (viewBox, body) => `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;

// Illustrations originales et volontairement génériques : aucune marque, aucun logo, aucun dessin de produit reproduit.
const art = {
  camera: svg('0 0 320 220', `<defs>
    <linearGradient id="gcam-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2a25"/><stop offset=".5" stop-color="#171411"/><stop offset="1" stop-color="#0c0a09"/></linearGradient>
    <radialGradient id="gcam-sensor" cx=".32" cy=".28" r=".95"><stop offset="0" stop-color="#4a7d76"/><stop offset=".55" stop-color="#173431"/><stop offset="1" stop-color="#091413"/></radialGradient></defs>
    <rect x="138" y="8" width="52" height="12" rx="2" fill="#3a352f"/>
    <path d="M110 64 126 22q2-6 10-6h56q8 0 10 6l16 42z" fill="url(#gcam-body)"/>
    <rect x="226" y="34" width="34" height="18" rx="4" fill="#26221e"/><rect x="266" y="38" width="28" height="14" rx="4" fill="#26221e"/>
    <circle cx="50" cy="40" r="11" fill="#3a352f"/><circle cx="50" cy="40" r="6" fill="#171411"/>
    <rect x="8" y="48" width="304" height="164" rx="26" fill="url(#gcam-body)"/>
    <path d="M34 51h252" stroke="#5a534b" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    <rect x="14" y="56" width="70" height="150" rx="22" fill="#0d0b0a"/>
    <path d="M32 80v104M44 74v116M56 74v116M68 80v104" stroke="#211d1a" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 72l-8 6v10l8 4zM310 72l8 6v10l-8 4z" fill="#3a352f"/>
    <circle cx="178" cy="132" r="71" fill="#080706"/><circle cx="178" cy="132" r="66" fill="none" stroke="#9a9188" stroke-width="5"/>
    <circle cx="178" cy="132" r="57" fill="#12100e" stroke="#2c2722" stroke-width="2"/>
    <rect x="143" y="109" width="70" height="46" rx="4" fill="url(#gcam-sensor)" stroke="#050505" stroke-width="2"/>
    <path d="M149 115l22 0" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".28"/>
    <circle cx="178" cy="66" r="4" fill="#e97736"/>
    <circle cx="264" cy="152" r="10" fill="#1d1a17" stroke="#3a352f" stroke-width="2"/>
    <rect x="94" y="60" width="18" height="8" rx="4" fill="#3a352f"/><circle cx="106" cy="94" r="5" fill="#e97736"/>`),
  lens: svg('0 0 330 140', `<defs>
    <linearGradient id="glens-barrel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#433c35"/><stop offset=".2" stop-color="#262220"/><stop offset=".6" stop-color="#0e0c0b"/><stop offset="1" stop-color="#211d1a"/></linearGradient>
    <linearGradient id="glens-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d0c4"/><stop offset=".5" stop-color="#8d847a"/><stop offset="1" stop-color="#565049"/></linearGradient>
    <pattern id="glens-rib" width="6" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="10" fill="#000" opacity=".5"/></pattern></defs>
    <rect x="6" y="38" width="20" height="64" rx="3" fill="url(#glens-metal)"/>
    <rect x="22" y="26" width="250" height="88" rx="8" fill="url(#glens-barrel)"/>
    <rect x="262" y="14" width="60" height="112" rx="8" fill="url(#glens-barrel)"/>
    <rect x="62" y="26" width="84" height="88" fill="url(#glens-rib)"/><rect x="188" y="26" width="62" height="88" fill="url(#glens-rib)"/>
    <rect x="156" y="26" width="5" height="88" fill="#cc460c"/>
    <rect x="34" y="58" width="16" height="24" rx="3" fill="#3a352f"/>
    <path d="M168 36v9M175 36v5M182 36v9" stroke="#f0ebe2" stroke-width="1.5" opacity=".7"/>
    <path d="M30 33h236M268 22h46" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".13"/>
    <rect x="316" y="20" width="6" height="100" rx="3" fill="#080706"/>`),
  mic: svg('0 0 460 64', `<defs>
    <linearGradient id="gmic-tube" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#433c35"/><stop offset=".25" stop-color="#1f1b18"/><stop offset=".62" stop-color="#0c0a09"/><stop offset="1" stop-color="#201c19"/></linearGradient>
    <linearGradient id="gmic-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d0c4"/><stop offset=".5" stop-color="#8d847a"/><stop offset="1" stop-color="#565049"/></linearGradient></defs>
    <rect x="8" y="16" width="400" height="32" rx="16" fill="url(#gmic-tube)"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${36 + i * 22}" y="22" width="13" height="4" rx="2" fill="#000" opacity=".75"/><rect x="${36 + i * 22}" y="38" width="13" height="4" rx="2" fill="#000" opacity=".75"/>`).join('')}
    <rect x="270" y="16" width="3" height="32" fill="#4a443d"/><rect x="374" y="16" width="3" height="32" fill="#4a443d"/>
    <rect x="300" y="27" width="26" height="10" rx="5" fill="#3a352f"/><circle cx="346" cy="32" r="3" fill="#e97736"/>
    <rect x="404" y="18" width="44" height="28" rx="5" fill="url(#gmic-metal)"/><rect x="444" y="24" width="8" height="16" rx="2" fill="#565049"/>
    <path d="M24 21h366" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".13"/>`),
  gimbal: svg('0 0 280 340', `<defs>
    <linearGradient id="ggim-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#332e29"/><stop offset=".5" stop-color="#151210"/><stop offset="1" stop-color="#0b0908"/></linearGradient></defs>
    <rect x="48" y="34" width="184" height="26" rx="8" fill="#1d1a17" stroke="#3a352f" stroke-width="1.5"/><rect x="76" y="42" width="100" height="10" rx="5" fill="#080706"/>
    <rect x="218" y="60" width="24" height="98" rx="8" fill="#171411"/><rect x="138" y="152" width="94" height="24" rx="8" fill="#171411"/>
    <rect x="214" y="98" width="8" height="16" rx="2" fill="#e97736"/><rect x="176" y="148" width="16" height="8" rx="2" fill="#e97736"/>
    <circle cx="230" cy="47" r="26" fill="url(#ggim-body)" stroke="#3a352f" stroke-width="2"/><circle cx="230" cy="47" r="9" fill="#080706"/>
    <circle cx="230" cy="164" r="28" fill="url(#ggim-body)" stroke="#3a352f" stroke-width="2"/><circle cx="230" cy="164" r="10" fill="#080706"/>
    <rect x="112" y="178" width="56" height="154" rx="26" fill="url(#ggim-body)"/>
    <circle cx="140" cy="164" r="32" fill="url(#ggim-body)" stroke="#3a352f" stroke-width="2"/><circle cx="140" cy="164" r="11" fill="#080706"/>
    <rect x="124" y="204" width="32" height="24" rx="4" fill="#173431"/><path d="M129 216h14" stroke="#7fb5ac" stroke-width="2" stroke-linecap="round"/>
    <circle cx="140" cy="248" r="9" fill="#26221e" stroke="#3a352f" stroke-width="1.5"/><circle cx="140" cy="273" r="6" fill="#cc460c"/>
    <path d="M126 294h28M126 304h28M126 314h28" stroke="#2a2622" stroke-width="3" stroke-linecap="round"/>`),
  earbuds: svg('0 0 170 190', `<defs>
    <linearGradient id="gbud-shell" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfaf5"/><stop offset="1" stop-color="#d6cdbf"/></linearGradient></defs>
    <g transform="rotate(-14 52 44)"><rect x="46.500" y="34" width="11" height="42" rx="5.500" fill="url(#gbud-shell)"/><ellipse cx="52" cy="30" rx="15" ry="17" fill="url(#gbud-shell)"/><circle cx="47" cy="26" r="4" fill="#3a352f"/></g>
    <g transform="rotate(15 118 44)"><rect x="112.500" y="34" width="11" height="42" rx="5.500" fill="url(#gbud-shell)"/><ellipse cx="118" cy="30" rx="15" ry="17" fill="url(#gbud-shell)"/><circle cx="123" cy="26" r="4" fill="#3a352f"/></g>
    <rect x="30" y="76" width="110" height="108" rx="36" fill="url(#gbud-shell)"/>
    <path d="M32 112h106" stroke="#b9b0a2" stroke-width="2"/><circle cx="85" cy="132" r="3.500" fill="#e97736"/>`),
  tablet: svg('0 0 400 260', `<defs>
    <linearGradient id="gtab-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2014"/><stop offset=".6" stop-color="#17110e"/><stop offset="1" stop-color="#0c0a09"/></linearGradient></defs>
    <rect x="6" y="8" width="340" height="244" rx="18" fill="#0f0d0c" stroke="#4a443d" stroke-width="2"/>
    <rect x="18" y="20" width="316" height="220" rx="8" fill="url(#gtab-screen)"/><circle cx="176" cy="14" r="2" fill="#4a443d"/>
    ${[0, 1, 2].map(col => [0, 1].map(row => { const x = 34 + col * 100, y = 40 + row * 72; const sketch = [`M${x + 8} ${y + 38}h68M${x + 30} ${y + 38}l14-18 12 18`, `M${x + 8} ${y + 34}q34-22 68 0`, `M${x + 42} ${y + 10}v34M${x + 30} ${y + 44}h24`][(col + row) % 3];
      return `<rect x="${x}" y="${y}" width="84" height="52" rx="4" fill="#f0ebe2" fill-opacity=".05" stroke="#f0ebe2" stroke-opacity=".5"/><path d="${sketch}" fill="none" stroke="#f0ebe2" stroke-opacity=".6" stroke-width="1.5" stroke-linecap="round"/><path d="M${x} ${y + 60}h${52 - col * 8}" stroke="#f0ebe2" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/>`; }).join('')).join('')}
    <circle cx="96" cy="58" r="6" fill="#e97736"/>
    <rect x="34" y="204" width="284" height="6" rx="3" fill="#3a352f"/><rect x="34" y="204" width="118" height="6" rx="3" fill="#cc460c"/><circle cx="152" cy="207" r="7" fill="#f0ebe2"/>
    <g transform="rotate(7 374 130)"><rect x="368" y="18" width="12" height="208" rx="6" fill="#e9e2d6"/><path d="M368 224h12l-6 22z" fill="#3a352f"/><rect x="368" y="62" width="12" height="3" fill="#b9b0a2"/></g>`)
};

const place = (desk, mobile, index) => `--x:${desk.x}%;--y:${desk.y}%;--w:${desk.w}%;--r:${desk.r}deg;--mx:${mobile.x}%;--my:${mobile.y}%;--mw:${mobile.w}%;--mr:${mobile.r}deg;--i:${index}`;

// La planche : un tapis de découpe aux couleurs de la marque, le matériel posé dessus, le titre en bandes de papier.
export function gearBoard(titleId) {
  return `<div class="gear-board" data-gear-board>
    <span class="gear-board__print" aria-hidden="true">Mon matériel</span>
    <h2 class="gear-title" id="${titleId}">${gearTitle.map((line, i) => `<span class="gear-strip gear-strip--${i + 1}"><span>${esc(line)}</span></span>`).join(' ')}</h2>
    <ul class="gear-list" aria-label="Matériel utilisé sur les tournages">${gearItems.map((item, i) => `<li class="gear-item gear-item--${item.key}" style="${place(item.desk, item.mobile, i)}">${art[item.key]}<p class="gear-tag"><b>${esc(item.category)}</b><span>${esc(item.name)}</span></p></li>`).join('')}</ul>
    <div class="gear-notes" aria-hidden="true">${gearNotes.map((note, i) => `<span class="gear-note gear-note--${note.tone}" style="${place(note.desk, note.mobile, gearItems.length + i)}">${esc(note.text)}</span>`).join('')}</div>
  </div>`;
}
