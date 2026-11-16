// Tableau de bord Nolan Arc — connexion Google, vue d'ensemble, édition des contenus, publication.
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

  const SECTIONS = [
    { id: 'overview', label: 'Vue d’ensemble' },
    { id: 'projects', label: 'Projets', group: 'Contenu', hint: 'Fiches projet et visibilité sur le site.' },
    { id: 'testimonials', label: 'Témoignages', group: 'Contenu', hint: 'Avis clients affichés sur le site.' },
    { id: 'instagram', label: 'Social media videos', group: 'Contenu', hint: 'Vidéos Instagram de la page Work.' },
    { id: 'site', label: 'Textes et chiffres', group: 'Contenu', hint: 'Signature, chiffres clés, marques, questions fréquentes, liens.' },
    { id: 'legal', label: 'Informations légales', group: 'Contenu', hint: 'Coordonnées, médiateur, conditions.' },
    { id: 'publish', label: 'Publication', group: 'Mise en ligne' }
  ];
  const labelOf = id => SECTIONS.find(s => s.id === id)?.label || id;
  const state = { email: '', view: 'overview', drafts: {}, snapshots: [], audit: [], dirty: false, armed: '' };

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
  };
  const pending = () => {
    const last = state.snapshots[0] ? new Date(state.snapshots[0].created_at) : null;
    return Object.values(state.drafts).filter(row => !last || new Date(row.updated_at) > last).map(row => row.key);
  };
  const importSite = async () => {
    const seed = await (await fetch('/admin/seed.json', { cache: 'no-store' })).json();
    const rows = Object.entries(seed).map(([key, data]) => ({ key, data }));
    const { error } = await client.from('content_drafts').upsert(rows);
    if (error) throw error;
    await load();
    return rows.length;
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
  const draw = () => {
    const nav = el('nav', { className: 'admin-nav' });
    nav.setAttribute('aria-label', 'Sections du tableau de bord');
    let group = '';
    SECTIONS.forEach(section => {
      if (section.group && section.group !== group) { group = section.group; nav.append(el('small', { textContent: group })); }
      const item = button(section.label, 'admin-nav__item', () => go(section.id));
      if (section.id === state.view) item.setAttribute('aria-current', 'page');
      if (section.id === 'publish' && pending().length) item.append(el('span', { className: 'admin-badge', textContent: String(pending().length) }));
      nav.append(item);
    });
    const side = el('aside', { className: 'admin-side' }, [
      el('div', { className: 'admin-brand' }, [el('strong', { textContent: 'Nolan.Arc' }), el('span', { textContent: 'Tableau de bord' })]),
      nav,
      el('div', { className: 'admin-account' }, [
        el('span', { textContent: state.email }),
        link('Voir le site ↗', '/'),
        button('Se déconnecter', 'admin-linkbutton', () => client.auth.signOut())
      ])
    ]);
    const main = el('section', { className: 'admin-main', tabIndex: -1 }, [VIEWS[state.view]?.() || VIEWS.editor(state.view), status]);
    root.replaceChildren(side, main);
  };
  const heading = (title, intro) => el('header', { className: 'admin-head' }, [el('h2', { textContent: title }), intro && el('p', { textContent: intro })]);
  const card = (title, children, className = '') => el('article', { className: `admin-card ${className}` }, [el('h3', { textContent: title }), ...children]);

  // ---------------------------------------------------------------- Vue d'ensemble
  const VIEWS = {};
  VIEWS.overview = () => {
    const d = key => state.drafts[key]?.data;
    if (!Object.keys(state.drafts).length) {
      const start = button('Importer le contenu actuel du site', 'admin-button', async () => {
        start.disabled = true; say('Import en cours…');
        try { const count = await importSite(); draw(); say(`${count} blocs importés. Tu peux maintenant les modifier.`, 'ok'); }
        catch (err) { say(`Import impossible : ${err.message}`, 'error'); start.disabled = false; }
      });
      return el('div', {}, [heading('Bienvenue', 'Première étape : copier le contenu actuel du site dans le tableau de bord. Rien ne change sur le site public.'), start]);
    }
    const last = state.snapshots[0];
    const waiting = pending();
    const projects = d('projects') || [];
    const legal = d('legal') || {};
    const missing = [!legal.professionalAddress && 'adresse professionnelle', !legal.professionalPhone && 'téléphone professionnel', !legal.mediator?.name && 'médiateur de la consommation'].filter(Boolean);
    const site = d('site') || {};

    const stat = (value, label, target) => {
      const node = button('', 'admin-stat', () => go(target), `${label} : ${value}`);
      node.append(el('strong', { textContent: String(value) }), el('span', { textContent: label }));
      return node;
    };
    const publishCard = card('Mise en ligne', [
      el('p', { textContent: last ? `Dernière version : n° ${last.id}, le ${date(last.created_at)}.` : 'Aucune version enregistrée pour l’instant.' }),
      el('p', { className: waiting.length ? 'admin-alert' : 'admin-ok', textContent: waiting.length ? `${waiting.length} bloc(s) modifié(s) depuis : ${waiting.map(labelOf).join(', ')}.` : 'Tout est à jour.' }),
      waiting.length ? button('Aller à la publication', 'admin-button', () => go('publish')) : null
    ], 'admin-card--wide');

    const todo = card('À compléter', missing.length
      ? [el('p', { textContent: `Informations légales manquantes : ${missing.join(', ')}.` }), button('Compléter', 'admin-mini', () => go('legal'))]
      : [el('p', { className: 'admin-ok', textContent: 'Rien à signaler.' })]);

    const shortcuts = card('Mon activité', [el('ul', { className: 'admin-links' }, [
      ['Statistiques de visite', 'https://dash.cloudflare.com/?to=/:account/web-analytics'],
      ['Demandes reçues (Gmail)', 'https://mail.google.com/mail/#search/formsubmit'],
      ['Rendez-vous (Calendly)', 'https://calendly.com/app/scheduled_events/user/me'],
      ['Instagram', site.instagram],
      ['YouTube', site.youtube]
    ].filter(([, href]) => href).map(([text, href]) => el('li', {}, [link(`${text} ↗`, href)])))]);

    const ACTIONS = { publish: 'Version enregistrée', draft_insert: 'Bloc importé', draft_update: 'Bloc modifié', draft_delete: 'Bloc supprimé' };
    const journal = card('Dernières actions', [el('ul', { className: 'admin-log' }, state.audit.length
      ? state.audit.map(row => el('li', {}, [el('span', { textContent: `${ACTIONS[row.action] || row.action}${row.detail?.key ? ` : ${labelOf(row.detail.key)}` : row.detail?.snapshot ? ` n° ${row.detail.snapshot}` : ''}` }), el('time', { textContent: date(row.at) })]))
      : [el('li', { textContent: 'Aucune action enregistrée.' })])]);

    return el('div', {}, [
      heading('Vue d’ensemble'),
      el('div', { className: 'admin-stats' }, [
        stat(`${projects.filter(p => p.visible).length}/${projects.length}`, 'projets visibles', 'projects'),
        stat((d('testimonials') || []).length, 'témoignages', 'testimonials'),
        stat((d('instagram') || []).length, 'social media videos', 'instagram'),
        stat((site.clients || []).length, 'marques accompagnées', 'site')
      ]),
      el('div', { className: 'admin-grid' }, [publishCard, shortcuts, todo, journal])
    ]);
  };

  // ---------------------------------------------------------------- Éditeur (formulaire généré depuis les données)
  const FIELD_LABELS = { image: 'Image du projet (adresse de l’image)', link: 'Lien (adresse, facultatif)', linkLabel: 'Texte du lien', manifesto: 'Phrase de l’accueil (lue mot à mot)', title: 'Titre', type: 'Type', role: 'Rôle', year: 'Année', context: 'Contexte', location: 'Lieu', format: 'Format', camera: 'Caméra', visible: 'Visible sur le site', videoId: 'Identifiant vidéo YouTube', poster: 'Image d’affiche (adresse)', summary: 'Résumé', contextText: 'Texte de contexte', intent: 'Intention', decisions: 'Décisions', text: 'Texte', quote: 'Citation', name: 'Nom', territory: 'Territoire', id: 'Identifiant de la publication', kind: 'Précision', ratio: 'Format (ex. 9/16)', label: 'Libellé', value: 'Valeur', suffix: 'Suffixe', question: 'Question', answer: 'Réponse', clients: 'Marques accompagnées', proofStats: 'Chiffres clés', faqs: 'Questions fréquentes', home: 'Accueil', services: 'Services', contact: 'Contact', legalName: 'Nom légal', principle: 'Signature', email: 'Email', responseTime: 'Délai de réponse', calendly: 'Lien Calendly', instagram: 'Lien Instagram', youtube: 'Lien YouTube', professionalAddress: 'Adresse professionnelle', professionalPhone: 'Téléphone professionnel', mediator: 'Médiateur de la consommation', host: 'Hébergeur', address: 'Adresse', website: 'Site web', phone: 'Téléphone', card: 'Carte', image: 'Image', alt: 'Description de l’image', slug: 'Identifiant (non modifiable)', href: 'Adresse de la page (non modifiable)' };
  const EXTRA_FIELDS = { testimonials: { image: '', link: '', linkLabel: '' } };
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
    if (!row) return el('div', {}, [heading(section.label, section.hint), el('p', { textContent: 'Ce bloc n’est pas encore importé. Passe par la Vue d’ensemble ou la Publication pour importer le contenu du site.' })]);
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

  // ---------------------------------------------------------------- Publication
  VIEWS.publish = () => {
    const waiting = pending();
    const note = el('input', { type: 'text', maxLength: 200, placeholder: 'Note (facultatif) : ce qui change', className: 'admin-input' });
    note.setAttribute('aria-label', 'Note de version');
    const publish = button('Enregistrer une version', 'admin-button', async () => {
      publish.disabled = true; say('Enregistrement…');
      const { data, error } = await client.rpc('publish_snapshot', { p_note: note.value || null });
      if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); publish.disabled = false; return; }
      try { await load(); } catch {}
      draw(); say(`Version n° ${data} enregistrée.`, 'ok');
    });
    publish.disabled = !Object.keys(state.drafts).length;
    const reset = button('Réimporter le contenu du site', 'admin-mini', async () => {
      if (reset.dataset.armed !== '1') { reset.dataset.armed = '1'; reset.textContent = 'Confirmer : remplacer tous les brouillons'; return say('Attention : tous les brouillons seront remplacés par le contenu actuel du site. Clique encore pour confirmer.', 'warn'); }
      reset.disabled = true; say('Import en cours…');
      try { const count = await importSite(); draw(); say(`${count} blocs réimportés.`, 'ok'); }
      catch (err) { say(`Import impossible : ${err.message}`, 'error'); reset.disabled = false; }
    });
    return el('div', {}, [
      heading('Publication', 'Une version fige l’ensemble des brouillons. La mise en ligne automatique sur le site public arrive à l’étape suivante.'),
      el('div', { className: 'admin-grid' }, [
        card('Nouvelle version', [
          el('p', { className: waiting.length ? 'admin-alert' : 'admin-ok', textContent: waiting.length ? `Modifié depuis la dernière version : ${waiting.map(labelOf).join(', ')}.` : 'Aucune modification en attente.' }),
          el('div', { className: 'admin-row' }, [note, publish])
        ], 'admin-card--wide'),
        card('Historique', [el('ul', { className: 'admin-log' }, state.snapshots.length
          ? state.snapshots.map(row => el('li', {}, [el('span', { textContent: `Version n° ${row.id}${row.note ? ` — ${row.note}` : ''}` }), el('time', { textContent: date(row.created_at) })]))
          : [el('li', { textContent: 'Aucune version enregistrée.' })])]),
        card('Repartir du site actuel', [el('p', { textContent: 'Remplace tous les brouillons par le contenu actuellement en ligne.' }), reset])
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
    state.email = session.user.email; state.view = 'overview';
    try { await load(); draw(); } catch (err) { gate(out); say(`Lecture impossible : ${err.message}`, 'error'); }
  };
  addEventListener('beforeunload', event => { if (state.dirty) event.preventDefault(); });
  // setTimeout : ne jamais appeler Supabase directement dans le rappel d'authentification (risque de blocage).
  client.auth.onAuthStateChange((_event, session) => setTimeout(() => route(session), 0));
})();
