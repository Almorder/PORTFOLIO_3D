// Admin Nolan Arc : « Images du site ». Chaque emplacement photo du site, par page : l'image actuelle, le format
// conseillé, « Remplacer » et « Revenir à l'image d'origine ». Les images de l'accueil vont dans le brouillon
// « images » ; les miniatures de la page Work modifient directement les projets (brouillon « projects ») et les
// Social media videos (brouillon « instagram ») : une seule source par image.
// Chaque action est enregistrée tout de suite ; « Publier » met le site à jour.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const HOME = [
    { group: 'Accueil · Trois dimensions', note: 'Fond des trois dossiers. Image décorative : pas de texte alternatif.', slots: [
      { slot: 'home.dims.realisation', label: 'Dossier Réalisation', origin: '/assets/da/texture.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' },
      { slot: 'home.dims.direction', label: 'Dossier Direction artistique', origin: '/assets/da/texture-b.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' },
      { slot: 'home.dims.strategie', label: 'Dossier Stratégie de marque', origin: '/assets/da/texture-c.webp', preset: 'folder', format: 'Vertical 4:5, au moins 1200 px de haut.' }
    ] },
    { group: 'Accueil · Mariage', note: 'Les trois polaroïds. Ils mènent aux formules mariage et demande en mariage.', slots: [
      { slot: 'home.wedding.0', label: 'Polaroïd 1 (Film de mariage)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true },
      { slot: 'home.wedding.1', label: 'Polaroïd 2 (Demande en mariage)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true },
      { slot: 'home.wedding.2', label: 'Polaroïd 3 (Le jour J)', origin: '', preset: 'polaroid', format: 'Carré ou vertical 4:5, au moins 900 px.', alt: true }
    ] },
    { group: 'Accueil · Cartes des tarifs', note: 'Recto de chaque carte de la section Tarifs, et le dos commun. Image décorative : les infos de l’offre sont écrites sur la carte.', slots: [
      { slot: 'home.cards.mariage', label: 'Carte A♣ · Film de mariage', origin: '/assets/cards/mariage.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.demande', label: 'Carte K♦ · Demande en mariage', origin: '/assets/cards/demande.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.contenu', label: 'Carte Q♥ · Création de contenu', origin: '/assets/cards/contenu.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.film', label: 'Carte J♠ · Film de marque ou court métrage', origin: '/assets/cards/film.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.direction', label: 'Carte 5♦ · Direction artistique', origin: '/assets/cards/direction.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.strategie', label: 'Carte 10♣ · Stratégie de marque', origin: '/assets/cards/strategie.webp', preset: 'card', format: 'Recto de carte vertical 2:3 (290 × 430 au minimum, idéal 1000 × 1480 px). Le bas est couvert par le bandeau des infos.' },
      { slot: 'home.cards.dos', label: 'Dos des cartes (commun)', origin: '/assets/cards/dos.webp', preset: 'card', format: 'Vertical, environ 3:5 (idéal 1000 × 1700 px).' }
    ] }
  ];
  const plain = i => ({ id: i.id, width: i.width, height: i.height, smallWidth: i.smallWidth, smallHeight: i.smallHeight });

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
    const slotRow = ({ key, label, format, current, currentLabel, origin, originLabel, report, onFile, onRevert, alt, onAlt, note }) => {
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
          el('p', { className: 'ph-help', textContent: `${current ? (currentLabel || 'Image remplacée.') : 'Image d’origine.'} Format conseillé : ${format}` }),
          note ? el('p', { className: 'ph-help', textContent: note }) : null,
          el('div', { className: 'admin-tools' }, [
            input, el('label', { htmlFor: id, className: 'admin-mini ph-drop__btn', textContent: busy === key ? 'Envoi en cours…' : 'Remplacer' }),
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
      return card(group, [el('p', { className: 'ph-help', textContent: note }), el('ul', { className: 'im-list' }, slots.map(s => slotRow({
        key: s.slot, label: s.label, format: s.format, current: data[s.slot]?.image, origin: s.origin, originLabel: 'Cadre aux couleurs du site (aucune photo)', report: reports.get(s.slot),
        alt: s.alt ? (data[s.slot]?.alt || '') : undefined,
        onFile: async file => {
          const { image, report } = await media.store(file, s.preset);
          const next = await read('images') || {}; const old = next[s.slot]?.image?.id;
          next[s.slot] = { image: plain(image), alt: next[s.slot]?.alt || '' };
          await save('images', next, old); reports.set(s.slot, report);
          say(s.alt ? `${report}. Écris le texte alternatif puis publie.` : `${report}. Publie pour mettre en ligne.`, 'ok');
        },
        onRevert: async () => { const next = await read('images') || {}; const old = next[s.slot]?.image?.id; delete next[s.slot]; await save('images', next, old); reports.delete(s.slot); say('Image d’origine rétablie. Publie pour mettre en ligne.', 'ok'); },
        onAlt: async value => { const next = await read('images') || {}; if (!next[s.slot]) return; next[s.slot].alt = value; await save('images', next); say('Texte alternatif enregistré.', 'ok'); }
      })))], 'admin-card--wide');
    });

    const projectRows = projects => card('Work · Miniatures des projets (Ma sélection)', [
      el('p', { className: 'ph-help', textContent: 'Image de la tuile de chaque projet visible. Le reste du projet se modifie dans « Projets du portfolio ».' }),
      el('ul', { className: 'im-list' }, projects.map((p, index) => ({ p, index })).filter(({ p }) => p.visible).map(({ p, index }) => {
        const kind = p.mediaKind || (p.videoId ? 'youtube' : 'photo');
        const poster = p.posterFile || (p.videoId ? `/assets/work/yt-${p.videoId}.jpg` : '');
        return slotRow({
          key: `project-${p.slug}`, label: p.title || 'Projet sans titre', format: 'Horizontal 16:9 ou vertical 4:5, au moins 1600 px.',
          current: p.image, origin: kind === 'youtube' ? poster : '', originLabel: kind === 'youtube' ? 'Affiche de la vidéo YouTube' : 'Aucune image : projet masqué sur le site', report: reports.get(`project-${p.slug}`),
          note: kind === 'photo' ? 'Projet photo : la photo est le média du projet (pas d’image d’origine).' : null,
          alt: p.alt || '',
          onFile: async file => {
            const { image, report } = await media.store(file, 'photo');
            const list = await read('projects'); const target = list[index]; const old = target.image?.id;
            target.image = plain(image); await save('projects', list, old); reports.set(`project-${p.slug}`, report);
            say(`${report}. Vérifie le texte alternatif puis publie.`, 'ok');
          },
          onRevert: kind === 'youtube' ? async () => { const list = await read('projects'); const old = list[index].image?.id; list[index].image = null; await save('projects', list, old); say('Affiche YouTube rétablie. Publie pour mettre en ligne.', 'ok'); } : null,
          onAlt: async value => { const list = await read('projects'); list[index].alt = value; await save('projects', list); say('Texte alternatif enregistré.', 'ok'); }
        });
      })),
      button('Ouvrir « Projets du portfolio »', 'admin-mini', () => go('projects'))
    ], 'admin-card--wide');

    const socialRows = posts => card('Work · Miniatures des Social media videos', [
      el('p', { className: 'ph-help', textContent: 'Image affichée avant la lecture. Le reste se modifie dans « Social media videos ».' }),
      el('ul', { className: 'im-list' }, posts.map((p, index) => ({ p, index })).filter(({ p }) => p.visible !== false).map(({ p, index }) => slotRow({
        key: `social-${p.key || p.id}`, label: p.title || 'Vidéo sans titre', format: 'Vertical 9:16, 1080 × 1920 px.',
        current: p.coverImage || p.autoCover, currentLabel: p.coverImage ? 'Image remplacée.' : 'Miniature tirée de la vidéo.', origin: '', originLabel: 'Fond aux couleurs du site', report: reports.get(`social-${p.key || p.id}`),
        onFile: async file => {
          const { image, report } = await media.store(file, 'cover');
          const list = await read('instagram'); const old = list[index].coverImage?.id;
          list[index].coverImage = plain(image); await save('instagram', list, old); reports.set(`social-${p.key || p.id}`, report);
          say(`${report}. Publie pour mettre en ligne.`, 'ok');
        },
        onRevert: p.coverImage ? async () => { const list = await read('instagram'); const old = list[index].coverImage?.id; list[index].coverImage = null; await save('instagram', list, old); say(p.autoCover ? 'Miniature automatique rétablie.' : 'Fond d’origine rétabli.', 'ok'); } : null
      }))),
      button('Ouvrir « Social media videos »', 'admin-mini', () => go('instagram'))
    ], 'admin-card--wide');

    const view = () => {
      const box = el('div', { className: 'pj-admin' });
      redraw = async () => {
        const focusKey = document.activeElement?.dataset?.focusKey;
        const [projects, posts] = await Promise.all([read('projects'), read('instagram')]);
        const live = button('Publier', 'admin-button admin-button--ember', async () => { live.disabled = true; await publish('Images du site'); live.disabled = false; });
        live.disabled = Boolean(busy);
        box.replaceChildren(
          el('div', { className: 'admin-bar' }, [heading('Images du site', 'Chaque emplacement photo, page par page. Les images sont réduites aux tailles affichées avant l’envoi. Chaque changement est enregistré tout de suite.'), el('div', { className: 'admin-row' }, [live])]),
          ...homeRows(), projectRows(projects || []), socialRows(posts || [])
        );
        if (focusKey) box.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
      };
      redraw();
      return box;
    };
    return { view };
  };
})();
