// Admin Nolan Arc : « Ordre ». Un seul ordre pour tout ce que le site présente : projets, vidéos, photos du catalogue
// et tuile Photographie. Le haut de la liste ouvre le catalogue Work ; les cinq premiers projets, vidéos ou tuile
// forment « Ma sélection » sur l'accueil. L'ordre de cette liste = l'ordre du site.
// Chaque élément reçoit un numéro (rank) enregistré dans son propre bloc (projects, instagram, photos) ; la tuile
// Photographie garde le sien dans le bloc photos (tileRank). Glisser ou flèches, puis « Enregistrer ».
// Remplace l'ancienne case « Mis en avant » : un élément mis en avant avant cette version est placé en tête au départ.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  window.NolanOrder = ({ el, button, say, heading, card, getDraft, getSeed, saveKey, publish, setDirty, afterSave }) => {
    let list = null, drafts = null, redraw = () => {}, dragFrom = -1;
    const read = async key => { const d = getDraft(key); return structuredClone(d !== undefined && d !== null ? d : await getSeed(key)); };
    const isVideo = p => p.source === 'file' ? Boolean(p.video) : Boolean(p.id);
    // Même règle que le site (templates/pages.mjs) : numéro choisi, puis ancienne mise en avant, puis ordre des blocs.
    const sortKey = (x, i) => [Number.isInteger(x.ref.rank) ? x.ref.rank : x.kind === 'tile' && Number.isInteger(x.tileRank) ? x.tileRank : Infinity, x.ref.featured ? 0 : 1, i];
    const cmp = (a, b) => { for (let k = 0; k < 3; k++) if (a.key[k] !== b.key[k]) return a.key[k] < b.key[k] ? -1 : 1; return 0; };
    const load = async () => {
      drafts = { projects: await read('projects') || [], instagram: await read('instagram') || [], photos: await read('photos') || { items: [] } };
      const items = [
        ...drafts.projects.filter(p => p.visible && (p.media || []).length).map(p => ({ kind: 'project', ref: p, title: p.title || 'Projet sans titre', type: 'Projet' })),
        ...(drafts.photos.items || []).some(p => p.inTile && String(p.alt || '').trim()) ? [{ kind: 'tile', ref: {}, tileRank: drafts.photos.tileRank, title: 'Tuile Photographie', type: 'Accueil seulement' }] : [],
        ...drafts.instagram.filter(p => p.visible !== false && isVideo(p)).map(p => ({ kind: 'video', ref: p, title: p.title || 'Vidéo sans titre', type: 'Vidéo' })),
        ...(drafts.photos.items || []).filter(p => p.visible && String(p.alt || '').trim()).map(p => ({ kind: 'photo', ref: p, title: [p.series, p.place].filter(Boolean).join(' · ') || p.alt, type: 'Photo', alt: p.alt }))
      ];
      list = items.map((x, i) => ({ ...x, key: sortKey(x, i) })).sort(cmp);
    };
    const touch = () => { setDirty(true); say('Ordre modifié, non enregistré.', 'warn'); };
    const move = (from, to) => { if (to < 0 || to >= list.length || from === to) return; list.splice(to, 0, list.splice(from, 1)[0]); touch(); redraw(); document.querySelector(`[data-order-key="${to}"]`)?.focus(); };
    const save = async () => {
      list.forEach((x, i) => { if (x.kind === 'tile') drafts.photos.tileRank = i + 1; else { x.ref.rank = i + 1; delete x.ref.featured; } });
      // Éléments absents de la liste (masqués) : plus de numéro ni d'ancienne mise en avant, ils retrouvent leur place à la fin.
      for (const p of drafts.projects) if (!list.some(x => x.ref === p)) { delete p.rank; delete p.featured; }
      for (const p of drafts.instagram) if (!list.some(x => x.ref === p)) { delete p.rank; delete p.featured; }
      for (const p of drafts.photos.items || []) if (!list.some(x => x.ref === p)) { delete p.rank; delete p.featured; }
      if (!list.some(x => x.kind === 'tile')) delete drafts.photos.tileRank;
      say('Enregistrement…');
      for (const key of ['projects', 'instagram', 'photos']) { const { error } = await saveKey(key, drafts[key]); if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return false; } }
      setDirty(false); afterSave?.(); await load(); redraw();
      say('Ordre enregistré. Clique sur « Enregistrer et publier » pour le mettre en ligne.', 'ok');
      return true;
    };
    const view = () => {
      const box = el('div', { className: 'pj-admin' });
      redraw = () => {
        if (!list) { box.replaceChildren(el('p', { textContent: 'Chargement…' })); return; }
        const saveBtn = button('Enregistrer', 'admin-button', () => save());
        const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => { live.disabled = true; if (await save()) await publish('Ordre du site'); live.disabled = false; });
        let home = 0;
        const rows = list.map((x, i) => {
          const inHome = x.kind !== 'photo' && home < 5 && ++home;
          const where = [inHome ? `Accueil n° ${home}` : '', x.kind !== 'tile' ? 'Work' : ''].filter(Boolean).join(' · ');
          const up = button('↑', 'admin-mini', () => move(i, i - 1), `Monter : ${x.title}`); up.disabled = i === 0;
          const down = button('↓', 'admin-mini', () => move(i, i + 1), `Descendre : ${x.title}`); down.disabled = i === list.length - 1;
          up.dataset.orderKey = String(i);
          const li = el('li', { className: 'ord-row', draggable: true }, [
            el('span', { className: 'ord-row__n', textContent: String(i + 1) }),
            el('span', { className: 'ord-row__body' }, [el('strong', { textContent: x.title }), el('small', { textContent: `${x.type} · ${where}` })]),
            el('span', { className: 'admin-tools' }, [up, down])
          ]);
          li.addEventListener('dragstart', e => { dragFrom = i; e.dataTransfer.effectAllowed = 'move'; li.classList.add('is-dragging'); });
          li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
          li.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
          li.addEventListener('drop', e => { e.preventDefault(); if (dragFrom >= 0) move(dragFrom, i); dragFrom = -1; });
          return li;
        });
        box.replaceChildren(
          el('div', { className: 'admin-bar' }, [heading('Ordre', 'L’ordre de cette liste est l’ordre du site.'), el('div', { className: 'admin-row' }, [saveBtn, live])]),
          card('Catalogue Work et « Ma sélection »', [Object.assign(el('ol', { className: 'ord-list' }, rows), { ariaLabel: 'Ordre des réalisations sur le site' })], 'admin-card--wide')
        );
      };
      redraw();
      load().then(redraw).catch(err => say(`Lecture impossible : ${err.message}`, 'error'));
      return box;
    };
    return { view, reset: () => { list = null; } };
  };
})();
