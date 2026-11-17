// Cockpit d'activité Nolan Arc : pilotage, demandes, clients, devis et factures, agenda, finances, réglages.
// Toutes les données restent dans Supabase, lisibles et modifiables par l'administrateur seul (RLS, voir
// supabase/cockpit_schema.sql). Aucun HTML n'est injecté : tout passe par textContent.
window.NolanCockpit = ({ client, root, el, button, link, say, heading, card, go }) => {
  // ------------------------------------------------------------ Repères réglementaires (à revoir chaque 1er janvier)
  // Plafond micro et seuils de franchise TVA « prestations de services » applicables en 2026 ; taux URSSAF au 1er janvier 2026.
  // Sources : service-public.gouv.fr (F36232, vérifié le 1er janvier 2026) et legifiscal.fr (seuils 2026).
  const RULES = { year: 2026, plafond: 83600, tvaBase: 37500, tvaMajore: 41250 };
  const ACTIVITES = {
    bic: { label: 'Prestations de services artisanales ou commerciales (BIC)', taux: 21.2 },
    bnc: { label: 'Profession libérale non réglementée (BNC)', taux: 25.6 }
  };
  const DEFAULTS = { objectifAnnuel: 30000, activite: 'bic', periodicite: 'trimestrielle', acompte: 40, delaiPaiement: 30, validiteDevis: 30, delaiRelanceDevis: 7, adresseFacturation: '', telephoneFacturation: '', iban: '' };
  const STAGES = [
    ['nouveau', 'Nouvelle demande', 0.1], ['qualifie', 'Qualifiée', 0.25], ['devis', 'Devis envoyé', 0.5], ['signe', 'Signé', 1],
    ['production', 'En production', 1], ['livre', 'Livré', 1], ['paye', 'Payé', 1], ['perdu', 'Perdu', 0]
  ];
  const STAGE = Object.fromEntries(STAGES.map(([id, label, p]) => [id, { label, p }]));
  const DOC_STATUS = { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé', signe: 'Signé', paye: 'Payé', annule: 'Annulé' };
  const DOC_KINDS = { devis: 'Devis', contrat: 'Contrats', facture: 'Factures pro forma', droit_image: 'Droits à l’image', retractation: 'Rétractations' };
  const DOC_ONE = { devis: 'Devis', contrat: 'Contrat', facture: 'Facture pro forma', droit_image: 'Droit à l’image', retractation: 'Rétractation' };
  const EVENT_KINDS = { tournage: 'Tournage', livraison: 'Livraison', 'rendez-vous': 'Rendez-vous', autre: 'Autre' };
  const SOURCES = ['Site (formulaire)', 'Instagram', 'Bouche-à-oreille', 'Recommandation client', 'Salon ou événement', 'Autre'];
  const PAY_METHODS = ['Virement', 'Espèces', 'Chèque', 'Carte', 'Autre'];
  let OFFERS = [];
  try { OFFERS = JSON.parse(root.dataset.offers || '[]'); } catch { OFFERS = []; }
  const offerLabel = key => OFFERS.find(o => o.key === key)?.label || key || '';

  const S = { contacts: [], deals: [], docs: [], events: [], settings: { ...DEFAULTS }, missing: false, error: '', focus: null, filter: '', docTab: 'tous', showLost: false, year: new Date().getFullYear() };

  // ------------------------------------------------------------ Outils
  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const money = n => euro.format(Number(n) || 0);
  const iso = d => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const today = () => iso(new Date());
  const addDays = (day, n) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() + Number(n || 0)); return iso(d); };
  const longDate = day => day ? new Date(`${String(day).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const shortDate = day => day ? new Date(`${String(day).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  const contactOf = id => S.contacts.find(c => c.id === id);
  const dealOf = id => S.deals.find(d => d.id === id);
  const rate = () => ACTIVITES[S.settings.activite]?.taux ?? ACTIVITES.bic.taux;
  const sum = (list, f) => list.reduce((t, x) => t + (Number(f(x)) || 0), 0);
  const invoices = () => S.docs.filter(d => d.kind === 'facture' && d.status !== 'annule');
  const cashed = d => Number(d.paid_amount) || (d.status === 'paye' ? Number(d.total) || 0 : 0);
  const paidIn = prefix => invoices().filter(d => d.paid_at && String(d.paid_at).startsWith(prefix));
  const open = (view, id) => { S.focus = id ?? null; go(view); };
  const pill = (text, kind = '') => el('span', { className: `ck-pill ${kind ? `ck-pill--${kind}` : ''}`, textContent: text });
  const bar = (value, max, label) => {
    const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0;
    const node = el('div', { className: `ck-progress${pct >= 100 ? ' is-over' : pct >= 80 ? ' is-near' : ''}` }, [el('span', { style: `width:${pct}%` })]);
    node.setAttribute('role', 'progressbar'); node.setAttribute('aria-valuenow', String(pct)); node.setAttribute('aria-valuemin', '0'); node.setAttribute('aria-valuemax', '100'); node.setAttribute('aria-label', label);
    return node;
  };
  const csvCell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const download = (name, text, type = 'text/csv;charset=utf-8') => {
    const url = URL.createObjectURL(new Blob(['﻿', text], { type }));
    const a = el('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Formulaire simple : [{ name, label, type, options, required, full, hint }]
  const form = (defs, values = {}) => {
    const inputs = {};
    const node = el('div', { className: 'ck-form' });
    defs.forEach(def => {
      const value = values[def.name] ?? def.value ?? '';
      let input;
      if (def.type === 'select') {
        input = el('select', { className: 'admin-input' });
        (def.options || []).forEach(([v, l]) => input.append(el('option', { value: v, textContent: l, selected: String(v) === String(value) })));
      } else if (def.type === 'textarea') {
        input = el('textarea', { className: 'admin-input admin-input--area', rows: def.rows || 4, value: String(value ?? '') });
      } else if (def.type === 'checkbox') {
        input = el('input', { type: 'checkbox', checked: Boolean(value) });
      } else {
        input = el('input', { type: def.type || 'text', className: 'admin-input', value: value == null ? '' : String(value) });
        if (def.type === 'number') { input.step = def.step || 'any'; input.min = def.min ?? '0'; input.inputMode = 'decimal'; }
      }
      if (def.required) input.required = true;
      if (def.placeholder) input.placeholder = def.placeholder;
      inputs[def.name] = input;
      const field = el('label', { className: `admin-field${def.full ? ' ck-full' : ''}${def.type === 'checkbox' ? ' admin-field--check' : ''}` }, [el('span', { textContent: def.label }), input, def.hint ? el('small', { className: 'ck-hint', textContent: def.hint }) : null]);
      node.append(field);
    });
    const read = () => Object.fromEntries(Object.entries(inputs).map(([k, input]) => {
      const def = defs.find(d => d.name === k);
      if (def.type === 'checkbox') return [k, input.checked];
      if (def.type === 'number') return [k, input.value === '' ? null : Number(input.value)];
      return [k, input.value.trim() === '' ? null : input.value.trim()];
    }));
    return { node, inputs, read };
  };
  const save = async (table, row, id) => {
    const query = id ? client.from(table).update(row).eq('id', id).select().single() : client.from(table).insert(row).select().single();
    const { data, error } = await query;
    if (error) { say(`Enregistrement impossible : ${error.message}`, 'error'); return null; }
    await load();
    return data;
  };
  const remove = async (table, id) => {
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) { say(error.message, 'error'); return false; }
    await load(); return true;
  };
  const armed = (text, confirmText, action) => {
    const b = button(text, 'admin-mini ck-danger', async () => {
      if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = confirmText; return; }
      b.disabled = true; await action();
    });
    return b;
  };
  const contactOptions = () => [['', 'Aucun contact'], ...S.contacts.map(c => [c.id, c.company ? `${c.name} (${c.company})` : c.name])];
  const dealOptions = () => [['', 'Aucun projet'], ...S.deals.map(d => [d.id, d.title])];

  // ------------------------------------------------------------ Données
  const load = async () => {
    const res = await Promise.all([
      client.from('crm_contacts').select('*').order('name'),
      client.from('crm_deals').select('*').order('created_at', { ascending: false }),
      client.from('crm_documents').select('*').order('issue_date', { ascending: false }),
      client.from('crm_events').select('*').order('starts_at'),
      client.from('crm_settings').select('data').eq('key', 'cockpit').maybeSingle(),
      client.from('crm_documents').select('template').limit(1)
    ]);
    // La 6e requête vérifie seulement que documents_schema.sql a été exécuté (colonne « template »).
    S.needsDocs = Boolean(res[5].error);
    const error = res.slice(0, 5).find(r => r.error)?.error;
    if (error) {
      S.missing = /does not exist|schema cache|PGRST20|42P01/i.test(`${error.code} ${error.message}`);
      S.error = error.message; return;
    }
    S.missing = false; S.error = '';
    [S.contacts, S.deals, S.docs, S.events] = res.slice(0, 4).map(r => r.data || []);
    S.settings = { ...DEFAULTS, ...(res[4].data?.data || {}) };
  };

  // ------------------------------------------------------------ Calculs
  const period = () => {
    const t = today(); const y = Number(t.slice(0, 4)); const list = [];
    for (const year of [y - 1, y]) {
      if (S.settings.periodicite === 'mensuelle') for (let m = 0; m < 12; m++) {
        const start = iso(new Date(year, m, 1)), end = iso(new Date(year, m + 1, 0)), due = iso(new Date(year, m + 2, 0));
        list.push({ label: new Date(year, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), start, end, due });
      } else for (let q = 0; q < 4; q++) {
        const start = iso(new Date(year, q * 3, 1)), end = iso(new Date(year, q * 3 + 3, 0)), due = iso(new Date(year, q * 3 + 4, 0));
        list.push({ label: `${['Janvier à mars', 'Avril à juin', 'Juillet à septembre', 'Octobre à décembre'][q]} ${year}`, start, end, due });
      }
    }
    return list.map(p => {
      const ca = sum(invoices().filter(d => d.paid_at && d.paid_at >= p.start && d.paid_at <= p.end), cashed);
      return { ...p, ca, cotisations: Math.round(ca * rate()) / 100 };
    });
  };
  const nextDeclaration = () => period().filter(p => p.due >= today()).sort((a, b) => a.due.localeCompare(b.due))[0];
  const metrics = () => {
    const t = today(), year = t.slice(0, 4), month = t.slice(0, 7);
    const caYear = sum(paidIn(year), cashed), caMonth = sum(paidIn(month), cashed);
    const unpaid = invoices().filter(d => d.status === 'envoye');
    const due = sum(unpaid, d => (Number(d.total) || 0) - (Number(d.paid_amount) || 0));
    const late = unpaid.filter(d => d.due_date && d.due_date < t);
    const active = S.deals.filter(d => ['nouveau', 'qualifie', 'devis'].includes(d.stage));
    const weighted = sum(active, d => (Number(d.amount) || 0) * STAGE[d.stage].p);
    const signed = S.deals.filter(d => ['signe', 'production', 'livre'].includes(d.stage));
    const toInvoice = sum(signed, d => Math.max(0, (Number(d.amount) || 0) - sum(invoices().filter(i => i.deal_id === d.id), i => i.total)));
    const dayOfYear = (new Date(`${t}T12:00:00`) - new Date(Number(year), 0, 1)) / 864e5 + 1;
    const projection = dayOfYear > 30 ? Math.round(caYear / dayOfYear * 365) : null;
    return { caYear, caMonth, due, late, active, weighted, toInvoice, projection };
  };
  const followUps = () => {
    const t = today(), items = [];
    S.deals.filter(d => !['paye', 'perdu'].includes(d.stage)).forEach(d => {
      const who = contactOf(d.contact_id)?.name || d.title;
      if (d.next_action_date && d.next_action_date <= t) items.push({ when: d.next_action_date, text: `${d.next_action || 'Action prévue'} : ${who}`, late: d.next_action_date < t, go: () => open('deal', d.id) });
      else if (d.stage === 'nouveau' && !d.next_action && iso(d.created_at) <= addDays(t, -1)) items.push({ when: iso(d.created_at), text: `Répondre à la demande : ${who}`, late: iso(d.created_at) <= addDays(t, -2), go: () => open('deal', d.id) });
    });
    S.docs.filter(d => d.kind === 'devis' && d.status === 'envoye' && d.issue_date <= addDays(t, -S.settings.delaiRelanceDevis)).forEach(d => items.push({ when: d.issue_date, text: `Relancer le devis ${d.number} : ${contactOf(d.contact_id)?.name || ''}`, late: true, go: () => open('doc', d.id) }));
    invoices().filter(d => d.status === 'envoye' && d.due_date && d.due_date < t).forEach(d => items.push({ when: d.due_date, text: `Facture ${d.number} en retard : ${money(d.total - (d.paid_amount || 0))}`, late: true, go: () => open('doc', d.id) }));
    S.deals.filter(d => ['signe', 'production'].includes(d.stage) && d.event_date && d.event_date >= t && !S.events.some(e => e.deal_id === d.id)).forEach(d => items.push({ when: d.event_date, text: `Planifier dans l’agenda : ${d.title} (${shortDate(d.event_date)})`, late: false, go: () => open('event', { deal: d.id }) }));
    return items.sort((a, b) => a.when.localeCompare(b.when));
  };
  const upcoming = (days = 30) => {
    const t = today(), limit = addDays(t, days);
    return S.events.filter(e => !e.done && iso(e.starts_at) >= t && iso(e.starts_at) <= limit);
  };

  // ------------------------------------------------------------ Mise en place
  const setup = () => el('div', {}, [
    heading('Cockpit à activer', 'Les tables du cockpit n’existent pas encore dans Supabase. Cinq minutes, une seule fois.'),
    card('Mise en place', [
      el('ol', { className: 'ck-steps' }, [
        el('li', {}, [el('span', { textContent: 'Ouvre le fichier ' }), link('cockpit_schema.sql sur GitHub ↗', 'https://github.com/Almorder/PORTFOLIO_3D/blob/main/supabase/cockpit_schema.sql'), el('span', { textContent: ', clique sur l’icône « Copy raw file » en haut à droite du code.' })]),
        el('li', { textContent: 'Dans Supabase : ton projet > SQL Editor (menu de gauche) > New query.' }),
        el('li', { textContent: 'Colle le texte, puis clique sur Run (en bas à droite). Le message « Success. No rows returned » confirme.' }),
        el('li', { textContent: 'Reviens ici et recharge la page.' })
      ]),
      S.error ? el('p', { className: 'ck-hint', textContent: `Détail technique : ${S.error}` }) : null
    ], 'admin-card--wide')
  ]);
  const guard = view => (...args) => S.missing ? setup() : view(...args);

  // ------------------------------------------------------------ Vues
  const V = {};

  V.pilotage = guard(() => {
    const m = metrics(), s = S.settings, todo = followUps(), next = nextDeclaration();
    const stat = (value, label, sub, target) => {
      const node = button('', 'admin-stat', () => go(target), `${label} : ${value}`);
      node.append(el('strong', { textContent: value }), el('span', { textContent: label }), sub ? el('small', { className: 'ck-stat-sub', textContent: sub }) : null);
      return node;
    };
    const todoCard = card('À faire maintenant', todo.length
      ? [el('ul', { className: 'ck-list' }, todo.slice(0, 8).map(item => el('li', { className: item.late ? 'is-late' : '' }, [button(item.text, 'ck-link', item.go), el('time', { textContent: shortDate(item.when) })])))]
      : [el('p', { className: 'admin-ok', textContent: 'Rien en attente. Tout est à jour.' })]);
    const agenda = upcoming(30);
    const agendaCard = card('30 prochains jours', agenda.length
      ? [el('ul', { className: 'ck-list' }, agenda.slice(0, 6).map(e => el('li', {}, [button(`${EVENT_KINDS[e.kind]} : ${e.title}`, 'ck-link', () => open('event', e.id)), el('time', { textContent: shortDate(e.starts_at) })])))]
      : [el('p', { className: 'admin-ok', textContent: 'Aucun tournage ni livraison prévu.' }), button('Ajouter un événement', 'admin-mini', () => open('event', null))]);
    const goal = Number(s.objectifAnnuel) || 0;
    const goalCard = card(`Objectif ${new Date().getFullYear()}`, [
      el('p', { className: 'ck-big', textContent: `${money(m.caYear)} sur ${money(goal)}` }), bar(m.caYear, goal, 'Avancement de l’objectif annuel'),
      el('p', { textContent: m.caYear >= goal ? 'Objectif atteint.' : `Reste ${money(goal - m.caYear)}.${m.projection ? ` Au rythme actuel : ${money(m.projection)} sur l’année.` : ''}` }),
      m.toInvoice ? el('p', { className: 'ck-hint', textContent: `Déjà signé et pas encore facturé : ${money(m.toInvoice)}.` }) : null
    ]);
    const plafondPct = m.caYear / RULES.plafond;
    const seuilCard = card('Seuils micro-entreprise', [
      el('p', { textContent: `Franchise de TVA : ${money(m.caYear)} sur ${money(RULES.tvaBase)}` }), bar(m.caYear, RULES.tvaBase, 'Seuil de franchise de TVA'),
      el('p', { textContent: `Plafond micro : ${money(m.caYear)} sur ${money(RULES.plafond)}` }), bar(m.caYear, RULES.plafond, 'Plafond du régime micro'),
      el('p', { className: m.caYear > RULES.tvaMajore ? 'admin-alert' : m.caYear > RULES.tvaBase ? 'admin-alert' : 'ck-hint', textContent:
        m.caYear > RULES.tvaMajore ? `Seuil majoré de ${money(RULES.tvaMajore)} dépassé : la TVA est due dès le jour du dépassement. Appelle ton comptable ou le service des impôts des entreprises.`
        : m.caYear > RULES.tvaBase ? `Seuil de ${money(RULES.tvaBase)} dépassé : la franchise s’arrête au 1er janvier prochain, sauf si tu dépasses ${money(RULES.tvaMajore)} avant (TVA due immédiatement).`
        : plafondPct > 0.8 ? 'Tu approches du plafond micro : fais le point avec un comptable.' : `Repères ${RULES.year} pour les prestations de services, à vérifier chaque année.` })
    ]);
    const urssafCard = card('Prochaine déclaration URSSAF', next ? [
      el('p', { className: 'ck-big', textContent: money(next.cotisations) }),
      el('p', { textContent: `${next.label} : ${money(next.ca)} encaissés, au taux de ${String(rate()).replace('.', ',')} %. À déclarer et payer avant le ${longDate(next.due)}.` }),
      el('p', { className: 'ck-hint', textContent: 'Estimation : seul le montant déclaré sur autoentrepreneur.urssaf.fr fait foi.' }),
      link('Déclarer sur autoentrepreneur.urssaf.fr ↗', 'https://www.autoentrepreneur.urssaf.fr/')
    ] : [el('p', { textContent: 'Aucune période à venir.' })]);
    const pipeCard = card('Pipeline', [
      el('ul', { className: 'ck-pipe' }, STAGES.filter(([id]) => !['paye', 'perdu'].includes(id)).map(([id, label]) => {
        const list = S.deals.filter(d => d.stage === id);
        return el('li', {}, [el('span', { textContent: label }), el('strong', { textContent: String(list.length) }), el('small', { textContent: money(sum(list, d => d.amount)) })]);
      })),
      button('Ouvrir les demandes', 'admin-mini', () => go('demandes'))
    ], 'admin-card--wide');
    const shortcuts = card('Raccourcis', [el('ul', { className: 'admin-links' }, [
      ['Statistiques de visite', 'https://dash.cloudflare.com/?to=/:account/web-analytics'],
      ['Demandes reçues (Gmail)', 'https://mail.google.com/mail/#search/formsubmit'],
      ['Rendez-vous (Calendly)', 'https://calendly.com/app/scheduled_events/user/me'],
      ['Déclaration URSSAF', 'https://www.autoentrepreneur.urssaf.fr/'],
      ['Annuaire des Entreprises (ta fiche)', 'https://annuaire-entreprises.data.gouv.fr/entreprise/987648664']
    ].map(([text, href]) => el('li', {}, [link(`${text} ↗`, href)])))]);
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Pilotage', new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })), el('div', { className: 'admin-row' }, [button('+ Demande', 'admin-mini', () => open('deal', null)), button('+ Facture', 'admin-button', () => open('doc', { kind: 'facture' }))])]),
      el('div', { className: 'admin-stats' }, [
        stat(money(m.caYear), `encaissés en ${new Date().getFullYear()}`, `dont ${money(m.caMonth)} ce mois-ci`, 'finances'),
        stat(money(m.due), 'à encaisser', m.late.length ? `${m.late.length} facture(s) en retard` : 'aucun retard', 'documents'),
        stat(money(m.weighted), 'pipeline pondéré', `${m.active.length} demande(s) en cours`, 'demandes'),
        stat(String(todo.length), 'actions à faire', todo.filter(t => t.late).length ? `${todo.filter(t => t.late).length} en retard` : 'aucune en retard', 'pilotage')
      ]),
      el('div', { className: 'admin-grid' }, [todoCard, agendaCard, goalCard, urssafCard, seuilCard, shortcuts, pipeCard])
    ]);
  });

  // Demandes (pipeline)
  V.demandes = guard(() => {
    const stages = STAGES.filter(([id]) => S.showLost || id !== 'perdu');
    const t = today();
    const board = el('div', { className: 'ck-board' }, stages.map(([id, label]) => {
      const list = S.deals.filter(d => d.stage === id);
      return el('section', { className: 'ck-col' }, [
        el('header', {}, [el('h3', { textContent: label }), el('span', { textContent: `${list.length} · ${money(sum(list, d => d.amount))}` })]),
        ...list.map(d => {
          const contact = contactOf(d.contact_id);
          const move = el('select', { className: 'ck-move' });
          move.setAttribute('aria-label', `Étape de ${d.title}`);
          STAGES.forEach(([sid, sl]) => move.append(el('option', { value: sid, textContent: sl, selected: sid === d.stage })));
          move.addEventListener('change', async () => { move.disabled = true; if (await save('crm_deals', { stage: move.value }, d.id)) { say(`« ${d.title} » : ${STAGE[move.value].label}.`, 'ok'); go('demandes'); } });
          const late = d.next_action_date && d.next_action_date < t;
          return el('article', { className: `ck-card${late ? ' is-late' : ''}` }, [
            button(d.title, 'ck-card__title', () => open('deal', d.id)),
            el('p', { textContent: [contact?.name, offerLabel(d.offer)].filter(Boolean).join(' · ') }),
            el('p', { className: 'ck-card__meta' }, [el('strong', { textContent: money(d.amount) }), d.event_date ? el('span', { textContent: `Date : ${shortDate(d.event_date)}` }) : null]),
            d.next_action ? el('p', { className: 'ck-card__next', textContent: `${d.next_action}${d.next_action_date ? ` (${shortDate(d.next_action_date)})` : ''}` }) : null,
            move
          ]);
        })
      ]);
    }));
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Demandes', 'Chaque demande avance d’une colonne à l’autre jusqu’au paiement. Change l’étape depuis la carte.'),
        el('div', { className: 'admin-row' }, [button(S.showLost ? 'Masquer les perdues' : 'Voir les perdues', 'admin-mini', () => { S.showLost = !S.showLost; go('demandes'); }), button('+ Nouvelle demande', 'admin-button', () => open('deal', null))])]),
      board
    ]);
  });

  // Lecture d'un email de demande (FormSubmit ou message libre) pour préremplir la fiche.
  const parseRequest = text => {
    const out = {};
    const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const pick = (re) => { for (const l of lines) { const m = l.match(re); if (m && m[1]?.trim()) return m[1].trim(); } return ''; };
    out.email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [''])[0];
    out.name = pick(/^(?:nom|name|prénom et nom)\s*[:\t|]\s*(.+)$/i);
    out.company = pick(/^(?:entreprise|société|company|marque)\s*[:\t|]\s*(.+)$/i);
    out.phone = pick(/^(?:téléphone|telephone|tél|tel|phone)\s*[:\t|]\s*(.+)$/i) || (text.match(/(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/) || [''])[0];
    const offer = pick(/^(?:offre|offer)\s*[:\t|]\s*(.+)$/i);
    out.offer = OFFERS.find(o => o.key === offer || o.label.toLowerCase() === offer.toLowerCase())?.key || '';
    out.budget = pick(/^(?:budget)\s*[:\t|]\s*(.+)$/i);
    out.message = pick(/^(?:message|projet|description)\s*[:\t|]\s*(.+)$/i);
    out.intent = pick(/^(?:intent|catégorie|categorie|sujet|_subject)\s*[:\t|]\s*(.+)$/i);
    const amount = Number(String(out.budget).replace(/[^\d,.]/g, '').replace(',', '.'));
    out.amount = Number.isFinite(amount) && amount > 0 ? amount : (OFFERS.find(o => o.key === out.offer)?.from || 0);
    return out;
  };

  V.deal = guard(() => {
    const deal = S.focus ? dealOf(S.focus) : null;
    const contact = deal ? contactOf(deal.contact_id) : null;
    const t = today();
    const dealForm = form([
      { name: 'title', label: 'Projet', required: true, full: true, placeholder: 'Ex. Mariage de Léa et Sam, juin' },
      { name: 'offer', label: 'Offre', type: 'select', options: [['', 'Non précisé'], ...OFFERS.map(o => [o.key, o.label])] },
      { name: 'stage', label: 'Étape', type: 'select', options: STAGES.map(([id, l]) => [id, l]) },
      { name: 'amount', label: 'Montant estimé ou signé (€)', type: 'number' },
      { name: 'event_date', label: 'Date du tournage ou de l’événement', type: 'date' },
      { name: 'next_action', label: 'Prochaine action', placeholder: 'Ex. Envoyer le devis' },
      { name: 'next_action_date', label: 'Pour le', type: 'date' },
      { name: 'lost_reason', label: 'Si perdue : pourquoi ?', full: true },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true, rows: 6 }
    ], deal || { stage: 'nouveau', next_action: 'Répondre', next_action_date: t });
    const contactPick = form([{ name: 'contact_id', label: 'Contact existant', type: 'select', options: contactOptions(), full: true }], { contact_id: deal?.contact_id || '' });
    const newContact = form([
      { name: 'name', label: 'Nom' }, { name: 'company', label: 'Entreprise' },
      { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Téléphone', type: 'tel' },
      { name: 'source', label: 'Source', type: 'select', options: [['', 'Non précisée'], ...SOURCES.map(s => [s, s])] }
    ], { source: 'Site (formulaire)' });
    const paste = el('textarea', { className: 'admin-input admin-input--area', rows: 5, placeholder: 'Colle ici l’email reçu (FormSubmit ou message libre) : nom, email, offre et message sont repérés automatiquement.' });
    paste.setAttribute('aria-label', 'Email de demande à analyser');
    const fill = button('Remplir la fiche', 'admin-mini', () => {
      const r = parseRequest(paste.value);
      if (r.name) newContact.inputs.name.value = r.name;
      if (r.email) newContact.inputs.email.value = r.email;
      if (r.phone) newContact.inputs.phone.value = r.phone;
      if (r.company) newContact.inputs.company.value = r.company;
      if (r.offer) dealForm.inputs.offer.value = r.offer;
      if (r.amount) dealForm.inputs.amount.value = String(r.amount);
      if (!dealForm.inputs.title.value) dealForm.inputs.title.value = [offerLabel(r.offer) || r.intent || 'Demande', r.name || r.company].filter(Boolean).join(' : ');
      if (r.message) dealForm.inputs.notes.value = [dealForm.inputs.notes.value, `Message : ${r.message}`, r.budget ? `Budget indiqué : ${r.budget}` : ''].filter(Boolean).join('\n');
      const known = r.email && S.contacts.find(c => (c.email || '').toLowerCase() === r.email.toLowerCase());
      if (known) contactPick.inputs.contact_id.value = known.id;
      say(known ? `Contact déjà connu : ${known.name}. Fiche préremplie.` : 'Fiche préremplie : vérifie puis enregistre.', 'ok');
    });
    const submit = button(deal ? 'Enregistrer' : 'Créer la demande', 'admin-button', async () => {
      const row = dealForm.read();
      if (!row.title) return say('Donne un nom au projet.', 'warn');
      submit.disabled = true;
      let contactId = contactPick.read().contact_id;
      const c = newContact.read();
      if (!contactId && c.name) { const created = await save('crm_contacts', c); if (!created) { submit.disabled = false; return; } contactId = created.id; }
      row.contact_id = contactId || null; row.amount = row.amount || 0;
      const saved = await save('crm_deals', row, deal?.id);
      submit.disabled = false;
      if (saved) { say(deal ? 'Demande enregistrée.' : 'Demande créée.', 'ok'); open('deal', saved.id); }
    });
    const linkedDocs = deal ? S.docs.filter(d => d.deal_id === deal.id) : [];
    const linkedEvents = deal ? S.events.filter(e => e.deal_id === deal.id) : [];
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading(deal ? deal.title : 'Nouvelle demande', deal ? `${STAGE[deal.stage].label}${contact ? ` · ${contact.name}` : ''}` : 'Saisis la demande, ou colle l’email reçu pour remplir la fiche.'), el('div', { className: 'admin-row' }, [button('← Demandes', 'admin-mini', () => go('demandes')), submit])]),
      el('div', { className: 'admin-grid' }, [
        deal ? null : card('Coller l’email reçu', [paste, fill], 'admin-card--wide'),
        card('Projet', [dealForm.node], 'admin-card--wide'),
        card('Contact', [contactPick.node, contact ? el('p', { className: 'ck-hint' }, [button(`Ouvrir la fiche de ${contact.name}`, 'ck-link', () => open('contact', contact.id))]) : null, el('details', { className: 'ck-details', open: !deal && !S.contacts.length }, [el('summary', { textContent: 'Ou créer un nouveau contact' }), newContact.node])], 'admin-card--wide'),
        deal ? card('Documents et agenda', [
          el('ul', { className: 'ck-list' }, [...linkedDocs.map(d => el('li', {}, [button(`${docName(d)}${['devis', 'facture'].includes(d.kind) ? ` : ${money(d.total)}` : ''}`, 'ck-link', () => open('doc', d.id)), pill(DOC_STATUS[d.status], d.status)])),
            ...linkedEvents.map(e => el('li', {}, [button(`${EVENT_KINDS[e.kind]} : ${e.title}`, 'ck-link', () => open('event', e.id)), el('time', { textContent: shortDate(e.starts_at) })]))]),
          el('div', { className: 'admin-row' }, [
            button('+ Devis', 'admin-mini', () => open('doc', { kind: 'devis', deal: deal.id })),
            button('+ Facture', 'admin-mini', () => open('doc', { kind: 'facture', deal: deal.id })),
            button('+ Contrat', 'admin-mini', () => open('doc', { kind: 'contrat', deal: deal.id })),
            button('+ Droit à l’image', 'admin-mini', () => open('doc', { kind: 'droit_image', deal: deal.id })),
            button('+ Agenda', 'admin-mini', () => open('event', { deal: deal.id })),
            button('Messages', 'admin-mini', () => open('messages', deal.id))
          ])
        ], 'admin-card--wide') : null,
        deal ? card('Supprimer', [el('p', { className: 'ck-hint', textContent: 'Les devis et factures liés restent enregistrés.' }), armed('Supprimer la demande', 'Confirmer la suppression', async () => { if (await remove('crm_deals', deal.id)) { say('Demande supprimée.', 'ok'); go('demandes'); } })]) : null
      ])
    ]);
  });

  // Clients
  V.clients = guard(() => {
    const search = el('input', { type: 'search', className: 'admin-input', placeholder: 'Rechercher un nom, une entreprise, un email', value: S.filter });
    search.setAttribute('aria-label', 'Rechercher un contact');
    const tbody = el('tbody');
    const render = () => {
      const q = search.value.trim().toLowerCase(); S.filter = search.value;
      const list = S.contacts.filter(c => !q || [c.name, c.company, c.email, c.phone].some(v => (v || '').toLowerCase().includes(q)));
      tbody.replaceChildren(...list.map(c => {
        const deals = S.deals.filter(d => d.contact_id === c.id);
        const ca = sum(invoices().filter(d => d.contact_id === c.id), cashed);
        return el('tr', {}, [
          el('th', { scope: 'row' }, [button(c.name, 'ck-link', () => open('contact', c.id)), c.company ? el('small', { textContent: c.company }) : null]),
          el('td', {}, [c.email ? el('a', { href: `mailto:${c.email}`, textContent: c.email }) : null]),
          el('td', {}, [c.phone ? el('a', { href: `tel:${c.phone.replace(/\s/g, '')}`, textContent: c.phone }) : null]),
          el('td', { textContent: String(deals.length) }),
          el('td', { textContent: money(ca) })
        ]);
      }));
      if (!list.length) tbody.append(el('tr', {}, [el('td', { colSpan: 5, textContent: S.contacts.length ? 'Aucun résultat.' : 'Aucun contact pour l’instant : ils se créent avec les demandes.' })]));
    };
    search.addEventListener('input', render); render();
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Clients', `${S.contacts.length} contact(s). Le chiffre encaissé vient des factures payées.`), button('+ Nouveau contact', 'admin-button', () => open('contact', null))]),
      search,
      el('div', { className: 'ck-table-wrap' }, [el('table', { className: 'ck-table' }, [el('thead', {}, [el('tr', {}, ['Nom', 'Email', 'Téléphone', 'Projets', 'Encaissé'].map(h => el('th', { scope: 'col', textContent: h })))]), tbody])])
    ]);
  });

  V.contact = guard(() => {
    const c = S.focus ? contactOf(S.focus) : null;
    const f = form([
      { name: 'name', label: 'Nom', required: true }, { name: 'company', label: 'Entreprise (vide pour un particulier)' },
      { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Téléphone', type: 'tel' },
      { name: 'address', label: 'Adresse (pour les factures)', type: 'textarea', rows: 2, full: true },
      { name: 'source', label: 'Source', type: 'select', options: [['', 'Non précisée'], ...SOURCES.map(s => [s, s])] },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true }
    ], c || {});
    const submit = button(c ? 'Enregistrer' : 'Créer le contact', 'admin-button', async () => {
      const row = f.read(); if (!row.name) return say('Le nom est obligatoire.', 'warn');
      submit.disabled = true; const saved = await save('crm_contacts', row, c?.id); submit.disabled = false;
      if (saved) { say('Contact enregistré.', 'ok'); open('contact', saved.id); }
    });
    const deals = c ? S.deals.filter(d => d.contact_id === c.id) : [];
    const docs = c ? S.docs.filter(d => d.contact_id === c.id) : [];
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading(c ? c.name : 'Nouveau contact', c?.company || ''), el('div', { className: 'admin-row' }, [button('← Clients', 'admin-mini', () => go('clients')), submit])]),
      el('div', { className: 'admin-grid' }, [
        card('Coordonnées', [f.node], 'admin-card--wide'),
        c ? card('Historique', [el('ul', { className: 'ck-list' }, [
          ...deals.map(d => el('li', {}, [button(d.title, 'ck-link', () => open('deal', d.id)), pill(STAGE[d.stage].label)])),
          ...docs.map(d => el('li', {}, [button(`${docName(d)}${['devis', 'facture'].includes(d.kind) ? ` : ${money(d.total)}` : ''}`, 'ck-link', () => open('doc', d.id)), pill(DOC_STATUS[d.status], d.status)]))
        ]), el('div', { className: 'admin-row' }, [button('+ Demande', 'admin-mini', () => open('deal', null)), c.email ? link('Écrire ↗', `mailto:${c.email}`, 'admin-mini') : null])], 'admin-card--wide') : null,
        c ? card('Supprimer', [el('p', { className: 'ck-hint', textContent: 'Les projets et factures restent enregistrés, sans contact associé. À faire si la personne demande l’effacement de ses données.' }), armed('Supprimer le contact', 'Confirmer la suppression', async () => { if (await remove('crm_contacts', c.id)) { say('Contact supprimé.', 'ok'); go('clients'); } })]) : null
      ])
    ]);
  });

  // Documents : devis, contrats, factures pro forma, droits à l'image, rétractations.
  // Gabarits fidèles aux modèles PDF de Nolan (public/admin/doc-templates.js) ; fichiers signés dans un stockage privé.
  const TPL = () => window.NolanDocTemplates || { templates: [], messages: [] };
  const DEFAULT_TEMPLATE = { devis: 'devis_datee', facture: 'facture', contrat: 'contrat_datee', droit_image: 'droit_image', retractation: 'retractation' };
  const templateOf = d => TPL().templates.find(t => t.id === (d.template || DEFAULT_TEMPLATE[d.kind]));
  const kindLabel = (kind, one) => one ? DOC_ONE[kind] || kind : DOC_KINDS[kind] || kind;
  const docName = d => `${kindLabel(d.kind, true)} ${d.number}`;
  const docTotal = lines => Math.round(sum(lines, l => (Number(l.qty) || 0) * (Number(l.unit) || 0)) * 100) / 100;
  const businessInfo = () => { try { return JSON.parse(root.dataset.business || '{}'); } catch { return {}; } };
  const escHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const prefillValue = (key, contact, deal) => {
    const ev = deal ? S.events.find(e => e.deal_id === deal.id) : null;
    return ({ offerLabel: offerLabel(deal?.offer), eventDate: deal?.event_date ? longDate(deal.event_date) : '', dealTitle: deal?.title || '', eventLocation: ev?.location || '', personName: contact?.name || '', personEmail: contact?.email || '', personAddress: contact?.address || '' })[key] || '';
  };

  V.documents = guard(() => {
    const t = today(), q = (S.filter || '').toLowerCase();
    const counts = Object.fromEntries(Object.keys(DOC_KINDS).map(k => [k, S.docs.filter(d => d.kind === k).length]));
    const tabs = [['tous', `Tous (${S.docs.length})`], ...Object.entries(DOC_KINDS).map(([k, l]) => [k, `${l} (${counts[k]})`]), ['attente', 'À encaisser'], ['retard', 'En retard']];
    const isLate = d => d.kind === 'facture' && d.status === 'envoye' && d.due_date && d.due_date < t;
    const list = S.docs.filter(d => (S.docTab === 'tous' || d.kind === S.docTab
      || (S.docTab === 'attente' && d.kind === 'facture' && d.status === 'envoye') || (S.docTab === 'retard' && isLate(d)))
      && (!q || [d.number, d.title, contactOf(d.contact_id)?.name, contactOf(d.contact_id)?.company, dealOf(d.deal_id)?.title, d.data?.NomPersonne].some(v => String(v || '').toLowerCase().includes(q))));
    const tabBar = el('div', { className: 'ck-tabs' }, tabs.map(([id, l]) => { const b = button(l, 'ck-tab', () => { S.docTab = id; go('documents'); }); b.setAttribute('aria-pressed', String(S.docTab === id)); return b; }));
    const search = el('input', { type: 'search', className: 'admin-input', placeholder: 'Rechercher : numéro, client, projet, personne photographiée', value: S.filter || '' });
    search.setAttribute('aria-label', 'Rechercher un document');
    search.addEventListener('change', () => { S.filter = search.value; go('documents'); });
    // Hiérarchie : client, puis projet, puis documents (le plus récent en premier).
    const groups = new Map();
    list.forEach(d => {
      const ck = d.contact_id || 'none', dk = d.deal_id || 'none';
      if (!groups.has(ck)) groups.set(ck, new Map());
      const g = groups.get(ck); if (!g.has(dk)) g.set(dk, []); g.get(dk).push(d);
    });
    const latest = docs => docs.reduce((m, d) => (d.issue_date > m ? d.issue_date : m), '');
    const ordered = [...groups.entries()].sort((a, b) => latest([...b[1].values()].flat()).localeCompare(latest([...a[1].values()].flat())));
    const row = d => el('li', { className: `nd-item${isLate(d) ? ' is-late' : ''}` }, [
      pill(kindLabel(d.kind, true), `kind-${d.kind}`),
      button(`${d.number}${d.title ? ` : ${d.title}` : d.data?.NomPersonne ? ` : ${d.data.NomPersonne}` : ''}`, 'ck-link', () => open('doc', d.id)),
      d.file_path ? el('span', { className: 'nd-file', textContent: 'PDF joint' }) : null,
      ['devis', 'facture'].includes(d.kind) ? el('span', { className: 'nd-amount', textContent: money(d.total) }) : null,
      pill(isLate(d) ? 'En retard' : DOC_STATUS[d.status], isLate(d) ? 'late' : d.status),
      el('time', { textContent: shortDate(d.issue_date) })
    ]);
    const tree = ordered.map(([ck, deals], i) => {
      const c = contactOf(ck), all = [...deals.values()].flat();
      return el('details', { className: 'nd-client', open: i < 6 }, [
        el('summary', {}, [el('strong', { textContent: c ? (c.company ? `${c.company} (${c.name})` : c.name) : 'Sans client' }), el('span', { textContent: `${all.length} document(s)` })]),
        ...[...deals.entries()].map(([dk, docs]) => {
          const deal = dealOf(dk);
          return el('section', { className: 'nd-project' }, [
            el('h4', {}, [deal ? button(deal.title, 'ck-link', () => open('deal', deal.id)) : el('span', { textContent: 'Hors projet' }), deal ? pill(STAGE[deal.stage].label) : null]),
            el('ul', { className: 'nd-rows' }, docs.sort((a, b) => b.issue_date.localeCompare(a.issue_date) || b.number.localeCompare(a.number)).map(row))
          ]);
        })
      ]);
    });
    const create = el('div', { className: 'nd-create' }, TPL().templates.map(tp => button(`+ ${tp.label}`, tp.kind === 'facture' ? 'admin-button' : 'admin-mini', () => open('doc', { template: tp.id }))));
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Documents', 'Classés par client puis par projet. Les factures sont des pro forma informatives : la facture officielle part sur Indy.')]),
      S.needsDocs ? card('Une étape avant de créer des documents', [el('ol', { className: 'ck-steps' }, [
        el('li', {}, [el('span', { textContent: 'Ouvre ' }), link('documents_schema.sql sur GitHub ↗', 'https://github.com/Almorder/PORTFOLIO_3D/blob/main/supabase/documents_schema.sql'), el('span', { textContent: ' et clique sur l’icône « Copy raw file ».' })]),
        el('li', { textContent: 'Supabase > ton projet > SQL Editor > New query : colle, puis Run.' }),
        el('li', { textContent: 'Recharge cette page.' })
      ])], 'admin-card--wide ck-mb') : null,
      create.childNodes.length ? create : el('p', { className: 'admin-alert', textContent: 'Les gabarits de documents ne sont pas chargés : recharge la page.' }),
      el('div', { className: 'nd-tools' }, [search, tabBar]),
      tree.length ? el('div', { className: 'nd-tree' }, tree) : el('p', { className: 'admin-ok', textContent: 'Aucun document ici.' })
    ]);
  });

  V.doc = guard(() => {
    const existing = typeof S.focus === 'string' ? S.docs.find(d => d.id === S.focus) : null;
    const preset = existing ? {} : (S.focus || {});
    const tp = existing ? templateOf(existing) : TPL().templates.find(x => x.id === (preset.template || DEFAULT_TEMPLATE[preset.kind || 'facture']));
    if (!tp) return el('p', { className: 'admin-alert', textContent: 'Gabarit introuvable : recharge la page.' });
    const kind = existing?.kind || tp.kind;
    const deal = existing ? dealOf(existing.deal_id) : dealOf(preset.deal);
    const contact = existing ? contactOf(existing.contact_id) : contactOf(preset.contact || deal?.contact_id);
    const s = S.settings, t = today();
    const data = structuredClone(existing?.data || preset.data || {});
    data.checks = data.checks || {};
    if (!existing) (tp.fields || []).forEach(f => { if (f.prefill && !data[f.name]) data[f.name] = prefillValue(f.prefill, contact, deal); });
    const lastQuote = deal ? S.docs.filter(x => x.deal_id === deal.id && x.kind === 'devis').sort((a, b) => b.number.localeCompare(a.number))[0] : null;
    if (!existing && lastQuote && (tp.fields || []).some(f => f.name === 'NumeroDevis') && !data.NumeroDevis) data.NumeroDevis = lastQuote.number;
    const lines = structuredClone(existing?.lines?.length ? existing.lines : preset.lines || (tp.lines ? [{ label: deal ? `${offerLabel(deal.offer) || 'Prestation'} : ${deal.title}` : '', qty: 1, unit: deal ? Number(deal.amount) || 0 : 0, category: 'main' }] : []));
    const statusOptions = Object.entries(DOC_STATUS).filter(([id]) => ({ devis: ['brouillon', 'envoye', 'accepte', 'refuse', 'annule'], facture: ['brouillon', 'envoye', 'paye', 'annule'] }[kind] || ['brouillon', 'envoye', 'signe', 'annule']).includes(id));
    const head = form([
      { name: 'title', label: 'Objet (pour toi, et imprimé sur les devis et factures)', full: true, placeholder: 'Ex. Film de mariage, 14 juin 2027' },
      { name: 'contact_id', label: 'Client', type: 'select', options: contactOptions() },
      { name: 'deal_id', label: 'Projet', type: 'select', options: dealOptions() },
      { name: 'issue_date', label: 'Date', type: 'date' },
      ...(['devis', 'facture'].includes(kind) ? [{ name: 'due_date', label: kind === 'devis' ? 'Valable jusqu’au' : 'Échéance de paiement', type: 'date' }] : []),
      { name: 'status', label: 'Statut', type: 'select', options: statusOptions },
      ...(kind === 'facture' ? [
        { name: 'paid_amount', label: 'Montant encaissé (€)', type: 'number' },
        { name: 'paid_at', label: 'Date d’encaissement', type: 'date' },
        { name: 'payment_method', label: 'Mode de règlement', type: 'select', options: [['', 'Non précisé'], ...PAY_METHODS.map(m => [m, m])] },
        { name: 'indy_number', label: 'Numéro de la facture officielle sur Indy', placeholder: 'Ex. F-2026-0012' }
      ] : []),
      ...(['contrat', 'droit_image', 'devis'].includes(kind) ? [{ name: 'signed_at', label: 'Signé le', type: 'date' }] : [])
    ], existing || { title: preset.title || deal?.title || '', contact_id: contact?.id || '', deal_id: deal?.id || '', issue_date: t, due_date: kind === 'devis' ? addDays(t, s.validiteDevis) : kind === 'facture' ? addDays(t, s.delaiPaiement) : '', status: 'brouillon' });
    // Champs propres au gabarit, regroupés par section du modèle.
    const sections = new Map();
    (tp.fields || []).forEach(f => { const k = f.section || 'Détails'; if (!sections.has(k)) sections.set(k, []); sections.get(k).push(f); });
    const fieldForms = [...sections.entries()].map(([name, defs]) => [name, form(defs.map(f => ({ ...f, full: f.type === 'textarea' })), data)]);
    const checkGroups = new Map();
    (tp.checks || []).forEach(c => { const k = c.group || 'Cases à cocher'; if (!checkGroups.has(k)) checkGroups.set(k, []); checkGroups.get(k).push(c); });
    const checkInputs = {};
    const checkCards = [...checkGroups.entries()].map(([name, defs]) => card(name, [el('div', { className: 'ck-checks' }, defs.map(c => {
      const input = el('input', { type: 'checkbox', checked: Boolean(data.checks[c.name]) }); checkInputs[c.name] = input;
      return el('label', { className: 'admin-field admin-field--check' }, [el('span', { textContent: c.label }), input]);
    }))], 'admin-card--wide'));
    // Lignes de prix
    const totalOut = el('strong', { className: 'ck-total' });
    const linesBox = el('div', { className: 'ck-lines' });
    const withCategory = kind === 'devis';
    const drawLines = () => {
      const headRow = el('div', { className: `ck-line ck-line--head${withCategory ? ' ck-line--cat' : ''}`, ariaHidden: 'true' }, [el('span', { textContent: 'Désignation' }), withCategory ? el('span', { textContent: 'Rangée' }) : null, el('span', { textContent: 'Quantité' }), el('span', { textContent: 'Prix unitaire (€)' }), el('span')]);
      linesBox.replaceChildren(headRow, ...lines.map((line, i) => {
        const label = el('input', { className: 'admin-input', value: line.label || '', placeholder: 'Désignation' });
        const qty = el('input', { className: 'admin-input ck-num', type: 'number', min: '0', step: 'any', value: String(line.qty ?? 1) });
        const unit = el('input', { className: 'admin-input ck-num', type: 'number', min: '0', step: 'any', value: String(line.unit ?? 0) });
        const cat = withCategory ? el('select', { className: 'admin-input' }, [['main', 'Prestation principale'], ['option', 'Option']].map(([v, l]) => el('option', { value: v, textContent: l, selected: (line.category || 'main') === v }))) : null;
        [label, qty, unit, cat].filter(Boolean).forEach((x, k) => x.setAttribute('aria-label', `Ligne ${i + 1} : ${['désignation', 'quantité', 'prix unitaire', 'rangée'][k]}`));
        const sync = () => { line.label = label.value; line.qty = Number(qty.value) || 0; line.unit = Number(unit.value) || 0; if (cat) line.category = cat.value; totalOut.textContent = `Total : ${money(docTotal(lines))}`; };
        [label, qty, unit, cat].filter(Boolean).forEach(x => x.addEventListener('input', sync));
        return el('div', { className: `ck-line${withCategory ? ' ck-line--cat' : ''}` }, [label, cat, qty, unit, button('×', 'admin-mini', () => { lines.splice(i, 1); drawLines(); }, `Supprimer la ligne ${i + 1}`)]);
      }));
      totalOut.textContent = `Total : ${money(docTotal(lines))}`;
    };
    if (tp.lines) drawLines();
    const collect = () => {
      const row = head.read();
      fieldForms.forEach(([, f]) => Object.assign(data, f.read()));
      Object.entries(checkInputs).forEach(([k, input]) => { data.checks[k] = input.checked; });
      row.data = data; row.template = tp.id;
      if (tp.lines) { row.lines = lines.filter(l => l.label || l.unit); row.total = docTotal(lines); }
      row.contact_id = row.contact_id || null; row.deal_id = row.deal_id || null;
      if (kind === 'facture') { row.paid_amount = row.paid_amount || 0; if (row.status === 'paye' && !row.paid_amount) row.paid_amount = row.total; if (row.status === 'paye' && !row.paid_at) row.paid_at = t; }
      if (['signe', 'accepte'].includes(row.status) && 'signed_at' in row && !row.signed_at) row.signed_at = t;
      return row;
    };
    const submit = button(existing ? 'Enregistrer' : `Créer : ${tp.label}`, 'admin-button', async () => {
      const row = collect();
      submit.disabled = true;
      if (!existing) {
        const { data: number, error } = await client.rpc('crm_next_number', { p_kind: kind });
        if (error) { submit.disabled = false; return say(`Numérotation impossible : ${error.message}. As-tu exécuté documents_schema.sql ?`, 'error'); }
        Object.assign(row, { kind, number });
      }
      const saved = await save('crm_documents', row, existing?.id);
      submit.disabled = false;
      if (!saved) return;
      // Le projet avance avec ses documents.
      const linked = saved.deal_id ? dealOf(saved.deal_id) : null;
      if (linked && kind === 'devis' && saved.status === 'envoye' && ['nouveau', 'qualifie'].includes(linked.stage)) await save('crm_deals', { stage: 'devis', amount: saved.total, next_action: `Relancer le devis ${saved.number}`, next_action_date: addDays(saved.issue_date || t, s.delaiRelanceDevis) }, linked.id);
      if (linked && kind === 'devis' && saved.status === 'accepte' && ['nouveau', 'qualifie', 'devis'].includes(linked.stage)) await save('crm_deals', { stage: 'signe', amount: saved.total, next_action: 'Facturer l’acompte', next_action_date: t }, linked.id);
      if (linked && kind === 'facture' && saved.status !== 'brouillon' && linked.next_action === 'Facturer l’acompte') await save('crm_deals', { next_action: null, next_action_date: null }, linked.id);
      if (linked && kind === 'facture' && saved.status === 'paye' && linked.stage === 'livre' && sum(invoices().filter(i => i.deal_id === linked.id), cashed) >= Number(linked.amount)) await save('crm_deals', { stage: 'paye' }, linked.id);
      say(`${docName(saved)} enregistré.`, 'ok'); open('doc', saved.id);
    });
    // Fichier joint : PDF signé, facture Indy, scan.
    const fileCard = existing ? (() => {
      const input = el('input', { type: 'file', accept: 'application/pdf,image/jpeg,image/png', className: 'nd-file-input' });
      input.setAttribute('aria-label', 'Choisir le fichier à joindre');
      const upload = button(existing.file_path ? 'Remplacer le fichier' : 'Joindre le fichier', 'admin-mini', async () => {
        const file = input.files?.[0];
        if (!file) return say('Choisis d’abord un fichier PDF, JPG ou PNG.', 'warn');
        if (file.size > 20 * 1024 * 1024) return say('Fichier trop lourd : 20 Mo maximum.', 'warn');
        upload.disabled = true; say('Envoi du fichier…');
        const safe = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '-').slice(-80);
        const path = `${existing.kind}/${existing.number}/${Date.now()}-${safe}`;
        const { error } = await client.storage.from('documents').upload(path, file, { contentType: file.type, upsert: false });
        upload.disabled = false;
        if (error) return say(`Envoi impossible : ${error.message}. As-tu exécuté documents_schema.sql ?`, 'error');
        if (existing.file_path) await client.storage.from('documents').remove([existing.file_path]);
        if (await save('crm_documents', { file_path: path }, existing.id)) { say('Fichier joint.', 'ok'); open('doc', existing.id); }
      });
      const view = existing.file_path ? button('Ouvrir le fichier', 'admin-mini', async () => {
        const { data: signed, error } = await client.storage.from('documents').createSignedUrl(existing.file_path, 300);
        if (error) return say(error.message, 'error');
        window.open(signed.signedUrl, '_blank', 'noopener');
      }) : null;
      return card('Fichier signé ou facture Indy', [
        el('p', { className: 'ck-hint', textContent: existing.file_path ? `Joint : ${existing.file_path.split('/').pop().replace(/^\d+-/, '')}` : 'Joins ici le PDF signé par le client ou la facture officielle téléchargée depuis Indy. Stockage privé, visible par toi seul.' }),
        el('div', { className: 'admin-row' }, [input, upload, view])
      ], 'admin-card--wide');
    })() : null;
    const actions = [];
    if (existing) {
      actions.push(button('Aperçu et PDF', 'admin-button', () => open('paper', existing.id)));
      actions.push(button('Dupliquer', 'admin-mini', () => open('doc', { template: tp.id, deal: existing.deal_id, contact: existing.contact_id, title: existing.title, lines: structuredClone(existing.lines || []), data: structuredClone(existing.data || {}) })));
      if (kind === 'devis') {
        const already = sum(S.docs.filter(d => d.kind === 'facture' && d.status !== 'annule' && d.deal_id && d.deal_id === existing.deal_id), d => d.total);
        const rateA = Number(s.acompte) || 40;
        actions.push(button(`Facture d’acompte (${rateA} %)`, 'admin-mini', () => open('doc', { template: 'facture', deal: existing.deal_id, contact: existing.contact_id, title: `Acompte : ${existing.title || existing.number}`, lines: [{ label: `Acompte de ${rateA} % sur le devis ${existing.number}`, qty: 1, unit: Math.round(existing.total * rateA) / 100 }] })));
        actions.push(button('Facture du solde', 'admin-mini', () => open('doc', { template: 'facture', deal: existing.deal_id, contact: existing.contact_id, title: `Solde : ${existing.title || existing.number}`, lines: [{ label: `Solde du devis ${existing.number}${already ? `, après ${money(already)} déjà facturés` : ''}`, qty: 1, unit: Math.max(0, Math.round((existing.total - already) * 100) / 100) }] })));
        actions.push(button('Contrat correspondant', 'admin-mini', () => open('doc', { template: existing.template === 'devis_mission' ? 'contrat_mission' : 'contrat_datee', deal: existing.deal_id, contact: existing.contact_id, title: existing.title, data: structuredClone(existing.data || {}) })));
      }
      if (existing.kind !== 'facture' || existing.status === 'brouillon') actions.push(armed('Supprimer', 'Confirmer la suppression', async () => {
        if (existing.file_path) await client.storage.from('documents').remove([existing.file_path]);
        if (await remove('crm_documents', existing.id)) { say('Document supprimé.', 'ok'); go('documents'); }
      }));
    }
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading(existing ? docName(existing) : tp.label, existing ? `${tp.label} · ${DOC_STATUS[existing.status]}${existing.total ? ` · ${money(existing.total)}` : ''}` : 'Le numéro est attribué à l’enregistrement.'), el('div', { className: 'admin-row' }, [button('← Documents', 'admin-mini', () => go('documents')), submit])]),
      el('div', { className: 'admin-grid' }, [
        actions.length ? card('Actions', [el('div', { className: 'admin-row' }, actions)], 'admin-card--wide') : null,
        kind === 'facture' ? card('Facture pro forma', [el('p', { className: 'ck-hint', textContent: 'Document informatif pour ton suivi et ton client. La facture officielle (facturation électronique) est émise sur Indy : reporte ici son numéro et joins son PDF une fois émise.' })], 'admin-card--wide') : null,
        card('Informations', [head.node], 'admin-card--wide'),
        tp.lines ? card('Lignes de prix', [linesBox, el('div', { className: 'admin-row ck-between' }, [button('+ Ligne', 'admin-mini', () => { lines.push({ label: '', qty: 1, unit: 0, category: 'main' }); drawLines(); }), totalOut]), el('p', { className: 'ck-hint', textContent: 'Montants nets : TVA non applicable, art. 293 B du CGI (mention imprimée automatiquement).' })], 'admin-card--wide') : null,
        ...fieldForms.map(([name, f]) => card(name, [f.node], 'admin-card--wide')),
        ...checkCards,
        fileCard
      ])
    ]);
  });

  // Aperçu imprimable : rendu du gabarit de Nolan (chaque valeur est échappée par le gabarit, puis le HTML est analysé sans exécuter de script).
  V.paper = guard(() => {
    const d = S.docs.find(x => x.id === S.focus);
    if (!d) return el('p', { textContent: 'Document introuvable.' });
    const tp = templateOf(d);
    const contact = contactOf(d.contact_id) || {}, deal = dealOf(d.deal_id) || {};
    const ctx = { contact, deal, settings: S.settings, business: businessInfo(), esc: escHtml, money, longDate };
    const missing = [!S.settings.adresseFacturation && ['devis', 'facture', 'contrat'].includes(d.kind) && 'ton adresse (Réglages)', d.kind === 'facture' && !S.settings.iban && 'ton IBAN (Réglages)', !contact.name && d.kind !== 'droit_image' && 'le client'].filter(Boolean);
    const sheet = el('div', { className: 'nd-sheet' });
    if (tp) {
      const parsed = new DOMParser().parseFromString(`<div>${tp.render({ ...d, data: { checks: {}, ...(d.data || {}) } }, ctx)}</div>`, 'text/html');
      parsed.querySelectorAll('script,iframe,object,embed,link,meta,style').forEach(n => n.remove());
      parsed.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (/^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name); }));
      sheet.append(...[...parsed.body.firstChild.childNodes].map(n => document.importNode(n, true)));
    } else sheet.append(el('p', { className: 'admin-alert', textContent: 'Gabarit introuvable pour ce document.' }));
    return el('div', {}, [
      el('div', { className: 'admin-bar ck-noprint' }, [heading(`Aperçu ${d.number}`, missing.length ? `À compléter avant envoi : ${missing.join(', ')}.` : 'Prêt : Imprimer, puis « Enregistrer au format PDF ».'), el('div', { className: 'admin-row' }, [button('← Modifier', 'admin-mini', () => open('doc', d.id)), button('Imprimer ou PDF', 'admin-button', () => { const before = document.title; document.title = `${d.number} ${contact.company || contact.name || ''}`.trim(); window.print(); document.title = before; })])]),
      sheet
    ]);
  });

  // Messages clients : modèles de Nolan, variables remplies depuis le projet, prêts à copier ou envoyer.
  const fillMessage = (text, deal, contact) => {
    const devis = deal ? S.docs.filter(x => x.deal_id === deal.id && x.kind === 'devis').sort((a, b) => b.number.localeCompare(a.number))[0] : null;
    const ev = deal ? S.events.find(e => e.deal_id === deal.id) : null;
    const amount = Number(devis?.total || deal?.amount) || 0, rateA = Number(S.settings.acompte) || 40;
    const vars = { prenom: (contact?.name || '').split(/\s+/)[0], nom: contact?.name || '', projet: deal?.title || '', date: deal?.event_date ? longDate(deal.event_date) : '', lieu: ev?.location || '', montant: amount ? money(amount) : '', acompte: amount ? money(amount * rateA / 100) : '', solde: amount ? money(amount - amount * rateA / 100) : '', numero: devis?.number || '', lien: 'https://nolanarc.com' };
    return String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => vars[k] || `[${k} à compléter]`);
  };
  V.messages = guard(() => {
    const msgs = TPL().messages || [];
    const deal = S.focus && typeof S.focus === 'string' ? dealOf(S.focus) : null;
    const pick = form([{ name: 'deal', label: 'Projet', type: 'select', options: dealOptions() }], { deal: deal?.id || '' });
    pick.inputs.deal.addEventListener('change', () => open('messages', pick.inputs.deal.value || null));
    const contact = deal ? contactOf(deal.contact_id) : null;
    const order = STAGES.map(([id]) => id);
    const sorted = [...msgs].sort((a, b) => order.indexOf(a.stage) - order.indexOf(b.stage) || a.id.localeCompare(b.id));
    const items = sorted.map(m => {
      const subject = fillMessage(m.subject, deal, contact), body = fillMessage(m.body, deal, contact);
      const area = el('textarea', { className: 'admin-input admin-input--area', rows: Math.min(14, body.split('\n').length + 2), value: body });
      area.setAttribute('aria-label', `Texte : ${m.label}`);
      const copy = button('Copier', 'admin-mini', async () => { try { await navigator.clipboard.writeText(m.channel === 'email' && subject ? `${subject}\n\n${area.value}` : area.value); say('Message copié.', 'ok'); } catch { say('Copie impossible : sélectionne le texte.', 'warn'); } });
      const phone = (contact?.phone || '').replace(/[^\d+]/g, '').replace(/^0/, '+33').replace(/^\+/, '');
      const send = m.channel === 'email'
        ? (contact?.email ? link('Ouvrir dans ma messagerie ↗', `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(area.value)}`, 'admin-mini') : null)
        : (phone ? link('Ouvrir dans WhatsApp ↗', `https://wa.me/${phone}?text=${encodeURIComponent(area.value)}`, 'admin-mini') : null);
      if (send) area.addEventListener('input', () => { send.href = m.channel === 'email' ? `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(area.value)}` : `https://wa.me/${phone}?text=${encodeURIComponent(area.value)}`; });
      const isSuggested = deal && m.stage === deal.stage;
      return el('details', { className: `nd-message${isSuggested ? ' is-suggested' : ''}`, open: isSuggested }, [
        el('summary', {}, [el('strong', { textContent: m.label }), pill(m.channel === 'email' ? 'Email' : 'WhatsApp'), pill(STAGE[m.stage]?.label || m.stage), isSuggested ? pill('Suggéré', 'envoye') : null]),
        m.channel === 'email' && subject ? el('p', { className: 'ck-hint', textContent: `Objet : ${subject}` }) : null,
        area, el('div', { className: 'admin-row' }, [copy, send])
      ]);
    });
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Messages', 'Tes modèles de messages, remplis avec le projet choisi : prénom, date, montants, numéro de devis.')]),
      card('Pour quel projet ?', [pick.node, deal ? el('p', { className: 'ck-hint', textContent: `${STAGE[deal.stage].label}${contact ? ` · ${contact.name}` : ''} : les messages de cette étape sont ouverts.` }) : el('p', { className: 'ck-hint', textContent: 'Sans projet, les variables restent à compléter.' })], 'admin-card--wide ck-mb'),
      items.length ? el('div', { className: 'nd-messages' }, items) : el('p', { className: 'admin-alert', textContent: 'Les modèles de messages ne sont pas chargés : recharge la page.' })
    ]);
  });

  // Agenda
  V.agenda = guard(() => {
    const t = today();
    const future = S.events.filter(e => iso(e.starts_at) >= t || !e.done);
    const months = new Map();
    future.forEach(e => { const k = iso(e.starts_at).slice(0, 7); if (!months.has(k)) months.set(k, []); months.get(k).push(e); });
    const gcal = e => {
      const fmt = x => new Date(x).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      const end = e.ends_at || new Date(new Date(e.starts_at).getTime() + 2 * 3600e3).toISOString();
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${EVENT_KINDS[e.kind]} : ${e.title}`)}&dates=${fmt(e.starts_at)}/${fmt(end)}&location=${encodeURIComponent(e.location || '')}`;
    };
    const suggestions = S.deals.filter(d => ['signe', 'production'].includes(d.stage) && d.event_date && d.event_date >= t && !S.events.some(e => e.deal_id === d.id));
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Agenda', 'Tournages, livraisons et rendez-vous. Chaque événement peut s’ajouter à Google Agenda en un clic.'), button('+ Événement', 'admin-button', () => open('event', null))]),
      suggestions.length ? card('Projets signés sans date dans l’agenda', [el('ul', { className: 'ck-list' }, suggestions.map(d => el('li', {}, [button(`${d.title} : ${longDate(d.event_date)}`, 'ck-link', () => open('event', { deal: d.id })), el('span', { textContent: 'Planifier' })])))], 'admin-card--wide ck-mb') : null,
      months.size ? el('div', { className: 'ck-agenda' }, [...months.entries()].sort().map(([k, list]) => el('section', {}, [
        el('h3', { textContent: new Date(`${k}-01T12:00:00`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }),
        el('ul', { className: 'ck-list' }, list.map(e => {
          const done = el('input', { type: 'checkbox', checked: e.done });
          done.setAttribute('aria-label', `Terminé : ${e.title}`);
          done.addEventListener('change', async () => { if (await save('crm_events', { done: done.checked }, e.id)) go('agenda'); });
          const start = new Date(e.starts_at);
          return el('li', { className: `${e.done ? 'is-done' : ''}${iso(e.starts_at) < t && !e.done ? ' is-late' : ''}` }, [
            done,
            el('time', { textContent: `${start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` }),
            pill(EVENT_KINDS[e.kind]), button(e.title, 'ck-link', () => open('event', e.id)),
            e.location ? el('span', { className: 'ck-hint', textContent: e.location }) : null,
            link('Google Agenda ↗', gcal(e), 'ck-gcal')
          ]);
        }))
      ]))) : el('p', { className: 'admin-ok', textContent: 'Aucun événement à venir.' })
    ]);
  });

  V.event = guard(() => {
    const e = typeof S.focus === 'string' ? S.events.find(x => x.id === S.focus) : null;
    const preset = e ? {} : (S.focus || {});
    const deal = dealOf(e?.deal_id || preset.deal);
    const local = x => { const d = new Date(x); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };
    const f = form([
      { name: 'kind', label: 'Type', type: 'select', options: Object.entries(EVENT_KINDS) },
      { name: 'title', label: 'Titre', required: true },
      { name: 'starts_at', label: 'Début', type: 'datetime-local', required: true },
      { name: 'ends_at', label: 'Fin', type: 'datetime-local' },
      { name: 'location', label: 'Lieu', full: true },
      { name: 'deal_id', label: 'Projet', type: 'select', options: dealOptions() },
      { name: 'notes', label: 'Notes (horaires, contacts sur place, matériel)', type: 'textarea', full: true }
    ], e ? { ...e, starts_at: local(e.starts_at), ends_at: e.ends_at ? local(e.ends_at) : '' } : { kind: 'tournage', title: deal?.title || '', starts_at: deal?.event_date ? `${deal.event_date}T10:00` : '', deal_id: deal?.id || '' });
    const submit = button(e ? 'Enregistrer' : 'Ajouter', 'admin-button', async () => {
      const row = f.read();
      if (!row.title || !row.starts_at) return say('Titre et début sont obligatoires.', 'warn');
      row.starts_at = new Date(row.starts_at).toISOString(); row.ends_at = row.ends_at ? new Date(row.ends_at).toISOString() : null; row.deal_id = row.deal_id || null;
      submit.disabled = true; const saved = await save('crm_events', row, e?.id); submit.disabled = false;
      if (saved) { say('Événement enregistré.', 'ok'); go('agenda'); }
    });
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading(e ? e.title : 'Nouvel événement'), el('div', { className: 'admin-row' }, [button('← Agenda', 'admin-mini', () => go('agenda')), submit])]),
      el('div', { className: 'admin-grid' }, [card('Événement', [f.node], 'admin-card--wide'),
        e ? card('Supprimer', [armed('Supprimer l’événement', 'Confirmer la suppression', async () => { if (await remove('crm_events', e.id)) { say('Événement supprimé.', 'ok'); go('agenda'); } })]) : null])
    ]);
  });

  // Finances
  V.finances = guard(() => {
    const y = String(S.year), goal = Number(S.settings.objectifAnnuel) || 0;
    const months = Array.from({ length: 12 }, (_, i) => { const k = `${y}-${String(i + 1).padStart(2, '0')}`; return { k, label: new Date(Number(y), i, 1).toLocaleDateString('fr-FR', { month: 'short' }), v: sum(paidIn(k), cashed) }; });
    const total = sum(months, m => m.v), max = Math.max(goal / 12, ...months.map(m => m.v), 1);
    const chart = el('div', { className: 'ck-bars', role: 'img', ariaLabel: `Encaissements mensuels ${y}, total ${money(total)}` }, months.map(m => el('div', { className: 'ck-bar' }, [
      el('span', { className: 'ck-bar__fill', style: `height:${Math.round(m.v / max * 100)}%` }), el('small', { textContent: m.label }), el('b', { textContent: m.v ? `${Math.round(m.v)} €` : '' })
    ])));
    chart.style.setProperty('--goal', String(Math.min(1, goal / 12 / max)));
    const years = [...new Set([new Date().getFullYear(), ...invoices().filter(d => d.paid_at).map(d => Number(d.paid_at.slice(0, 4)))])].sort();
    const yearPick = el('select', { className: 'admin-input ck-year' }, years.map(v => el('option', { value: String(v), textContent: String(v), selected: v === S.year })));
    yearPick.setAttribute('aria-label', 'Année');
    yearPick.addEventListener('change', () => { S.year = Number(yearPick.value); go('finances'); });
    const periods = period().filter(p => p.start.startsWith(y));
    const exportBook = button('Exporter le livre des recettes (CSV)', 'admin-button', () => {
      const rows = invoices().filter(d => d.paid_at && d.paid_at.startsWith(y)).sort((a, b) => a.paid_at.localeCompare(b.paid_at));
      const csv = [['Date d’encaissement', 'Référence de la facture', 'Client', 'Nature de la prestation', 'Montant encaissé (€)', 'Mode de règlement'], ...rows.map(d => [d.paid_at, d.number, contactOf(d.contact_id)?.company || contactOf(d.contact_id)?.name || '', d.title || '', String(cashed(d)).replace('.', ','), d.payment_method || ''])].map(r => r.map(csvCell).join(';')).join('\r\n');
      download(`livre-des-recettes-${y}.csv`, csv); say(`${rows.length} encaissement(s) exporté(s).`, 'ok');
    });
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Finances', `Chiffre d’affaires encaissé (régime micro : ce qui compte, c’est la date d’encaissement).`), el('div', { className: 'admin-row' }, [yearPick, exportBook])]),
      el('div', { className: 'admin-stats' }, [
        el('div', { className: 'admin-stat' }, [el('strong', { textContent: money(total) }), el('span', { textContent: `encaissés en ${y}` })]),
        el('div', { className: 'admin-stat' }, [el('strong', { textContent: goal ? `${Math.round(total / goal * 100)} %` : 'Aucun' }), el('span', { textContent: `de l’objectif (${money(goal)})` })]),
        el('div', { className: 'admin-stat' }, [el('strong', { textContent: money(Math.round(total * rate()) / 100) }), el('span', { textContent: `cotisations estimées (${String(rate()).replace('.', ',')} %)` })]),
        el('div', { className: 'admin-stat' }, [el('strong', { textContent: money(total - Math.round(total * rate()) / 100) }), el('span', { textContent: 'restant après cotisations' })])
      ]),
      el('div', { className: 'admin-grid' }, [
        card('Encaissements par mois', [chart, el('p', { className: 'ck-hint', textContent: 'La ligne pointillée marque l’objectif mensuel moyen.' })], 'admin-card--wide'),
        card('Déclarations URSSAF', [el('div', { className: 'ck-table-wrap' }, [el('table', { className: 'ck-table' }, [
          el('thead', {}, [el('tr', {}, ['Période', 'Encaissé', 'Cotisations estimées', 'À déclarer avant'].map(h => el('th', { scope: 'col', textContent: h })))]),
          el('tbody', {}, periods.map(p => el('tr', { className: p.due < today() ? 'is-past' : '' }, [el('th', { scope: 'row', textContent: p.label }), el('td', { textContent: money(p.ca) }), el('td', { textContent: money(p.cotisations) }), el('td', { textContent: longDate(p.due) })])))
        ])]), el('p', { className: 'ck-hint', textContent: 'Estimation au taux choisi dans les Réglages. Déclare même un chiffre nul.' })], 'admin-card--wide'),
        card('Obligations à garder en tête', [el('ul', { className: 'ck-bullets' }, [
          'Tenir le livre des recettes (export ci-dessus), conserver les factures 10 ans.',
          `Franchise de TVA : seuil de ${money(RULES.tvaBase)}, seuil majoré de ${money(RULES.tvaMajore)} (prestations de services, ${RULES.year}).`,
          `Plafond du régime micro : ${money(RULES.plafond)} de chiffre d’affaires annuel.`,
          'Un compte bancaire dédié est obligatoire au-delà de 10 000 € encaissés deux années de suite.',
          'Cotisation foncière des entreprises (CFE) : avis en ligne sur impots.gouv.fr, paiement en décembre.'
        ].map(text => el('li', { textContent: text })))], 'admin-card--wide')
      ])
    ]);
  });

  // Réglages
  V.reglages = guard(() => {
    const f = form([
      { name: 'objectifAnnuel', label: 'Objectif de chiffre d’affaires annuel (€)', type: 'number' },
      { name: 'activite', label: 'Catégorie URSSAF', type: 'select', options: Object.entries(ACTIVITES).map(([k, a]) => [k, `${a.label} : ${String(a.taux).replace('.', ',')} %`]), hint: 'Elle figure sur ton attestation d’immatriculation et sur ton espace URSSAF.' },
      { name: 'periodicite', label: 'Déclaration URSSAF', type: 'select', options: [['trimestrielle', 'Trimestrielle'], ['mensuelle', 'Mensuelle']] },
      { name: 'acompte', label: 'Acompte demandé (%)', type: 'number' },
      { name: 'delaiPaiement', label: 'Délai de paiement des factures (jours)', type: 'number' },
      { name: 'validiteDevis', label: 'Validité des devis (jours)', type: 'number' },
      { name: 'delaiRelanceDevis', label: 'Relancer un devis sans réponse après (jours)', type: 'number' },
      { name: 'adresseFacturation', label: 'Ton adresse (obligatoire sur les factures, jamais publiée sur le site)', type: 'textarea', rows: 2, full: true },
      { name: 'telephoneFacturation', label: 'Téléphone sur les devis et factures', type: 'tel' },
      { name: 'iban', label: 'IBAN imprimé sur les factures', hint: 'Stocké dans ta base Supabase, visible par toi seul.' }
    ], S.settings);
    const submit = button('Enregistrer les réglages', 'admin-button', async () => {
      submit.disabled = true;
      const data = { ...S.settings, ...f.read() };
      const { error } = await client.from('crm_settings').upsert({ key: 'cockpit', data, updated_at: new Date().toISOString() });
      submit.disabled = false;
      if (error) return say(`Enregistrement impossible : ${error.message}`, 'error');
      await load(); say('Réglages enregistrés.', 'ok'); go('reglages');
    });
    return el('div', {}, [
      el('div', { className: 'admin-bar' }, [heading('Réglages', 'Objectifs, taux et informations imprimées sur tes devis et factures.'), submit]),
      card('Activité et facturation', [f.node], 'admin-card--wide')
    ]);
  });

  return {
    sections: [
      { id: 'pilotage', label: 'Pilotage', group: 'Activité' },
      { id: 'demandes', label: 'Demandes', group: 'Activité' },
      { id: 'clients', label: 'Clients', group: 'Activité' },
      { id: 'documents', label: 'Documents', group: 'Activité' },
      { id: 'messages', label: 'Messages', group: 'Activité' },
      { id: 'agenda', label: 'Agenda', group: 'Activité' },
      { id: 'finances', label: 'Finances', group: 'Activité' },
      { id: 'reglages', label: 'Réglages', group: 'Activité' }
    ],
    parent: { deal: 'demandes', contact: 'clients', doc: 'documents', paper: 'documents', event: 'agenda' },
    views: V,
    load,
    badge: id => (id === 'pilotage' && !S.missing ? followUps().length : 0)
  };
};
