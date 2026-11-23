// Admin Nolan Arc : projets du portfolio (page Work, « Ma sélection »). Remplace le formulaire générique
// du bloc « projects » par un éditeur dédié : ajouter, modifier, ordonner, masquer, supprimer un projet.
// Un projet a autant de médias qu'il veut (photos, vidéos YouTube, Instagram ou fichiers), dans l'ordre choisi
// (glisser ou flèches), dont un média principal : la couverture de la tuile. Avec plusieurs médias (ou le
// réglage « page projet »), la tuile ouvre une page /projet/<adresse>/ générée au déploiement.
// Au déploiement, tools/fetch-published.mjs copie la dernière version publiée sur le site.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const BOL = 'le-bol-den-face';
  const KIND_LABEL = { photo: 'Photo', youtube: 'Vidéo YouTube', instagram: 'Vidéo Instagram', file: 'Fichier vidéo' };
  const youtubeId = text => { const v = String(text || '').trim(); if (/^[\w-]{11}$/.test(v)) return v; const m = v.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/); return m ? m[1] : ''; };
  const instagramId = text => { const m = String(text || '').trim().match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|tv)\/([\w-]{5,40})/); return m ? m[1] : ''; };
  const validLink = v => !v || /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[\w.-]+(\/[\w\-./?=&#%~+]*)?$/.test(v);
  const randomSlug = () => `projet-${crypto.randomUUID().slice(0, 8)}`;
  const newKey = () => `m-${crypto.randomUUID().slice(0, 8)}`;
  const slugify = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  const imageFields = i => i ? { id: i.id, width: i.width, height: i.height, smallWidth: i.smallWidth, smallHeight: i.smallHeight, ...(i.source ? { source: i.source } : {}), ...(i.crop ? { crop: i.crop } : {}) } : null;
  // Ancien format (un seul média : mediaKind, image, alt, videoId, instagramId) -> liste de médias. Aucune perte :
  // le média existant devient le premier, et la couverture. Une vidéo seule garde une page pour rester visible.
  // « Page projet au clic » (page) ou non (none, ou link : lien externe facultatif). Ancien réglage « auto » :
  // même résultat qu'avant, page dès deux médias, sinon pas de page.
  const pageModeOf = p => p.slug === BOL ? 'page' : p.pageMode === 'auto' || !p.pageMode ? ((p.media || []).length > 1 ? 'page' : 'none') : ['page', 'none', 'link'].includes(p.pageMode) ? p.pageMode : 'none';
  // Catégories du catalogue (cases à cocher). Projet publié avant les catégories : classement proposé, à vérifier.
  const withCategories = p => { if (!Array.isArray(p.categories)) p.categories = window.NolanCategories.project(p); return p; };
  const migrate = p => withCategories(migrateMedia(p));
  const migrateMedia = p => {
    if (Array.isArray(p.media)) { if (!p.media.some(m => m.key === p.cover)) p.cover = p.media[0]?.key || ''; p.pageMode = pageModeOf(p); return p; }
    const kind = ['photo', 'youtube', 'instagram'].includes(p.mediaKind) ? p.mediaKind : p.videoId ? 'youtube' : p.image ? 'photo' : '';
    p.media = kind ? [{ key: 'm-1', kind, image: p.image || null, alt: p.alt || '', caption: '', videoId: kind === 'youtube' ? p.videoId || '' : '', instagramId: kind === 'instagram' ? p.instagramId || '' : '' }] : [];
    p.cover = p.media[0]?.key || '';
    p.pageMode = p.pageMode || (String(p.link || '').trim() ? 'link' : kind === 'youtube' || kind === 'instagram' ? 'page' : 'none');
    p.pageMode = pageModeOf(p);
    return p;
  };
  // Champs de l'ancien format recopiés depuis la couverture (lus par « Images du site » et le site).
  const syncLegacy = p => { const c = p.media.find(m => m.key === p.cover) || p.media[0]; p.cover = c?.key || ''; p.mediaKind = c?.kind === 'file' ? 'file' : c?.kind || 'photo'; p.image = c?.image || null; p.alt = c?.alt || ''; p.videoId = c?.videoId || ''; p.instagramId = c?.instagramId || ''; };
  const mediaProblem = m => {
    if (m.kind === 'youtube' && !m.videoId) return ['video', 'colle le lien de la vidéo YouTube'];
    if (m.kind === 'instagram' && !m.instagramId) return ['video', 'colle le lien de la publication Instagram'];
    if (m.kind === 'instagram' && !m.image) return ['image', 'une vidéo Instagram a besoin d’une image de couverture (Instagram n’en fournit pas)'];
    if (m.kind === 'photo' && !m.image) return ['image', 'photo manquante'];
    if (m.kind === 'file' && !m.video) return ['image', 'fichier vidéo manquant'];
    if ((m.image || m.kind === 'file') && !String(m.alt || '').trim()) return ['alt', 'écris le texte alternatif (ce que montre l’image)'];
    return null;
  };

  window.NolanProjects = ({ client, el, button, say, heading, card, getDraft, saveDraft, publish, setDirty, inUse }) => {
    const media = window.NolanMedia ? window.NolanMedia(client, inUse) : null;
    let model = null, removed = [], removedVideos = [], busy = '', redraw = () => {};
    const open = new Set();
    const reset = () => { const data = getDraft(); model = Array.isArray(data) ? structuredClone(data).map(migrate) : null; removed = []; removedVideos = []; };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const dropMedia = m => { if (m.image?.id) removed.push(m.image.id); if (m.video?.id) removedVideos.push(m.video); };
    const ready = p => p.media.filter(m => !mediaProblem(m));
    const pageAddress = p => `/projet/${p.pageSlug || slugify(p.title) || p.slug}/`;
    // Ce que fera la tuile une fois publiée (même règle que le site, voir templates/pages.mjs).
    const tileAction = p => {
      if (p.slug === BOL) return 'Page du film : /projet/le-bol-den-face/';
      if (!ready(p).length) return 'Aucun média complet : projet masqué.';
      if (p.pageMode === 'page') return `Page : ${pageAddress(p)}`;
      if (p.pageMode === 'link') return `Ouvre ${String(p.link || '').trim()}`;
      return 'Sans page : visible dans Ma sélection, fiche sous la grille.';
    };

    const status = p => {
      if (!p.visible) return 'Masqué';
      if (!ready(p).length) return 'Masqué sur le site : aucun média complet';
      return `Visible · ${ready(p).length} média${ready(p).length > 1 ? 's' : ''}`;
    };
    const problemOf = p => {
      p.title = media?.noDash(p.title) ?? p.title;
      for (const f of ['type', 'role', 'context', 'client', 'result', 'summary', 'contextText', 'intent']) if (typeof p[f] === 'string') p[f] = media ? media.noDash(p[f]) : p[f];
      p.media.forEach(m => { m.alt = media ? media.noDash(m.alt) : m.alt; m.caption = media ? media.noDash(m.caption) : m.caption; });
      if (!String(p.title || '').trim()) return ['title', 'Chaque projet a besoin d’un titre.'];
      if (p.year && !/^\d{4}$/.test(String(p.year).trim())) return ['year', 'L’année s’écrit avec quatre chiffres, par exemple 2026.'];
      if (!validLink(String(p.link || '').trim())) return ['link', 'Le lien doit commencer par https:// ou par / (page du site).'];
      if (p.pageMode === 'link' && !String(p.link || '').trim()) p.pageMode = 'none';
      if (p.pageSlug && !/^[a-z0-9](?:[a-z0-9-]{0,58}[a-z0-9])?$/.test(p.pageSlug)) return ['pageSlug', 'L’adresse de la page : lettres minuscules sans accent, chiffres et tirets (ex. mariage-lea-sam).'];
      if (p.uploadDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate)) return ['uploadDate', 'La date s’écrit AAAA-MM-JJ, par exemple 2026-03-14.'];
      if (p.duration && !/^PT(\d+H)?(\d+M)?(\d+S)?$/.test(p.duration)) return ['duration', 'La durée s’écrit comme PT1M30S (1 min 30 s).'];
      for (const [i, m] of p.media.entries()) { const bad = mediaProblem(m); if (bad && (p.visible || bad[0] === 'alt')) return [`${m.key}-${bad[0]}`, `Média ${i + 1} (${KIND_LABEL[m.kind]}) : ${bad[1]}.`]; }
      if (p.visible && !p.media.length) return ['add', 'Un projet visible a besoin d’au moins un média (photo ou vidéo).'];
      syncLegacy(p);
      return null;
    };
    const persist = async () => {
      for (const p of model) {
        const problem = problemOf(p);
        if (problem) {
          open.add(p.slug); redraw();
          const input = document.querySelector(`[data-focus-key="${p.slug}-${problem[0]}"]`);
          input?.setAttribute('aria-invalid', 'true'); input?.focus();
          say(`${p.title || 'Projet sans titre'} : ${problem[1]}`, 'error'); return false;
        }
      }
      say('Enregistrement…');
      const { error } = await saveDraft(model);
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return false; }
      if (removed.length && media) await media.remove(removed);
      if (media) for (const v of removedVideos) await media.removeVideo(v);
      setDirty(false); reset(); redraw();
      say('Projets enregistrés. Clique sur « Enregistrer et publier » pour les mettre en ligne.', 'ok');
      return true;
    };

    const view = () => {
      if (!model) reset();
      const box = el('div', { className: 'pj-admin' });
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
    const text = (p, prop, opts = {}) => {
      const input = el(opts.area ? 'textarea' : 'input', { className: `admin-input${opts.area ? ' admin-input--area' : ''}`, value: String(p[prop] ?? '') });
      if (!opts.area) input.type = 'text'; else input.rows = opts.rows || 2;
      if (opts.max) input.maxLength = opts.max;
      if (opts.placeholder) input.placeholder = opts.placeholder;
      if (opts.inputMode) input.inputMode = opts.inputMode;
      if (opts.required) { input.required = true; input.setAttribute('aria-required', 'true'); }
      input.dataset.focusKey = opts.key || `${p.slug}-${prop}`;
      input.addEventListener('input', () => { p[prop] = input.value; input.removeAttribute('aria-invalid'); touch(); });
      return input;
    };
    const select = (p, prop, options, onChange) => {
      const node = el('select', { className: 'admin-input' }, options.map(([value, label]) => el('option', { value, textContent: label })));
      node.value = String(p[prop] || options[0][0]);
      node.dataset.focusKey = `${p.slug}-${prop}`;
      node.addEventListener('change', () => { p[prop] = node.value; touch(); onChange?.(); });
      return node;
    };
    const move = (from, to) => { if (to < 0 || to >= model.length) return; model.splice(to, 0, model.splice(from, 1)[0]); touch(); redraw(); };

    // ------------------------------------------------ Médias du projet (plusieurs, réordonnables, une couverture)
    const moveMedia = (p, from, to) => { if (to < 0 || to >= p.media.length || from === to) return; p.media.splice(to, 0, p.media.splice(from, 1)[0]); touch(); redraw(); };
    const addFiles = async (p, files) => {
      if (!media) return;
      busy = p.slug; redraw();
      let done = 0;
      try {
        for (const file of files) {
          say(`Préparation de ${file.name} (${done + 1}/${files.length})…`);
          if (/^video\//.test(file.type)) {
            const { video, cover, report } = await media.storeVideo(file);
            p.media.push({ key: newKey(), kind: 'file', image: imageFields(cover), video, alt: '', caption: '', videoId: '', instagramId: '' }); say(report, 'warn');
          } else {
            const { image, report } = await media.store(file, 'photo', 'project');
            p.media.push({ key: newKey(), kind: 'photo', image: imageFields(image), alt: '', caption: '', videoId: '', instagramId: '' }); say(report, 'warn');
          }
          done++;
        }
        if (!p.cover) p.cover = p.media[0]?.key || '';
        touch(); say(`${done} média(s) ajouté(s). Écris le texte alternatif de chacun puis enregistre.`, 'warn');
      } catch (err) { say(`Arrêt : ${err.message}. ${done} média(s) ajouté(s).`, 'error'); }
      busy = ''; redraw();
    };
    let drag = null;
    const mediaItem = (p, m, i) => {
      const isCover = p.cover === m.key, n = i + 1, label = KIND_LABEL[m.kind];
      const fk = suffix => `${p.slug}-${m.key}-${suffix}`;
      const tool = (text, aria, key, action, disabled) => { const b = button(text, 'admin-mini', action, aria); b.dataset.focusKey = fk(key); b.disabled = Boolean(disabled) || Boolean(busy); return b; };
      const fig = el('div', { className: 'ph-card__media' });
      if (m.image) { const img = el('img', { className: 'ph-thumb', alt: m.alt ? `Aperçu : ${m.alt}` : `Aperçu du média ${n}`, width: m.image.smallWidth || 0, height: m.image.smallHeight || 0 }); media?.preview(img, m.image.id); fig.append(img); }
      else fig.append(el('span', { className: 'im-blank', textContent: m.kind === 'youtube' ? (m.videoId ? 'Affiche YouTube (copiée au déploiement)' : 'Vidéo YouTube') : 'Aucune image' }));
      fig.append(el('span', { className: 'ph-card__n', textContent: String(n) }));
      if (isCover) fig.append(el('span', { className: 'ph-card__cover', textContent: 'Couverture' }));
      const coverRadio = el('input', { type: 'radio', name: `pj-cover-${p.slug}`, checked: isCover });
      coverRadio.dataset.focusKey = fk('cover');
      coverRadio.addEventListener('change', () => { p.cover = m.key; touch(); redraw(); });
      const body = el('div', { className: 'ph-card__body' }, [el('p', { className: `ph-card__status${mediaProblem(m) ? ' is-off' : ''}`, textContent: `Média ${n} · ${label}${mediaProblem(m) ? ` · à compléter : ${mediaProblem(m)[1]}` : ''}` })]);
      if (m.kind === 'youtube' || m.kind === 'instagram') {
        const yt = m.kind === 'youtube';
        const input = el('input', { type: 'url', className: 'admin-input', value: yt ? (m.videoId ? `https://www.youtube.com/watch?v=${m.videoId}` : '') : (m.instagramId ? `https://www.instagram.com/p/${m.instagramId}/` : ''), placeholder: yt ? 'https://www.youtube.com/watch?v=…' : 'https://www.instagram.com/p/…' });
        input.dataset.focusKey = fk('video');
        const help = el('small', { className: 'ph-help' });
        const sync = () => { const id = yt ? youtubeId(input.value) : instagramId(input.value); if (yt) m.videoId = id; else m.instagramId = id; help.textContent = id ? `Vidéo reconnue (${id}). Le lecteur ne se charge qu’au clic du visiteur.` : input.value.trim() ? 'Lien non reconnu.' : 'Colle l’adresse de la vidéo.'; };
        sync();
        input.addEventListener('input', () => { sync(); input.removeAttribute('aria-invalid'); touch(); });
        body.append(el('label', { className: 'admin-field' }, [el('span', { textContent: yt ? 'Lien de la vidéo YouTube' : 'Lien de la publication Instagram' }), input, help]));
      }
      if (m.image || m.kind !== 'youtube') body.append(field(m.image || m.kind === 'file' ? 'Texte alternatif (obligatoire)' : 'Texte alternatif', text(m, 'alt', { area: true, max: 300, required: true, key: fk('alt'), placeholder: 'Ce que montre l’image, en une phrase' })));
      body.append(field('Légende (facultatif, affichée sous le média sur la page projet)', text(m, 'caption', { max: 160, key: fk('caption') })));
      const fileId = `pj-img-${p.slug}-${m.key}`;
      const replace = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id: fileId });
      replace.dataset.focusKey = fk('image'); replace.disabled = Boolean(busy);
      replace.addEventListener('change', async () => {
        const file = replace.files[0]; if (!file || !media) return;
        busy = p.slug; redraw(); say(`Préparation de ${file.name}…`);
        try { const { image, report } = await media.store(file, 'photo', 'project'); if (m.image?.id) removed.push(m.image.id); m.image = imageFields(image); touch(); say(`${report}. Vérifie le texte alternatif puis enregistre.`, 'warn'); }
        catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
        busy = ''; redraw();
      });
      const del = tool('Retirer', `Retirer le média ${n} (${label})`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer le retrait'; return say('Le média sera retiré (et son fichier supprimé) à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        dropMedia(m); p.media.splice(i, 1); if (isCover) p.cover = p.media[0]?.key || ''; touch(); redraw();
      });
      body.append(
        el('div', { className: 'ph-card__checks' }, [el('label', { className: 'admin-field admin-field--check' }, [coverRadio, el('span', { textContent: 'Média principal (couverture de la tuile)' })])]),
        el('div', { className: 'admin-tools' }, [
          tool('↑', `Monter le média ${n}`, 'up', () => moveMedia(p, i, i - 1), i === 0),
          tool('↓', `Descendre le média ${n}`, 'down', () => moveMedia(p, i, i + 1), i === p.media.length - 1),
          m.kind !== 'file' ? replace : null,
          m.kind !== 'file' ? el('label', { htmlFor: fileId, className: 'admin-mini ph-drop__btn', textContent: busy === p.slug ? 'Envoi en cours…' : m.image ? 'Remplacer l’image' : m.kind === 'photo' ? 'Envoyer la photo' : 'Ajouter une image de couverture' }) : null,
          m.image ? tool('Recadrer', `Recadrer le média ${n}`, 'crop', async () => {
            busy = p.slug; redraw();
            try { const { image } = await media.recrop(m.image, 'photo', 'project'); removed.push(m.image.id); m.image = imageFields(image); touch(); say('Recadrage prêt. Enregistre pour le garder.', 'warn'); }
            catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
            busy = ''; redraw();
          }) : null,
          m.kind === 'youtube' && m.image ? tool('Revenir à l’affiche YouTube', `Retirer l’image du média ${n}`, 'noimg', () => { removed.push(m.image.id); m.image = null; touch(); redraw(); }) : null,
          del
        ].filter(Boolean))
      );
      const node = el('li', { className: 'ph-card pj-mediaitem', draggable: !busy }, [fig, body]);
      node.dataset.media = m.key;
      node.addEventListener('dragstart', e => { drag = { slug: p.slug, from: i }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', m.key); node.classList.add('is-dragging'); });
      node.addEventListener('dragend', () => { node.classList.remove('is-dragging'); drag = null; });
      node.addEventListener('dragover', e => { if (drag?.slug === p.slug) { e.preventDefault(); node.classList.add('is-over'); } });
      node.addEventListener('dragleave', () => node.classList.remove('is-over'));
      node.addEventListener('drop', e => { if (drag?.slug !== p.slug) return; e.preventDefault(); const from = drag.from; drag = null; moveMedia(p, from, i); });
      return node;
    };
    const mediaBlock = p => {
      const files = el('input', { type: 'file', multiple: true, accept: 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm', className: 'ph-file', id: `pj-files-${p.slug}` });
      files.dataset.focusKey = `${p.slug}-add`; files.disabled = Boolean(busy);
      files.addEventListener('change', () => { if (files.files.length) addFiles(p, [...files.files]); });
      const addLink = kind => button(kind === 'youtube' ? '+ Vidéo YouTube' : '+ Vidéo Instagram', 'admin-mini admin-mini--add', () => {
        const m = { key: newKey(), kind, image: null, alt: '', caption: '', videoId: '', instagramId: '' };
        p.media.push(m); if (!p.cover) p.cover = m.key; touch(); redraw();
        document.querySelector(`[data-focus-key="${p.slug}-${m.key}-video"]`)?.focus();
      }, kind === 'youtube' ? `Ajouter une vidéo YouTube au projet ${p.title || ''}` : `Ajouter une vidéo Instagram au projet ${p.title || ''}`);
      const list = el('ol', { className: 'ph-list pj-medialist' }, p.media.map((m, i) => mediaItem(p, m, i)));
      list.setAttribute('aria-label', `Médias du projet ${p.title || ''}, dans l’ordre de la page`);
      return el('fieldset', { className: 'admin-group pj-media' }, [
        el('legend', { textContent: `Médias (${p.media.length})` }),
        p.media.length ? list : el('p', { className: 'ph-empty', textContent: 'Aucun média : le projet reste masqué sur le site.' }),
        el('div', { className: 'admin-tools pj-media__tools' }, [
          files, el('label', { htmlFor: `pj-files-${p.slug}`, className: 'admin-mini admin-mini--add ph-drop__btn', textContent: busy === p.slug ? 'Envoi en cours…' : '+ Photos ou fichiers vidéo' }),
          addLink('youtube'), addLink('instagram')
        ])
      ]);
    };
    const pageBlock = p => {
      if (p.slug === BOL) return el('p', { className: 'ph-help', textContent: tileAction(p) });
      const page = el('input', { type: 'checkbox', checked: p.pageMode === 'page' });
      page.dataset.focusKey = `${p.slug}-page`;
      page.addEventListener('change', () => { p.pageMode = page.checked ? 'page' : String(p.link || '').trim() ? 'link' : 'none'; touch(); redraw(); });
      const box = el('div', { className: 'admin-group' }, [el('label', { className: 'admin-field admin-field--check' }, [page, el('span', { textContent: 'Page projet au clic' })])]);
      if (p.pageMode === 'page') box.append(field('Adresse de la page (facultatif)', text(p, 'pageSlug', { max: 60, placeholder: slugify(p.title) || 'mariage-lea-sam' })));
      else {
        const linkInput = text(p, 'link', { max: 300, placeholder: 'https://…' });
        linkInput.addEventListener('input', () => { p.pageMode = String(p.link || '').trim() ? 'link' : 'none'; });
        box.append(field('Lien externe au clic (facultatif)', linkInput));
      }
      box.append(el('p', { className: 'ph-help', textContent: tileAction(p) }));
      return box;
    };

    const decisionsBlock = p => {
      if (!Array.isArray(p.decisions)) return null;
      const box = el('fieldset', { className: 'admin-group' }, [el('legend', { textContent: 'Décisions (page projet)' })]);
      p.decisions.forEach((d, i) => {
        box.append(field(`Décision ${i + 1} : titre`, text(d, 'title', { max: 160, key: `${p.slug}-d${i}-title` })), field(`Décision ${i + 1} : texte`, text(d, 'text', { area: true, rows: 3, max: 800, key: `${p.slug}-d${i}-text` })));
        box.append(button('Retirer cette décision', 'admin-mini', () => { p.decisions.splice(i, 1); touch(); redraw(); }, `Retirer la décision ${i + 1}`));
      });
      box.append(button('+ Ajouter une décision', 'admin-mini admin-mini--add', () => { p.decisions.push({ title: '', text: '' }); touch(); redraw(); }));
      return box;
    };

    const categoriesBlock = p => el('fieldset', { className: 'admin-group vd-tags' }, [el('legend', { textContent: 'Catégories du catalogue' }), ...window.NolanCategories.LIST.map(([value, label]) => {
      const box = el('input', { type: 'checkbox', checked: p.categories.includes(value) });
      box.dataset.focusKey = `${p.slug}-cat-${value}`;
      box.addEventListener('change', () => { p.categories = window.NolanCategories.valid(box.checked ? [...p.categories, value] : p.categories.filter(c => c !== value)); touch(); });
      return el('label', { className: 'admin-field admin-field--check' }, [box, el('span', { textContent: label })]);
    })]);

    const projectCard = (p, index) => {
      const n = index + 1, isBol = p.slug === BOL, k = (p.media.find(m => m.key === p.cover) || p.media[0])?.kind || 'photo';
      const visible = el('input', { type: 'checkbox', checked: Boolean(p.visible) });
      visible.dataset.focusKey = `${p.slug}-visible`;
      visible.addEventListener('change', () => { p.visible = visible.checked; touch(); redraw(); });
      const tool = (label, aria, key, action, disabled) => { const b = button(label, 'admin-mini', action, aria); b.dataset.focusKey = `${p.slug}-${key}`; b.disabled = Boolean(disabled); return b; };
      const name = p.title || 'Projet sans titre';
      const del = tool('Supprimer', `Supprimer le projet ${name}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('Le projet et ses médias seront supprimés à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        p.media.forEach(dropMedia); model.splice(index, 1); touch(); redraw();
      }, isBol);
      const st = status(p);
      const details = el('details', { className: 'admin-item pj-card' });
      details.open = open.has(p.slug);
      details.addEventListener('toggle', () => { if (details.open) open.add(p.slug); else open.delete(p.slug); });
      const page = el('details', { className: 'pj-more' }, [el('summary', { textContent: isBol ? 'Page du film et données Google' : 'Textes de la page projet et données Google (facultatif)' })]);
      if (p.media.some(m => m.kind !== 'photo')) page.append(field('Date de mise en ligne de la vidéo (AAAA-MM-JJ)', text(p, 'uploadDate', { max: 10, placeholder: '2026-03-14' })), field('Durée (ex. PT1M30S)', text(p, 'duration', { max: 12 })));
      page.append(field('Lieu', text(p, 'location', { max: 80 })), field('Format', text(p, 'format', { max: 80 })), field('Caméra', text(p, 'camera', { max: 80 })),
        field('Texte de contexte', text(p, 'contextText', { area: true, rows: 4, max: 1500 })), field('Intention', text(p, 'intent', { max: 300 })));
      if (!Array.isArray(p.decisions)) p.decisions = [];
      page.append(decisionsBlock(p));
      details.append(...[
        el('summary', {}, [el('span', { textContent: `${n} · ${name}` }), el('small', { className: `pj-status${st.startsWith('Visible') ? '' : ' is-off'}`, textContent: st })]),
        el('div', { className: 'pj-grid' }, [
          field('Titre (obligatoire)', text(p, 'title', { max: 120, required: true })),
          field('Type', text(p, 'type', { max: 80, placeholder: 'Court métrage, film de marque…' })),
          field('Rôle', text(p, 'role', { max: 80, placeholder: 'Réalisation, image…' })),
          field('Contexte', text(p, 'context', { max: 120 })),
          field('Client (facultatif)', text(p, 'client', { max: 80 })),
          field('Année', text(p, 'year', { max: 4, inputMode: 'numeric', placeholder: '2026' })),
          field('Résultat (facultatif)', text(p, 'result', { max: 200 }), 'Uniquement un résultat réel et vérifié.')
        ]),
        categoriesBlock(p),
        field('Résumé (texte de la tuile)', text(p, 'summary', { area: true, max: 400 })),
        mediaBlock(p),
        pageBlock(p),
        page,
        el('div', { className: 'ph-card__checks' }, [el('label', { className: 'admin-field admin-field--check' }, [visible, el('span', { textContent: 'Visible sur le site' })])]),
        el('div', { className: 'admin-tools' }, [
          tool('↑', `Monter le projet ${name}`, 'up', () => move(index, index - 1), index === 0),
          tool('↓', `Descendre le projet ${name}`, 'down', () => move(index, index + 1), index === model.length - 1),
          del
        ]),
        isBol ? el('small', { className: 'ph-help', textContent: 'Le film a sa propre page : il peut être masqué, pas supprimé.' }) : null
      ].filter(Boolean));
      return details;
    };

    const render = () => {
      const head = el('div', { className: 'admin-bar' }, [heading('Projets', 'Les cinq premiers forment la sélection de l’accueil.')]);
      if (!model) {
        const start = button('Partir des projets actuels du site', 'admin-button', async () => {
          start.disabled = true;
          try { model = ((await (await fetch('/admin/seed.json', { cache: 'no-store' })).json()).projects || []).map(migrate); touch(); redraw(); }
          catch (err) { say(`Lecture impossible : ${err.message}`, 'error'); start.disabled = false; }
        });
        return [head, el('p', { textContent: 'Ce bloc n’est pas encore dans le tableau de bord.' }), start];
      }
      const save = button('Enregistrer', 'admin-button', () => persist());
      const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => { live.disabled = true; if (await persist()) await publish('Projets de la page Work'); live.disabled = false; });
      save.disabled = live.disabled = Boolean(busy);
      head.append(el('div', { className: 'admin-row' }, [save, live]));
      const add = button('+ Ajouter un projet', 'admin-button', () => {
        const slug = randomSlug();
        model.push({ slug, title: '', territory: '', categories: [], type: '', role: '', context: '', client: '', year: '', result: '', link: '', summary: '', media: [], cover: '', pageMode: 'none', pageSlug: '', mediaKind: 'photo', videoId: '', instagramId: '', image: null, alt: '', uploadDate: '', duration: '', visible: false });
        open.add(slug); touch(); redraw();
        document.querySelector(`[data-focus-key="${slug}-title"]`)?.focus();
      });
      const shown = model.filter(p => status(p).startsWith('Visible')).length;
      return [
        head,
        card('Mise en ligne', [
          el('p', { className: shown ? 'admin-ok' : 'admin-alert', textContent: `${shown} projet(s) visible(s) sur le site après publication. Un projet sans média complet reste masqué.` }),
          el('p', { className: 'ph-help', textContent: 'Après « Enregistrer et publier », la nouvelle version part en ligne ; l’état (« En ligne : version n° … ») s’affiche en bas du menu.' })
        ], 'admin-card--wide'),
        el('div', { className: 'pj-list' }, model.map(projectCard)),
        add
      ];
    };

    return { view, reset: () => { model = null; } };
  };
  // Partagés avec « Images du site » (miniature = couverture du projet).
  Object.assign(window.NolanProjects, { migrate, syncLegacy });
})();
