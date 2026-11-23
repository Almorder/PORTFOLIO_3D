// Admin Nolan Arc : Social media videos (page Work, le téléphone). Chaque vidéo vient d'Instagram (lecteur
// chargé au clic du visiteur, comme avant) ou d'un fichier envoyé ici (MP4, MOV ou WebM, 50 Mo maximum),
// copié sur nolanarc.com au déploiement. Miniature : image envoyée, sinon image tirée de la vidéo à l'import.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const SOURCES = [['instagram', 'Vidéo Instagram'], ['file', 'Fichier vidéo (envoyé ici)']];
  const instagramId = text => { const v = String(text || '').trim(); if (/^[\w-]{5,40}$/.test(v) && !v.includes('/')) return v; const m = v.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|tv)\/([\w-]{5,40})/); return m ? m[1] : ''; };
  const prepare = list => (Array.isArray(list) ? structuredClone(list) : []).map(p => ({
    ...p, key: p.key || p.id || `video-${crypto.randomUUID().slice(0, 8)}`, source: p.source || (p.video ? 'file' : 'instagram'),
    visible: p.visible !== false, tags: Array.isArray(p.tags) ? p.tags : ['reseaux'], categories: window.NolanCategories.social(p), coverImage: p.coverImage || null, autoCover: p.autoCover || null, video: p.video || null
  }));
  const plainImage = i => i ? { id: i.id, width: i.width, height: i.height, smallWidth: i.smallWidth, smallHeight: i.smallHeight, ...(i.source ? { source: i.source } : {}), ...(i.crop ? { crop: i.crop } : {}) } : null;

  window.NolanVideos = ({ client, el, button, say, heading, card, getDraft, getSeed, saveDraft, publish, setDirty, inUse }) => {
    const media = window.NolanMedia(client, inUse);
    let model = null, removedImages = [], removedVideos = [], busy = '', redraw = () => {};
    const open = new Set(), reports = new Map();
    const reset = () => { const data = getDraft(); model = Array.isArray(data) ? prepare(data) : null; removedImages = []; removedVideos = []; };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const cover = p => p.coverImage || p.autoCover;
    const status = p => !p.visible ? 'Masquée' : p.source === 'file' ? (p.video ? 'Visible' : 'Fichier manquant') : (p.id ? 'Visible' : 'Lien Instagram manquant');

    const problemOf = p => {
      for (const f of ['title', 'kind', 'client', 'role', 'result']) if (typeof p[f] === 'string') p[f] = media.noDash(p[f]);
      if (!String(p.title || '').trim()) return ['title', 'Chaque vidéo a besoin d’un titre.'];
      if (p.year && !/^\d{4}$/.test(String(p.year).trim())) return ['year', 'L’année s’écrit avec quatre chiffres, par exemple 2026.'];
      if (p.uploadDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate)) return ['uploadDate', 'La date s’écrit AAAA-MM-JJ, par exemple 2026-03-14.'];
      if (p.visible && p.source === 'instagram' && !p.id) return ['link', 'Colle le lien de la publication Instagram.'];
      if (p.visible && p.source === 'file' && !p.video) return ['video', 'Envoie le fichier vidéo.'];
      return null;
    };
    const persist = async () => {
      for (const p of model) {
        const problem = problemOf(p);
        if (problem) {
          open.add(p.key); redraw();
          const input = document.querySelector(`[data-focus-key="${p.key}-${problem[0]}"]`);
          input?.setAttribute('aria-invalid', 'true'); input?.focus();
          say(`${p.title || 'Vidéo sans titre'} : ${problem[1]}`, 'error'); return false;
        }
      }
      if (!model.some(p => p.visible)) { say('Garde au moins une vidéo visible (sinon le site reprend les vidéos d’origine).', 'error'); return false; }
      say('Enregistrement…');
      const { error } = await saveDraft(model);
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return false; }
      await media.remove(removedImages);
      for (const v of removedVideos) await media.removeVideo(v);
      setDirty(false); reset(); redraw();
      say('Vidéos enregistrées. Clique sur « Enregistrer et publier » pour les mettre en ligne.', 'ok');
      return true;
    };

    const field = (labelText, input, help) => {
      const wrap = el('label', { className: 'admin-field' }, [el('span', { textContent: labelText }), input]);
      if (help) wrap.append(help instanceof Node ? help : el('small', { className: 'ph-help', textContent: help }));
      return wrap;
    };
    const text = (p, prop, opts = {}) => {
      const input = el('input', { type: 'text', className: 'admin-input', value: String(p[prop] ?? '') });
      if (opts.max) input.maxLength = opts.max;
      if (opts.placeholder) input.placeholder = opts.placeholder;
      if (opts.inputMode) input.inputMode = opts.inputMode;
      if (opts.required) { input.required = true; input.setAttribute('aria-required', 'true'); }
      input.dataset.focusKey = `${p.key}-${prop}`;
      input.addEventListener('input', () => { p[prop] = input.value; input.removeAttribute('aria-invalid'); touch(); });
      return input;
    };
    const fileInput = (p, kind, accept, onFile) => {
      const id = `vd-${kind}-${p.key}`;
      const input = el('input', { type: 'file', accept, className: 'ph-file', id });
      input.dataset.focusKey = `${p.key}-${kind}`;
      input.disabled = Boolean(busy);
      input.addEventListener('change', async () => {
        const file = input.files[0]; if (!file) return;
        busy = `${p.key}-${kind}`; redraw(); say(`Préparation de ${file.name}…`);
        try { await onFile(file); touch(); } catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
        busy = ''; redraw();
      });
      return { input, id };
    };
    const move = (from, to) => { if (to < 0 || to >= model.length) return; model.splice(to, 0, model.splice(from, 1)[0]); touch(); redraw(); };

    const mediaBlock = p => {
      const nodes = [];
      if (p.source === 'instagram') {
        const input = el('input', { type: 'url', className: 'admin-input', value: p.id ? `https://www.instagram.com/p/${p.id}/` : '', placeholder: 'https://www.instagram.com/p/…' });
        input.dataset.focusKey = `${p.key}-link`;
        const state = el('small', { className: 'ph-help', textContent: p.id ? `Publication reconnue (${p.id}). Le lecteur Instagram ne se charge qu’au clic du visiteur.` : 'Colle l’adresse de la publication ou du reel.' });
        input.addEventListener('input', () => { p.id = instagramId(input.value); state.textContent = p.id ? `Publication reconnue (${p.id}). Le lecteur Instagram ne se charge qu’au clic du visiteur.` : 'Lien non reconnu.'; input.removeAttribute('aria-invalid'); touch(); });
        nodes.push(field('Lien de la publication Instagram', input, state));
      } else {
        const { input, id } = fileInput(p, 'video', 'video/mp4,video/quicktime,video/webm', async file => {
          const { video, cover: auto, report } = await media.storeVideo(file);
          if (p.video) removedVideos.push(p.video);
          if (p.autoCover) removedImages.push(p.autoCover.id);
          p.video = video; p.autoCover = plainImage(auto); p.ratio = '';
          reports.set(p.key, report); say(report, 'ok');
        });
        input.dataset.focusKey = `${p.key}-video`;
        nodes.push(el('p', { className: 'pj-media__label', textContent: p.video ? `Fichier : ${media.mb(p.video.bytes)}, ${p.video.width} × ${p.video.height}, ${p.video.duration} s` : 'Aucun fichier pour l’instant' }),
          el('div', { className: 'admin-tools pj-media__tools' }, [input, el('label', { htmlFor: id, className: 'admin-mini ph-drop__btn', textContent: busy === `${p.key}-video` ? 'Envoi en cours…' : p.video ? 'Remplacer la vidéo' : 'Envoyer la vidéo' })]),
          el('small', { className: 'ph-help', textContent: 'MP4 (H.264) conseillé, format vertical 9:16, 50 Mo maximum. La vidéo est servie par nolanarc.com, sans Instagram ni autre service.' }));
      }
      // Miniature
      const c = cover(p);
      nodes.push(el('p', { className: 'pj-media__label', textContent: p.coverImage ? 'Miniature : image envoyée' : p.autoCover ? 'Miniature : image tirée de la vidéo (automatique)' : 'Miniature : fond aux couleurs du site' }));
      if (c) { const img = el('img', { className: 'ph-thumb vd-thumb', alt: `Miniature de ${p.title || 'la vidéo'}`, width: c.smallWidth || 0, height: c.smallHeight || 0 }); media.preview(img, c.id); nodes.push(img); }
      const { input, id } = fileInput(p, 'cover', 'image/jpeg,image/png,image/webp', async file => {
        const { image, report } = await media.store(file, 'cover', 'social');
        if (p.coverImage) removedImages.push(p.coverImage.id);
        p.coverImage = plainImage(image); reports.set(p.key, report); say(report, 'ok');
      });
      nodes.push(el('div', { className: 'admin-tools pj-media__tools' }, [
        input, el('label', { htmlFor: id, className: 'admin-mini ph-drop__btn', textContent: busy === `${p.key}-cover` ? 'Envoi en cours…' : 'Remplacer la miniature' }),
        c ? button('Recadrer', 'admin-mini', async () => {
          busy = `${p.key}-cover`; redraw();
          try { const { image } = await media.recrop(c, 'cover', 'social'); if (p.coverImage) removedImages.push(p.coverImage.id); p.coverImage = plainImage(image); touch(); say('Recadrage prêt. Enregistre pour le garder.', 'warn'); }
          catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
          busy = ''; redraw();
        }, `Recadrer la miniature de ${p.title || 'la vidéo'}`) : null,
        p.coverImage ? button(p.source === 'file' ? 'Revenir à la miniature automatique' : 'Retirer la miniature', 'admin-mini', () => { removedImages.push(p.coverImage.id); p.coverImage = null; touch(); redraw(); }) : null
      ]));
      if (reports.has(p.key)) nodes.push(el('p', { className: 'md-badge', textContent: reports.get(p.key) }));
      return nodes;
    };

    const videoCard = (p, index) => {
      const n = index + 1, name = p.title || 'Vidéo sans titre', st = status(p);
      const details = el('details', { className: 'admin-item pj-card' });
      details.open = open.has(p.key);
      details.addEventListener('toggle', () => { if (details.open) open.add(p.key); else open.delete(p.key); });
      const source = el('select', { className: 'admin-input' }, SOURCES.map(([value, label]) => el('option', { value, textContent: label })));
      source.value = p.source; source.dataset.focusKey = `${p.key}-source`;
      source.addEventListener('change', () => { p.source = source.value; touch(); redraw(); });
      const visible = el('input', { type: 'checkbox', checked: Boolean(p.visible) });
      visible.dataset.focusKey = `${p.key}-visible`;
      visible.addEventListener('change', () => { p.visible = visible.checked; touch(); redraw(); });
      const featured = el('input', { type: 'checkbox', checked: Boolean(p.featured) });
      featured.dataset.focusKey = `${p.key}-featured`;
      featured.addEventListener('change', () => { p.featured = featured.checked; touch(); });
      // Catégories du catalogue (page Work). Vidéo publiée avant les catégories : classement proposé, à vérifier.
      const tags = el('fieldset', { className: 'admin-group vd-tags' }, [el('legend', { textContent: 'Catégories du catalogue' }), ...window.NolanCategories.LIST.map(([value, label]) => {
        const box = el('input', { type: 'checkbox', checked: p.categories.includes(value) });
        box.dataset.focusKey = `${p.key}-cat-${value}`;
        box.addEventListener('change', () => { p.categories = window.NolanCategories.valid(box.checked ? [...p.categories, value] : p.categories.filter(c => c !== value)); touch(); });
        return el('label', { className: 'admin-field admin-field--check' }, [box, el('span', { textContent: label })]);
      })]);
      const tool = (label, aria, key, action, disabled) => { const b = button(label, 'admin-mini', action, aria); b.dataset.focusKey = `${p.key}-${key}`; b.disabled = Boolean(disabled); return b; };
      const del = tool('Supprimer', `Supprimer la vidéo ${name}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('La vidéo et ses fichiers seront supprimés à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        if (p.video) removedVideos.push(p.video);
        [p.coverImage, p.autoCover].forEach(i => i && removedImages.push(i.id));
        model.splice(index, 1); touch(); redraw();
      });
      details.append(...[
        el('summary', {}, [el('span', { textContent: `${n} · ${name}` }), el('small', { className: `pj-status${st === 'Visible' ? '' : ' is-off'}`, textContent: st })]),
        el('div', { className: 'pj-grid' }, [
          field('Titre (obligatoire)', text(p, 'title', { max: 120, required: true })),
          field('Source', source),
          field('Précision (facultatif)', text(p, 'kind', { max: 80, placeholder: 'Marque de vêtement…' })),
          field('Client (facultatif)', text(p, 'client', { max: 80 })),
          field('Rôle (facultatif)', text(p, 'role', { max: 80 })),
          field('Année', text(p, 'year', { max: 4, inputMode: 'numeric', placeholder: '2026' })),
          field('Résultat (facultatif)', text(p, 'result', { max: 200 }), 'Uniquement un résultat réel et vérifié.'),
          field('Date de mise en ligne (AAAA-MM-JJ, pour Google)', text(p, 'uploadDate', { max: 10, placeholder: '2026-03-14' }))
        ]),
        tags,
        el('fieldset', { className: 'admin-group pj-media' }, [el('legend', { textContent: 'Vidéo et miniature' }), ...mediaBlock(p)]),
        el('div', { className: 'ph-card__checks' }, [el('label', { className: 'admin-field admin-field--check' }, [visible, el('span', { textContent: 'Visible sur le site' })]), el('label', { className: 'admin-field admin-field--check' }, [featured, el('span', { textContent: 'Mis en avant' })])]),
        el('div', { className: 'admin-tools' }, [
          tool('↑', `Monter la vidéo ${name}`, 'up', () => move(index, index - 1), index === 0),
          tool('↓', `Descendre la vidéo ${name}`, 'down', () => move(index, index + 1), index === model.length - 1),
          del
        ])
      ].filter(Boolean));
      return details;
    };

    const render = () => {
      const head = el('div', { className: 'admin-bar' }, [heading('Vidéos', 'Le téléphone de la page Work, dans cet ordre.')]);
      if (!model) {
        const start = button('Partir des vidéos actuelles du site', 'admin-button', async () => {
          start.disabled = true;
          try { model = prepare(await getSeed('instagram')); touch(); redraw(); } catch (err) { say(`Lecture impossible : ${err.message}`, 'error'); start.disabled = false; }
        });
        return [head, el('p', { textContent: 'Ce bloc n’est pas encore dans le tableau de bord.' }), start];
      }
      const save = button('Enregistrer', 'admin-button', () => persist());
      const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => { live.disabled = true; if (await persist()) await publish('Social media videos'); live.disabled = false; });
      save.disabled = live.disabled = Boolean(busy);
      head.append(el('div', { className: 'admin-row' }, [save, live]));
      const add = button('+ Ajouter une vidéo', 'admin-button', () => {
        const key = `video-${crypto.randomUUID().slice(0, 8)}`;
        model.push({ key, source: 'file', id: '', title: '', kind: '', ratio: '', tags: ['reseaux'], categories: ['video', 'reseaux-sociaux'], client: '', role: '', year: '', result: '', uploadDate: '', cover: '', coverImage: null, autoCover: null, video: null, visible: false });
        open.add(key); touch(); redraw();
        document.querySelector(`[data-focus-key="${key}-title"]`)?.focus();
      });
      return [head, el('div', { className: 'pj-list' }, model.map(videoCard)), add];
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
    return { view, reset: () => { model = null; } };
  };
})();
