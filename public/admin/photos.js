// Admin Nolan Arc : photos de la page Work (section Photographie et tuile du bento).
// Les fichiers sont réduits dans le navigateur (WebP, deux tailles, métadonnées et position GPS retirées)
// puis envoyés dans l'espace Supabase « site-photos ». La liste (ordre, légendes, photo de la tuile) est le
// brouillon « photos ». Au déploiement, tools/fetch-photos.mjs copie la dernière version publiée sur le site.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const BUCKET = 'site-photos';
  const SIZES = { large: { side: 2000, budget: 700 * 1024 }, small: { side: 1000, budget: 220 * 1024 } };
  const MIN = 3;
  const MAX_SOURCE = 40 * 1024 * 1024;
  const pathsOf = id => [`${id}.webp`, `${id}-s.webp`];
  const noDash = text => String(text || '').replace(/[\u2014\u2013]/g, '-');

  // Redimensionne et encode en WebP ; baisse la qualité jusqu'à tenir le poids visé.
  const encode = async (bitmap, { side, budget }) => {
    const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale)), height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = Object.assign(document.createElement('canvas'), { width, height });
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    let blob = null;
    for (let q = 0.84; q >= 0.5; q -= 0.08) {
      blob = await new Promise(done => canvas.toBlob(done, 'image/webp', q));
      if (!blob || blob.type !== 'image/webp') throw new Error('ce navigateur ne sait pas produire d’images WebP (utilise Chrome, Edge ou Firefox)');
      if (blob.size <= budget) break;
    }
    return { blob, width, height };
  };

  window.NolanPhotos = ({ client, el, button, say, heading, card, getDraft, saveDraft, publish, setDirty }) => {
    const previews = new Map();
    let model = null, removed = [], busy = false, redraw = () => {};
    const reset = () => {
      const data = getDraft() || {};
      model = { cover: data.cover || '', items: Array.isArray(data.items) ? structuredClone(data.items) : [] };
      removed = [];
    };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const publicUrl = path => client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    // Aperçu : le fichier est lu par fetch puis affiché en blob: (la politique de sécurité n'autorise pas
    // d'image venant directement de Supabase, et le site public n'en a pas besoin).
    const preview = (img, id) => {
      if (previews.has(id)) { img.src = previews.get(id); return; }
      fetch(publicUrl(pathsOf(id)[1]), { cache: 'force-cache' }).then(r => r.ok ? r.blob() : Promise.reject(new Error(r.status))).then(blob => {
        const url = URL.createObjectURL(blob); previews.set(id, url); img.src = url;
      }).catch(() => { img.alt = 'Aperçu indisponible'; });
    };
    const visibleCount = () => model.items.filter(p => p.visible && String(p.alt || '').trim()).length;

    const upload = async files => {
      const list = [...files].filter(f => /^image\/(jpeg|png|webp)$/.test(f.type));
      if (!list.length) return say('Formats acceptés : JPEG, PNG ou WebP.', 'error');
      busy = true; redraw();
      let done = 0;
      try {
        for (const file of list) {
          say(`Préparation de ${file.name} (${done + 1}/${list.length})…`);
          if (file.size > MAX_SOURCE) throw new Error(`${file.name} dépasse 40 Mo`);
          const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
          const large = await encode(bitmap, SIZES.large), small = await encode(bitmap, SIZES.small);
          bitmap.close?.();
          const id = crypto.randomUUID();
          const [pLarge, pSmall] = pathsOf(id);
          for (const [path, blob] of [[pLarge, large.blob], [pSmall, small.blob]]) {
            const { error } = await client.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
            if (error) throw new Error(`envoi de ${file.name} impossible : ${error.message}`);
          }
          previews.set(id, URL.createObjectURL(small.blob));
          const last = model.items[model.items.length - 1];
          // Masquée tant que le texte alternatif n'est pas écrit ; série et année reprises de la photo précédente.
          model.items.push({ id, width: large.width, height: large.height, smallWidth: small.width, smallHeight: small.height, series: last?.series || '', place: '', year: last?.year || '', alt: '', visible: false });
          done++;
        }
      } catch (err) {
        say(`Arrêt : ${err.message}. ${done} photo(s) envoyée(s).`, 'error');
      }
      busy = false;
      if (done) {
        // Enregistrement immédiat : une photo envoyée n'est jamais perdue, même si on quitte la page.
        const ok = await persist(false);
        if (ok) say(`${done} photo(s) ajoutée(s), masquées pour l’instant. Écris le texte alternatif, coche « Visible » puis enregistre.`, 'ok');
      } else redraw();
    };

    const validate = () => {
      for (const p of model.items) {
        p.series = noDash(p.series); p.place = noDash(p.place); p.alt = noDash(p.alt);
        if (p.visible && !String(p.alt || '').trim()) return { id: p.id, field: 'alt', text: 'Une photo visible doit avoir un texte alternatif (ce que montre la photo).' };
        if (p.year && !/^\d{4}$/.test(String(p.year).trim())) return { id: p.id, field: 'year', text: 'L’année s’écrit avec quatre chiffres, par exemple 2026.' };
      }
      if (model.cover && !model.items.some(p => p.id === model.cover)) model.cover = '';
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
      const { error } = await saveDraft({ cover: model.cover, items: model.items });
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); redraw(); return false; }
      if (removed.length) { await client.storage.from(BUCKET).remove(removed); removed.forEach(path => { const id = path.replace(/(-s)?\.webp$/, ''); const url = previews.get(id); if (url) { URL.revokeObjectURL(url); previews.delete(id); } }); }
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
      const isCover = model.cover ? model.cover === item.id : index === 0;
      const img = el('img', { className: 'ph-thumb', alt: item.alt ? `Aperçu : ${item.alt}` : `Aperçu de la photo ${n}`, width: item.smallWidth || 0, height: item.smallHeight || 0 });
      preview(img, item.id);
      const visible = el('input', { type: 'checkbox', checked: Boolean(item.visible) });
      visible.dataset.focusKey = `${item.id}-visible`;
      visible.addEventListener('change', () => { item.visible = visible.checked; touch(); redraw(); });
      const cover = el('input', { type: 'radio', name: 'ph-cover', checked: isCover });
      cover.dataset.focusKey = `${item.id}-cover`;
      cover.addEventListener('change', () => { model.cover = item.id; touch(); redraw(); });
      const tool = (text, label, key, action, disabled) => { const b = button(text, 'admin-mini', action, label); b.dataset.focusKey = `${item.id}-${key}`; b.disabled = Boolean(disabled); return b; };
      const del = tool('Supprimer', `Supprimer la photo ${n}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('La photo sera supprimée définitivement à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        model.items.splice(index, 1); removed.push(...pathsOf(item.id));
        if (model.cover === item.id) model.cover = '';
        touch(); redraw();
      });
      const status = !item.visible ? 'Masquée' : !String(item.alt || '').trim() ? 'Texte alternatif manquant' : 'Visible';
      const node = el('li', { className: `ph-card${item.visible ? '' : ' is-hidden'}`, draggable: true }, [
        el('div', { className: 'ph-card__media' }, [img, el('span', { className: 'ph-card__n', textContent: String(n) }), isCover ? el('span', { className: 'ph-card__cover', textContent: 'Tuile' }) : null]),
        el('div', { className: 'ph-card__body' }, [
          el('p', { className: `ph-card__status${item.visible ? '' : ' is-off'}`, textContent: `Photo ${n} · ${status}` }),
          field('Texte alternatif (obligatoire)', textInput(item, 'alt', { area: true, max: 300, required: true, placeholder: 'Ce que montre la photo, en une phrase' }), 'Lu par les personnes aveugles et par Google.'),
          el('div', { className: 'ph-card__row' }, [
            field('Série', textInput(item, 'series', { max: 80, placeholder: 'Portraits' })),
            field('Lieu (facultatif)', textInput(item, 'place', { max: 80 })),
            field('Année', textInput(item, 'year', { max: 4, inputMode: 'numeric', placeholder: '2026' }))
          ]),
          el('div', { className: 'ph-card__checks' }, [
            el('label', { className: 'admin-field admin-field--check' }, [visible, el('span', { textContent: 'Visible sur le site' })]),
            el('label', { className: 'admin-field admin-field--check' }, [cover, el('span', { textContent: 'Photo de la tuile Work' })])
          ]),
          el('div', { className: 'admin-tools' }, [
            tool('↑', `Monter la photo ${n}`, 'up', () => move(index, index - 1), index === 0),
            tool('↓', `Descendre la photo ${n}`, 'down', () => move(index, index + 1), index === model.items.length - 1),
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
        el('p', { textContent: 'Ou glisse les fichiers ici. JPEG, PNG ou WebP : chaque photo est réduite dans ton navigateur (WebP, 2000 px et 1000 px), sans ses métadonnées ni sa position GPS.' })
      ]);
      drop.addEventListener('dragover', e => { if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); drop.classList.add('is-over'); } });
      drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
      drop.addEventListener('drop', e => { if (!e.dataTransfer?.files?.length) return; e.preventDefault(); drop.classList.remove('is-over'); if (!busy) upload(e.dataTransfer.files); });
      const count = visibleCount();
      const summary = el('p', { className: count >= MIN ? 'admin-ok' : 'admin-alert', textContent: count >= MIN
        ? `${count} photo(s) visible(s) : la section Photographie et sa tuile s’afficheront sur la page Work.`
        : `${count} photo(s) visible(s) sur ${MIN} minimum : tant qu’il en manque, la section Photographie reste masquée sur le site.` });
      return [
        el('div', { className: 'admin-bar' }, [heading('Photos de la page Work', 'Section Photographie et tuile du bento. L’ordre ici est l’ordre sur le site.'), el('div', { className: 'admin-row' }, [save, live])]),
        card('Ajouter', [drop, summary, el('p', { className: 'ph-help', textContent: 'Après publication, les photos apparaissent sur nolanarc.com dans l’heure (copie automatique au déploiement).' })], 'admin-card--wide'),
        model.items.length
          ? Object.assign(el('ol', { className: 'ph-list' }, model.items.map(photoCard)), { ariaLabel: 'Photos, dans l’ordre du site' })
          : el('p', { className: 'ph-empty', textContent: 'Aucune photo pour l’instant.' })
      ];
    };

    return { view, reset: () => { model = null; } };
  };
})();
