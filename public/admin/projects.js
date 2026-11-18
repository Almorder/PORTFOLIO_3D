// Admin Nolan Arc : projets du portfolio (page Work, « Ma sélection »). Remplace le formulaire générique
// du bloc « projects » par un éditeur dédié : ajouter, modifier, ordonner, masquer, supprimer un projet,
// avec un média réel (photo envoyée, ou vidéo YouTube / Instagram avec son image).
// Au déploiement, tools/fetch-published.mjs copie la dernière version publiée sur le site.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const BOL = 'le-bol-den-face';
  const CATEGORIES = [['', 'Choisir'], ['Récits', 'Films & récits'], ['Marques', 'Marques'], ['Moments', 'Mariages & moments'], ['Réseaux', 'Réseaux'], ['Photographie', 'Photographie']];
  const KINDS = [['photo', 'Photo envoyée'], ['youtube', 'Vidéo YouTube'], ['instagram', 'Vidéo Instagram']];
  const youtubeId = text => { const v = String(text || '').trim(); if (/^[\w-]{11}$/.test(v)) return v; const m = v.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/); return m ? m[1] : ''; };
  const instagramId = text => { const m = String(text || '').trim().match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|tv)\/([\w-]{5,40})/); return m ? m[1] : ''; };
  const kindOf = p => p.mediaKind || (p.videoId ? 'youtube' : 'photo');
  const validLink = v => !v || /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[\w.-]+(\/[\w\-./?=&#%~+]*)?$/.test(v);
  const randomSlug = () => `projet-${crypto.randomUUID().slice(0, 8)}`;

  window.NolanProjects = ({ client, el, button, say, heading, card, getDraft, saveDraft, publish, setDirty, inUse }) => {
    const media = window.NolanMedia ? window.NolanMedia(client, inUse) : null;
    let model = null, removed = [], busy = '', redraw = () => {};
    const open = new Set();
    const reset = () => { const data = getDraft(); model = Array.isArray(data) ? structuredClone(data) : null; removed = []; };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const dropImage = p => { if (p.image?.id) removed.push(p.image.id); p.image = null; };

    const status = p => {
      if (!p.visible) return 'Masqué';
      const k = kindOf(p);
      if (k === 'photo' && !p.image) return 'Masqué sur le site : photo manquante';
      if (k === 'instagram' && (!p.instagramId || !p.image)) return 'Masqué sur le site : lien ou image manquant';
      if (k === 'youtube' && !p.videoId) return 'Masqué sur le site : lien YouTube manquant';
      return 'Visible';
    };
    const problemOf = p => {
      p.title = media?.noDash(p.title) ?? p.title;
      for (const f of ['type', 'role', 'context', 'client', 'result', 'summary', 'alt', 'contextText', 'intent']) if (typeof p[f] === 'string') p[f] = media ? media.noDash(p[f]) : p[f];
      if (!String(p.title || '').trim()) return ['title', 'Chaque projet a besoin d’un titre.'];
      if (p.year && !/^\d{4}$/.test(String(p.year).trim())) return ['year', 'L’année s’écrit avec quatre chiffres, par exemple 2026.'];
      if (!validLink(String(p.link || '').trim())) return ['link', 'Le lien doit commencer par https:// ou par / (page du site).'];
      if (p.image && !String(p.alt || '').trim()) return ['alt', 'Une image a besoin d’un texte alternatif (ce qu’elle montre).'];
      if (p.uploadDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.uploadDate)) return ['uploadDate', 'La date s’écrit AAAA-MM-JJ, par exemple 2026-03-14.'];
      if (p.duration && !/^PT(\d+H)?(\d+M)?(\d+S)?$/.test(p.duration)) return ['duration', 'La durée s’écrit comme PT1M30S (1 min 30 s).'];
      if (p.visible) {
        const k = kindOf(p);
        if (k === 'photo' && !p.image) return ['image', 'Un projet photo visible a besoin de sa photo.'];
        if (k === 'youtube' && !p.videoId) return ['video', 'Colle le lien de la vidéo YouTube.'];
        if (k === 'instagram' && !p.instagramId) return ['video', 'Colle le lien de la publication Instagram.'];
        if (k === 'instagram' && !p.image) return ['image', 'Une vidéo Instagram a besoin d’une image de couverture (Instagram n’en fournit pas).'];
      }
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
      node.value = prop === 'mediaKind' ? kindOf(p) : String(p[prop] || '');
      node.dataset.focusKey = `${p.slug}-${prop}`;
      node.addEventListener('change', () => { p[prop] = node.value; touch(); onChange?.(); });
      return node;
    };
    const move = (from, to) => { if (to < 0 || to >= model.length) return; model.splice(to, 0, model.splice(from, 1)[0]); touch(); redraw(); };

    const imageBlock = p => {
      const k = kindOf(p);
      const label = k === 'photo' ? 'Photo du projet (obligatoire)' : k === 'instagram' ? 'Image de couverture (obligatoire)' : 'Image de couverture (facultatif)';
      const help = k === 'youtube' ? 'Sans image, l’affiche de la vidéo YouTube est copiée sur le site au déploiement.' : 'Réduite dans ton navigateur (WebP, deux tailles), sans métadonnées ni position GPS.';
      const id = `pj-file-${p.slug}`;
      const input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id });
      input.dataset.focusKey = `${p.slug}-image`;
      input.disabled = Boolean(busy);
      input.addEventListener('change', async () => {
        const file = input.files[0]; if (!file || !media) return;
        busy = p.slug; redraw(); say(`Préparation de ${file.name}…`);
        try { const { image, report } = await media.store(file, 'photo'); dropImage(p); p.image = { id: image.id, width: image.width, height: image.height, smallWidth: image.smallWidth, smallHeight: image.smallHeight }; touch(); say(`${report}. Écris le texte alternatif puis enregistre.`, 'warn'); }
        catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
        busy = ''; redraw();
      });
      const nodes = [el('p', { className: 'pj-media__label', textContent: label })];
      if (p.image) {
        const img = el('img', { className: 'ph-thumb', alt: p.alt ? `Aperçu : ${p.alt}` : 'Aperçu de l’image du projet', width: p.image.smallWidth || 0, height: p.image.smallHeight || 0 });
        media?.preview(img, p.image.id);
        nodes.push(img);
      }
      nodes.push(el('div', { className: 'admin-tools pj-media__tools' }, [
        input,
        el('label', { htmlFor: id, className: 'admin-mini ph-drop__btn', textContent: busy === p.slug ? 'Envoi en cours…' : p.image ? 'Remplacer l’image' : 'Envoyer une image' }),
        p.image ? button('Retirer l’image', 'admin-mini', () => { dropImage(p); touch(); redraw(); }, `Retirer l’image de ${p.title || 'ce projet'}`) : null
      ]));
      nodes.push(el('small', { className: 'ph-help', textContent: help }));
      if (p.image || k !== 'youtube') nodes.push(field(p.image ? 'Texte alternatif de l’image (obligatoire)' : 'Texte alternatif de l’image', text(p, 'alt', { area: true, max: 300, required: Boolean(p.image), placeholder: 'Ce que montre l’image, en une phrase' }), 'Lu par les personnes aveugles et par Google.'));
      return nodes;
    };
    const videoField = p => {
      const k = kindOf(p);
      if (k === 'photo') return null;
      const current = k === 'youtube' ? (p.videoId ? `https://www.youtube.com/watch?v=${p.videoId}` : '') : (p.instagramId ? `https://www.instagram.com/p/${p.instagramId}/` : '');
      const input = el('input', { type: 'url', className: 'admin-input', value: current, placeholder: k === 'youtube' ? 'https://www.youtube.com/watch?v=…' : 'https://www.instagram.com/p/…' });
      input.dataset.focusKey = `${p.slug}-video`;
      const state = el('small', { className: 'ph-help' });
      const sync = () => {
        const id = k === 'youtube' ? youtubeId(input.value) : instagramId(input.value);
        if (k === 'youtube') p.videoId = id; else p.instagramId = id;
        state.textContent = id ? `Vidéo reconnue (${id}). Aucun lecteur ne se charge dans la page sans le clic du visiteur.` : input.value.trim() ? 'Lien non reconnu.' : 'Colle l’adresse de la vidéo.';
      };
      sync();
      input.addEventListener('input', () => { sync(); input.removeAttribute('aria-invalid'); touch(); });
      if (!state.textContent) state.textContent = 'Colle l’adresse de la vidéo.';
      return el('label', { className: 'admin-field' }, [el('span', { textContent: k === 'youtube' ? 'Lien de la vidéo YouTube' : 'Lien de la publication Instagram' }), input, state]);
    };

    const decisionsBlock = p => {
      if (!Array.isArray(p.decisions)) return null;
      const box = el('fieldset', { className: 'admin-group' }, [el('legend', { textContent: 'Décisions (page du film)' })]);
      p.decisions.forEach((d, i) => {
        box.append(field(`Décision ${i + 1} : titre`, text(d, 'title', { max: 160, key: `${p.slug}-d${i}-title` })), field(`Décision ${i + 1} : texte`, text(d, 'text', { area: true, rows: 3, max: 800, key: `${p.slug}-d${i}-text` })));
        box.append(button('Retirer cette décision', 'admin-mini', () => { p.decisions.splice(i, 1); touch(); redraw(); }, `Retirer la décision ${i + 1}`));
      });
      box.append(button('+ Ajouter une décision', 'admin-mini admin-mini--add', () => { p.decisions.push({ title: '', text: '' }); touch(); redraw(); }));
      return box;
    };

    const projectCard = (p, index) => {
      const n = index + 1, k = kindOf(p), isBol = p.slug === BOL;
      const visible = el('input', { type: 'checkbox', checked: Boolean(p.visible) });
      visible.dataset.focusKey = `${p.slug}-visible`;
      visible.addEventListener('change', () => { p.visible = visible.checked; touch(); redraw(); });
      const tool = (label, aria, key, action, disabled) => { const b = button(label, 'admin-mini', action, aria); b.dataset.focusKey = `${p.slug}-${key}`; b.disabled = Boolean(disabled); return b; };
      const name = p.title || 'Projet sans titre';
      const del = tool('Supprimer', `Supprimer le projet ${name}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('Le projet et son image seront supprimés à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        dropImage(p); model.splice(index, 1); touch(); redraw();
      }, isBol);
      const st = status(p);
      const details = el('details', { className: 'admin-item pj-card' });
      details.open = open.has(p.slug);
      details.addEventListener('toggle', () => { if (details.open) open.add(p.slug); else open.delete(p.slug); });
      const page = el('details', { className: 'pj-more' }, [el('summary', { textContent: isBol ? 'Page du film et données Google' : 'Données Google (facultatif)' })]);
      if (k !== 'photo') page.append(field('Date de mise en ligne de la vidéo (AAAA-MM-JJ)', text(p, 'uploadDate', { max: 10, placeholder: '2026-03-14' })), field('Durée (ex. PT1M30S)', text(p, 'duration', { max: 12 })));
      if (isBol) {
        page.append(field('Lieu', text(p, 'location', { max: 80 })), field('Format', text(p, 'format', { max: 80 })), field('Caméra', text(p, 'camera', { max: 80 })),
          field('Texte de contexte', text(p, 'contextText', { area: true, rows: 4, max: 1500 })), field('Intention', text(p, 'intent', { max: 300 })));
        const dec = decisionsBlock(p); if (dec) page.append(dec);
      }
      if (k === 'photo' && !isBol) page.append(el('p', { className: 'ph-help', textContent: 'Rien à compléter pour une photo.' }));
      details.append(...[
        el('summary', {}, [el('span', { textContent: `${n} · ${name}` }), el('small', { className: `pj-status${st === 'Visible' ? '' : ' is-off'}`, textContent: st })]),
        el('div', { className: 'pj-grid' }, [
          field('Titre (obligatoire)', text(p, 'title', { max: 120, required: true })),
          field('Catégorie (filtre de la liste)', select(p, 'territory', CATEGORIES)),
          field('Type', text(p, 'type', { max: 80, placeholder: 'Court métrage, film de marque…' })),
          field('Rôle', text(p, 'role', { max: 80, placeholder: 'Réalisation, image…' })),
          field('Contexte', text(p, 'context', { max: 120 })),
          field('Client (facultatif)', text(p, 'client', { max: 80 })),
          field('Année', text(p, 'year', { max: 4, inputMode: 'numeric', placeholder: '2026' })),
          field('Résultat (facultatif)', text(p, 'result', { max: 200 }), 'Uniquement un résultat réel et vérifié.')
        ]),
        field('Résumé (texte de la tuile)', text(p, 'summary', { area: true, max: 400 })),
        isBol ? el('p', { className: 'ph-help', textContent: 'La tuile ouvre la page du film (/projet/le-bol-den-face/).' }) : field('Lien du projet (facultatif)', text(p, 'link', { max: 300, placeholder: 'https://… ou /services/' }), 'Sans lien, la tuile ouvre la vidéo ou la photo.'),
        el('fieldset', { className: 'admin-group pj-media' }, [
          el('legend', { textContent: 'Média' }),
          field('Nature du média', select(p, 'mediaKind', KINDS, () => redraw())),
          videoField(p),
          ...imageBlock(p)
        ]),
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
      const head = el('div', { className: 'admin-bar' }, [heading('Projets du portfolio', 'Section « Ma sélection » de la page Work : les cinq premiers éléments forment le bento, dans cet ordre (projets, puis la tuile Photographie, puis les vidéos sociales). Tous apparaissent dans la vue Liste.')]);
      if (!model) {
        const start = button('Partir des projets actuels du site', 'admin-button', async () => {
          start.disabled = true;
          try { model = (await (await fetch('/admin/seed.json', { cache: 'no-store' })).json()).projects || []; touch(); redraw(); }
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
        model.push({ slug, title: '', territory: '', type: '', role: '', context: '', client: '', year: '', result: '', link: '', summary: '', mediaKind: 'photo', videoId: '', instagramId: '', image: null, alt: '', uploadDate: '', duration: '', visible: false });
        open.add(slug); touch(); redraw();
        document.querySelector(`[data-focus-key="${slug}-title"]`)?.focus();
      });
      const shown = model.filter(p => status(p) === 'Visible').length;
      return [
        head,
        card('Mise en ligne', [
          el('p', { className: shown ? 'admin-ok' : 'admin-alert', textContent: `${shown} projet(s) visible(s) sur le site après publication. Un projet sans média réel reste masqué.` }),
          el('p', { className: 'ph-help', textContent: 'Après « Enregistrer et publier », le site se met à jour en quelques minutes (l’état s’affiche en bas de l’écran).' })
        ], 'admin-card--wide'),
        el('div', { className: 'pj-list' }, model.map(projectCard)),
        add
      ];
    };

    return { view, reset: () => { model = null; } };
  };
})();
