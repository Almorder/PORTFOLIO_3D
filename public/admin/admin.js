// Tableau de bord Nolan Arc: connexion Google, vue d'ensemble, édition des contenus, publication.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const root = document.querySelector('[data-admin-app]');
  if (!root || !window.supabase) return;
  const client = window.supabase.createClient(root.dataset.supabaseUrl, root.dataset.supabaseKey);

  // ---------------------------------------------------------------- Outils
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    children.filter(Boolean).forEach(child => node.append(child));
    return node;
  };
  const button = (text, className, onClick, label) => {
    const node = el('button', { type: 'button', className, textContent: text });
    if (label) node.setAttribute('aria-label', label);
    node.addEventListener('click', onClick);
    return node;
  };
  const link = (text, href, className = '') => el('a', { textContent: text, href, className, target: '_blank', rel: 'noopener noreferrer' });
  const date = value => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const status = el('p', { className: 'admin-status' });
  status.setAttribute('role', 'status');
  const say = (text, kind = '') => { status.textContent = text; status.dataset.kind = kind; };

  // Menu : titres seuls, rangés par groupe. « Site » = tout ce que « Enregistrer et publier » met en ligne.
  const SECTIONS = [
    { id: 'projects', label: 'Projets', group: 'Site' },
    { id: 'photos', label: 'Photos', group: 'Site' },
    { id: 'instagram', label: 'Vidéos', group: 'Site' },
    { id: 'testimonials', label: 'Avis', group: 'Site' },
    { id: 'images', label: 'Images', group: 'Site' },
    { id: 'order', label: 'Ordre', group: 'Site' },
    { id: 'publish', label: 'Mise en ligne', group: 'Site' },
    { id: 'site', label: 'Textes et chiffres', group: 'Non publié' },
    { id: 'legal', label: 'Infos légales', group: 'Non publié' }
  ];
  const RENAME = { demandes: 'Demandes' };
  const labelOf = id => SECTIONS.find(s => s.id === id)?.label || id;
  const state = { email: '', view: 'publish', drafts: {}, snapshots: [], audit: [], dirty: false, armed: '' };

  // ---------------------------------------------------------------- Données
  const load = async () => {
    const [drafts, snapshots, audit] = await Promise.all([
      client.from('content_drafts').select('key,data,updated_at'),
      client.from('content_snapshots').select('id,created_at,note').order('id', { ascending: false }).limit(8),
      client.from('audit_log').select('at,action,detail').order('id', { ascending: false }).limit(6)
    ]);
    const error = drafts.error || snapshots.error || audit.error;
    if (error) throw error;
    state.drafts = Object.fromEntries((drafts.data || []).map(row => [row.key, row]));
    state.snapshots = snapshots.data || [];
    state.audit = audit.data || [];
    if (cockpit) await cockpit.load();
  };
  const pending = () => {
    const last = state.snapshots[0] ? new Date(state.snapshots[0].created_at) : null;
    return Object.values(state.drafts).filter(row => !last || new Date(row.updated_at) > last).map(row => row.key);
  };
  const importSite = async () => {
    const seed = await (await fetch('/admin/seed.json', { cache: 'no-store' })).json();
    const later = ['photos', 'images'];
    const rows = Object.entries(seed).filter(([key]) => !later.includes(key)).map(([key, data]) => ({ key, data }));
    const { error } = await client.from('content_drafts').upsert(rows);
    if (error) throw error;
    // Blocs « photos » et « images » à part : ils n'existent qu'une fois photos_schema.sql et medias_schema.sql
    // exécutés, leur absence ne bloque pas l'import.
    let count = rows.length;
    for (const key of later) if (seed[key]) { const res = await client.from('content_drafts').upsert({ key, data: seed[key] }); if (!res.error) count++; }
    resetEditors();
    await load();
    return count;
  };

  // ---------------------------------------------------------------- Structure (menu + zone principale)
  const go = view => {
    if (state.dirty && state.armed !== view) {
      state.armed = view;
      return say('Des modifications ne sont pas enregistrées. Clique encore une fois pour quitter sans enregistrer.', 'warn');
    }
    state.dirty = false; state.armed = ''; state.view = view; say('');
    draw();
    root.querySelector('.admin-main')?.focus();
  };
  // Recherche globale : client, projet, document ou numéro, ouvert directement (Entrée ou clic).
  const searchBox = () => {
    const wrap = el('div', { className: 'admin-search' });
    const input = el('input', { type: 'search', className: 'admin-search__input', placeholder: 'Rechercher un client, un projet, un n°…', autocomplete: 'off', value: state.query || '' });
    input.setAttribute('aria-label', 'Recherche globale');
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', 'admin-search-results'); input.setAttribute('aria-autocomplete', 'list');
    const list = el('ul', { className: 'admin-search__results', id: 'admin-search-results', hidden: true });
    list.setAttribute('role', 'listbox');
    let hits = [], active = -1;
    const pick = i => { const h = hits[i]; if (!h) return; state.query = ''; h.go(); };
    const paint = () => {
      list.replaceChildren(...hits.map((h, i) => {
        const opt = el('li', { className: `admin-search__hit${i === active ? ' is-active' : ''}`, id: `admin-hit-${i}` }, [el('small', { textContent: h.kind }), el('strong', { textContent: h.label }), h.sub ? el('span', { textContent: h.sub }) : null]);
        opt.setAttribute('role', 'option'); opt.setAttribute('aria-selected', String(i === active));
        opt.addEventListener('mousedown', e => { e.preventDefault(); pick(i); });
        return opt;
      }));
      if (input.value.trim().length >= 2 && !hits.length) list.append(el('li', { className: 'admin-search__none', textContent: 'Aucun résultat.' }));
      list.hidden = input.value.trim().length < 2;
      input.setAttribute('aria-expanded', String(!list.hidden));
      if (active >= 0) input.setAttribute('aria-activedescendant', `admin-hit-${active}`); else input.removeAttribute('aria-activedescendant');
    };
    input.addEventListener('input', () => { state.query = input.value; hits = cockpit ? cockpit.search(input.value) : []; active = hits.length ? 0 : -1; paint(); });
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(hits.length - 1, active + 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); pick(active < 0 ? 0 : active); }
      else if (e.key === 'Escape') { input.value = ''; state.query = ''; hits = []; paint(); }
    });
    input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }, 150));
    wrap.append(input, list);
    return wrap;
  };
  // Menu (badges compris) : reconstruit à chaque affichage et après chaque enregistrement (refreshNav).
  const buildNav = () => {
    const nav = el('nav', { className: 'admin-nav' });
    nav.setAttribute('aria-label', 'Sections du tableau de bord');
    let group = '';
    SECTIONS.forEach(section => {
      if (section.group && section.group !== group) { group = section.group; nav.append(el('small', { textContent: group })); }
      const item = button(RENAME[section.id] || section.label, 'admin-nav__item', () => go(section.id));
      if (section.id === state.view || cockpit?.parent[state.view] === section.id) item.setAttribute('aria-current', 'page');
      if (section.group === 'Site' || section.group === 'Non publié') item.classList.add('admin-nav__item--site');
      const count = cockpit?.badge(section.id) || 0;
      if (count) item.append(el('span', { className: 'admin-badge', textContent: String(count) }));
      if (section.id === 'publish' && pending().length) item.append(el('span', { className: 'admin-badge', textContent: String(pending().length) }));
      nav.append(item);
    });
    return nav;
  };
  const refreshNav = () => root.querySelector('.admin-nav')?.replaceWith(buildNav());
  const draw = () => {
    const nav = buildNav();
    const side = el('aside', { className: 'admin-side' }, [
      el('div', { className: 'admin-brand' }, [el('strong', { textContent: 'Nolan.Arc' }), el('span', { textContent: 'Tableau de bord' })]),
      cockpit ? searchBox() : null,
      nav,
      el('div', { className: 'admin-account' }, [
        el('span', { textContent: state.email }),
        link('Voir le site ↗', '/'),
        button('Se déconnecter', 'admin-linkbutton', () => client.auth.signOut())
      ]),
      liveLine
    ]);
    const main = el('section', { className: 'admin-main', tabIndex: -1 }, [VIEWS[state.view]?.() || VIEWS.editor(state.view), status]);
    root.replaceChildren(side, main);
  };
  const heading = (title, intro) => el('header', { className: 'admin-head' }, [el('h2', { textContent: title }), intro && el('p', { textContent: intro })]);
  const card = (title, children, className = '') => el('article', { className: `admin-card ${className}` }, [el('h3', { textContent: title }), ...children]);
  // Cockpit d'activité (public/admin/cockpit.js) : ses rubriques passent avant celles du contenu du site.
  const cockpit = window.NolanCockpit ? window.NolanCockpit({ client, root, el, button, link, say, heading, card, go: view => go(view), setDirty: value => { state.dirty = Boolean(value); state.armed = ''; } }) : null;
  if (cockpit) SECTIONS.unshift(...cockpit.sections, ...(cockpit.footer || []).map(s => ({ ...s, group: 'Activité' })));

  // ---------------------------------------------------------------- Mise en ligne
  // 1. publish_snapshot fige les brouillons dans une version (content_snapshots).
  // 2. Le site se reconstruit sur Cloudflare Pages (deploy hook), lancé par le premier qui le voit :
  //    la fonction Supabase « publish-site » (si elle est déployée avec son secret), un Database Webhook Supabase
  //    sur content_snapshots (si Nolan l'a créé), sinon la vérification périodique (.github/workflows/admin-sync.yml,
  //    programmée toutes les 10 minutes, que GitHub peut retarder). L'admin ne sait pas lequel a agi.
  // 3. L'admin lit /version.json (écrit à chaque build) : « En ligne » dès que snapshot = version publiée.
  const liveLine = el('p', { className: 'admin-live' });
  liveLine.setAttribute('role', 'status');
  const live = { online: null, waiting: 0, timer: 0, since: 0 };
  const latest = () => state.snapshots[0]?.id || 0;
  const paintLive = () => {
    const on = live.online?.snapshot || 0;
    if (live.waiting && on < live.waiting) { liveLine.textContent = `Version n° ${live.waiting} : en attente de mise en ligne${on ? ` (en ligne : n° ${on})` : ''}. La page se met à jour seule.`; liveLine.dataset.kind = 'warn'; }
    else if (on) { liveLine.textContent = `En ligne : version n° ${on}${live.online.builtAt ? `, construite le ${date(live.online.builtAt)}` : ''}.`; liveLine.dataset.kind = 'ok'; }
    else { liveLine.textContent = live.online ? 'En ligne : contenu du code (aucune version publiée).' : ''; liveLine.dataset.kind = 'ok'; }
  };
  const readLive = async () => { try { const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' }); if (res.ok) live.online = await res.json(); } catch {} paintLive(); };
  // Surveille /version.json jusqu'à voir la version attendue (toutes les 15 s, puis toutes les minutes après 10 min).
  const watchLive = id => {
    live.waiting = id; live.since = Date.now(); clearTimeout(live.timer); paintLive();
    const tick = async () => {
      await readLive();
      if ((live.online?.snapshot || 0) >= id) { live.waiting = 0; paintLive(); say(`En ligne : la version n° ${id} est sur nolanarc.com.`, 'ok'); if (state.view === 'publish') draw(); return; }
      const age = Date.now() - live.since;
      if (age < 3 * 60 * 60 * 1000) live.timer = setTimeout(tick, age < 10 * 60 * 1000 ? 15000 : 60000);
    };
    live.timer = setTimeout(tick, 8000);
  };
  // À l'ouverture : si la dernière version publiée n'est pas encore en ligne, on la surveille.
  const checkLive = async () => { await readLive(); const id = latest(); if (id && live.online && (live.online.snapshot || 0) < id) watchLive(id); };
  const publishVersion = async note => {
    say('Publication…');
    const { data, error } = await client.rpc('publish_snapshot', { p_note: note || null });
    if (error) { say(`Publication impossible : ${error.message}`, 'error'); return false; }
    try { await load(); } catch {}
    draw();
    let launched = false;
    try { const res = await client.functions.invoke('publish-site', { body: { snapshot: data } }); launched = !res.error; } catch {}
    say(launched
      ? `Version n° ${data} enregistrée. Reconstruction du site lancée : « En ligne » s’affichera en bas du menu dès que nolanarc.com sert la version n° ${data}.`
      : `Version n° ${data} enregistrée. Elle partira en ligne au prochain déclenchement : le webhook Supabase s’il est en place, sinon la vérification automatique (prévue toutes les 10 minutes, parfois retardée). « En ligne » s’affichera en bas du menu dès que nolanarc.com sert la version n° ${data} ; tu peux fermer cette page en attendant.`, 'ok');
    watchLive(data);
    return true;
  };
  // Une image peut servir à plusieurs endroits (photo et projet) : on ne supprime jamais un fichier encore utilisé.
  const inUse = id => JSON.stringify(Object.values(state.drafts).map(row => row.data)).includes(id);
  const saveKey = async (key, data) => { const res = await client.from('content_drafts').upsert({ key, data }); if (!res.error) { try { await load(); } catch {} refreshNav(); } return res; };
  let seedCache = null;
  const getSeed = async key => { seedCache = seedCache || await (await fetch('/admin/seed.json', { cache: 'no-store' })).json(); return seedCache[key]; };
  const setDirty = value => { state.dirty = Boolean(value); state.armed = ''; };
  const shared = { client, el, button, say, heading, card, publish: publishVersion, setDirty, inUse, getSeed };
  // Social media videos (public/admin/videos.js) et Images du site (public/admin/images.js).
  const videosEditor = window.NolanVideos ? window.NolanVideos({ ...shared, getDraft: () => state.drafts.instagram?.data, saveDraft: data => saveKey('instagram', data) }) : null;
  const imagesView = window.NolanImages ? window.NolanImages({ ...shared, getDraft: key => state.drafts[key]?.data, saveDraft: (key, data) => saveKey(key, data).then(res => { if (key === 'projects') projectsEditor?.reset(); if (key === 'instagram') videosEditor?.reset(); return res; }), go: view => go(view) }) : null;
  const resetEditors = () => { photos?.reset(); projectsEditor?.reset(); videosEditor?.reset(); testimonialsEditor?.reset(); };
  // Avis (public/admin/testimonials.js) : éditeur dédié, images envoyées seulement.
  const testimonialsEditor = window.NolanTestimonials ? window.NolanTestimonials({ ...shared, getDraft: () => state.drafts.testimonials?.data, saveDraft: data => saveKey('testimonials', data) }) : null;
  // Projets de « Ma sélection » (public/admin/projects.js) : éditeur dédié du bloc « projects ».
  const projectsEditor = window.NolanProjects ? window.NolanProjects({ client, el, button, say, heading, card,
    getDraft: () => state.drafts.projects?.data,
    saveDraft: data => saveKey('projects', data),
    publish: publishVersion, inUse,
    setDirty }) : null;
  // Photos de la page Work (public/admin/photos.js) : envoi des fichiers, ordre, légendes, tuile, destination.
  const photos = window.NolanPhotos ? window.NolanPhotos({ ...shared,
    getDraft: () => state.drafts.photos?.data,
    saveDraft: data => saveKey('photos', data),
    // Projet photo créé depuis une photo : ajouté (masqué) à la fin des projets de « Ma sélection ».
    addProjects: async list => { const current = state.drafts.projects?.data || await getSeed('projects') || []; const res = await saveKey('projects', [...structuredClone(current), ...list]); if (!res.error) projectsEditor?.reset(); return res; } }) : null;

  // Ordre du site (public/admin/order.js) : un seul ordre pour le catalogue Work et « Ma sélection ».
  const orderView = window.NolanOrder ? window.NolanOrder({ ...shared, getDraft: key => state.drafts[key]?.data, saveKey, afterSave: () => resetEditors() }) : null;
  const VIEWS = {};
  if (cockpit) Object.assign(VIEWS, cockpit.views);
  if (photos) VIEWS.photos = photos.view;
  if (projectsEditor) VIEWS.projects = projectsEditor.view;
  if (videosEditor) VIEWS.instagram = videosEditor.view;
  if (imagesView) VIEWS.images = imagesView.view;
  if (testimonialsEditor) VIEWS.testimonials = testimonialsEditor.view;
  if (orderView) VIEWS.order = orderView.view;
  VIEWS.overview = () => VIEWS.publish();
  // ---------------------------------------------------------------- Éditeur (formulaire généré depuis les données)
  const FIELD_LABELS = { image: 'Image du projet (adresse de l’image)', link: 'Lien (adresse, facultatif)', linkLabel: 'Texte du lien', manifesto: 'Phrase de l’accueil (lue mot à mot)', title: 'Titre', type: 'Type', role: 'Rôle', year: 'Année', context: 'Contexte', location: 'Lieu', format: 'Format', camera: 'Caméra', visible: 'Visible sur le site', videoId: 'Identifiant vidéo YouTube', poster: 'Image d’affiche (adresse)', summary: 'Résumé', contextText: 'Texte de contexte', intent: 'Intention', decisions: 'Décisions', text: 'Texte', quote: 'Citation', name: 'Nom', territory: 'Territoire', id: 'Identifiant de la publication', kind: 'Précision', ratio: 'Format (ex. 9/16)', label: 'Libellé', value: 'Valeur', suffix: 'Suffixe', question: 'Question', answer: 'Réponse', clients: 'Marques accompagnées', proofStats: 'Chiffres clés', faqs: 'Questions fréquentes', home: 'Accueil', services: 'Services', contact: 'Contact', legalName: 'Nom légal', principle: 'Signature', email: 'Email', responseTime: 'Délai de réponse', calendly: 'Lien Calendly', instagram: 'Lien Instagram', youtube: 'Lien YouTube', professionalAddress: 'Adresse professionnelle', professionalPhone: 'Téléphone professionnel', mediator: 'Médiateur de la consommation', host: 'Hébergeur', address: 'Adresse', website: 'Site web', phone: 'Téléphone', card: 'Carte', image: 'Image', alt: 'Description de l’image', slug: 'Identifiant (non modifiable)', href: 'Adresse de la page (non modifiable)' };
  const EXTRA_FIELDS = {};
  const HIDDEN = new Set(['supabaseUrl', 'supabasePublishableKey', 'analyticsToken', 'domain', 'nav', 'status']);
  const READONLY = new Set(['slug', 'href']);
  const blank = value => Array.isArray(value) ? [] : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)])) : typeof value === 'boolean' ? false : typeof value === 'number' ? 0 : '';
  const itemTitle = (item, index) => {
    const name = (item && typeof item === 'object' && (item.title || item.name || item.question || item.label)) || `Élément ${index + 1}`;
    return item && item.visible === false ? `${name} · masqué` : name;
  };

  VIEWS.editor = key => {
    const section = SECTIONS.find(s => s.id === key);
    const row = state.drafts[key];
    if (!row) return el('div', {}, [heading(section.label, section.hint), el('p', { textContent: 'Ce bloc n’est pas encore importé. Passe par « Mise en ligne » pour importer le contenu du site.' })]);
    const model = { data: structuredClone(row.data) };
    // Champs ajoutés après le premier import : on les complète pour qu'ils apparaissent dans le formulaire.
    const extra = EXTRA_FIELDS[key];
    if (extra && Array.isArray(model.data)) model.data.forEach(item => { if (item && typeof item === 'object') for (const k in extra) if (!(k in item)) item[k] = extra[k]; });
    const touch = () => { state.dirty = true; state.armed = ''; say('Modifications non enregistrées.', 'warn'); };
    const form = el('form', { className: 'admin-form' });
    form.addEventListener('submit', event => event.preventDefault());

    const build = (holder, prop, labelText, top = false) => {
      const value = holder[prop];
      if (Array.isArray(value)) {
        const box = el(top ? 'div' : 'fieldset', { className: top ? 'admin-stack' : 'admin-group' }, [top ? null : el('legend', { textContent: labelText })]);
        value.forEach((item, index) => {
          const tools = el('div', { className: 'admin-tools' });
          const tool = (text, label, action) => tools.append(button(text, 'admin-mini', () => { action(); touch(); redraw(); }, label));
          if (index > 0) tool('↑', 'Monter', () => value.splice(index - 1, 0, value.splice(index, 1)[0]));
          if (index < value.length - 1) tool('↓', 'Descendre', () => value.splice(index + 1, 0, value.splice(index, 1)[0]));
          tool('Supprimer', 'Supprimer cet élément', () => value.splice(index, 1));
          if (item && typeof item === 'object') {
            const details = el('details', { className: 'admin-item' }, [el('summary', { textContent: itemTitle(item, index) })]);
            Object.keys(item).filter(k => !HIDDEN.has(k)).forEach(k => details.append(build(item, k, FIELD_LABELS[k] || k)));
            details.append(tools); box.append(details);
          } else box.append(el('div', { className: 'admin-inline' }, [build(value, index, `${labelText} ${index + 1}`), tools]));
        });
        if (value.length) box.append(button('+ Ajouter', 'admin-mini admin-mini--add', () => { value.push(blank(value[0])); touch(); redraw(); }));
        return box;
      }
      if (value && typeof value === 'object') {
        const box = el(top ? 'div' : 'fieldset', { className: top ? 'admin-stack' : 'admin-group' }, [top ? null : el('legend', { textContent: labelText })]);
        Object.keys(value).filter(k => !HIDDEN.has(k)).forEach(k => box.append(build(value, k, FIELD_LABELS[k] || k)));
        return box;
      }
      const field = el('label', { className: 'admin-field' }, [el('span', { textContent: labelText })]);
      let input;
      if (typeof value === 'boolean') {
        input = el('input', { type: 'checkbox', checked: value }); field.classList.add('admin-field--check');
        input.addEventListener('change', () => { holder[prop] = input.checked; touch(); });
      } else if (typeof value === 'number') {
        input = el('input', { type: 'number', value: String(value), className: 'admin-input' });
        input.addEventListener('input', () => { holder[prop] = Number(input.value) || 0; touch(); });
      } else {
        const text = value == null ? '' : String(value);
        input = text.length > 70 ? el('textarea', { value: text, rows: Math.min(8, Math.ceil(text.length / 80) + 1), className: 'admin-input admin-input--area' }) : el('input', { type: 'text', value: text, className: 'admin-input' });
        input.addEventListener('input', () => { holder[prop] = input.value; touch(); });
      }
      if (READONLY.has(prop)) input.disabled = true;
      field.append(input);
      return field;
    };
    const redraw = () => {
      const open = [...form.querySelectorAll('details')].map(node => node.open);
      form.replaceChildren(build(model, 'data', section.label, true));
      [...form.querySelectorAll('details')].forEach((node, i) => { if (open[i]) node.open = true; });
    };
    redraw();

    const save = button('Enregistrer', 'admin-button', async () => {
      save.disabled = true; say('Enregistrement…');
      const { error } = await client.from('content_drafts').update({ data: model.data }).eq('key', key);
      save.disabled = false;
      if (error) return say(`Enregistrement impossible : ${error.message}`, 'error');
      state.dirty = false; state.armed = '';
      try { await load(); } catch {}
      draw(); say('Brouillon enregistré. Pense à publier pour mettre en ligne.', 'ok');
    });
    return el('div', {}, [el('div', { className: 'admin-bar' }, [heading(section.label, section.hint), save]), form]);
  };

  // « Mise en ligne » : état en ligne, nouvelle version, historique, à compléter, liens utiles.
  VIEWS.publish = () => {
    const d = key => state.drafts[key]?.data;
    if (!Object.keys(state.drafts).length) {
      const start = button('Importer le contenu actuel du site', 'admin-button', async () => {
        start.disabled = true; say('Import en cours…');
        try { const count = await importSite(); draw(); say(`${count} blocs importés. Tu peux maintenant les modifier.`, 'ok'); }
        catch (err) { say(`Import impossible : ${err.message}`, 'error'); start.disabled = false; }
      });
      return el('div', {}, [heading('Bienvenue', 'Première étape : copier le contenu actuel du site dans le tableau de bord. Rien ne change sur le site public.'), start]);
    }
    const waiting = pending();
    const last = state.snapshots[0];
    const on = live.online?.snapshot || 0;
    const stat = (value, label, target) => {
      const node = button('', 'admin-stat', () => go(target), `${label} : ${value}`);
      node.append(el('strong', { textContent: String(value) }), el('span', { textContent: label }));
      return node;
    };
    const projects = d('projects') || [];
    const legal = d('legal') || {};
    const missing = [!legal.professionalAddress && 'adresse professionnelle', !legal.professionalPhone && 'téléphone professionnel', !legal.mediator?.name && 'médiateur de la consommation'].filter(Boolean);
    const site = d('site') || {};
    const note = el('input', { type: 'text', maxLength: 200, placeholder: 'Note (facultatif) : ce qui change', className: 'admin-input' });
    note.setAttribute('aria-label', 'Note de version');
    const publish = button('Enregistrer et publier une version', 'admin-button admin-button--ember', async () => {
      publish.disabled = true;
      if (!await publishVersion(note.value)) publish.disabled = false;
    });
    const reset = button('Réimporter le contenu du site', 'admin-mini', async () => {
      if (reset.dataset.armed !== '1') { reset.dataset.armed = '1'; reset.textContent = 'Confirmer : remplacer tous les brouillons'; return say('Attention : tous les brouillons seront remplacés par le contenu actuel du site. Clique encore pour confirmer.', 'warn'); }
      reset.disabled = true; say('Import en cours…');
      try { const count = await importSite(); draw(); say(`${count} blocs réimportés.`, 'ok'); }
      catch (err) { say(`Import impossible : ${err.message}`, 'error'); reset.disabled = false; }
    });
    const onlineText = !last ? 'Aucune version publiée pour l’instant.'
      : !live.online ? `Dernière version : n° ${last.id}, le ${date(last.created_at)}. État en ligne inconnu (version.json illisible).`
      : on >= last.id ? `En ligne : la version n° ${on} est sur nolanarc.com.`
      : `Version n° ${last.id} publiée le ${date(last.created_at)}, pas encore en ligne (en ligne : n° ${on || 'aucune'}). La mise en ligne passe par le webhook Supabase s’il est en place, sinon par la vérification automatique (toutes les 10 minutes, parfois plus).`;
    const ACTIONS = { publish: 'Version enregistrée', draft_insert: 'Bloc importé', draft_update: 'Bloc modifié', draft_delete: 'Bloc supprimé' };
    return el('div', {}, [
      heading('Mise en ligne'),
      el('div', { className: 'admin-stats' }, [
        stat(`${projects.filter(p => p.visible).length}/${projects.length}`, 'projets visibles', 'projects'),
        stat((d('instagram') || []).length, 'vidéos', 'instagram'),
        stat((d('testimonials') || []).filter(t => t.visible !== false).length, 'avis', 'testimonials'),
        stat((d('photos')?.items || []).filter(p => p.visible).length, 'photos visibles', 'photos'),
      ]),
      el('div', { className: 'admin-grid' }, [
        card('Nouvelle version', [
          el('p', { className: !last || on >= last.id ? 'admin-ok' : 'admin-alert', textContent: onlineText }),
          el('p', { className: waiting.length ? 'admin-alert' : 'admin-ok', textContent: waiting.length ? `Modifié depuis la dernière version : ${waiting.map(labelOf).join(', ')}.` : 'Aucune modification en attente.' }),
          el('div', { className: 'admin-row' }, [note, publish])
        ], 'admin-card--wide'),
        card('Historique', [el('ul', { className: 'admin-log' }, state.snapshots.length
          ? state.snapshots.map(row => el('li', {}, [el('span', { textContent: `Version n° ${row.id}${row.id === on ? ' · en ligne' : ''}${row.note ? ` | ${row.note}` : ''}` }), el('time', { textContent: date(row.created_at) })]))
          : [el('li', { textContent: 'Aucune version enregistrée.' })])]),
        card('Dernières actions', [el('ul', { className: 'admin-log' }, state.audit.length
          ? state.audit.map(row => el('li', {}, [el('span', { textContent: `${ACTIONS[row.action] || row.action}${row.detail?.key ? ` : ${labelOf(row.detail.key)}` : row.detail?.snapshot ? ` n° ${row.detail.snapshot}` : ''}` }), el('time', { textContent: date(row.at) })]))
          : [el('li', { textContent: 'Aucune action enregistrée.' })])]),
        card('À compléter', missing.length
          ? [el('p', { textContent: `Informations légales manquantes : ${missing.join(', ')}.` }), button('Compléter', 'admin-mini', () => go('legal'))]
          : [el('p', { className: 'admin-ok', textContent: 'Rien à signaler.' })]),
        card('Liens utiles', [el('ul', { className: 'admin-links' }, [
          ['Statistiques de visite', 'https://dash.cloudflare.com/?to=/:account/web-analytics'],
          ['Déploiements du site (Cloudflare)', 'https://dash.cloudflare.com/?to=/:account/pages'],
          ['Instagram', site.instagram], ['YouTube', site.youtube]
        ].filter(([, href]) => href).map(([text, href]) => el('li', {}, [link(`${text} ↗`, href)])))]),
        card('Repartir du site actuel', [reset])
      ])
    ]);
  };

  // ---------------------------------------------------------------- Connexion
  const gate = (...nodes) => root.replaceChildren(el('section', { className: 'admin-gate' }, [el('strong', { className: 'admin-gate__brand', textContent: 'Nolan.Arc' }), ...nodes, status]));
  const showLogin = () => {
    const login = button('Se connecter avec Google', 'admin-button', async () => {
      login.disabled = true;
      const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/admin/` } });
      if (error) { say(`Connexion impossible : ${error.message}`, 'error'); login.disabled = false; }
    });
    gate(el('p', { textContent: 'Espace réservé à l’administrateur du site.' }), login);
  };

  let current = null;
  const route = async session => {
    const id = session?.user?.id || '';
    if (id === current) return;
    current = id; say('');
    if (!session) return showLogin();
    gate(el('p', { textContent: 'Vérification des droits…' }));
    const out = button('Se déconnecter', 'admin-mini', () => client.auth.signOut());
    const { data, error } = await client.rpc('is_admin');
    if (error) { gate(out); return say(`Vérification impossible : ${error.message}`, 'error'); }
    if (data !== true) return gate(el('p', { textContent: `Le compte ${session.user.email} n’a pas les droits d’administration.` }), out);
    state.email = session.user.email; state.view = cockpit ? 'pilotage' : 'publish';
    try { await load(); draw(); checkLive(); } catch (err) { gate(out); say(`Lecture impossible : ${err.message}`, 'error'); }
  };
  addEventListener('beforeunload', event => { if (state.dirty) event.preventDefault(); });
  // setTimeout : ne jamais appeler Supabase directement dans le rappel d'authentification (risque de blocage).
  client.auth.onAuthStateChange((_event, session) => setTimeout(() => route(session), 0));
})();
