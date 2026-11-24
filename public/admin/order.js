// Admin Nolan Arc : « Ordre ». Deux ordres distincts, enregistrés et publiés ensemble :
// - Accueil : les éléments de « Ma sélection » (projets, vidéos, tuile Photographie). Les cinq premiers de la liste
//   forment le bento de l'accueil, dans cet ordre (homeRank de 1 à 5, tileHomeRank pour la tuile).
// - Work : l'ordre complet du catalogue Work (projets, vidéos, photos), numéro rank dans chaque bloc.
// Chaque numéro est enregistré dans son propre bloc (projects, instagram, photos). Ordre Accueil jamais enregistré
// (avant cette version) : la liste Accueil part de l'ancien ordre unique, ses cinq premiers sont ceux en ligne.
// Remplace l'ancienne case « Mis en avant » : un élément mis en avant avant cette version est placé en tête au départ.
// Glisser ou flèches. Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const HOME_SLOTS = 5;
  window.NolanOrder = ({ el, button, say, heading, card, getDraft, getSeed, saveKey, publish, setDirty, afterSave }) => {
    let lists = null, drafts = null, tab = 'home', redraw = () => {}, dragFrom = -1;
    const read = async key => { const d = getDraft(key); return structuredClone(d !== undefined && d !== null ? d : await getSeed(key)); };
    const isVideo = p => p.source === 'file' ? Boolean(p.video) : Boolean(p.id);
    const int = v => Number.isInteger(v) ? v : Infinity;
    // Même règle que le site (templates/pages.mjs) : numéro choisi, puis ancienne mise en avant, puis ordre des blocs.
    const sorted = (items, keyOf) => items.map((x, i) => ({ x, k: [...keyOf(x), i] })).sort((a, b) => { for (let n = 0; n < a.k.length; n++) if (a.k[n] !== b.k[n]) return a.k[n] < b.k[n] ? -1 : 1; return 0; }).map(({ x }) => x);
    const workKey = x => [int(x.kind === 'tile' ? drafts.photos.tileRank : x.ref.rank), x.ref.featured ? 0 : 1];
    const homeKey = x => [int(x.kind === 'tile' ? drafts.photos.tileHomeRank : x.ref.homeRank), ...workKey(x)];
    const load = async () => {
      drafts = { projects: await read('projects') || [], instagram: await read('instagram') || [], photos: await read('photos') || { items: [] } };
      const projects = drafts.projects.filter(p => p.visible && (p.media || []).length).map(p => ({ kind: 'project', ref: p, title: p.title || 'Projet sans titre', type: 'Projet' }));
      const tile = (drafts.photos.items || []).some(p => p.inTile && String(p.alt || '').trim()) ? [{ kind: 'tile', ref: {}, title: 'Tuile Photographie', type: 'Tuile' }] : [];
      const videos = drafts.instagram.filter(p => p.visible !== false && isVideo(p)).map(p => ({ kind: 'video', ref: p, title: p.title || 'Vidéo sans titre', type: 'Vidéo' }));
      const photos = (drafts.photos.items || []).filter(p => p.visible && String(p.alt || '').trim()).map(p => ({ kind: 'photo', ref: p, title: [p.series, p.place].filter(Boolean).join(' · ') || p.alt, type: 'Photo' }));
      lists = { home: sorted([...projects, ...tile, ...videos], homeKey), work: sorted([...projects, ...videos, ...photos], workKey) };
    };
    const touch = () => { setDirty(true); say('Ordre modifié, non enregistré.', 'warn'); };
    const move = (from, to) => {
      const list = lists[tab];
      if (to < 0 || to >= list.length || from === to) return;
      list.splice(to, 0, list.splice(from, 1)[0]); touch(); redraw();
      document.querySelector(`[data-order-key="${to}"]`)?.focus();
    };
    const save = async () => {
      // Work : numéro de 1 à n ; l'ancienne mise en avant disparaît.
      lists.work.forEach((x, i) => { x.ref.rank = i + 1; delete x.ref.featured; });
      // Accueil : les cinq premiers reçoivent leur place, les autres n'en ont plus.
      const home = lists.home.slice(0, HOME_SLOTS);
      for (const p of [...drafts.projects, ...drafts.instagram]) delete p.homeRank;
      delete drafts.photos.tileHomeRank;
      home.forEach((x, i) => { if (x.kind === 'tile') drafts.photos.tileHomeRank = i + 1; else x.ref.homeRank = i + 1; });
      // Éléments absents de la liste Work (masqués) : plus de numéro ni d'ancienne mise en avant, ils retrouvent leur place à la fin.
      for (const p of [...drafts.projects, ...drafts.instagram, ...(drafts.photos.items || [])]) if (!lists.work.some(x => x.ref === p)) { delete p.rank; delete p.featured; }
      if (!lists.home.some(x => x.kind === 'tile')) delete drafts.photos.tileRank;
      say('Enregistrement…');
      for (const key of ['projects', 'instagram', 'photos']) { const { error } = await saveKey(key, drafts[key]); if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return false; } }
      setDirty(false); afterSave?.(); await load(); redraw();
      say('Ordre enregistré. Clique sur « Enregistrer et publier » pour le mettre en ligne.', 'ok');
      return true;
    };
    const row = (x, i, list) => {
      const where = tab === 'home' ? (i < HOME_SLOTS ? `Accueil n° ${i + 1}` : 'Hors accueil') : `Work n° ${i + 1}`;
      const up = button('↑', 'admin-mini', () => move(i, i - 1), `Monter : ${x.title}`); up.disabled = i === 0;
      const down = button('↓', 'admin-mini', () => move(i, i + 1), `Descendre : ${x.title}`); down.disabled = i === list.length - 1;
      up.dataset.orderKey = String(i);
      const out = tab === 'home' && i >= HOME_SLOTS;
      const li = el('li', { className: `ord-row${out ? ' is-out' : ''}${tab === 'home' && i === HOME_SLOTS ? ' is-cut' : ''}`, draggable: true }, [
        el('span', { className: 'ord-row__n', textContent: String(i + 1) }),
        el('span', { className: 'ord-row__body' }, [el('strong', { textContent: x.title }), el('small', { textContent: `${x.type} · ${where}` })]),
        el('span', { className: 'admin-tools' }, [up, down])
      ]);
      li.addEventListener('dragstart', e => { dragFrom = i; e.dataTransfer.effectAllowed = 'move'; li.classList.add('is-dragging'); });
      li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
      li.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
      li.addEventListener('drop', e => { e.preventDefault(); if (dragFrom >= 0) move(dragFrom, i); dragFrom = -1; });
      return li;
    };
    const view = () => {
      const box = el('div', { className: 'pj-admin' });
      redraw = () => {
        if (!lists) { box.replaceChildren(el('p', { textContent: 'Chargement…' })); return; }
        const saveBtn = button('Enregistrer', 'admin-button', () => save());
        const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => { live.disabled = true; if (await save()) await publish('Ordre du site'); live.disabled = false; });
        const tabs = el('div', { className: 'ck-tabs ord-tabs' }, [['home', 'Accueil'], ['work', 'Work']].map(([id, label]) => {
          const b = button(label, 'ck-tab', () => { tab = id; redraw(); }); b.setAttribute('aria-pressed', String(tab === id)); return b;
        }));
        const list = lists[tab];
        const ol = el('ol', { className: 'ord-list' }, list.map((x, i) => row(x, i, list)));
        ol.setAttribute('aria-label', tab === 'home' ? 'Ordre de Ma sélection sur l’accueil' : 'Ordre du catalogue Work');
        box.replaceChildren(
          el('div', { className: 'admin-bar' }, [heading('Ordre'), el('div', { className: 'admin-row' }, [saveBtn, live])]),
          tabs,
          card(tab === 'home' ? 'Accueil · Ma sélection' : 'Work · Catalogue', [ol], 'admin-card--wide')
        );
      };
      redraw();
      load().then(redraw).catch(err => say(`Lecture impossible : ${err.message}`, 'error'));
      return box;
    };
    return { view, reset: () => { lists = null; } };
  };
})();
