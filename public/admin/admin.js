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

  const showDashboard = async email => {
    const [drafts, snapshots] = await Promise.all([
      client.from('content_drafts').select('key,updated_at').order('key'),
      client.from('content_snapshots').select('id,created_at,note').order('id', { ascending: false }).limit(5)
    ]);
    const error = drafts.error || snapshots.error;
    const draftRows = drafts.data || [], snapshotRows = snapshots.data || [];

    const draftList = el('ul', { className: 'admin-list' }, draftRows.length
      ? draftRows.map(row => el('li', {}, [el('strong', { textContent: LABELS[row.key] || row.key }), el('span', { textContent: `modifié le ${date(row.updated_at)}` })]))
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
    if (error) say(`Lecture impossible : ${error.message}`, 'error');
  };

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
