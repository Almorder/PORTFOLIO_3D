// Admin Nolan Arc : « Images du site ». Chaque emplacement photo du site, par page : l'image actuelle, le format
// conseillé, « Remplacer » et « Revenir à l'image d'origine ». Les images de l'accueil vont dans le brouillon
// « images » ; les miniatures de la page Work modifient directement les projets (brouillon « projects ») et les
// Social media videos (brouillon « instagram ») : une seule source par image.
// Chaque action est enregistrée tout de suite ; « Publier » met le site à jour.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const HOME = [
    { group: 'Accueil · Trois dimensions', slots: [
      { slot: 'home.dims.realisation', label: 'Dossier Réalisation', origin: '/assets/da/texture.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' },
      { slot: 'home.dims.direction', label: 'Dossier Direction artistique', origin: '/assets/da/texture-b.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' },
      { slot: 'home.dims.strategie', label: 'Dossier Stratégie de marque', origin: '/assets/da/texture-c.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' }
    ] },
    { group: 'Accueil · Mariage', slots: [
      { slot: 'home.wedding.0', label: 'Polaroïd 1 (Film de mariage)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true },
      { slot: 'home.wedding.1', label: 'Polaroïd 2 (Demande en mariage)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true },
      { slot: 'home.wedding.2', label: 'Polaroïd 3 (Le jour J)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true }
    ] },
    { group: 'Accueil · Cartes des tarifs', slots: [
      { slot: 'home.cards.mariage', label: 'Carte A♣ · Film de mariage', origin: '/assets/cards/mariage.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.demande', label: 'Carte K♦ · Demande en mariage', origin: '/assets/cards/demande.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.contenu', label: 'Carte Q♥ · Création de contenu', origin: '/assets/cards/contenu.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.film', label: 'Carte J♠ · Film de marque ou court métrage', origin: '/assets/cards/film.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.direction', label: 'Carte 5♦ · Direction artistique', origin: '/assets/cards/direction.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.strategie', label: 'Carte 10♣ · Stratégie de marque', origin: '/assets/cards/strategie.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.dos', label: 'Dos des cartes (commun)', origin: '/assets/cards/dos.webp', preset: 'card', format: 'Vertical, environ 3:5 (idéal 1000 × 1700 px).' }
    ] }
  ];
  // Bannière de l'accueil : une vidéo hébergée par le site pour l'ordinateur (16:9) et une pour le téléphone (9:16),
  // chacune avec son affiche (image fixe montrée avant la lecture et si le visiteur préfère moins d'animations).
  // Sans fichier publié, la bannière garde la vidéo YouTube d'origine.
  const HERO = [
    { slot: 'home.hero.desktop', label: 'Bannière ordinateur (16:9)', wide: true, format: 'MP4 H.264, 1920 × 1080 ou 2560 × 1440, 25 ou 30 i/s, débit élevé (12 à 20 Mbit/s), sans son, 50 Mo max, 10 à 20 s en boucle.' },
    { slot: 'home.hero.mobile', label: 'Bannière mobile (9:16)', wide: false, format: 'MP4 H.264, 1080 × 1920, 25 ou 30 i/s, débit élevé (10 à 16 Mbit/s), sans son, 50 Mo max, 10 à 20 s en boucle.' }
  ];
  // Format de recadrage de chaque emplacement (public/admin/cropper.js).
  const cropOf = s => s.slot === 'home.cards.dos' ? 'cardBack' : s.preset;
  const plain = i => ({ id: i.id, width: i.width, height: i.height, smallWidth: i.smallWidth, smallHeight: i.smallHeight, ...(i.source ? { source: i.source } : {}), ...(i.crop ? { crop: i.crop } : {}) });

  window.NolanImages = ({ client, el, button, say, heading, card, getDraft, getSeed, saveDraft, publish, inUse, go }) => {
    const media = window.NolanMedia(client, inUse);
    const reports = new Map();
    let busy = '', redraw = () => {};
    const run = async (key, action) => {
      busy = key; redraw();
      try { await action(); } catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
      busy = ''; redraw();
    };
    // Lecture d'un bloc : brouillon s'il existe, sinon contenu actuel du site (seed).
    const read = async key => { const d = getDraft(key); return d !== undefined ? structuredClone(d) : structuredClone(await getSeed(key)); };
    const save = async (key, data, old) => {
      const { error } = await saveDraft(key, data);
      if (error) throw new Error(error.message);
      if (old) await media.remove([old]);
    };

    // Une ligne : image actuelle (ou d'origine), format, boutons, texte alternatif si nécessaire.
    const slotRow = ({ key, label, format, current, currentLabel, origin, originLabel, report, onFile, onRevert, onRecrop, alt, onAlt, note }) => {
      const id = `im-${key.replace(/[^\w-]/g, '-')}`;
      const input = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id });
      input.dataset.focusKey = `${key}-file`;
      input.disabled = Boolean(busy);
      input.addEventListener('change', () => { const file = input.files[0]; if (file) run(key, () => onFile(file)); });
      const figure = el('div', { className: 'im-figure' });
      if (current) { const img = el('img', { className: 'ph-thumb', alt: `Image actuelle : ${label}`, width: current.smallWidth || 0, height: current.smallHeight || 0 }); media.preview(img, current.id); figure.append(img); }
      else if (origin) figure.append(el('img', { className: 'ph-thumb', src: origin, alt: `Image d’origine : ${label}` }));
      else figure.append(el('span', { className: 'im-blank', textContent: originLabel || 'Aucune image' }));
      const nodes = [
        figure,
        el('div', { className: 'im-body' }, [
          el('p', { className: 'pj-media__label', textContent: label }),
          el('p', { className: 'ph-help', textContent: current ? (currentLabel || 'Image remplacée.') : 'Image d’origine.' }),
          note ? el('p', { className: 'ph-help', textContent: note }) : null,
          el('div', { className: 'admin-tools' }, [
            input, el('label', { htmlFor: id, className: 'admin-mini ph-drop__btn', textContent: busy === key ? 'Envoi en cours…' : 'Remplacer' }),
            current && onRecrop ? button('Recadrer', 'admin-mini', () => run(key, onRecrop), `Recadrer : ${label}`) : null,
            current && onRevert ? button('Revenir à l’image d’origine', 'admin-mini', () => run(key, onRevert), `Revenir à l’image d’origine : ${label}`) : null
          ]),
          report ? el('p', { className: 'md-badge', textContent: report }) : null
        ])
      ];
      if (alt !== undefined) {
        const area = el('textarea', { className: 'admin-input admin-input--area', rows: 2, maxLength: 300, value: alt || '', placeholder: 'Ce que montre l’image, en une phrase' });
        area.dataset.focusKey = `${key}-alt`;
        area.required = Boolean(current); area.setAttribute('aria-required', String(Boolean(current)));
        area.addEventListener('change', () => run(key, () => onAlt(media.noDash(area.value))));
        nodes[1].append(...[el('label', { className: 'admin-field' }, [el('span', { textContent: current ? 'Texte alternatif (obligatoire)' : 'Texte alternatif' }), area]),
          current && !String(alt || '').trim() ? el('p', { className: 'admin-alert', textContent: 'Sans texte alternatif, cette image n’apparaîtra pas sur le site.' }) : null].filter(Boolean));
      }
      return el('li', { className: 'im-slot' }, nodes.filter(Boolean));
    };

    const homeRows = () => HOME.map(({ group, note, slots }) => {
      const data = getDraft('images') || {};
      return card(group, [el('ul', { className: 'im-list' }, slots.map(s => slotRow({
        key: s.slot, label: s.label, format: s.format, current: data[s.slot]?.image, origin: s.origin, originLabel: 'Cadre aux couleurs du site (aucune photo)', report: reports.get(s.slot),
        alt: s.alt ? (data[s.slot]?.alt || '') : undefined,
        onFile: async file => {
          const { image, report } = await media.store(file, s.preset, cropOf(s));
          const next = await read('images') || {}; const old = next[s.slot]?.image?.id;
          next[s.slot] = { image: plain(image), alt: next[s.slot]?.alt || '' };
          await save('images', next, old); reports.set(s.slot, report);
          say(s.alt ? `${report}. Écris le texte alternatif puis publie.` : `${report}. Publie pour mettre en ligne.`, 'ok');
        },
        onRecrop: async () => {
          const next = await read('images') || {}; const cur = next[s.slot]?.image; if (!cur) return;
          const { image, report } = await media.recrop(cur, s.preset, cropOf(s));
          next[s.slot] = { ...next[s.slot], image: plain(image) };
          await save('images', next, cur.id); reports.set(s.slot, report); say('Recadrage enregistré. Publie pour mettre en ligne.', 'ok');
        },
        onRevert: async () => { const next = await read('images') || {}; const old = next[s.slot]?.image?.id; delete next[s.slot]; await save('images', next, old); reports.delete(s.slot); say('Image d’origine rétablie. Publie pour mettre en ligne.', 'ok'); },
        onAlt: async value => { const next = await read('images') || {}; if (!next[s.slot]) return; next[s.slot].alt = value; await save('images', next); say('Texte alternatif enregistré.', 'ok'); }
      })))], 'admin-card--wide');
    });

    // Bannière : envoyer la vidéo (affiche tirée automatiquement), remplacer l'affiche, revenir à YouTube.
    const heroRows = () => {
      const data = getDraft('images') || {};
      return card('Accueil · Bannière', [el('ul', { className: 'im-list' }, HERO.map(h => {
        const cur = data[h.slot] || null, key = h.slot, id = `im-${key.replace(/[^\w-]/g, '-')}`;
        const videoInput = el('input', { type: 'file', accept: 'video/mp4,video/quicktime,video/webm', className: 'ph-file', id: `${id}-video` });
        const posterInput = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id: `${id}-poster` });
        videoInput.disabled = posterInput.disabled = Boolean(busy);
        videoInput.addEventListener('change', () => { const file = videoInput.files[0]; if (file) run(key, async () => {
          const { video, cover, report } = await media.storeVideo(file, 'banner');
          const landscape = video.width >= video.height;
          if (landscape !== h.wide) { await media.removeVideo(video); await media.remove([cover.id]); throw new Error(h.wide ? 'la bannière ordinateur doit être horizontale (16:9)' : 'la bannière mobile doit être verticale (9:16)'); }
          const next = await read('images') || {}, old = next[key];
          next[key] = { video, image: plain(cover), auto: plain(cover) };
          await save('images', next, old?.image?.id);
          if (old?.auto?.id && old.auto.id !== old.image?.id) await media.remove([old.auto.id]);
          if (old?.video) await media.removeVideo(old.video);
          reports.set(key, report);
          say(Math.min(video.width, video.height) < 1080 ? `${report}. Résolution faible : préfère ${h.wide ? '1920 × 1080' : '1080 × 1920'} au minimum.` : `${report}. Publie pour mettre en ligne.`, Math.min(video.width, video.height) < 1080 ? 'warn' : 'ok');
        }); });
        posterInput.addEventListener('change', () => { const file = posterInput.files[0]; if (file) run(key, async () => {
          const { image, report } = await media.store(file, 'banner', '');
          const next = await read('images') || {}; if (!next[key]) throw new Error('envoie d’abord la vidéo');
          const old = next[key].image?.id !== next[key].auto?.id ? next[key].image?.id : null;
          next[key].image = plain(image); await save('images', next, old); reports.set(key, report); say(`${report}. Publie pour mettre en ligne.`, 'ok');
        }); });
        const figure = el('div', { className: 'im-figure' });
        if (cur?.image) { const img = el('img', { className: 'ph-thumb', alt: `Affiche actuelle : ${h.label}`, width: cur.image.smallWidth || 0, height: cur.image.smallHeight || 0 }); media.preview(img, cur.image.id); figure.append(img); }
        else figure.append(el('span', { className: 'im-blank', textContent: 'Vidéo YouTube d’origine' }));
        const custom = cur && cur.image?.id !== cur.auto?.id;
        return el('li', { className: 'im-slot' }, [figure, el('div', { className: 'im-body' }, [
          el('p', { className: 'pj-media__label', textContent: h.label }),
          el('p', { className: 'ph-help', textContent: cur ? `Vidéo : ${cur.video.width} × ${cur.video.height}, ${cur.video.duration} s. Affiche : ${custom ? 'image envoyée' : 'tirée de la vidéo'}.` : 'Aucun fichier : vidéo YouTube d’origine.' }),
          el('p', { className: 'ph-help', textContent: `Format idéal : ${h.format}` }),
          el('div', { className: 'admin-tools' }, [
            videoInput, el('label', { htmlFor: `${id}-video`, className: 'admin-mini ph-drop__btn', textContent: busy === key ? 'Envoi en cours…' : cur ? 'Remplacer la vidéo' : 'Envoyer la vidéo' }),
            cur ? posterInput : null, cur ? el('label', { htmlFor: `${id}-poster`, className: 'admin-mini ph-drop__btn', textContent: 'Remplacer l’affiche' }) : null,
            custom ? button('Affiche tirée de la vidéo', 'admin-mini', () => run(key, async () => { const next = await read('images') || {}; const old = next[key].image.id; next[key].image = next[key].auto; await save('images', next, old); say('Affiche automatique rétablie. Publie pour mettre en ligne.', 'ok'); }), `Affiche automatique : ${h.label}`) : null,
            cur ? button('Revenir à YouTube', 'admin-mini', () => run(key, async () => { const next = await read('images') || {}; const old = next[key]; delete next[key]; await save('images', next, old.image?.id); if (old.auto?.id && old.auto.id !== old.image?.id) await media.remove([old.auto.id]); await media.removeVideo(old.video); reports.delete(key); say('Vidéo retirée. Publie pour mettre en ligne.', 'ok'); }), `Retirer la vidéo : ${h.label}`) : null
          ].filter(Boolean)),
          reports.get(key) ? el('p', { className: 'md-badge', textContent: reports.get(key) }) : null
        ].filter(Boolean))]);
      }))], 'admin-card--wide');
    };

    // Miniature d'un projet = son média principal (couverture). Les autres médias se gèrent dans « Projets ».
    const P = window.NolanProjects || {};
    const coverOf = p => { P.migrate?.(p); return (p.media || []).find(m => m.key === p.cover) || (p.media || [])[0] || null; };
    const editCover = async (index, change) => { const list = await read('projects'); const p = list[index]; P.migrate?.(p); const c = coverOf(p); if (!c) throw new Error('ce projet n’a pas encore de média'); const old = change(c); P.syncLegacy?.(p); await save('projects', list, old); };
    const projectRows = projects => card('Work · Couvertures des projets', [
      el('ul', { className: 'im-list' }, projects.map((p, index) => ({ p, index, c: coverOf(p) })).filter(({ p, c }) => p.visible && c).map(({ p, index, c }) => {
        const poster = c.kind === 'youtube' && c.videoId ? (p.posterFile && p.slug === 'le-bol-den-face' ? p.posterFile : `/assets/work/yt-${c.videoId}.jpg`) : '';
        return slotRow({
          key: `project-${p.slug}`, label: p.title || 'Projet sans titre', format: 'Horizontal 16:9 ou vertical 4:5, au moins 1600 px.',
          current: c.image, origin: poster, originLabel: c.kind === 'youtube' ? 'Affiche de la vidéo YouTube' : 'Aucune image : projet masqué sur le site', report: reports.get(`project-${p.slug}`),
          
          alt: c.alt || '',
          onFile: async file => {
            const { image, report } = await media.store(file, 'photo', 'project');
            await editCover(index, m => { const old = m.image?.id; m.image = plain(image); return old; }); reports.set(`project-${p.slug}`, report);
            say(`${report}. Vérifie le texte alternatif puis publie.`, 'ok');
          },
          onRecrop: async () => { const { image } = await media.recrop(c.image, 'photo', 'project'); await editCover(index, m => { const old = m.image?.id; m.image = plain(image); return old; }); say('Recadrage enregistré. Publie pour mettre en ligne.', 'ok'); },
          onRevert: c.kind === 'youtube' ? async () => { await editCover(index, m => { const old = m.image?.id; m.image = null; return old; }); say('Affiche YouTube rétablie. Publie pour mettre en ligne.', 'ok'); } : null,
          onAlt: async value => { await editCover(index, m => { m.alt = value; return null; }); say('Texte alternatif enregistré.', 'ok'); }
        });
      })),
      button('Ouvrir « Projets »', 'admin-mini', () => go('projects'))
    ], 'admin-card--wide');

    const socialRows = posts => card('Work · Miniatures des Social media videos', [
      el('ul', { className: 'im-list' }, posts.map((p, index) => ({ p, index })).filter(({ p }) => p.visible !== false).map(({ p, index }) => slotRow({
        key: `social-${p.key || p.id}`, label: p.title || 'Vidéo sans titre', format: 'Vertical 9:16, 1080 × 1920 px.',
        current: p.coverImage || p.autoCover, currentLabel: p.coverImage ? 'Image remplacée.' : 'Miniature tirée de la vidéo.', origin: '', originLabel: 'Fond aux couleurs du site', report: reports.get(`social-${p.key || p.id}`),
        onFile: async file => {
          const { image, report } = await media.store(file, 'cover', 'social');
          const list = await read('instagram'); const old = list[index].coverImage?.id;
          list[index].coverImage = plain(image); await save('instagram', list, old); reports.set(`social-${p.key || p.id}`, report);
          say(`${report}. Publie pour mettre en ligne.`, 'ok');
        },
        onRecrop: async () => { const list = await read('instagram'); const cur = list[index].coverImage || list[index].autoCover; const { image } = await media.recrop(cur, 'cover', 'social'); const old = list[index].coverImage?.id; list[index].coverImage = plain(image); await save('instagram', list, old); say('Recadrage enregistré. Publie pour mettre en ligne.', 'ok'); },
        onRevert: p.coverImage ? async () => { const list = await read('instagram'); const old = list[index].coverImage?.id; list[index].coverImage = null; await save('instagram', list, old); say(p.autoCover ? 'Miniature automatique rétablie.' : 'Fond d’origine rétabli.', 'ok'); } : null
      }))),
      button('Ouvrir « Vidéos »', 'admin-mini', () => go('instagram'))
    ], 'admin-card--wide');

    const view = () => {
      const box = el('div', { className: 'pj-admin' });
      redraw = async () => {
        const focusKey = document.activeElement?.dataset?.focusKey;
        const [projects, posts] = await Promise.all([read('projects'), read('instagram')]);
        const live = button('Publier', 'admin-button admin-button--ember', async () => { live.disabled = true; await publish('Images du site'); live.disabled = false; });
        live.disabled = Boolean(busy);
        box.replaceChildren(
          el('div', { className: 'admin-bar' }, [heading('Images', 'Chaque changement est enregistré tout de suite.'), el('div', { className: 'admin-row' }, [live])]),
          heroRows(), ...homeRows(), projectRows(projects || []), socialRows(posts || [])
        );
        if (focusKey) box.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
      };
      redraw();
      return box;
    };
    return { view };
  };
})();
