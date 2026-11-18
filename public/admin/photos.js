// Admin Nolan Arc : photos de la page Work (section Photographie et tuile du bento).
// Les fichiers sont réduits dans le navigateur (WebP, deux tailles, métadonnées et position GPS retirées)
// puis envoyés dans l'espace Supabase « site-photos ». La liste (ordre, légendes, photo de la tuile) est le
// brouillon « photos ». Au déploiement, tools/fetch-published.mjs copie la dernière version publiée sur le site.
// window.NolanMedia (réduction, envoi, aperçu) sert aussi aux images des projets (public/admin/projects.js).
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const MIN = 1;
  const imageFields = it => ({ id: it.id, width: it.width, height: it.height, smallWidth: it.smallWidth, smallHeight: it.smallHeight, ...(it.source ? { source: it.source } : {}), ...(it.crop ? { crop: it.crop } : {}) });
  // Projet photo de « Ma sélection » créé depuis une photo : masqué tant que Nolan n'a pas relu le titre.
  const projectFrom = (image, { title = '', alt = '', year = '' } = {}) => ({ slug: `projet-${crypto.randomUUID().slice(0, 8)}`, title: title || 'Projet photo', territory: 'Photographie', type: 'Photographie', role: 'Photographie', context: '', client: '', year, result: '', link: '', summary: '', media: [{ key: 'm-1', kind: 'photo', image, alt, caption: '', videoId: '', instagramId: '' }], cover: 'm-1', pageMode: 'none', pageSlug: '', mediaKind: 'photo', videoId: '', instagramId: '', image, alt, uploadDate: '', duration: '', visible: false });
  const DESTS = [['photo', 'Section Photographie'], ['project', 'Ma sélection (projet photo du bento)'], ['both', 'Les deux']];

  window.NolanPhotos = ({ client, el, button, say, heading, card, getDraft, saveDraft, publish, setDirty, inUse, addProjects }) => {
    const { store, recrop, preview, remove, noDash } = window.NolanMedia(client, inUse);
    let model = null, removed = [], busy = false, redraw = () => {}, dest = 'photo';
    const reports = new Map();
    const reset = () => {
      const data = getDraft() || {};
      // inTile absent (ancien brouillon) : la photo visible restait dans la tuile, on garde ce comportement.
      model = { items: Array.isArray(data.items) ? structuredClone(data.items).map(p => ({ ...p, inTile: typeof p.inTile === 'boolean' ? p.inTile : Boolean(p.visible) })) : [] };
      removed = [];
    };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const visibleCount = () => model.items.filter(p => p.visible && String(p.alt || '').trim()).length;
    const tileCount = () => model.items.filter(p => p.inTile && String(p.alt || '').trim()).length;

    const upload = async files => {
      const list = [...files].filter(f => /^image\/(jpeg|png|webp)$/.test(f.type));
      if (!list.length) return say('Formats acceptés : JPEG, PNG ou WebP.', 'error');
      busy = true; redraw();
      let done = 0, added = 0;
      const projects = [];
      try {
        for (const file of list) {
          say(`Préparation de ${file.name} (${done + 1}/${list.length})…`);
          const { image, report } = await store(file, 'photo', 'photo');
          reports.set(image.id, report);
          if (dest !== 'project') {
            const last = model.items[model.items.length - 1];
            // Masquée tant que le texte alternatif n'est pas écrit ; série et année reprises de la photo précédente.
            model.items.push({ ...imageFields(image), series: last?.series || '', place: '', year: last?.year || '', alt: '', visible: false, inTile: false });
            added++;
          }
          if (dest !== 'photo') projects.push(projectFrom(imageFields(image), { title: noDash(file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ')).slice(0, 120) }));
          done++;
        }
      } catch (err) {
        say(`Arrêt : ${err.message}. ${done} photo(s) envoyée(s).`, 'error');
      }
      busy = false;
      if (projects.length) {
        const res = await addProjects(projects);
        if (res?.error) say(`Projets non créés : ${res.error.message}`, 'error');
        else if (!added) { redraw(); return say(`${projects.length} projet(s) photo créé(s), masqués : ouvre « Projets » pour relire le titre, écrire le texte alternatif et les rendre visibles.`, 'ok'); }
      }
      if (added) {
        // Enregistrement immédiat : une photo envoyée n'est jamais perdue, même si on quitte la page.
        const ok = await persist(false);
        if (ok) say(`${done} photo(s) ajoutée(s), masquées pour l’instant. Écris le texte alternatif, coche « Visible » puis enregistre.`, 'ok');
      } else redraw();
    };

    const validate = () => {
      for (const p of model.items) {
        p.series = noDash(p.series); p.place = noDash(p.place); p.alt = noDash(p.alt);
        if ((p.visible || p.inTile) && !String(p.alt || '').trim()) return { id: p.id, field: 'alt', text: 'Une photo affichée doit avoir un texte alternatif (ce que montre la photo).' };
        if (p.year && !/^\d{4}$/.test(String(p.year).trim())) return { id: p.id, field: 'year', text: 'L’année s’écrit avec quatre chiffres, par exemple 2026.' };
      }
      return null;
    };
    const persist = async (strict = true) => {
      const problem = validate();
      if (problem) {
        if (!strict) { redraw(); say('Photos envoyées. Complète les champs signalés puis enregistre.', 'warn'); return false; }
        redraw();
        const input = document.querySelector(`[data-photo="${problem.id}"] [data-field="${problem.field}"]`);
        input?.setAttribute('aria-invalid', 'true'); input?.focus();
        say(problem.text, 'error'); return false;
      }
      say('Enregistrement…');
      const { error } = await saveDraft({ items: model.items });
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); redraw(); return false; }
      if (removed.length) await remove(removed);
      setDirty(false); reset(); redraw();
      say('Photos enregistrées. Clique sur « Enregistrer et publier » pour les mettre en ligne.', 'ok');
      return true;
    };

    const view = () => {
      if (!model) reset();
      const box = el('div', { className: 'ph-admin' });
      redraw = () => {
        const focusKey = document.activeElement?.dataset?.focusKey;
        box.replaceChildren(...render());
        if (focusKey) box.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
      };
      redraw();
      return box;
    };

    const field = (labelText, input, help) => {
      const wrap = el('label', { className: 'admin-field' }, [el('span', { textContent: labelText }), input]);
      if (help) wrap.append(el('small', { className: 'ph-help', textContent: help }));
      return wrap;
    };
    const textInput = (item, prop, attrs = {}) => {
      const input = el(attrs.area ? 'textarea' : 'input', { className: `admin-input${attrs.area ? ' admin-input--area' : ''}`, value: String(item[prop] || '') });
      if (!attrs.area) input.type = 'text';
      if (attrs.area) input.rows = 2;
      if (attrs.max) input.maxLength = attrs.max;
      if (attrs.inputMode) input.inputMode = attrs.inputMode;
      if (attrs.placeholder) input.placeholder = attrs.placeholder;
      if (attrs.required) { input.required = true; input.setAttribute('aria-required', 'true'); }
      input.dataset.field = prop;
      input.addEventListener('input', () => { item[prop] = input.value; input.removeAttribute('aria-invalid'); touch(); });
      return input;
    };
    const move = (from, to) => {
      if (to < 0 || to >= model.items.length) return;
      model.items.splice(to, 0, model.items.splice(from, 1)[0]);
      touch(); redraw();
    };

    let dragFrom = -1;
    const photoCard = (item, index) => {
      const n = index + 1;
      const img = el('img', { className: 'ph-thumb', alt: item.alt ? `Aperçu : ${item.alt}` : `Aperçu de la photo ${n}`, width: item.smallWidth || 0, height: item.smallHeight || 0 });
      preview(img, item.id);
      const visible = el('input', { type: 'checkbox', checked: Boolean(item.visible) });
      visible.dataset.focusKey = `${item.id}-visible`;
      visible.addEventListener('change', () => { item.visible = visible.checked; touch(); redraw(); });
      const tile = el('input', { type: 'checkbox', checked: Boolean(item.inTile) });
      tile.dataset.focusKey = `${item.id}-tile`;
      tile.addEventListener('change', () => { item.inTile = tile.checked; touch(); redraw(); });
      const tool = (text, label, key, action, disabled) => { const b = button(text, 'admin-mini', action, label); b.dataset.focusKey = `${item.id}-${key}`; b.disabled = Boolean(disabled); return b; };
      const del = tool('Supprimer', `Supprimer la photo ${n}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('La photo sera supprimée définitivement à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        model.items.splice(index, 1); removed.push(item.id);
        touch(); redraw();
      });
      const status = (item.visible || item.inTile) && !String(item.alt || '').trim() ? 'Texte alternatif manquant' : [item.visible && 'Section', item.inTile && 'Tuile'].filter(Boolean).join(' + ') || 'Masquée';
      const asProject = tool('Créer un projet photo', `Créer un projet de Ma sélection avec la photo ${n}`, 'project', async () => {
        asProject.disabled = true;
        const res = await addProjects([projectFrom(imageFields(item), { title: item.series || '', alt: item.alt || '', year: item.year || '' })]);
        asProject.disabled = false;
        if (res?.error) return say(`Projet non créé : ${res.error.message}`, 'error');
        say('Projet photo créé, masqué, en bas de « Projets » : relis son titre puis rends-le visible.', 'ok');
      });
      const node = el('li', { className: `ph-card${item.visible || item.inTile ? '' : ' is-hidden'}`, draggable: true }, [
        el('div', { className: 'ph-card__media' }, [img, el('span', { className: 'ph-card__n', textContent: String(n) }), item.inTile ? el('span', { className: 'ph-card__cover', textContent: 'Tuile' }) : null]),
        el('div', { className: 'ph-card__body' }, [
          el('p', { className: `ph-card__status${item.visible || item.inTile ? '' : ' is-off'}`, textContent: `Photo ${n} · ${status}` }),
          reports.has(item.id) ? el('p', { className: 'md-badge', textContent: reports.get(item.id) }) : null,
          field('Texte alternatif (obligatoire)', textInput(item, 'alt', { area: true, max: 300, required: true, placeholder: 'Ce que montre la photo, en une phrase' })),
          el('div', { className: 'ph-card__row' }, [
            field('Série', textInput(item, 'series', { max: 80, placeholder: 'Portraits' })),
            field('Lieu (facultatif)', textInput(item, 'place', { max: 80 })),
            field('Année', textInput(item, 'year', { max: 4, inputMode: 'numeric', placeholder: '2026' }))
          ]),
          el('div', { className: 'ph-card__checks' }, [
            el('label', { className: 'admin-field admin-field--check' }, [visible, el('span', { textContent: 'Visible dans la section Photographie' })]),
            el('label', { className: 'admin-field admin-field--check' }, [tile, el('span', { textContent: 'Dans la tuile Photographie' })])
          ]),
          el('div', { className: 'admin-tools' }, [
            tool('↑', `Monter la photo ${n}`, 'up', () => move(index, index - 1), index === 0),
            tool('↓', `Descendre la photo ${n}`, 'down', () => move(index, index + 1), index === model.items.length - 1),
            tool('Recadrer', `Recadrer la photo ${n}`, 'crop', async () => {
              busy = true; redraw();
              try { const { image } = await recrop(item, 'photo', 'photo'); removed.push(item.id); Object.assign(item, imageFields(image)); touch(); say('Recadrage prêt. Enregistre pour le garder.', 'warn'); }
              catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
              busy = false; redraw();
            }, busy),
            asProject,
            del
          ])
        ])
      ]);
      node.dataset.photo = item.id;
      node.addEventListener('dragstart', e => { dragFrom = index; e.dataTransfer.effectAllowed = 'move'; node.classList.add('is-dragging'); });
      node.addEventListener('dragend', () => node.classList.remove('is-dragging'));
      node.addEventListener('dragover', e => { if (dragFrom >= 0) { e.preventDefault(); node.classList.add('is-over'); } });
      node.addEventListener('dragleave', () => node.classList.remove('is-over'));
      node.addEventListener('drop', e => { if (dragFrom < 0) return; e.preventDefault(); const from = dragFrom; dragFrom = -1; move(from, index); });
      return node;
    };

    const render = () => {
      const save = button('Enregistrer', 'admin-button', () => persist(true));
      const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => {
        live.disabled = true;
        if (await persist(true)) await publish('Photos de la page Work');
        live.disabled = false;
      });
      save.disabled = live.disabled = busy;
      const input = el('input', { type: 'file', multiple: true, accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id: 'ph-file' });
      input.disabled = busy;
      input.addEventListener('change', () => { if (input.files.length) upload(input.files); });
      const drop = el('div', { className: 'ph-drop' }, [
        input,
        el('label', { htmlFor: 'ph-file', className: 'admin-button ph-drop__btn', textContent: busy ? 'Envoi en cours…' : '+ Ajouter des photos' }),
        el('p', { textContent: 'Ou glisse les fichiers ici (JPEG, PNG ou WebP).' })
      ]);
      const where = el('fieldset', { className: 'admin-group md-dest' }, [el('legend', { textContent: 'Où vont les photos importées ?' }), ...DESTS.map(([value, label]) => {
        const radio = el('input', { type: 'radio', name: 'ph-dest', value, checked: dest === value });
        radio.dataset.focusKey = `dest-${value}`;
        radio.addEventListener('change', () => { dest = value; });
        return el('label', { className: 'admin-field admin-field--check' }, [radio, el('span', { textContent: label })]);
      })]);
      drop.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); drop.classList.add('is-over'); } });
      drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
      drop.addEventListener('drop', e => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); drop.classList.remove('is-over'); if (!busy) upload(e.dataTransfer.files); });
      const count = visibleCount();
      const tiles = tileCount();
      const summary = el('p', { className: 'ph-help', textContent: `Section Photographie : ${count ? `${count} photo(s)` : 'masquée'}. Tuile Photographie : ${tiles ? `${tiles} photo(s)` : 'masquée'}.` });
      return [
        el('div', { className: 'admin-bar' }, [heading('Photos'), el('div', { className: 'admin-row' }, [save, live])]),
        card('Ajouter', [where, drop, summary], 'admin-card--wide'),
        model.items.length
          ? Object.assign(el('ol', { className: 'ph-list' }, model.items.map(photoCard)), { ariaLabel: 'Photos, dans l’ordre du site' })
          : el('p', { className: 'ph-empty', textContent: 'Aucune photo pour l’instant.' })
      ];
    };

    return { view, reset: () => { model = null; } };
  };
})();
