// Dashboard admin Nolan Arc — connexion Google, statut administrateur, brouillons et publication.
// Aucune donnée n'est injectée en HTML : tout passe par textContent.
(() => {
  const root = document.querySelector('[data-admin-app]');
  if (!root || !window.supabase) return;
  const client = window.supabase.createClient(root.dataset.supabaseUrl, root.dataset.supabaseKey);
  const LABELS = { projects: 'Projets', testimonials: 'Témoignages', offers: 'Offres et tarifs', faq: 'FAQ', site: 'Textes et réglages du site', legal: 'Informations légales', instagram: 'Social media videos' };
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach(child => node.append(child));
    return node;
  };
  const date = value => new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  const status = el('p', { className: 'admin-status' });
  status.setAttribute('role', 'status');
  const say = (text, kind = '') => { status.textContent = text; status.dataset.kind = kind; };
  const render = (...nodes) => root.replaceChildren(...nodes, status);

  // ---------------------------------------------------------------- Éditeur de bloc (formulaire généré depuis les données)
  const FIELD_LABELS = { title: 'Titre', type: 'Type', role: 'Rôle', year: 'Année', context: 'Contexte', location: 'Lieu', format: 'Format', camera: 'Caméra', visible: 'Visible sur le site', videoId: 'Identifiant vidéo YouTube', poster: 'Image d’affiche (adresse)', summary: 'Résumé', contextText: 'Texte de contexte', intent: 'Intention', decisions: 'Décisions', text: 'Texte', quote: 'Citation', name: 'Nom', territory: 'Territoire', id: 'Identifiant de la publication', kind: 'Précision', ratio: 'Format (ex. 9/16)', label: 'Libellé', value: 'Valeur', suffix: 'Suffixe', question: 'Question', answer: 'Réponse', clients: 'Marques accompagnées', proofStats: 'Chiffres clés', faqs: 'Questions fréquentes', home: 'Accueil', services: 'Services', contact: 'Contact', legalName: 'Nom légal', principle: 'Signature', email: 'Email', location_: 'Lieu', responseTime: 'Délai de réponse', calendly: 'Lien Calendly', instagram: 'Lien Instagram', youtube: 'Lien YouTube', professionalAddress: 'Adresse professionnelle', professionalPhone: 'Téléphone professionnel', mediator: 'Médiateur de la consommation', host: 'Hébergeur', address: 'Adresse', website: 'Site web', phone: 'Téléphone', card: 'Carte', image: 'Image', alt: 'Description de l’image', slug: 'Identifiant (non modifiable)', href: 'Adresse de la page (non modifiable)' };
  const HIDDEN = new Set(['supabaseUrl', 'supabasePublishableKey', 'analyticsToken', 'domain', 'nav', 'status']);
  const READONLY = new Set(['slug', 'href']);
  const blank = value => Array.isArray(value) ? [] : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blank(v)])) : typeof value === 'boolean' ? false : typeof value === 'number' ? 0 : '';
  const itemTitle = (item, index) => (item && typeof item === 'object' && (item.title || item.name || item.question || item.label)) || `Élément ${index + 1}`;

  const showEditor = async (email, key) => {
    render(el('p', { textContent: 'Chargement…' }));
    const { data: row, error } = await client.from('content_drafts').select('data').eq('key', key).single();
    if (error) { await showDashboard(email); return say(`Lecture impossible : ${error.message}`, 'error'); }
    const model = { data: structuredClone(row.data) };
    let dirty = false;
    const touch = () => { dirty = true; say('Modifications non enregistrées.', 'warn'); };
    const form = el('form', { className: 'admin-form' });
    form.addEventListener('submit', event => event.preventDefault());

    const build = (holder, prop, labelText) => {
      const value = holder[prop];
      if (Array.isArray(value)) {
        const box = el('fieldset', { className: 'admin-group' }, [el('legend', { textContent: labelText })]);
        value.forEach((item, index) => {
          const tools = el('div', { className: 'admin-tools' });
          const tool = (text, label, action) => { const b = el('button', { type: 'button', className: 'admin-mini', textContent: text }); b.setAttribute('aria-label', label); b.addEventListener('click', () => { action(); touch(); draw(); }); tools.append(b); };
          if (index > 0) tool('↑', 'Monter', () => value.splice(index - 1, 0, value.splice(index, 1)[0]));
          if (index < value.length - 1) tool('↓', 'Descendre', () => value.splice(index + 1, 0, value.splice(index, 1)[0]));
          tool('Supprimer', 'Supprimer cet élément', () => value.splice(index, 1));
          if (item && typeof item === 'object') {
            const details = el('details', { className: 'admin-item' }, [el('summary', { textContent: itemTitle(item, index) })]);
            Object.keys(item).filter(k => !HIDDEN.has(k)).forEach(k => details.append(build(item, k, FIELD_LABELS[k] || k)));
            details.append(tools); box.append(details);
          } else box.append(el('div', { className: 'admin-inline' }, [build(value, index, `${labelText} ${index + 1}`), tools]));
        });
        if (value.length) {
          const add = el('button', { type: 'button', className: 'admin-mini', textContent: '+ Ajouter' });
          add.addEventListener('click', () => { value.push(blank(value[0])); touch(); draw(); });
          box.append(add);
        }
        return box;
      }
      if (value && typeof value === 'object') {
        const box = el('fieldset', { className: 'admin-group' }, [el('legend', { textContent: labelText })]);
        Object.keys(value).filter(k => !HIDDEN.has(k)).forEach(k => box.append(build(value, k, FIELD_LABELS[k] || k)));
        return box;
      }
      const label = el('label', { className: 'admin-field' }, [el('span', { textContent: labelText })]);
      let input;
      if (typeof value === 'boolean') {
        input = el('input', { type: 'checkbox', checked: value }); label.classList.add('admin-field--check');
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
      label.append(input);
      return label;
    };

    const draw = () => {
      const open = [...form.querySelectorAll('details')].map(d => d.open);
      form.replaceChildren(build(model, 'data', LABELS[key] || key));
      [...form.querySelectorAll('details')].forEach((d, i) => { if (open[i]) d.open = true; });
    };
    draw();

    const save = el('button', { type: 'button', className: 'admin-button', textContent: 'Enregistrer le brouillon' });
    save.addEventListener('click', async () => {
      save.disabled = true; say('Enregistrement…');
      const { error: saveError } = await client.from('content_drafts').update({ data: model.data }).eq('key', key);
      save.disabled = false;
      if (saveError) return say(`Enregistrement impossible : ${saveError.message}`, 'error');
      dirty = false; say('Brouillon enregistré.', 'ok');
    });
    const back = el('button', { type: 'button', className: 'admin-button admin-button--ghost', textContent: '← Retour' });
    back.addEventListener('click', () => {
      if (dirty && back.dataset.armed !== '1') { back.dataset.armed = '1'; back.textContent = 'Quitter sans enregistrer'; return say('Des modifications ne sont pas enregistrées. Clique encore pour quitter.', 'warn'); }
      showDashboard(email);
    });
    render(el('div', { className: 'admin-row admin-row--sticky' }, [back, save]), form);
  };

  const showLogin = () => {
    const button = el('button', { type: 'button', className: 'admin-button', textContent: 'Se connecter avec Google' });
    button.addEventListener('click', async () => {
      button.disabled = true;
      const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${location.origin}/admin/` } });
      if (error) { say(`Connexion impossible : ${error.message}`, 'error'); button.disabled = false; }
    });
    render(el('p', { textContent: 'Espace réservé à l’administrateur du site.' }), button);
  };

  const logoutButton = () => {
    const button = el('button', { type: 'button', className: 'admin-button admin-button--ghost', textContent: 'Se déconnecter' });
    button.addEventListener('click', () => client.auth.signOut());
    return button;
  };

  const showDenied = email => render(
    el('p', { textContent: `Le compte ${email} n’a pas les droits d’administration.` }),
    logoutButton()
  );

  async function showDashboard(email) {
    const [drafts, snapshots] = await Promise.all([
      client.from('content_drafts').select('key,updated_at').order('key'),
      client.from('content_snapshots').select('id,created_at,note').order('id', { ascending: false }).limit(5)
    ]);
    const error = drafts.error || snapshots.error;
    const draftRows = drafts.data || [], snapshotRows = snapshots.data || [];

    const draftList = el('ul', { className: 'admin-list' }, draftRows.length
      ? draftRows.map(row => {
          const edit = el('button', { type: 'button', className: 'admin-mini', textContent: 'Modifier' });
          edit.setAttribute('aria-label', `Modifier ${LABELS[row.key] || row.key}`);
          edit.addEventListener('click', () => showEditor(email, row.key));
          return el('li', {}, [el('strong', { textContent: LABELS[row.key] || row.key }), el('span', { textContent: `modifié le ${date(row.updated_at)}` }), edit]);
        })
      : [el('li', { textContent: 'Aucun brouillon pour l’instant. Importe le contenu actuel du site pour commencer.' })]);

    const importButton = el('button', { type: 'button', className: 'admin-button', textContent: draftRows.length ? 'Réimporter le contenu actuel du site' : 'Importer le contenu actuel du site' });
    importButton.addEventListener('click', async () => {
      if (draftRows.length && importButton.dataset.armed !== '1') {
        importButton.dataset.armed = '1';
        importButton.textContent = 'Confirmer : remplacer les brouillons';
        say('Attention : les brouillons existants seront remplacés. Clique une deuxième fois pour confirmer.', 'warn');
        return;
      }
      importButton.disabled = true; say('Import en cours…');
      try {
        const seed = await (await fetch('/admin/seed.json', { cache: 'no-store' })).json();
        const rows = Object.entries(seed).map(([key, data]) => ({ key, data }));
        const { error: upsertError } = await client.from('content_drafts').upsert(rows);
        if (upsertError) throw upsertError;
        await showDashboard(email); say(`${rows.length} blocs importés dans les brouillons.`, 'ok');
      } catch (err) { say(`Import impossible : ${err.message}`, 'error'); importButton.disabled = false; }
    });

    const note = el('input', { type: 'text', maxLength: 200, placeholder: 'Note (facultatif) : ce qui change', className: 'admin-input' });
    note.setAttribute('aria-label', 'Note de version');
    const publishButton = el('button', { type: 'button', className: 'admin-button', textContent: 'Enregistrer une version', disabled: !draftRows.length });
    publishButton.addEventListener('click', async () => {
      publishButton.disabled = true; say('Enregistrement…');
      const { data, error: publishError } = await client.rpc('publish_snapshot', { p_note: note.value || null });
      if (publishError) { say(`Enregistrement impossible : ${publishError.message}`, 'error'); publishButton.disabled = false; return; }
      await showDashboard(email); say(`Version n° ${data} enregistrée.`, 'ok');
    });

    const snapshotList = el('ul', { className: 'admin-list' }, snapshotRows.length
      ? snapshotRows.map(row => el('li', {}, [el('strong', { textContent: `Version n° ${row.id}` }), el('span', { textContent: `${date(row.created_at)}${row.note ? ` — ${row.note}` : ''}` })]))
      : [el('li', { textContent: 'Aucune version enregistrée.' })]);

    render(
      el('p', { className: 'admin-who' }, [el('span', { textContent: `Connecté : ${email} · administrateur ` }), logoutButton()]),
      el('h2', { textContent: 'Brouillons' }), draftList, importButton,
      el('h2', { textContent: 'Versions' }),
      el('p', { textContent: 'Une version fige les brouillons. La mise en ligne automatique sur le site arrivera à l’étape suivante.' }),
      el('div', { className: 'admin-row' }, [note, publishButton]), snapshotList
    );
    if (error) say(`Lecture impossible : ${error.message}`, 'error'); else say('');
  }

  let current = null;
  const route = async session => {
    const id = session?.user?.id || '';
    if (id === current) return;
    current = id;
    if (!session) return showLogin();
    render(el('p', { textContent: 'Vérification des droits…' }));
    const { data, error } = await client.rpc('is_admin');
    if (error) { render(logoutButton()); return say(`Vérification impossible : ${error.message}`, 'error'); }
    return data === true ? showDashboard(session.user.email) : showDenied(session.user.email);
  };
  // setTimeout : ne jamais appeler Supabase directement dans le rappel d'authentification (risque de blocage).
  client.auth.onAuthStateChange((_event, session) => setTimeout(() => route(session), 0));
})();
