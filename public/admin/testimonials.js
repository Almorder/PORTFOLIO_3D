// Admin Nolan Arc : avis clients (accueil, Work, Contact, À propos). Ajouter, modifier, ordonner, masquer,
// supprimer un avis. Image facultative, seulement envoyée depuis ici (WebP, stockage « site-photos », copiée sur
// le site au déploiement) : plus d'adresse d'image libre. La bulle ronde à côté du nom reprend automatiquement
// cette image (cadrage centre-haut, comme sur le site) ; si l'image a son original (recadrage), la bulle peut être
// recadrée à part (champ photo, tiré du même original). « Enregistrer et publier » met les avis en ligne
// (tools/fetch-published.mjs). Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const validLink = v => !v || /^\/(?!\/)[\w\-./?=&#%]*$/.test(v) || /^https:\/\/[\w.-]+(\/[\w\-./?=&#%~+]*)?$/.test(v);
  const imageFields = i => i ? { id: i.id, width: i.width, height: i.height, smallWidth: i.smallWidth, smallHeight: i.smallHeight, ...(i.source ? { source: i.source } : {}), ...(i.crop ? { crop: i.crop } : {}) } : null;
  // Ancien brouillon : l'image était une adresse libre (texte). Elle n'est plus acceptée : on la retire.
  const uploaded = i => i && typeof i === 'object' && i.id ? imageFields(i) : null;
  // Bulle recadrée : gardée seulement si elle vient de l'original de l'image de l'avis. Une ancienne « photo de la
  // personne » envoyée à part est ignorée : la bulle reprend l'image de l'avis (le site fait de même).
  const bubbleOf = t => { const img = uploaded(t.image), ph = uploaded(t.photo); return img?.source?.id && ph?.source?.id === img.source.id ? ph : null; };
  const migrate = t => ({ quote: t.quote || '', name: t.name || '', role: t.role || '', image: uploaded(t.image), photo: bubbleOf(t), alt: t.alt || '', link: t.link || '', linkLabel: t.linkLabel || '', visible: t.visible !== false });
  // Cadrage par défaut de la bulle, en fractions de l'original : le carré du haut, centré, de la zone gardée pour l'image.
  const topSquare = image => {
    const W = image.source.width, H = image.source.height, c = image.crop || { x: 0, y: 0, w: 1, h: 1 };
    const side = Math.min(c.w * W, c.h * H);
    return { x: c.x + (c.w - side / W) / 2, y: c.y, w: side / W, h: side / H };
  };

  window.NolanTestimonials = ({ client, el, button, say, heading, card, getDraft, getSeed, saveDraft, publish, setDirty, inUse }) => {
    const media = window.NolanMedia ? window.NolanMedia(client, inUse) : null;
    let model = null, removed = [], busy = -1, redraw = () => {};
    const open = new Set();
    const reset = () => { const d = getDraft(); model = Array.isArray(d) ? d.map(migrate) : null; removed = []; };
    const touch = () => { setDirty(true); say('Modifications non enregistrées.', 'warn'); };
    const fk = (i, f) => `tm-${i}-${f}`;

    const problemOf = (t, i) => {
      for (const f of ['quote', 'name', 'role', 'alt', 'linkLabel']) t[f] = media ? media.noDash(t[f]) : t[f];
      if (!String(t.quote).trim()) return [fk(i, 'quote'), 'écris le texte de l’avis'];
      if (!String(t.name).trim()) return [fk(i, 'name'), 'écris le nom de la personne'];
      if (t.image && !String(t.alt).trim()) return [fk(i, 'alt'), 'écris le texte alternatif de l’image'];
      if (!validLink(String(t.link).trim())) return [fk(i, 'link'), 'le lien commence par https:// ou par / (page du site)'];
      return null;
    };
    const persist = async () => {
      for (const [i, t] of model.entries()) {
        const bad = problemOf(t, i);
        if (bad) { open.add(i); redraw(); const n = document.querySelector(`[data-focus-key="${bad[0]}"]`); n?.setAttribute('aria-invalid', 'true'); n?.focus(); say(`Avis ${i + 1} : ${bad[1]}.`, 'error'); return false; }
      }
      if (!model.some(t => t.visible)) { say('Garde au moins un avis visible : la section Avis ne peut pas être vide.', 'error'); return false; }
      say('Enregistrement…');
      const { error } = await saveDraft(model);
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return false; }
      if (removed.length && media) await media.remove(removed);
      setDirty(false); reset(); redraw();
      say('Avis enregistrés. « Enregistrer et publier » les met en ligne.', 'ok');
      return true;
    };

    const field = (labelText, input) => el('label', { className: 'admin-field' }, [el('span', { textContent: labelText }), input]);
    const text = (t, prop, i, opts = {}) => {
      const input = el(opts.area ? 'textarea' : 'input', { className: `admin-input${opts.area ? ' admin-input--area' : ''}`, value: String(t[prop] ?? '') });
      if (opts.area) input.rows = opts.rows || 3; else input.type = 'text';
      input.maxLength = opts.max || 120;
      if (opts.placeholder) input.placeholder = opts.placeholder;
      if (opts.required) { input.required = true; input.setAttribute('aria-required', 'true'); }
      input.dataset.focusKey = fk(i, prop);
      input.addEventListener('input', () => { t[prop] = input.value; input.removeAttribute('aria-invalid'); touch(); });
      return input;
    };
    const move = (from, to) => { if (to < 0 || to >= model.length) return; model.splice(to, 0, model.splice(from, 1)[0]); touch(); redraw(); };

    const item = (t, i) => {
      const n = i + 1, who = t.name || `Avis ${n}`;
      const details = el('details', { className: 'admin-item pj-card' });
      details.open = open.has(i);
      details.addEventListener('toggle', () => { if (details.open) open.add(i); else open.delete(i); });
      const visible = el('input', { type: 'checkbox', checked: t.visible });
      visible.dataset.focusKey = fk(i, 'visible');
      visible.addEventListener('change', () => { t.visible = visible.checked; touch(); redraw(); });
      const fileId = `tm-file-${i}`;
      const file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp', className: 'ph-file', id: fileId });
      file.dataset.focusKey = fk(i, 'image'); file.disabled = busy >= 0;
      file.addEventListener('change', async () => {
        const f = file.files[0]; if (!f || !media) return;
        busy = i; redraw(); say(`Préparation de ${f.name}…`);
        try { const { image, report } = await media.store(f, 'cover', 'testimonial'); if (t.image?.id) removed.push(t.image.id); if (t.photo?.id) removed.push(t.photo.id); t.image = imageFields(image); t.photo = null; touch(); say(`${report}. Écris le texte alternatif puis enregistre.`, 'warn'); }
        catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
        busy = -1; redraw();
      });
      const fig = el('div', { className: 'im-figure' });
      if (t.image) {
        const img = el('img', { className: 'ph-thumb', alt: t.alt ? `Aperçu : ${t.alt}` : `Aperçu de l’image de l’avis ${n}`, width: t.image.smallWidth || 0, height: t.image.smallHeight || 0 }); media?.preview(img, t.image.id);
        // Aperçu de la bulle : la bulle recadrée si elle existe, sinon l'image de l'avis cadrée centre-haut (comme le site).
        const bubble = el('img', { className: `tm-bubble${t.photo ? '' : ' is-cover'}`, alt: `Bulle de ${who}`, width: 72, height: 72 }); media?.preview(bubble, (t.photo || t.image).id);
        fig.classList.add('tm-figure'); fig.append(img, el('figure', { className: 'tm-bubble__fig' }, [bubble, el('figcaption', { textContent: 'Bulle' })]));
      }
      const tool = (label, aria, key, action, disabled) => { const b = button(label, 'admin-mini', action, aria); b.dataset.focusKey = fk(i, key); b.disabled = Boolean(disabled); return b; };
      const del = tool('Supprimer', `Supprimer l’avis de ${who}`, 'del', () => {
        if (del.dataset.armed !== '1') { del.dataset.armed = '1'; del.textContent = 'Confirmer la suppression'; return say('L’avis sera supprimé à l’enregistrement. Clique encore pour confirmer.', 'warn'); }
        if (t.image?.id) removed.push(t.image.id); if (t.photo?.id) removed.push(t.photo.id); model.splice(i, 1); open.clear(); touch(); redraw();
      });
      details.append(
        el('summary', {}, [el('span', { textContent: `${n} · ${who}` }), el('small', { className: `pj-status${t.visible ? '' : ' is-off'}`, textContent: t.visible ? 'Visible' : 'Masqué' })]),
        field('Avis (obligatoire, mot pour mot)', text(t, 'quote', i, { area: true, max: 600, required: true })),
        el('div', { className: 'pj-grid' }, [field('Nom (obligatoire)', text(t, 'name', i, { max: 80, required: true })), field('Contexte (facultatif)', text(t, 'role', i, { max: 80, placeholder: 'Film de mariage, marque…' }))]),
        el('div', { className: 'pj-grid' }, [field('Lien (facultatif)', text(t, 'link', i, { max: 300, placeholder: 'https://… ou /projet/…/' })), field('Texte du lien', text(t, 'linkLabel', i, { max: 60, placeholder: 'Voir le projet' }))]),
        el('fieldset', { className: 'admin-group pj-media' }, [
          el('legend', { textContent: 'Image de l’avis (facultatif)' }),
          fig,
          el('div', { className: 'admin-tools' }, [file, el('label', { htmlFor: fileId, className: 'admin-mini ph-drop__btn', textContent: busy === i ? 'Envoi en cours…' : t.image ? 'Remplacer l’image' : 'Envoyer une image' }),
            t.image ? tool('Recadrer', `Recadrer l’image de l’avis de ${who}`, 'crop', async () => {
              busy = i; redraw();
              try { const { image } = await media.recrop(t.image, 'cover', 'testimonial'); removed.push(t.image.id); t.image = imageFields(image); touch(); say('Recadrage prêt. Enregistre pour le garder.', 'warn'); }
              catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
              busy = -1; redraw();
            }) : null,
            t.image?.source?.id ? tool('Recadrer la bulle', `Recadrer la bulle de ${who}`, 'bubble', async () => {
              busy = i; redraw();
              try { const { image } = await media.recrop({ id: t.image.id, source: t.image.source, crop: t.photo?.crop || topSquare(t.image) }, 'avatar', 'avatar'); if (t.photo?.id) removed.push(t.photo.id); t.photo = imageFields(image); touch(); say('Bulle recadrée. Enregistre pour la garder.', 'warn'); }
              catch (err) { say(`Arrêt : ${err.message}.`, 'error'); }
              busy = -1; redraw();
            }) : null,
            t.photo ? tool('Bulle par défaut', `Bulle de ${who} : cadrage centre-haut`, 'nobubble', () => { removed.push(t.photo.id); t.photo = null; touch(); redraw(); }) : null,
            t.image ? tool('Retirer l’image', `Retirer l’image de l’avis de ${who}`, 'noimg', () => { removed.push(t.image.id); if (t.photo?.id) removed.push(t.photo.id); t.image = null; t.photo = null; t.alt = ''; touch(); redraw(); }) : null].filter(Boolean)),
          t.image ? field('Texte alternatif (obligatoire)', text(t, 'alt', i, { area: true, rows: 2, max: 300, required: true, placeholder: 'Ce que montre l’image, en une phrase' })) : null
        ].filter(Boolean)),
        el('div', { className: 'ph-card__checks' }, [el('label', { className: 'admin-field admin-field--check' }, [visible, el('span', { textContent: 'Visible sur le site' })])]),
        el('div', { className: 'admin-tools' }, [tool('↑', `Monter l’avis de ${who}`, 'up', () => move(i, i - 1), i === 0), tool('↓', `Descendre l’avis de ${who}`, 'down', () => move(i, i + 1), i === model.length - 1), del])
      );
      return details;
    };

    const render = () => {
      const head = el('div', { className: 'admin-bar' }, [heading('Avis')]);
      if (!model) {
        const start = button('Partir des avis actuels du site', 'admin-button', async () => {
          start.disabled = true;
          try { model = ((await getSeed('testimonials')) || []).map(migrate); touch(); redraw(); }
          catch (err) { say(`Lecture impossible : ${err.message}`, 'error'); start.disabled = false; }
        });
        return [head, start];
      }
      const save = button('Enregistrer', 'admin-button', () => persist());
      const live = button('Enregistrer et publier', 'admin-button admin-button--ember', async () => { live.disabled = true; if (await persist()) await publish('Avis'); live.disabled = false; });
      save.disabled = live.disabled = busy >= 0;
      head.append(el('div', { className: 'admin-row' }, [save, live]));
      const add = button('+ Ajouter un avis', 'admin-button', () => { model.push(migrate({})); open.add(model.length - 1); touch(); redraw(); document.querySelector(`[data-focus-key="${fk(model.length - 1, 'quote')}"]`)?.focus(); });
      const shown = model.filter(t => t.visible).length;
      return [head, el('p', { className: shown ? 'ph-help' : 'admin-alert', textContent: `${shown} avis visible(s)` }), el('div', { className: 'pj-list' }, model.map(item)), add];
    };
    const view = () => {
      if (!model) reset();
      const box = el('div', { className: 'pj-admin' });
      redraw = () => { const f = document.activeElement?.dataset?.focusKey; box.replaceChildren(...render()); if (f) box.querySelector(`[data-focus-key="${f}"]`)?.focus(); };
      redraw();
      return box;
    };
    return { view, reset: () => { model = null; } };
  };
})();
