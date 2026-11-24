// Admin Nolan Arc : recadrage d'une image avant l'envoi, dans le format exact du composant qui l'affichera.
// Fenêtre principale = ce qui sera envoyé ; aperçus = le composant du site (cadre Mariage, carte, dossier, tuile,
// téléphone), recadré comme le fait le site (object-fit: cover, centré). Glisser pour déplacer, molette,
// curseur ou pincement pour zoomer ; clavier : flèches (Maj : plus vite), + et -, 0 pour recentrer.
// Sans bibliothèque. Aucune donnée n'est injectée en HTML.
(() => {
  const h = (tag, props = {}, kids = []) => { const n = Object.assign(document.createElement(tag), props); kids.filter(Boolean).forEach(k => n.append(k)); return n; };

  // Écran du téléphone de la page Work (content/work-assets.mjs : 74,564 % de 574 px sur 87,407 % de 1080 px),
  // plus étroit que 9:16. Le contrôle qualité vérifie que ce chiffre suit le visuel du téléphone.
  const PHONE_SCREEN = 428 / 944;
  // Formats des composants du site (ratio largeur / hauteur). 0 = ratio d'origine de l'image.
  const TILE = [{ label: 'Grande tuile', ratio: 1, frame: 'tile' }, { label: 'Tuile large', ratio: 4 / 3, frame: 'tile' }, { label: 'Tuile haute', ratio: 2 / 3, frame: 'tile' }, { label: 'Téléphone', ratio: 4 / 5, frame: 'tile' }];
  const FREE = [['Format d’origine', 0], ['Paysage 3:2', 3 / 2], ['Paysage 16:9', 16 / 9], ['Carré', 1], ['Portrait 4:5', 4 / 5], ['Vertical 9:16', 9 / 16]];
  const FORMATS = {
    folder: { title: 'Dossier « Trois dimensions »', ratios: [['Dossier 4:4,75', 4 / 4.75]], previews: [{ label: 'Ordinateur et téléphone', ratio: 4 / 4.75, frame: 'folder' }, { label: 'Tablette (dossier large)', ratio: 2.05, frame: 'folder' }] },
    wedding: { title: 'Accueil, section Mariage', ratios: [['Cadre 4:5', 4 / 5]], previews: [{ label: 'Cadre (ordinateur et téléphone)', ratio: 4 / 5, frame: 'wedding' }] },
    card: { title: 'Carte des tarifs', ratios: [['Carte 2:3', 290 / 430]], previews: [{ label: 'Recto (le bas porte les infos)', ratio: 290 / 430, frame: 'card' }] },
    cardBack: { title: 'Dos des cartes', ratios: [['Carte 2:3', 290 / 430]], previews: [{ label: 'Dos', ratio: 290 / 430, frame: 'plain' }] },
    project: { title: 'Média du projet', ratios: FREE, previews: [...TILE, { label: 'Page projet', ratio: 0, frame: 'plain' }] },
    photo: { title: 'Photo', ratios: FREE, previews: [{ label: 'Catalogue Work', ratio: 0, frame: 'plain' }, { label: 'Tuile Photographie', ratio: 1, frame: 'tile' }, { label: 'Tuile (téléphone)', ratio: 4 / 5, frame: 'tile' }] },
    testimonial: { title: 'Image de l’avis', ratios: [['Panneau 4:5', 4 / 5]], previews: [{ label: 'Panneau (ordinateur)', ratio: 4 / 5, frame: 'plain' }, { label: 'Panneau (téléphone)', ratio: 16 / 9, frame: 'plain' }] },
    social: { title: 'Miniature de la vidéo', ratios: [['Écran du téléphone', PHONE_SCREEN]], previews: [{ label: 'Téléphone', ratio: PHONE_SCREEN, frame: 'phone' }] }
  };

  // Modèle : image W×H, ratio R, zoom z (1 = le plus grand cadre possible), centre (cx, cy) en pixels.
  const geom = (W, H, R, z) => { const r = R || W / H; let cw = W, ch = W / r; if (ch > H) { ch = H; cw = H * r; } return { cw: cw / z, ch: ch / z }; };

  const open = ({ bitmap, format = 'photo', initial = null }) => new Promise(resolve => {
    const F = FORMATS[format] || FORMATS.photo;
    const W = bitmap.width, H = bitmap.height;
    const s = { R: F.ratios[0][1], z: 1, cx: W / 2, cy: H / 2 };
    // Recadrage précédent : on retrouve le ratio, le zoom et le centre.
    if (initial && initial.w > 0 && initial.h > 0) {
      const ir = (initial.w * W) / (initial.h * H);
      const match = F.ratios.find(([, r]) => r && Math.abs(r - ir) / ir < 0.02) || (F.ratios.some(([, r]) => r === 0) && Math.abs(ir - W / H) / ir < 0.02 ? ['', 0] : null);
      if (match) s.R = match[1];
      const base = geom(W, H, s.R, 1);
      s.z = Math.max(1, Math.min(8, base.cw / (initial.w * W)));
      s.cx = (initial.x + initial.w / 2) * W; s.cy = (initial.y + initial.h / 2) * H;
    }
    const clamp = () => { s.z = Math.max(1, Math.min(8, s.z)); const { cw, ch } = geom(W, H, s.R, s.z); s.cx = Math.max(cw / 2, Math.min(W - cw / 2, s.cx)); s.cy = Math.max(ch / 2, Math.min(H - ch / 2, s.cy)); return { cw, ch }; };
    const crop = () => { const { cw, ch } = clamp(); return { x: (s.cx - cw / 2) / W, y: (s.cy - ch / 2) / H, w: cw / W, h: ch / H }; };

    const dialog = h('dialog', { className: 'cr-dialog' });
    dialog.setAttribute('aria-labelledby', 'cr-title');
    const stage = h('canvas', { className: 'cr-stage', tabIndex: 0 });
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', 'Zone de recadrage. Flèches : déplacer. Plus et moins : zoomer. Zéro : recentrer.');
    const zoom = h('input', { type: 'range', min: '1', max: '8', step: '0.01', value: String(s.z), className: 'cr-zoom' });
    zoom.setAttribute('aria-label', 'Zoom');
    const ratioSel = F.ratios.length > 1 ? h('select', { className: 'admin-input cr-ratio' }, F.ratios.map(([label, r], i) => h('option', { value: String(i), textContent: label }))) : null;
    if (ratioSel) { ratioSel.value = String(Math.max(0, F.ratios.findIndex(([, r]) => r === s.R))); ratioSel.setAttribute('aria-label', 'Format'); }
    const previews = F.previews.map(p => {
      const c = h('canvas', { className: 'cr-prev__canvas' });
      const box = h('div', { className: `cr-prev cr-prev--${p.frame}` }, [c, p.frame === 'card' ? h('span', { className: 'cr-prev__band' }) : null, p.frame === 'folder' ? h('span', { className: 'cr-prev__front' }) : null, p.frame === 'tile' ? h('span', { className: 'cr-prev__title', textContent: 'Titre du projet' }) : null]);
      return { p, c, box, fig: h('figure', { className: 'cr-prev__fig' }, [box, h('figcaption', { textContent: p.label })]) };
    });
    const draw = () => {
      const { cw, ch } = clamp(), x = s.cx - cw / 2, y = s.cy - ch / 2, r = cw / ch;
      const maxW = Math.min(560, innerWidth - 64), maxH = Math.min(440, innerHeight * 0.5);
      let sw = maxW, sh = sw / r; if (sh > maxH) { sh = maxH; sw = sh * r; }
      const dpr = Math.min(2, devicePixelRatio || 1);
      stage.width = Math.round(sw * dpr); stage.height = Math.round(sh * dpr); stage.style.width = `${Math.round(sw)}px`; stage.style.height = `${Math.round(sh)}px`;
      const g = stage.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(bitmap, x, y, cw, ch, 0, 0, stage.width, stage.height);
      // Grille des tiers, discrète.
      g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = dpr;
      for (const k of [1, 2]) { g.beginPath(); g.moveTo(stage.width * k / 3, 0); g.lineTo(stage.width * k / 3, stage.height); g.moveTo(0, stage.height * k / 3); g.lineTo(stage.width, stage.height * k / 3); g.stroke(); }
      for (const { p, c, box } of previews) {
        const pr = p.ratio || r, pw = p.frame === 'folder' && pr > 1.5 ? 200 : 130, ph = pw / pr;
        box.style.width = `${pw}px`; box.style.aspectRatio = String(pr);
        // Comme le site : l'image envoyée remplit le composant (cover), centrée.
        let qw = cw, qh = cw / pr; if (qh > ch) { qh = ch; qw = ch * pr; }
        c.width = Math.round(pw * dpr); c.height = Math.round(ph * dpr);
        c.getContext('2d').drawImage(bitmap, s.cx - qw / 2, s.cy - qh / 2, qw, qh, 0, 0, c.width, c.height);
      }
      zoom.value = String(s.z);
    };
    let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };

    // Glisser (souris, doigt), pincer (deux doigts), molette.
    const pts = new Map(); let pinch = 0;
    const scale = () => clamp().cw / stage.clientWidth;
    stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); } });
    stage.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const [px, py] = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) s.z *= d / pinch; pinch = d; }
      else { const k = scale(); s.cx -= (e.clientX - px) * k; s.cy -= (e.clientY - py) * k; }
      redraw();
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', e => { e.preventDefault(); s.z *= Math.exp(-e.deltaY / 400); redraw(); }, { passive: false });
    const recenter = () => { s.z = 1; s.cx = W / 2; s.cy = H / 2; redraw(); };
    stage.addEventListener('keydown', e => {
      const step = (e.shiftKey ? 0.1 : 0.02) * clamp().cw;
      const act = { ArrowLeft: () => { s.cx -= step; }, ArrowRight: () => { s.cx += step; }, ArrowUp: () => { s.cy -= step; }, ArrowDown: () => { s.cy += step; }, '+': () => { s.z *= 1.1; }, '=': () => { s.z *= 1.1; }, '-': () => { s.z /= 1.1; }, '0': () => { s.z = 1; s.cx = W / 2; s.cy = H / 2; } }[e.key];
      if (act) { e.preventDefault(); act(); redraw(); }
    });
    zoom.addEventListener('input', () => { s.z = Number(zoom.value); redraw(); });
    ratioSel?.addEventListener('change', () => { s.R = F.ratios[Number(ratioSel.value)][1]; redraw(); });

    const done = value => { cancelAnimationFrame(raf); dialog.close(); dialog.remove(); resolve(value); };
    const btn = (text, cls, fn) => { const b = h('button', { type: 'button', className: cls, textContent: text }); b.addEventListener('click', fn); return b; };
    dialog.addEventListener('cancel', e => { e.preventDefault(); done(null); });
    dialog.append(
      h('h2', { id: 'cr-title', className: 'cr-title', textContent: `Recadrer : ${F.title}` }),
      h('div', { className: 'cr-body' }, [
        h('div', { className: 'cr-main' }, [stage, h('div', { className: 'cr-tools' }, [ratioSel, h('label', { className: 'cr-zoomwrap' }, [h('span', { textContent: 'Zoom' }), zoom]), btn('Recentrer', 'admin-mini', recenter)])]),
        h('div', { className: 'cr-prevs' }, previews.map(p => p.fig))
      ]),
      h('div', { className: 'cr-actions' }, [btn('Annuler', 'admin-mini', () => done(null)), btn('Valider le recadrage', 'admin-button admin-button--ember', () => done(crop()))])
    );
    document.body.append(dialog);
    dialog.showModal(); draw(); stage.focus();
  });

  // Applique un recadrage (fractions de l'image) : renvoie un canvas à la pleine résolution de la zone gardée.
  const apply = (bitmap, c) => {
    const x = Math.round(c.x * bitmap.width), y = Math.round(c.y * bitmap.height), w = Math.max(1, Math.round(c.w * bitmap.width)), hh = Math.max(1, Math.round(c.h * bitmap.height));
    const canvas = Object.assign(document.createElement('canvas'), { width: w, height: hh });
    const g = canvas.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(bitmap, x, y, w, hh, 0, 0, w, hh);
    return canvas;
  };
  window.NolanCrop = { open, apply, FORMATS };
})();
