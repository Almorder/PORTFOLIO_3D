// Cockpit d'activité Nolan Arc : pilotage, clients, demandes, documents, messages, agenda, finances, réglages.
// Toutes les données restent dans Supabase, lisibles et modifiables par l'administrateur seul (RLS, voir
// supabase/cockpit_schema.sql, documents_schema.sql et admin_v2_schema.sql). Aucun HTML n'est injecté : tout passe
// par textContent ou value, y compris dans l'aperçu des documents (modèles d'origine de public/admin/docs/).
window.NolanCockpit = ({ client, root, el, button, link, say, heading, card, go, setDirty = () => {} }) => {
  // ------------------------------------------------------------ Repères réglementaires (à revoir chaque 1er janvier)
  // Plafond micro et seuils de franchise TVA « prestations de services » applicables en 2026 ; taux URSSAF au 1er janvier 2026.
  // Sources : service-public.gouv.fr (F36232, vérifié le 1er janvier 2026) et legifiscal.fr (seuils 2026).
  const RULES = { year: 2026, plafond: 83600, tvaBase: 37500, tvaMajore: 41250 };
  const ACTIVITES = {
    bic: { label: 'Prestations de services artisanales ou commerciales (BIC)', taux: 21.2 },
    bnc: { label: 'Profession libérale non réglementée (BNC)', taux: 25.6 }
  };
  const DEFAULTS = { objectifAnnuel: 30000, activite: 'bic', periodicite: 'trimestrielle', acompte: 40, delaiPaiement: 30, validiteDevis: 30, delaiRelanceDevis: 7,
    adresseFacturation: '', telephoneFacturation: '', titulaire: '', banque: '', iban: '', bic: '',
    lienAvis: '', lienQuestionnaire: '', lienEspace: '', delaiLivraison: '', dureeGalerie: '', dureeVideo: '', metier: '' };
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
  const CLIENT_TYPES = [['particulier', 'Particulier'], ['professionnel', 'Professionnel']];
  const CHANNELS = { email: 'Email', whatsapp: 'WhatsApp', autre: 'Autre' };
  // Colonnes que l'admin a le droit d'écrire sur un document : jamais « kind » ni « number » après la création.
  const DOC_COLUMNS = ['title', 'contact_id', 'deal_id', 'issue_date', 'due_date', 'status', 'lines', 'total', 'paid_amount', 'paid_at', 'payment_method', 'indy_number', 'signed_at', 'template', 'data'];
  const CONTACT_COLUMNS = ['name', 'company', 'email', 'phone', 'address', 'source', 'notes'];
  const CONTACT_V2 = ['civility', 'first_name', 'last_name', 'client_type', 'siret'];
  const ACOMPTE_MODELE = 40; // pourcentage écrit dans les modèles de devis et de contrat
  let OFFERS = [];
  try { OFFERS = JSON.parse(root.dataset.offers || '[]'); } catch { OFFERS = []; }
  const offerLabel = key => OFFERS.find(o => o.key === key)?.label || key || '';
  const DOCS_V = root.dataset.docs || '1';

  const S = { contacts: [], deals: [], docs: [], events: [], sent: [], settings: { ...DEFAULTS }, missing: false, error: '', v2: true, needsDocs: false,
    focus: null, docFilter: '', clientFilter: '', docTab: 'tous', showLost: false, year: new Date().getFullYear(), autoPrint: false };

  // ------------------------------------------------------------ Outils
  const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const num2 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const money = n => euro.format(Number(n) || 0);
  const round2 = n => Math.round((Number(n) || 0) * 100) / 100;
  const clone = v => (v == null ? v : JSON.parse(JSON.stringify(v)));
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const iso = d => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const today = () => iso(new Date());
  const addDays = (day, n) => { const d = new Date(`${day}T12:00:00`); d.setDate(d.getDate() + Number(n || 0)); return iso(d); };
  const daysBetween = (from, to) => Math.round((new Date(`${to}T12:00:00`) - new Date(`${from}T12:00:00`)) / 864e5);
  const longDate = day => day ? new Date(`${String(day).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const shortDate = day => day ? new Date(`${String(day).slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  const hhmm = d => new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const contactOf = id => S.contacts.find(c => c.id === id);
  const dealOf = id => S.deals.find(d => d.id === id);
  const fullName = c => (c ? ([c.first_name, c.last_name].filter(Boolean).join(' ').trim() || c.name || '') : '');
  const firstName = c => (c ? (c.first_name || String(c.name || '').trim().split(/\s+/)[0] || '') : '');
  const displayName = c => (c ? (c.company && fullName(c) && c.company !== fullName(c) ? `${fullName(c)} (${c.company})` : fullName(c) || c.company || '') : '');
  const isPro = c => Boolean(c && (c.client_type ? c.client_type === 'professionnel' : c.company));
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
  const actions = (...nodes) => el('div', { className: 'admin-row' }, nodes);
  const bar2 = (title, intro, ...tools) => el('div', { className: 'admin-bar' }, [heading(title, intro), tools.length ? el('div', { className: 'admin-row' }, tools) : null]);
  const back = (label, view, focus) => button(`← ${label}`, 'admin-mini', () => open(view, focus));

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
      if (def.autocomplete) input.autocomplete = def.autocomplete;
      input.name = def.name;
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
  const contactOptions = (empty = 'Aucun client') => [['', empty], ...[...S.contacts].sort((a, b) => fullName(a).localeCompare(fullName(b), 'fr')).map(c => [c.id, displayName(c)])];
  const dealOptions = (contactId, empty = 'Aucun projet') => [['', empty], ...S.deals.filter(d => !contactId || d.contact_id === contactId || d.id === S.focus?.deal).map(d => [d.id, d.title])];

  // ------------------------------------------------------------ Données
  const load = async () => {
    const res = await Promise.all([
      client.from('crm_contacts').select('*').order('name'),
      client.from('crm_deals').select('*').order('created_at', { ascending: false }),
      client.from('crm_documents').select('*').order('issue_date', { ascending: false }),
      client.from('crm_events').select('*').order('starts_at'),
      client.from('crm_settings').select('data').eq('key', 'cockpit').maybeSingle(),
      client.from('crm_documents').select('template').limit(1),
      client.from('crm_messages').select('*').order('sent_at'),
      client.from('crm_contacts').select('first_name').limit(1)
    ]);
    // Requêtes 6 à 8 : vérifient que documents_schema.sql et admin_v2_schema.sql ont été exécutés.
    S.needsDocs = Boolean(res[5].error);
    S.v2 = !res[6].error && !res[7].error;
    const error = res.slice(0, 5).find(r => r.error)?.error;
    if (error) {
      S.missing = /does not exist|schema cache|PGRST20|42P01/i.test(`${error.code} ${error.message}`);
      S.error = error.message; return;
    }
    S.missing = false; S.error = '';
    [S.contacts, S.deals, S.docs, S.events] = res.slice(0, 4).map(r => r.data || []);
    S.sent = S.v2 ? res[6].data || [] : [];
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
      const who = fullName(contactOf(d.contact_id)) || d.title;
      if (d.next_action_date && d.next_action_date <= t) items.push({ type: 'Action', when: d.next_action_date, text: `${d.next_action || 'Action prévue'} : ${who}`, late: d.next_action_date < t, go: () => open('deal', d.id) });
      else if (d.stage === 'nouveau' && !d.next_action && iso(d.created_at) <= addDays(t, -1)) items.push({ type: 'Action', when: iso(d.created_at), text: `Répondre à la demande : ${who}`, late: iso(d.created_at) <= addDays(t, -2), go: () => open('deal', d.id) });
    });
    S.docs.filter(d => d.kind === 'devis' && d.status === 'envoye' && d.issue_date <= addDays(t, -S.settings.delaiRelanceDevis)).forEach(d => items.push({ type: 'Relance', when: d.issue_date, text: `Relancer le devis ${d.number} : ${fullName(contactOf(d.contact_id))}`, late: true, go: () => open('doc', d.id) }));
    invoices().filter(d => d.status === 'envoye' && d.due_date && d.due_date < t).forEach(d => items.push({ type: 'Paiement', when: d.due_date, text: `Facture ${d.number} en retard : ${money(d.total - (d.paid_amount || 0))}`, late: true, go: () => open('doc', d.id) }));
    S.deals.filter(d => ['signe', 'production'].includes(d.stage) && d.event_date && d.event_date >= t && !S.events.some(e => e.deal_id === d.id)).forEach(d => items.push({ type: 'Agenda', when: d.event_date, text: `Planifier dans l’agenda : ${d.title} (${shortDate(d.event_date)})`, late: false, go: () => open('event', { deal: d.id }) }));
    return items;
  };
  const upcoming = (days = 30) => {
    const t = today(), limit = addDays(t, days);
    return S.events.filter(e => !e.done && iso(e.starts_at) >= t && iso(e.starts_at) <= limit);
  };

  // ------------------------------------------------------------ Parcours client et messages
  const MSG = () => window.NolanMessages || { steps: [], messages: [] };
  const msgById = id => MSG().messages.find(m => m.id === id);
  const stepOf = id => MSG().steps.find(s => s.id === id);
  const eventOf = dealId => S.events.filter(e => e.deal_id === dealId).sort((a, b) => (a.kind === 'tournage' ? -1 : 0) - (b.kind === 'tournage' ? -1 : 0) || String(a.starts_at).localeCompare(String(b.starts_at)))[0];
  const quotesOf = dealId => S.docs.filter(x => x.deal_id === dealId && x.kind === 'devis' && x.status !== 'annule').sort((a, b) => String(b.number).localeCompare(String(a.number)));
  const latestQuote = deal => (deal ? quotesOf(deal.id)[0] : null);
  const branchOf = deal => {
    if (!deal) return 'datee';
    const tpl = S.docs.filter(x => x.deal_id === deal.id && ['devis', 'contrat'].includes(x.kind)).map(x => x.template).find(Boolean);
    if (tpl) return /mission/.test(tpl) ? 'mission' : 'datee';
    return ['direction', 'strategie'].includes(deal.offer) ? 'mission' : 'datee';
  };
  const activeDeal = c => (c ? S.deals.filter(d => d.contact_id === c.id && d.stage !== 'perdu').sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0] || null : null);
  const sentFor = (contact, deal) => S.sent.filter(m => m.contact_id === contact?.id && (!deal || !m.deal_id || m.deal_id === deal.id));
  const sentStep = (contact, deal, stepId) => sentFor(contact, deal).filter(m => msgById(m.message_id)?.step === stepId).sort((a, b) => String(b.sent_at).localeCompare(String(a.sent_at)))[0];
  const amountsOf = deal => {
    const q = latestQuote(deal);
    const total = Number(q?.total || deal?.amount) || 0;
    const pct = Number(S.settings.acompte) || ACOMPTE_MODELE;
    const paid = deal ? sum(invoices().filter(i => i.deal_id === deal.id), cashed) : 0;
    const acompte = round2(total * pct / 100);
    return { total, acompte, solde: round2(total - Math.max(paid, acompte)), paid, quote: q };
  };
  // État de chaque étape pour un client (et son projet) : sent, now, later, missed, na.
  const journey = (contact, deal) => {
    const t = today(), branch = branchOf(deal), stage = deal?.stage || 'nouveau';
    const ev = deal?.event_date, days = ev ? daysBetween(t, ev) : null;
    const after = s => STAGES.findIndex(([id]) => id === stage) >= STAGES.findIndex(([id]) => id === s);
    const delivered = sentStep(contact, deal, 'livraison');
    const sinceDelivery = delivered ? daysBetween(iso(delivered.sent_at), t) : null;
    const quote = latestQuote(deal);
    const due = {
      request: !deal || ['nouveau', 'qualifie'].includes(stage),
      quote: Boolean(quote) && ['nouveau', 'qualifie', 'devis'].includes(stage),
      signed: ['signe', 'production'].includes(stage) && (days == null || days >= 0),
      before7: days != null && days > 1 && days <= 7 && ['signe', 'production', 'devis', 'qualifie'].includes(stage),
      before1: days === 1 && stage !== 'perdu',
      after0: days != null && days <= 0 && days >= -3 && ['signe', 'production', 'livre'].includes(stage),
      delivered: ['livre', 'paye'].includes(stage),
      review: sinceDelivery != null && sinceDelivery >= 10,
      paid: stage === 'paye' || (sinceDelivery != null && sinceDelivery >= 30),
      anniversary: ev ? Math.abs(daysBetween(addDays(ev, 365), t)) <= 15 : false
    };
    const reached = {
      request: true, quote: Boolean(quote) || after('devis'), signed: after('signe'), before7: days != null && days <= 1, before1: days != null && days <= 0,
      after0: days != null && days < -3, delivered: after('livre'), review: due.review, paid: after('paye'), anniversary: false
    };
    let progress = -1;
    const rows = MSG().steps.map((step, i) => {
      const msgs = MSG().messages.filter(m => m.step === step.id && (!m.branch || m.branch === branch));
      const sent = contact ? sentStep(contact, deal, step.id) : null;
      let state;
      if (sent) state = 'sent';
      else if (deal?.stage === 'perdu' && step.id !== 'contact') state = 'na';
      else if (step.branch && step.branch !== branch) state = 'na';
      else if (step.branch === 'datee' && !ev) state = 'later';
      else if (due[step.rule]) state = 'now';
      else state = 'later';
      if (state === 'sent' || state === 'now' || reached[step.rule]) progress = Math.max(progress, i);
      return { step, msgs, sent, state, i };
    });
    rows.forEach(r => { if (r.state === 'later' && r.i < progress && !due[r.step.rule]) r.state = 'missed'; });
    return { branch, rows, deal, contact };
  };
  // Message conseillé pour une étape : version solde la veille si le solde reste dû, sinon l'email d'abord.
  const pickMessage = (rows, deal) => {
    if (!rows.msgs.length) return null;
    if (rows.step.id === 'veille') { const a = amountsOf(deal); return msgById(a.total && a.paid < a.total ? 'wa-veille-solde' : 'wa-veille'); }
    return rows.msgs.find(m => m.channel === 'email') || rows.msgs[0];
  };
  const dueMessages = () => {
    const items = [];
    S.deals.filter(d => d.contact_id && d.stage !== 'perdu').forEach(d => {
      const c = contactOf(d.contact_id); if (!c) return;
      journey(c, d).rows.filter(r => r.state === 'now').forEach(r => {
        const m = pickMessage(r, d); if (!m) return;
        items.push({ type: 'Message', when: d.event_date && ['j7', 'veille', 'merci'].includes(r.step.id) ? d.event_date : today(), text: `Envoyer « ${r.step.label} » à ${fullName(c)}`, late: false, go: () => open('message', { msg: m.id, contact: c.id, deal: d.id }), step: r.step.id });
      });
    });
    return items;
  };
  const todoAll = () => [...followUps(), ...dueMessages()].sort((a, b) => Number(b.late) - Number(a.late) || a.when.localeCompare(b.when));
  const nextFor = c => { const d = activeDeal(c); const j = journey(c, d); const r = j.rows.find(x => x.state === 'now') || j.rows.find(x => x.state === 'later'); return r ? { row: r, deal: d, msg: pickMessage(r, d) } : null; };

  const msgVars = (contact, deal, msg) => {
    const ev = deal ? eventOf(deal.id) : null, a = amountsOf(deal), s = S.settings;
    const links = { espace: s.lienEspace, questionnaire: s.lienQuestionnaire, avis: s.lienAvis, galerie: '' };
    return {
      prenom: firstName(contact), nom: fullName(contact), projet: deal?.title || '', date: deal?.event_date ? longDate(deal.event_date) : '',
      heure: ev ? hhmm(ev.starts_at) : '', lieu: ev?.location || '', montant: a.total ? money(a.total) : '', acompte: a.total ? money(a.acompte) : '',
      solde: a.total ? money(Math.max(0, a.solde)) : '', numero: a.quote?.number || '', lien: msg?.lien ? links[msg.lien] || '' : 'https://nolanarc.com',
      questionnaire: s.lienQuestionnaire || '', delai: s.delaiLivraison || '', duree_galerie: s.dureeGalerie || '', duree_video: s.dureeVideo || '',
      occasion: '', metier: s.metier || ''
    };
  };
  const fillMessage = (text, vars, missing) => String(text || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => { if (vars[k]) return vars[k]; missing.add(k); return `[${k} à compléter]`; });

  // ------------------------------------------------------------ Mise en place
  const setupStep = (file, extra) => el('ol', { className: 'ck-steps' }, [
    el('li', {}, [el('span', { textContent: 'Ouvre ' }), link(`${file} sur GitHub ↗`, `https://github.com/Almorder/PORTFOLIO_3D/blob/main/supabase/${file}`), el('span', { textContent: ', clique sur l’icône « Copy raw file » en haut à droite du code.' })]),
    el('li', { textContent: 'Dans Supabase : ton projet > SQL Editor (menu de gauche) > New query.' }),
    el('li', { textContent: 'Colle le texte, puis clique sur Run (en bas à droite). Le message « Success. No rows returned » confirme.' }),
    el('li', { textContent: extra || 'Reviens ici et recharge la page.' })
  ]);
  const setup = () => el('div', {}, [
    heading('Cockpit à activer', 'Les tables du cockpit n’existent pas encore dans Supabase. Cinq minutes, une seule fois.'),
    card('Mise en place', [setupStep('cockpit_schema.sql'), S.error ? el('p', { className: 'ck-hint', textContent: `Détail technique : ${S.error}` }) : null], 'admin-card--wide')
  ]);
  const v2Notice = () => (S.v2 ? null : card('Une étape pour activer prénom, nom et suivi des messages', [
    el('p', { textContent: 'La mise à jour de ta base n’a pas encore été faite. En attendant, les fiches gardent un seul champ « nom » et l’envoi des messages n’est pas mémorisé.' }),
    setupStep('admin_v2_schema.sql')
  ], 'admin-card--wide ck-notice'));
  const guard = view => (...args) => S.missing ? setup() : view(...args);

  // ------------------------------------------------------------ Vues
  const V = {};

  // Pilotage : ce qui compte aujourd'hui, et les trois actions les plus fréquentes.
  V.pilotage = guard(() => {
    const m = metrics(), s = S.settings, todo = todoAll(), next = nextDeclaration();
    const firstMsg = dueMessages()[0];
    const stat = (value, label, sub, target) => {
      const node = button('', 'admin-stat', () => go(target), `${label} : ${value}`);
      node.append(el('strong', { textContent: value }), el('span', { textContent: label }), sub ? el('small', { className: 'ck-stat-sub', textContent: sub }) : null);
      return node;
    };
    const quick = el('div', { className: 'ck-quick' }, [
      button('+ Nouvelle demande', 'ck-quick__btn', () => open('deal', null)),
      button('+ Nouveau document', 'ck-quick__btn', () => open('newdoc', {})),
      button(firstMsg ? `Prochain message : ${firstMsg.text.replace(/^Envoyer /, '')}` : 'Messages : carte du parcours', 'ck-quick__btn ck-quick__btn--accent', () => (firstMsg ? firstMsg.go() : open('messages', null)))
    ]);
    const todoCard = card('À faire maintenant', todo.length
      ? [el('ul', { className: 'ck-list ck-todo' }, todo.slice(0, 10).map(item => el('li', { className: item.late ? 'is-late' : '' }, [pill(item.type, item.type === 'Message' ? 'msg' : item.late ? 'late' : ''), button(item.text, 'ck-link', item.go), el('time', { textContent: shortDate(item.when) })]))),
        todo.length > 10 ? el('p', { className: 'ck-hint', textContent: `Et ${todo.length - 10} autre(s).` }) : null]
      : [el('p', { className: 'admin-ok', textContent: 'Rien en attente. Tout est à jour.' })], 'admin-card--wide ck-card-todo');
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
      el('p', { className: m.caYear > RULES.tvaBase ? 'admin-alert' : 'ck-hint', textContent:
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
    const pipeCard = card('Demandes en cours', [
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
      ['Factures officielles (Indy)', 'https://app.indy.fr/'],
      ['Déclaration URSSAF', 'https://www.autoentrepreneur.urssaf.fr/']
    ].map(([text, href]) => el('li', {}, [link(`${text} ↗`, href)])))]);
    return el('div', {}, [
      bar2('Pilotage', new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
      v2Notice(),
      quick,
      el('div', { className: 'admin-stats' }, [
        stat(String(todo.length), 'actions à faire', todo.filter(x => x.late).length ? `${todo.filter(x => x.late).length} en retard` : 'aucune en retard', 'pilotage'),
        stat(money(m.due), 'à encaisser', m.late.length ? `${m.late.length} facture(s) en retard` : 'aucun retard', 'documents'),
        stat(money(m.weighted), 'demandes pondérées', `${m.active.length} demande(s) en cours`, 'demandes'),
        stat(money(m.caYear), `encaissés en ${new Date().getFullYear()}`, `dont ${money(m.caMonth)} ce mois-ci`, 'finances')
      ]),
      el('div', { className: 'admin-grid' }, [todoCard, agendaCard, goalCard, pipeCard, urssafCard, seuilCard, shortcuts])
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
          move.addEventListener('change', async () => { move.disabled = true; if (await save('crm_deals', { stage: move.value }, d.id)) { go('demandes'); say(`« ${d.title} » : ${STAGE[move.value].label}.`, 'ok'); } });
          const late = d.next_action_date && d.next_action_date < t;
          return el('article', { className: `ck-card${late ? ' is-late' : ''}` }, [
            button(d.title, 'ck-card__title', () => open('deal', d.id)),
            el('p', { textContent: [fullName(contact), offerLabel(d.offer)].filter(Boolean).join(' · ') }),
            el('p', { className: 'ck-card__meta' }, [el('strong', { textContent: money(d.amount) }), d.event_date ? el('span', { textContent: `Date : ${shortDate(d.event_date)}` }) : null]),
            d.next_action ? el('p', { className: 'ck-card__next', textContent: `${d.next_action}${d.next_action_date ? ` (${shortDate(d.next_action_date)})` : ''}` }) : null,
            move
          ]);
        })
      ]);
    }));
    return el('div', {}, [
      bar2('Demandes et projets', 'Chaque demande avance d’une colonne à l’autre jusqu’au paiement. Change l’étape depuis la carte.',
        button(S.showLost ? 'Masquer les perdues' : 'Voir les perdues', 'admin-mini', () => { S.showLost = !S.showLost; go('demandes'); }), button('+ Nouvelle demande', 'admin-button', () => open('deal', null))),
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
  const splitName = full => { const parts = String(full || '').trim().split(/\s+/).filter(Boolean); return { first_name: parts[0] || '', last_name: parts.slice(1).join(' ') }; };
  // Ligne à envoyer pour un client : nom toujours rempli, colonnes v2 seulement si la base est à jour.
  const contactRow = values => {
    const v = { ...values };
    const first = (v.first_name || '').trim(), last = (v.last_name || '').trim();
    v.name = [first, last].filter(Boolean).join(' ') || (v.name || '').trim() || (v.company || '').trim();
    if (v.siret) v.siret = String(v.siret).replace(/[^\d ]/g, '').trim() || null;
    const allowed = S.v2 ? [...CONTACT_COLUMNS, ...CONTACT_V2] : CONTACT_COLUMNS;
    return Object.fromEntries(Object.entries(v).filter(([k]) => allowed.includes(k)).map(([k, x]) => [k, x === '' ? null : x]));
  };

  V.deal = guard(() => {
    const deal = typeof S.focus === 'string' ? dealOf(S.focus) : null;
    const preset = deal ? {} : (S.focus || {});
    const contact = deal ? contactOf(deal.contact_id) : contactOf(preset.contact);
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
    const contactPick = form([{ name: 'contact_id', label: 'Client existant', type: 'select', options: contactOptions('Aucun client'), full: true }], { contact_id: contact?.id || '' });
    const newContact = form([
      { name: 'first_name', label: 'Prénom', autocomplete: 'off' }, { name: 'last_name', label: 'Nom', autocomplete: 'off' }, { name: 'company', label: 'Entreprise (si professionnel)' },
      { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Téléphone', type: 'tel' },
      { name: 'source', label: 'Source', type: 'select', options: [['', 'Non précisée'], ...SOURCES.map(s => [s, s])] }
    ], { source: 'Site (formulaire)' });
    const paste = el('textarea', { className: 'admin-input admin-input--area', rows: 5, placeholder: 'Colle ici l’email reçu (FormSubmit ou message libre) : nom, email, offre et message sont repérés automatiquement.' });
    paste.setAttribute('aria-label', 'Email de demande à analyser');
    const fill = button('Remplir la fiche', 'admin-mini', () => {
      const r = parseRequest(paste.value);
      const n = splitName(r.name);
      if (n.first_name) newContact.inputs.first_name.value = n.first_name;
      if (n.last_name) newContact.inputs.last_name.value = n.last_name;
      if (r.email) newContact.inputs.email.value = r.email;
      if (r.phone) newContact.inputs.phone.value = r.phone;
      if (r.company) newContact.inputs.company.value = r.company;
      if (r.offer) dealForm.inputs.offer.value = r.offer;
      if (r.amount) dealForm.inputs.amount.value = String(r.amount);
      if (!dealForm.inputs.title.value) dealForm.inputs.title.value = [offerLabel(r.offer) || r.intent || 'Demande', r.name || r.company].filter(Boolean).join(' : ');
      if (r.message) dealForm.inputs.notes.value = [dealForm.inputs.notes.value, `Message : ${r.message}`, r.budget ? `Budget indiqué : ${r.budget}` : ''].filter(Boolean).join('\n');
      const known = r.email && S.contacts.find(c => (c.email || '').toLowerCase() === r.email.toLowerCase());
      if (known) contactPick.inputs.contact_id.value = known.id;
      say(known ? `Client déjà connu : ${fullName(known)}. Fiche préremplie.` : 'Fiche préremplie : vérifie puis enregistre.', 'ok');
    });
    const submit = button(deal ? 'Enregistrer' : 'Créer la demande', 'admin-button', async () => {
      const row = dealForm.read();
      if (!row.title) return say('Donne un nom au projet.', 'warn');
      submit.disabled = true;
      let contactId = contactPick.read().contact_id;
      const c = newContact.read();
      if (!contactId && (c.first_name || c.last_name || c.company)) { const created = await save('crm_contacts', contactRow({ ...c, client_type: c.company ? 'professionnel' : 'particulier' })); if (!created) { submit.disabled = false; return; } contactId = created.id; }
      row.contact_id = contactId || null; row.amount = row.amount || 0;
      const saved = await save('crm_deals', row, deal?.id);
      submit.disabled = false;
      if (saved) { setDirty(false); open('deal', saved.id); say(deal ? 'Demande enregistrée.' : 'Demande créée.', 'ok'); }
    });
    [dealForm.node, contactPick.node, newContact.node].forEach(n => n.addEventListener('input', () => setDirty(true)));
    const linkedDocs = deal ? S.docs.filter(d => d.deal_id === deal.id) : [];
    const linkedEvents = deal ? S.events.filter(e => e.deal_id === deal.id) : [];
    const docPreset = kind => ({ kind, deal: deal.id, contact: deal.contact_id || undefined, template: kind === 'devis' ? (branchOf(deal) === 'mission' ? 'devis_mission' : 'devis_datee') : kind === 'contrat' ? (branchOf(deal) === 'mission' ? 'contrat_mission' : 'contrat_datee') : undefined });
    return el('div', {}, [
      bar2(deal ? deal.title : 'Nouvelle demande', deal ? `${STAGE[deal.stage].label}${contact ? ` · ${fullName(contact)}` : ''}` : 'Saisis la demande, ou colle l’email reçu pour remplir la fiche.',
        contact ? back(fullName(contact), 'contact', contact.id) : back('Demandes', 'demandes'), submit),
      el('div', { className: 'admin-grid' }, [
        deal ? card('Documents, messages et agenda', [
          el('div', { className: 'admin-row' }, [
            button('+ Devis', 'admin-mini', () => open('doc', docPreset('devis'))),
            button('+ Contrat', 'admin-mini', () => open('doc', docPreset('contrat'))),
            button('+ Facture', 'admin-mini', () => open('doc', docPreset('facture'))),
            button('+ Droit à l’image', 'admin-mini', () => open('doc', docPreset('droit_image'))),
            button('+ Agenda', 'admin-mini', () => open('event', { deal: deal.id })),
            deal.contact_id ? button('Messages du parcours', 'admin-mini', () => open('messages', { contact: deal.contact_id, deal: deal.id })) : null
          ]),
          el('ul', { className: 'ck-list' }, [...linkedDocs.map(d => el('li', {}, [pill(kindLabel(d.kind, true), `kind-${d.kind}`), button(`${d.number}${['devis', 'facture'].includes(d.kind) ? ` : ${money(d.total)}` : ''}`, 'ck-link', () => open('doc', d.id)), pill(DOC_STATUS[d.status], d.status)])),
            ...linkedEvents.map(e => el('li', {}, [pill(EVENT_KINDS[e.kind]), button(e.title, 'ck-link', () => open('event', e.id)), el('time', { textContent: shortDate(e.starts_at) })]))])
        ], 'admin-card--wide') : card('Coller l’email reçu', [paste, fill], 'admin-card--wide'),
        card('Projet', [dealForm.node], 'admin-card--wide'),
        card('Client', [contactPick.node, contact ? el('p', { className: 'ck-hint' }, [button(`Ouvrir la fiche de ${fullName(contact)}`, 'ck-link', () => open('contact', contact.id))]) : null, el('details', { className: 'ck-details', open: !deal && !contact }, [el('summary', { textContent: 'Ou créer un nouveau client' }), newContact.node])], 'admin-card--wide'),
        deal ? card('Supprimer', [el('p', { className: 'ck-hint', textContent: 'Les documents liés restent enregistrés.' }), armed('Supprimer la demande', 'Confirmer la suppression', async () => { if (await remove('crm_deals', deal.id)) { setDirty(false); go('demandes'); say('Demande supprimée.', 'ok'); } })]) : null
      ])
    ]);
  });

  // Clients : liste
  const stateLabel = { sent: 'Envoyé', now: 'À envoyer maintenant', later: 'Plus tard', missed: 'Passé sans envoi', na: 'Non concerné' };
  V.clients = guard(() => {
    const search = el('input', { type: 'search', className: 'admin-input', placeholder: 'Rechercher un prénom, un nom, une entreprise, un email', value: S.clientFilter });
    search.setAttribute('aria-label', 'Rechercher un client');
    const tbody = el('tbody');
    const render = () => {
      const q = norm(search.value.trim()); S.clientFilter = search.value;
      const list = [...S.contacts].sort((a, b) => fullName(a).localeCompare(fullName(b), 'fr')).filter(c => !q || [fullName(c), c.company, c.email, c.phone].some(v => norm(v).includes(q)));
      tbody.replaceChildren(...list.map(c => {
        const deals = S.deals.filter(d => d.contact_id === c.id);
        const ca = sum(invoices().filter(d => d.contact_id === c.id), cashed);
        const nx = nextFor(c);
        return el('tr', {}, [
          el('th', { scope: 'row' }, [button(fullName(c) || c.company || 'Sans nom', 'ck-link ck-strong', () => open('contact', c.id)), c.company && c.company !== fullName(c) ? el('small', { textContent: c.company }) : null]),
          el('td', {}, [pill(isPro(c) ? 'Pro' : 'Particulier', isPro(c) ? 'pro' : '')]),
          el('td', {}, [c.email ? el('a', { href: `mailto:${c.email}`, textContent: c.email }) : null, c.phone ? el('small', {}, [el('a', { href: `tel:${c.phone.replace(/\s/g, '')}`, textContent: c.phone })]) : null]),
          el('td', { textContent: String(deals.length) }),
          el('td', {}, [nx ? button(nx.row.step.label, `ck-link${nx.row.state === 'now' ? ' is-now' : ''}`, () => (nx.msg ? open('message', { msg: nx.msg.id, contact: c.id, deal: nx.deal?.id }) : open('messages', { contact: c.id }))) : null, nx ? el('small', { textContent: stateLabel[nx.row.state] }) : null]),
          el('td', { className: 'ck-num', textContent: money(ca) })
        ]);
      }));
      if (!list.length) tbody.append(el('tr', {}, [el('td', { colSpan: 6, textContent: S.contacts.length ? 'Aucun résultat.' : 'Aucun client pour l’instant : ils se créent ici ou avec les demandes.' })]));
    };
    search.addEventListener('input', render); render();
    return el('div', {}, [
      bar2('Clients', `${S.contacts.length} client(s). Clique sur un nom pour ouvrir sa fiche : projets, documents, messages.`, button('+ Nouveau client', 'admin-button', () => open('contact', null))),
      v2Notice(),
      search,
      el('div', { className: 'ck-table-wrap' }, [el('table', { className: 'ck-table' }, [el('thead', {}, [el('tr', {}, ['Client', 'Type', 'Coordonnées', 'Projets', 'Prochain message', 'Encaissé'].map(h => el('th', { scope: 'col', textContent: h })))]), tbody])])
    ]);
  });

  // Fiche client : le centre de tout ce qui concerne une personne.
  const contactFields = () => [
    { name: 'civility', label: 'Civilité (facultatif)', type: 'select', options: [['', 'Aucune'], ['Mme', 'Mme'], ['M.', 'M.']] },
    { name: 'client_type', label: 'Type de client', type: 'select', options: CLIENT_TYPES },
    { name: 'first_name', label: 'Prénom', autocomplete: 'off' }, { name: 'last_name', label: 'Nom', autocomplete: 'off' },
    { name: 'company', label: 'Entreprise' }, { name: 'siret', label: 'SIRET du client (si professionnel)', inputMode: 'numeric' },
    { name: 'email', label: 'Email', type: 'email' }, { name: 'phone', label: 'Téléphone', type: 'tel' },
    { name: 'address', label: 'Adresse (imprimée sur les documents)', type: 'textarea', rows: 2, full: true },
    { name: 'source', label: 'Source', type: 'select', options: [['', 'Non précisée'], ...SOURCES.map(s => [s, s])] },
    { name: 'notes', label: 'Notes', type: 'textarea', full: true }
  ].filter(f => S.v2 || !CONTACT_V2.includes(f.name) || ['first_name', 'last_name'].includes(f.name));

  V.contact = guard(() => {
    const c = typeof S.focus === 'string' ? contactOf(S.focus) : null;
    const values = c ? { ...c, ...(c.first_name || c.last_name ? {} : splitName(c.name)), client_type: c.client_type || (c.company ? 'professionnel' : 'particulier') } : { client_type: 'particulier' };
    const f = form(contactFields(), values);
    f.node.addEventListener('input', () => setDirty(true));
    const submit = button(c ? 'Enregistrer la fiche' : 'Créer le client', 'admin-button', async () => {
      const row = contactRow(f.read());
      if (!row.name) return say('Indique au moins un prénom, un nom ou une entreprise.', 'warn');
      if (row.siret && !/^[\d ]{9,20}$/.test(row.siret)) return say('Le SIRET doit contenir 14 chiffres.', 'warn');
      submit.disabled = true; const saved = await save('crm_contacts', row, c?.id); submit.disabled = false;
      if (saved) { setDirty(false); open('contact', saved.id); say('Fiche enregistrée.', 'ok'); }
    });
    if (!c) return el('div', {}, [bar2('Nouveau client', 'Prénom et nom séparés : ils préremplissent tes documents et tes messages.', back('Clients', 'clients'), submit), v2Notice(), card('Coordonnées', [f.node], 'admin-card--wide')]);

    const deals = S.deals.filter(d => d.contact_id === c.id);
    const docs = S.docs.filter(d => d.contact_id === c.id).sort((a, b) => String(b.issue_date).localeCompare(String(a.issue_date)));
    const sent = S.sent.filter(m => m.contact_id === c.id).sort((a, b) => String(a.sent_at).localeCompare(String(b.sent_at)));
    const deal = activeDeal(c);
    const j = journey(c, deal);
    const nx = nextFor(c);
    const preset = kind => ({ kind, contact: c.id, deal: deal?.id, template: kind === 'devis' ? (j.branch === 'mission' ? 'devis_mission' : 'devis_datee') : undefined });
    const quick = el('div', { className: 'ck-quick ck-quick--hub' }, [
      button('+ Devis', 'ck-quick__btn', () => open('doc', preset('devis'))),
      button('+ Facture', 'ck-quick__btn', () => open('doc', preset('facture'))),
      button('+ Droit à l’image', 'ck-quick__btn', () => open('doc', preset('droit_image'))),
      button('+ Demande', 'ck-quick__btn', () => open('deal', { contact: c.id })),
      nx?.msg ? button(`Envoyer : ${nx.row.step.label}`, `ck-quick__btn${nx.row.state === 'now' ? ' ck-quick__btn--accent' : ''}`, () => open('message', { msg: nx.msg.id, contact: c.id, deal: nx.deal?.id })) : null
    ]);
    const coords = el('dl', { className: 'ck-coords' }, [
      ['Type', isPro(c) ? 'Professionnel' : 'Particulier'], ['Entreprise', c.company], ['SIRET', c.siret], ['Email', c.email], ['Téléphone', c.phone], ['Adresse', c.address], ['Source', c.source]
    ].filter(([, v]) => v).flatMap(([k, v]) => [el('dt', { textContent: k }), el('dd', {}, [k === 'Email' ? el('a', { href: `mailto:${v}`, textContent: v }) : k === 'Téléphone' ? el('a', { href: `tel:${String(v).replace(/\s/g, '')}`, textContent: v }) : el('span', { textContent: v })])]));
    const steps = el('ol', { className: 'ck-mini-journey' }, j.rows.map(r => {
      const b = button('', `ck-mini-journey__step is-${r.state}`, () => { const m = pickMessage(r, deal); if (m) open('message', { msg: m.id, contact: c.id, deal: deal?.id }); }, `${r.step.label} : ${stateLabel[r.state]}${r.sent ? ` le ${shortDate(r.sent.sent_at)}` : ''}`);
      b.append(el('span', { className: 'ck-dot' }), el('span', { textContent: r.step.label }), el('small', { textContent: r.sent ? shortDate(r.sent.sent_at) : stateLabel[r.state] }));
      return el('li', {}, [b]);
    }));
    return el('div', {}, [
      bar2(fullName(c) || c.company, [c.company && c.company !== fullName(c) ? c.company : '', isPro(c) ? 'Professionnel' : 'Particulier', deal ? `Projet en cours : ${deal.title}` : ''].filter(Boolean).join(' · '), back('Clients', 'clients')),
      v2Notice(),
      quick,
      el('div', { className: 'admin-grid' }, [
        card('Parcours et prochain message', [
          nx ? el('p', { className: `ck-next${nx.row.state === 'now' ? ' is-now' : ''}` }, [el('strong', { textContent: `${nx.row.step.label} : ` }), el('span', { textContent: `${nx.row.step.when}. ${nx.row.step.why}` })]) : el('p', { className: 'admin-ok', textContent: 'Parcours terminé.' }),
          steps,
          actions(button('Ouvrir la carte des messages', 'admin-mini', () => open('messages', { contact: c.id, deal: deal?.id })), deal ? el('span', { className: 'ck-hint', textContent: `Parcours ${j.branch === 'mission' ? 'mission continue' : 'prestation datée'}` }) : null)
        ], 'admin-card--wide'),
        card('Coordonnées', [coords.childNodes.length ? coords : el('p', { className: 'ck-hint', textContent: 'Aucune coordonnée pour l’instant.' }), c.notes ? el('p', { className: 'ck-hint', textContent: c.notes }) : null]),
        card('Projets', [deals.length ? el('ul', { className: 'ck-list' }, deals.map(d => el('li', {}, [button(d.title, 'ck-link', () => open('deal', d.id)), pill(STAGE[d.stage].label), d.event_date ? el('time', { textContent: shortDate(d.event_date) }) : null]))) : el('p', { className: 'ck-hint', textContent: 'Aucun projet.' }), button('+ Demande', 'admin-mini', () => open('deal', { contact: c.id }))]),
        card('Documents', [docs.length ? el('ul', { className: 'ck-list' }, docs.map(d => el('li', {}, [pill(kindLabel(d.kind, true), `kind-${d.kind}`), button(`${d.number}${['devis', 'facture'].includes(d.kind) ? ` : ${money(d.total)}` : ''}`, 'ck-link', () => open('doc', d.id)), pill(DOC_STATUS[d.status], d.status), el('time', { textContent: shortDate(d.issue_date) })]))) : el('p', { className: 'ck-hint', textContent: 'Aucun document.' })]),
        card('Messages envoyés', [sent.length ? el('ol', { className: 'ck-list ck-sent' }, sent.map(m => el('li', {}, [el('time', { textContent: shortDate(m.sent_at) }), el('span', { textContent: msgById(m.message_id)?.label || m.message_id }), pill(CHANNELS[m.channel] || m.channel), m.deal_id && dealOf(m.deal_id) ? el('small', { textContent: dealOf(m.deal_id).title }) : null, m.note ? el('small', { textContent: m.note }) : null]))) : el('p', { className: 'ck-hint', textContent: S.v2 ? 'Aucun message marqué comme envoyé.' : 'Le suivi des messages s’active avec admin_v2_schema.sql.' })]),
        card('Modifier la fiche', [f.node, actions(submit)], 'admin-card--wide'),
        card('Supprimer', [el('p', { className: 'ck-hint', textContent: 'Les projets et documents restent enregistrés, sans client associé ; l’historique des messages est effacé. À faire si la personne demande l’effacement de ses données.' }), armed('Supprimer le client', 'Confirmer la suppression', async () => { if (await remove('crm_contacts', c.id)) { setDirty(false); go('clients'); say('Client supprimé.', 'ok'); } })])
      ])
    ]);
  });

  // ------------------------------------------------------------ Documents
  const MODELS = () => window.NolanDocModels?.models || [];
  const SETTINGS_FIELDS = () => window.NolanDocModels?.settingsFields || {};
  const DEFAULT_TEMPLATE = { devis: 'devis_datee', facture: 'facture', contrat: 'contrat_datee', droit_image: 'droit_image', retractation: 'retractation' };
  const modelOf = d => MODELS().find(m => m.id === (d.template || DEFAULT_TEMPLATE[d.kind]));
  const kindLabel = (kind, one) => one ? DOC_ONE[kind] || kind : DOC_KINDS[kind] || kind;
  const docName = d => `${kindLabel(d.kind, true)} ${d.number}`;
  const clientLabel = c => { const n = fullName(c), co = c?.company || ''; return co && n && co !== n ? `${co} · ${n}` : co || n; };

  V.documents = guard(() => {
    const t = today();
    const counts = Object.fromEntries(Object.keys(DOC_KINDS).map(k => [k, S.docs.filter(d => d.kind === k).length]));
    const tabs = [['tous', `Tous (${S.docs.length})`], ['brouillon', 'Brouillons'], ...Object.entries(DOC_KINDS).map(([k, l]) => [k, `${l} (${counts[k]})`]), ['attente', 'À encaisser'], ['retard', 'En retard']];
    const isLate = d => d.kind === 'facture' && d.status === 'envoye' && d.due_date && d.due_date < t;
    const tabBar = el('div', { className: 'ck-tabs' }, tabs.map(([id, l]) => { const b = button(l, 'ck-tab', () => { S.docTab = id; go('documents'); }); b.setAttribute('aria-pressed', String(S.docTab === id)); return b; }));
    const search = el('input', { type: 'search', className: 'admin-input', placeholder: 'Rechercher : numéro, client, projet, personne photographiée', value: S.docFilter });
    search.setAttribute('aria-label', 'Rechercher un document');
    const tree = el('div', { className: 'nd-tree' });
    const row = d => el('li', { className: `nd-item${isLate(d) ? ' is-late' : ''}` }, [
      pill(kindLabel(d.kind, true), `kind-${d.kind}`),
      button(`${d.number}${d.title ? ` : ${d.title}` : d.data?.NomPersonne ? ` : ${d.data.NomPersonne}` : ''}`, 'ck-link', () => open('doc', d.id)),
      d.file_path ? el('span', { className: 'nd-file', textContent: 'PDF joint' }) : null,
      ['devis', 'facture'].includes(d.kind) ? el('span', { className: 'nd-amount', textContent: money(d.total) }) : null,
      pill(isLate(d) ? 'En retard' : DOC_STATUS[d.status], isLate(d) ? 'late' : d.status),
      el('time', { textContent: shortDate(d.issue_date) })
    ]);
    // Le filtre se fait sur place, sans redessiner la page : un clic sur un résultat n'est jamais perdu.
    const render = () => {
      const q = norm(search.value.trim()); S.docFilter = search.value;
      const list = S.docs.filter(d => (S.docTab === 'tous' || d.kind === S.docTab || (S.docTab === 'brouillon' && d.status === 'brouillon')
        || (S.docTab === 'attente' && d.kind === 'facture' && d.status === 'envoye') || (S.docTab === 'retard' && isLate(d)))
        && (!q || [d.number, d.title, fullName(contactOf(d.contact_id)), contactOf(d.contact_id)?.company, dealOf(d.deal_id)?.title, d.data?.NomPersonne].some(v => norm(v).includes(q))));
      const groups = new Map();
      list.forEach(d => {
        const ck = d.contact_id || 'none', dk = d.deal_id || 'none';
        if (!groups.has(ck)) groups.set(ck, new Map());
        const g = groups.get(ck); if (!g.has(dk)) g.set(dk, []); g.get(dk).push(d);
      });
      const latest = docs => docs.reduce((m, d) => (d.issue_date > m ? d.issue_date : m), '');
      const ordered = [...groups.entries()].sort((a, b) => latest([...b[1].values()].flat()).localeCompare(latest([...a[1].values()].flat())));
      tree.replaceChildren(...(ordered.length ? ordered.map(([ck, deals], i) => {
        const c = contactOf(ck), all = [...deals.values()].flat();
        return el('details', { className: 'nd-client', open: i < 8 || Boolean(q) }, [
          el('summary', {}, [el('strong', { textContent: c ? clientLabel(c) : 'Sans client' }), el('span', { textContent: `${all.length} document(s)` }), c ? button('Fiche client', 'admin-mini', () => open('contact', c.id)) : null]),
          ...[...deals.entries()].map(([dk, docs]) => {
            const deal = dealOf(dk);
            return el('section', { className: 'nd-project' }, [
              el('h4', {}, [deal ? button(deal.title, 'ck-link', () => open('deal', deal.id)) : el('span', { textContent: 'Hors projet' }), deal ? pill(STAGE[deal.stage].label) : null]),
              el('ul', { className: 'nd-rows' }, docs.sort((a, b) => String(b.issue_date).localeCompare(String(a.issue_date)) || String(b.number).localeCompare(String(a.number))).map(row))
            ]);
          })
        ]);
      }) : [el('p', { className: 'admin-ok', textContent: 'Aucun document ici.' })]));
    };
    search.addEventListener('input', render); render();
    return el('div', {}, [
      bar2('Documents', 'Classés par client puis par projet. Clique sur un numéro pour le modifier, même s’il est envoyé.', button('+ Nouveau document', 'admin-button', () => open('newdoc', {}))),
      S.needsDocs ? card('Une étape avant de créer des documents', [setupStep('documents_schema.sql')], 'admin-card--wide ck-mb') : null,
      el('div', { className: 'nd-tools' }, [search, tabBar]),
      tree
    ]);
  });

  // Choix du modèle : un clic, puis le document s'ouvre prérempli.
  const MODEL_HINTS = {
    devis_datee: 'Mariage, demande, shooting, tournage : une date précise.', devis_mission: 'Direction artistique, stratégie, accompagnement par phases.',
    contrat_datee: 'Complète le devis daté : réservation, annulation, report.', contrat_mission: 'Complète le devis de mission : phases, fin anticipée.',
    droit_image: 'Facultatif, séparé du contrat. Aucune case précochée.', retractation: 'Pour un client consommateur, à remettre avant l’engagement.',
    facture: 'Informative. La facture officielle part sur Indy.'
  };
  V.newdoc = guard(() => {
    const preset = isObj(S.focus) ? S.focus : {};
    const pick = form([{ name: 'contact', label: 'Pour quel client ? (facultatif)', type: 'select', options: contactOptions('Choisir plus tard') }], { contact: preset.contact || '' });
    const grid = el('div', { className: 'ck-models' }, MODELS().map(m => {
      const b = button('', `ck-model ck-model--${m.kind}`, () => { const cid = pick.inputs.contact.value || undefined; open('doc', { template: m.id, contact: cid, deal: cid ? activeDeal(contactOf(cid))?.id : undefined }); });
      b.append(el('strong', { textContent: m.label }), el('small', { textContent: MODEL_HINTS[m.id] || '' }));
      return b;
    }));
    return el('div', {}, [bar2('Nouveau document', 'Choisis le modèle : le document s’ouvre avec les informations du client et du projet déjà remplies.', back('Documents', 'documents')), card('Client', [pick.node], 'admin-card--wide ck-mb'), grid]);
  });

  // Valeurs automatiques d'un document (fiche client, projet, agenda, devis lié, Réglages).
  const autoValues = (ctx) => {
    const c = ctx.contact || {}, d = ctx.deal || {}, q = ctx.quote, ev = d.id ? eventOf(d.id) : null, s = S.settings;
    const total = Number(ctx.total) || 0, acompte = round2(total * ACOMPTE_MODELE / 100);
    const qTotal = Number(q?.total || d.amount) || 0, qAcompte = round2(qTotal * ACOMPTE_MODELE / 100);
    const m = n => (n > 0 ? money(n) : '');
    const signed = q ? (q.signed_at || (q.status === 'accepte' && q.updated_at ? iso(q.updated_at) : '')) : '';
    const base = {
      client: clientLabel(c), contactLine: [c.email, c.phone].filter(Boolean).join(' · '),
      addressSiret: [c.address, isPro(c) && c.siret ? `SIRET ${c.siret}` : ''].filter(Boolean).join('\n'),
      fullName: fullName(c), email: c.email || '', address: c.address || '',
      offer: offerLabel(d.offer) || d.title || '', dealTitle: d.title || '',
      dateHeure: ev ? `${longDate(iso(ev.starts_at))} à ${hhmm(ev.starts_at)}` : d.event_date ? longDate(d.event_date) : '',
      eventDate: d.event_date || '', lieu: ev?.location || '',
      quoteNumber: q?.number || '', quoteSigned: signed,
      acompte: m(acompte), solde: m(round2(total - acompte)), quoteTotal: m(qTotal), quoteAcompte: m(qAcompte), quoteSolde: m(round2(qTotal - qAcompte)),
      dealAmount: Number(d.amount) > 0 ? Number(d.amount) : '', phase2: total > 0 ? 'Solde : 60 %' : '',
      echeance2: total > 0 ? (ctx.data?.Echeancier || 'Avant la remise des livrables définitifs') : '',
      proAddress: s.adresseFacturation || '', isPro: isPro(c)
    };
    return key => {
      if (!key) return '';
      return key.split('|').map(k => (k.startsWith('q:') ? (q?.data?.[k.slice(2)] || '') : base[k])).find(v => v !== '' && v != null && v !== false) ?? (key === 'isPro' ? false : '');
    };
  };
  // Texte imprimé pour un champ : dates en toutes lettres, montants en euros.
  const shown = (def, v) => {
    if (v == null || v === '') return '';
    if (def.type === 'date') return ISO.test(String(v)) ? longDate(v) : String(v);
    if (def.type === 'amount') return Number(v) || def.name === 'MontantTotal' ? money(v) : '';
    return String(v);
  };

  V.doc = guard(() => {
    const existingId = typeof S.focus === 'string' ? S.focus : null;
    let existing = existingId ? S.docs.find(d => d.id === existingId) : null;
    if (existingId && !existing) return el('p', { className: 'admin-alert', textContent: 'Document introuvable : il a peut-être été supprimé.' });
    const preset = existing ? {} : (isObj(S.focus) ? S.focus : {});
    const model = existing ? modelOf(existing) : MODELS().find(m => m.id === (preset.template || DEFAULT_TEMPLATE[preset.kind || 'facture']));
    if (!model) return el('p', { className: 'admin-alert', textContent: 'Modèle introuvable : recharge la page.' });
    const kind = existing?.kind || model.kind;
    const s = S.settings, t = today();
    const presetDeal = dealOf(preset.deal);
    const doc = existing ? clone(existing) : {
      kind, number: '', status: 'brouillon', title: preset.title || presetDeal?.title || '', contact_id: preset.contact || presetDeal?.contact_id || '', deal_id: presetDeal?.id || '',
      issue_date: t, due_date: kind === 'devis' ? addDays(t, s.validiteDevis) : kind === 'facture' ? addDays(t, s.delaiPaiement) : null,
      // Première ligne de prix reprise du projet (offre et montant), modifiable.
      lines: clone(preset.lines) || (model.lines && presetDeal ? [{ label: `${offerLabel(presetDeal.offer) || 'Prestation'} : ${presetDeal.title}`, qty: 1, unit: Number(presetDeal.amount) || 0, category: 'main' }] : []),
      total: 0, paid_amount: 0, data: clone(preset.data) || {}
    };
    if (!isObj(doc.data)) doc.data = {};
    if (!isObj(doc.data.checks)) doc.data.checks = {};
    if (!Array.isArray(doc.lines)) doc.lines = [];
    const isNew = !existing;
    const fresh = new Set(isNew ? Object.keys(doc.data) : []); // données reprises d'un document dupliqué : jamais écrasées

    // --- Suivi : client, projet, statut, dates de gestion
    const statusOptions = Object.entries(DOC_STATUS).filter(([id]) => ({ devis: ['brouillon', 'envoye', 'accepte', 'refuse', 'annule'], facture: ['brouillon', 'envoye', 'paye', 'annule'] }[kind] || ['brouillon', 'envoye', 'signe', 'annule']).includes(id));
    const hasCol = col => model.sections.some(sec => (sec.fields || []).some(f => f.col === col));
    const head = form([
      { name: 'contact_id', label: 'Client', type: 'select', options: contactOptions() },
      { name: 'deal_id', label: 'Projet', type: 'select', options: dealOptions() },
      { name: 'status', label: 'Statut', type: 'select', options: statusOptions },
      ...(hasCol('title') ? [] : [{ name: 'title', label: 'Nom du document (pour toi)', placeholder: 'Ex. Mariage Léa et Sam' }]),
      ...(hasCol('issue_date') ? [] : [{ name: 'issue_date', label: 'Date du document', type: 'date' }]),
      ...(kind === 'devis' ? [{ name: 'due_date', label: 'Relance : valable jusqu’au', type: 'date' }] : []),
      ...(kind === 'facture' ? [{ name: 'paid_at', label: 'Date d’encaissement', type: 'date' }, { name: 'payment_method', label: 'Mode de règlement', type: 'select', options: [['', 'Non précisé'], ...PAY_METHODS.map(x => [x, x])] }] : []),
      ...(['contrat', 'droit_image', 'devis'].includes(kind) ? [{ name: 'signed_at', label: 'Signé le', type: 'date' }] : [])
    ], doc);
    // Ne propose que les projets du client choisi (et le projet actuel).
    const refreshDeals = () => {
      const cid = head.inputs.contact_id.value, cur = head.inputs.deal_id.value;
      head.inputs.deal_id.replaceChildren(...[['', 'Aucun projet'], ...S.deals.filter(d => !cid || d.contact_id === cid || d.id === cur).map(d => [d.id, d.title])].map(([v, l]) => el('option', { value: v, textContent: l, selected: v === cur })));
    };
    refreshDeals();

    // --- Champs du modèle, section par section
    const F = {}; // name -> { def, input }
    const lastAuto = {};
    const ctx = () => {
      const contact = contactOf(head.inputs.contact_id.value), deal = dealOf(head.inputs.deal_id.value);
      const typed = F.NumeroDevis && !F.NumeroDevis.def.col ? F.NumeroDevis.input.value.trim() : '';
      const quote = kind === 'devis' ? null : (typed && S.docs.find(x => x.kind === 'devis' && x.number === typed)) || latestQuote(deal);
      return { contact, deal, quote, total: currentTotal(), data: doc.data };
    };
    const inputFor = (def, value) => {
      let input;
      const legacyText = def.type === 'date' && value && !ISO.test(String(value)); // ancienne date écrite en toutes lettres : conservée telle quelle
      if (def.type === 'textarea') input = el('textarea', { className: 'admin-input admin-input--area', rows: 3, value: value == null ? '' : String(value) });
      else if (def.type === 'date' && !legacyText) input = el('input', { type: 'date', className: 'admin-input', value: value || '' });
      else if (def.type === 'amount') input = el('input', { type: 'number', className: 'admin-input', step: '0.01', min: '0', inputMode: 'decimal', value: value == null || value === '' ? '' : String(value) });
      else input = el('input', { type: 'text', className: 'admin-input', value: value == null ? '' : String(value) });
      if (def.readonly) { input.readOnly = true; input.classList.add('is-readonly'); input.tabIndex = -1; }
      input.name = def.name;
      return input;
    };
    const readInput = (def, input) => {
      if (def.type === 'amount') return input.value === '' ? null : round2(input.value);
      return input.type === 'date' ? input.value : input.value.replace(/\s+$/, '');
    };
    const initial = def => {
      if (def.col) return def.col === 'number' && !doc.number ? '' : doc[def.col];
      const v = doc.data[def.name];
      return v === undefined || v === null ? undefined : v;
    };
    const auto0 = autoValues({ contact: contactOf(doc.contact_id), deal: dealOf(doc.deal_id), quote: kind === 'devis' ? null : (doc.data.NumeroDevis && S.docs.find(x => x.kind === 'devis' && x.number === doc.data.NumeroDevis)) || latestQuote(dealOf(doc.deal_id)), total: Number(doc.total) || 0, data: doc.data });
    const fieldNode = def => {
      let v = initial(def);
      const saved = v;
      const a = def.auto ? auto0(def.auto) : '';
      const empty = v === undefined || v === null || v === '' || (def.type === 'amount' && !Number(v));
      // Préremplissage : un document neuf prend les valeurs connues ; un document existant ne complète que les champs jamais remplis.
      if (def.auto && (v === undefined || (isNew && !fresh.has(def.name) && empty))) v = a;
      if (v === undefined || v === null) v = '';
      const input = inputFor(def, v);
      // « manual » : valeur choisie par Nolan (différente de la valeur automatique), jamais remplacée ensuite.
      const manual = Boolean(def.auto) && saved !== undefined && saved !== null && !(isNew && !fresh.has(def.name)) && String(saved) !== String(a ?? '');
      F[def.name] = { def, input, manual };
      lastAuto[def.name] = def.auto ? String(a ?? '') : null;
      const label = el('label', { className: `admin-field${def.type === 'textarea' ? ' ck-full' : ''}` }, [el('span', { textContent: def.label }), input]);
      if (def.readonly) label.append(el('small', { className: 'ck-hint', textContent: def.col === 'number' ? (doc.number ? 'Attribué à la création.' : 'Attribué à l’enregistrement.') : 'Calculé depuis les lignes.' }));
      return label;
    };
    const CK = {}; // cases : name -> input
    const FLAGS = {};
    const checkNode = def => {
      const input = el('input', { type: 'checkbox', checked: doc.data.checks[def.name] === true }); CK[def.name] = input;
      return el('label', { className: 'admin-field admin-field--check' }, [el('span', { textContent: def.label }), input]);
    };
    const flagNode = def => {
      const a = auto0(def.auto);
      const v = doc.data[def.name] === undefined ? a : doc.data[def.name];
      const input = el('input', { type: 'checkbox', checked: Boolean(v) }); FLAGS[def.name] = { def, input, auto: Boolean(a), touched: doc.data[def.name] !== undefined && Boolean(doc.data[def.name]) !== Boolean(a) };
      input.addEventListener('change', () => { FLAGS[def.name].touched = true; });
      return el('label', { className: 'admin-field admin-field--check ck-full' }, [el('span', { textContent: def.label }), input]);
    };

    // --- Lignes de prix : exactement les rangées du modèle
    const slotRows = [];
    let linesBox = null;
    const totalOut = el('strong', { className: 'ck-total' });
    if (model.lines) {
      const pool = { main: doc.lines.filter(l => l && l.category !== 'option'), option: doc.lines.filter(l => l && l.category === 'option') };
      const overflow = [];
      model.lines.slots.forEach(slot => slot.rows.forEach(n => { const l = (pool[slot.category] || pool.main).shift(); slotRows.push({ n, category: slot.category, line: l ? { label: l.label || '', qty: l.qty ?? 1, unit: l.unit ?? 0 } : { label: '', qty: '', unit: '' } }); }));
      Object.values(pool).forEach(rest => overflow.push(...rest));
      overflow.forEach(l => { const free = slotRows.find(r => !r.line.label && !Number(r.line.unit)); if (free) free.line = { label: l.label || '', qty: l.qty ?? 1, unit: l.unit ?? 0 }; });
      linesBox = el('div', { className: 'ck-lines' });
      const head2 = el('div', { className: 'ck-line ck-line--head' }, [el('span', { textContent: 'Désignation' }), el('span', { textContent: 'Qté' }), el('span', { textContent: 'Prix unitaire (€)' }), el('span', { textContent: 'Total' })]);
      head2.setAttribute('aria-hidden', 'true');
      linesBox.append(head2);
      model.lines.slots.forEach(slot => {
        if (model.lines.slots.length > 1) linesBox.append(el('p', { className: 'ck-line-cat', textContent: slot.label }));
        slotRows.filter(r => r.category === slot.category).forEach(r => {
          const label = el('input', { className: 'admin-input', value: r.line.label, placeholder: `Ligne ${r.n}` });
          const qty = el('input', { className: 'admin-input ck-num', type: 'number', min: '0', step: 'any', inputMode: 'decimal', value: r.line.qty === '' ? '' : String(r.line.qty) });
          const unit = el('input', { className: 'admin-input ck-num', type: 'number', min: '0', step: '0.01', inputMode: 'decimal', value: r.line.unit === '' ? '' : String(r.line.unit) });
          const out = el('output', { className: 'ck-line__total' });
          [[label, 'désignation'], [qty, 'quantité'], [unit, 'prix unitaire']].forEach(([x, n]) => x.setAttribute('aria-label', `Ligne ${r.n} : ${n}`));
          r.inputs = { label, qty, unit, out };
          linesBox.append(el('div', { className: 'ck-line' }, [label, qty, unit, out]));
        });
      });
    }
    const lineValue = r => ({ label: r.inputs.label.value.trim(), qty: r.inputs.qty.value === '' ? (r.inputs.label.value.trim() || r.inputs.unit.value ? 1 : '') : Number(r.inputs.qty.value), unit: r.inputs.unit.value === '' ? '' : Number(r.inputs.unit.value) });
    const usedLines = () => slotRows.map(r => ({ ...lineValue(r), category: r.category, n: r.n })).filter(l => l.label || Number(l.unit));
    const currentTotal = () => {
      if (model.lines) return round2(sum(usedLines(), l => (Number(l.qty) || 0) * (Number(l.unit) || 0)));
      if (F.MontantTotal?.def.col === 'total') return Number(F.MontantTotal.input.value) || 0;
      return Number(doc.total) || 0;
    };

    // Sections du formulaire, dans l'ordre du modèle
    const sectionCards = model.sections.map(sec => {
      const kids = [];
      if (sec.note) kids.push(el('p', { className: 'ck-hint', textContent: sec.note }));
      if (sec.lines && linesBox) kids.push(linesBox, el('div', { className: 'admin-row ck-between' }, [el('span', { className: 'ck-hint', textContent: 'Montants nets : TVA non applicable, art. 293 B du CGI (déjà écrit sur le modèle).' }), totalOut]));
      if (sec.fields?.length) kids.push(el('div', { className: 'ck-form' }, sec.fields.map(fieldNode)));
      if (sec.flags?.length) kids.push(el('div', { className: 'ck-form' }, sec.flags.map(flagNode)));
      if (sec.checks?.length) kids.push(el('div', { className: 'ck-checks' }, sec.checks.map(checkNode)));
      if (sec.settings?.length) {
        const SF = SETTINGS_FIELDS();
        const missing = sec.settings.filter(k => !S.settings[SF[k]]);
        kids.push(el('dl', { className: 'ck-coords' }, sec.settings.flatMap(k => [el('dt', { textContent: k }), el('dd', { textContent: S.settings[SF[k]] || 'À renseigner dans Réglages' })])),
          actions(button(missing.length ? 'Compléter dans les Réglages' : 'Modifier dans les Réglages', 'admin-mini', () => go('reglages')), el('span', { className: 'ck-hint', textContent: 'Les mêmes pour tous tes documents.' })));
      }
      return card(sec.title, kids, 'admin-card--wide ck-doc-section');
    });

    // --- Valeurs à imprimer
    const valuesNow = () => {
      const v = {};
      Object.values(F).forEach(({ def, input }) => { v[def.name] = shown(def, readInput(def, input)); });
      const total = currentTotal();
      if (F.MontantTotal?.def.col === 'total') v.MontantTotal = model.lines && !usedLines().length ? '' : total ? money(total) : '';
      if (model.lines) usedLinesBySlot().forEach(({ n, l }) => {
        const has = l.label || Number(l.unit);
        v[`Ligne${n}`] = has ? l.label : ''; v[`Qte${n}`] = has ? num2.format(Number(l.qty) || 0) : '';
        v[`Prix${n}`] = has ? money(l.unit) : ''; v[`Total${n}`] = has ? money((Number(l.qty) || 0) * (Number(l.unit) || 0)) : '';
      });
      if (F.MontantRegle) { const paid = Number(F.MontantRegle.input.value) || 0; v.MontantRegle = paid > 0 ? money(paid) : ''; v.ResteDu = paid > 0 ? money(Math.max(0, total - paid)) : ''; }
      Object.entries(SETTINGS_FIELDS()).forEach(([k, sk]) => { v[k] = S.settings[sk] || ''; });
      Object.values(FLAGS).forEach(({ def, input }) => { v[def.name] = input.checked ? 'oui' : ''; });
      return v;
    };
    const usedLinesBySlot = () => slotRows.map(r => ({ n: r.n, l: lineValue(r) }));

    // --- Préremplissage vivant : on ne remplace qu'un champ vide ou resté à sa valeur automatique
    const refreshAutos = () => {
      const get = autoValues(ctx());
      Object.values(F).forEach(({ def, input, manual }) => {
        if (!def.auto || manual) return;
        const next = String(get(def.auto) ?? '');
        const cur = def.type === 'amount' ? (input.value === '' ? '' : String(Number(input.value))) : input.value;
        const prev = lastAuto[def.name] ?? '';
        if (cur === '' || cur === prev || (def.type === 'amount' && String(Number(prev)) === cur)) { if (input.value !== next) input.value = next; }
        lastAuto[def.name] = next;
        input.classList.toggle('is-auto', next !== '' && input.value === next);
      });
      Object.values(FLAGS).forEach(f => { const next = Boolean(get(f.def.auto)); if (!f.touched) f.input.checked = next; f.auto = next; });
    };
    const refreshTotals = () => {
      slotRows.forEach(r => { const l = lineValue(r); r.inputs.out.textContent = l.label || Number(l.unit) ? money((Number(l.qty) || 0) * (Number(l.unit) || 0)) : ''; });
      const total = currentTotal();
      totalOut.textContent = `Total : ${money(total)}`;
      if (F.MontantTotal?.def.col === 'total' && F.MontantTotal.def.readonly) F.MontantTotal.input.value = total ? String(total) : '';
    };

    // --- Aperçu : le modèle d'origine, rempli par textContent
    const frame = el('iframe', { className: 'dv-frame', title: `Aperçu : ${model.label}`, src: `/admin/docs/${model.file}?v=${DOCS_V}` });
    frame.setAttribute('scrolling', 'no');
    const frameBox = el('div', { className: 'dv-paper' }, [frame]);
    const frameNote = el('p', { className: 'ck-hint dv-note' });
    let marks = null;
    // Prépare le modèle : polices et ajouts de l'admin (fill.css), puis chaque zone vide garde la largeur exacte
    // qu'elle a dans le modèle d'origine (mesurée avant d'effacer le repère {{Champ}}, invisible sur le modèle).
    const prepare = async d => {
      if (!d || !d.querySelector('main.doc')) return null;
      if (!d.querySelector('link[data-admin-fill]')) {
        const l = d.createElement('link'); l.rel = 'stylesheet'; l.href = `fill.css?v=${DOCS_V}`; l.dataset.adminFill = '1';
        const loaded = new Promise(r => { l.onload = r; l.onerror = r; }); d.head.append(l); await loaded;
      }
      await Promise.all([...(d.fonts || [])].filter(x => x.status !== 'loaded').map(x => x.load().catch(() => null)));
      const fields = [...d.querySelectorAll('[data-field]')];
      fields.forEach(f => { if (!f.dataset.w) { f.dataset.w = f.getBoundingClientRect().width.toFixed(2); f.textContent = '\u200b'; } });
      const boxes = [...d.querySelectorAll('.box-marker')].map(b => { if (!b.dataset.chk) { b.dataset.chk = (b.textContent.match(/\[\[CHK:(\w+)\]\]/) || [])[1] || ''; b.textContent = ''; } return b; });
      return { d, fields, boxes, ifs: [...d.querySelectorAll('[data-if]')], ifnots: [...d.querySelectorAll('[data-ifnot]')] };
    };
    const fillDoc = (m, values, checks) => {
      m.fields.forEach(span => {
        const v = values[span.dataset.field] || '';
        // Vide : une espace sans largeur garde la ligne de base du modèle d'origine, sans aucun texte visible.
        span.textContent = v || '\u200b';
        span.style.minWidth = v ? '' : `${span.dataset.w}px`;
        span.classList.toggle('pdf-marker', !v); span.classList.toggle('na-value', Boolean(v));
      });
      m.boxes.forEach(b => { const on = checks[b.dataset.chk] === true; b.textContent = on ? '✓' : ''; b.classList.toggle('box-marker', !on); b.classList.toggle('na-tick', on); });
      m.ifs.forEach(x => x.classList.toggle('na-hidden', !values[x.dataset.if]));
      m.ifnots.forEach(x => x.classList.toggle('na-hidden', Boolean(values[x.dataset.ifnot])));
      m.d.title = [doc.number || model.label, values.Client || values.NomPersonne || values.Nom || ''].filter(Boolean).join(' ');
    };
    const checksNow = () => Object.fromEntries(Object.entries(CK).map(([k, i]) => [k, i.checked]));
    const sizeFrame = () => {
      if (!marks) return;
      const h = marks.d.documentElement.scrollHeight;
      frame.style.height = `${h}px`;
      const scale = Math.min(1, (frameBox.clientWidth || 860) / 860);
      frame.style.transform = `scale(${scale})`;
      frameBox.style.height = `${Math.ceil(h * scale)}px`;
    };
    let timer = 0;
    const refreshPreview = () => { clearTimeout(timer); timer = setTimeout(() => { if (marks) { fillDoc(marks, valuesNow(), checksNow()); sizeFrame(); } }, 120); };
    frame.addEventListener('load', async () => {
      let d = null; try { d = frame.contentDocument; } catch { d = null; }
      marks = await prepare(d);
      if (!marks) { frameNote.textContent = 'L’aperçu intégré est bloqué par ton navigateur ou par un en-tête de sécurité (voir SECURITY.md : X-Frame-Options SAMEORIGIN). Utilise « Ouvrir dans un onglet ».'; frameNote.classList.add('admin-alert'); return; }
      fillDoc(marks, valuesNow(), checksNow()); sizeFrame(); frameBox.dataset.ready = '1';
      if (S.autoPrint) { S.autoPrint = false; printFrame(); }
    });
    const onResize = () => sizeFrame();
    S.cleanup?.(); addEventListener('resize', onResize); S.cleanup = () => removeEventListener('resize', onResize);
    const printFrame = () => { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch { openTab(true); } };
    const openTab = (andPrint = false) => {
      const w = window.open(`/admin/docs/${model.file}?v=${DOCS_V}`, '_blank');
      if (!w) return say('Autorise l’ouverture d’onglets pour ce site, puis réessaie.', 'warn');
      w.addEventListener('load', async () => { const m = await prepare(w.document); if (!m) return; fillDoc(m, valuesNow(), checksNow()); if (andPrint) w.print(); });
    };

    // --- Lecture complète du formulaire, puis enregistrement (colonnes autorisées seulement)
    const collect = () => {
      const h = head.read();
      const data = { ...doc.data, checks: { ...doc.data.checks, ...checksNow() } };
      const row = { contact_id: h.contact_id || null, deal_id: h.deal_id || null, status: h.status || 'brouillon', template: model.id };
      ['title', 'issue_date', 'due_date', 'paid_at', 'payment_method', 'signed_at'].forEach(k => { if (k in h) row[k] = h[k]; });
      Object.values(F).forEach(({ def, input }) => {
        const v = readInput(def, input);
        if (def.col) { if (def.col !== 'number' && !(def.readonly && def.col === 'total')) row[def.col] = v === '' ? null : v; }
        else data[def.name] = v;
      });
      Object.values(FLAGS).forEach(({ def, input }) => { data[def.name] = input.checked; });
      row.data = data;
      if (model.lines) { row.lines = usedLines().map(({ label, qty, unit, category }) => ({ label, qty: Number(qty) || 0, unit: Number(unit) || 0, category })); row.total = currentTotal(); }
      else if (F.MontantTotal?.def.col === 'total') row.total = Number(F.MontantTotal.input.value) || 0;
      if (!row.issue_date) row.issue_date = doc.issue_date || t;
      if (kind === 'facture') { row.paid_amount = Number(row.paid_amount) || 0; if (row.status === 'paye' && !row.paid_amount) row.paid_amount = (row.total ?? Number(doc.total)) || 0; if (row.status === 'paye' && !row.paid_at) row.paid_at = t; }
      if (['signe', 'accepte'].includes(row.status) && 'signed_at' in row && !row.signed_at) row.signed_at = t;
      return Object.fromEntries(Object.entries(row).filter(([k]) => DOC_COLUMNS.includes(k)));
    };
    const heading2 = heading(existing ? docName(existing) : model.label, '');
    const sub = heading2.querySelector('p') || el('p'); if (!sub.parentNode) heading2.append(sub);
    const setSub = d => { sub.textContent = d ? `${model.label} · ${DOC_STATUS[d.status]}${['devis', 'facture'].includes(kind) ? ` · ${money(d.total)}` : ''}` : 'Le numéro est attribué à l’enregistrement.'; };
    setSub(existing);
    const persist = async () => {
      const row = collect();
      if (!existing) {
        const { data: number, error } = await client.rpc('crm_next_number', { p_kind: kind });
        if (error) { say(`Numérotation impossible : ${error.message}. As-tu exécuté documents_schema.sql ?`, 'error'); return null; }
        Object.assign(row, { kind, number });
      }
      const saved = await save('crm_documents', row, existing?.id);
      if (!saved) return null;
      setDirty(false);
      // Le projet avance avec ses documents.
      const linked = saved.deal_id ? dealOf(saved.deal_id) : null;
      if (linked && kind === 'devis' && saved.status === 'envoye' && ['nouveau', 'qualifie'].includes(linked.stage)) await save('crm_deals', { stage: 'devis', amount: saved.total, next_action: `Relancer le devis ${saved.number}`, next_action_date: addDays(saved.issue_date || t, s.delaiRelanceDevis) }, linked.id);
      if (linked && kind === 'devis' && saved.status === 'accepte' && ['nouveau', 'qualifie', 'devis'].includes(linked.stage)) await save('crm_deals', { stage: 'signe', amount: saved.total, next_action: 'Facturer l’acompte', next_action_date: t }, linked.id);
      if (linked && kind === 'facture' && saved.status !== 'brouillon' && linked.next_action === 'Facturer l’acompte') await save('crm_deals', { next_action: null, next_action_date: null }, linked.id);
      if (linked && kind === 'facture' && saved.status === 'paye' && linked.stage === 'livre' && sum(invoices().filter(i => i.deal_id === linked.id), cashed) >= Number(linked.amount)) await save('crm_deals', { stage: 'paye' }, linked.id);
      return saved;
    };
    const submit = button(existing ? 'Enregistrer' : 'Créer le document', 'admin-button', async () => {
      submit.disabled = true; const saved = await persist(); submit.disabled = false;
      if (!saved) return;
      if (!existing) { open('doc', saved.id); return say(`${docName(saved)} créé.`, 'ok'); }
      say(`${docName(saved)} enregistré.`, 'ok');
      existing = S.docs.find(d => d.id === saved.id) || saved; Object.assign(doc, clone(existing)); setSub(existing);
    });
    const printBtn = button('Imprimer ou PDF', 'admin-button admin-button--ember', async () => {
      if (!existing) { const saved = await persist(); if (!saved) return; S.autoPrint = true; return open('doc', saved.id); }
      if (dirty) { const saved = await persist(); if (!saved) return; existing = S.docs.find(d => d.id === saved.id) || saved; Object.assign(doc, clone(existing)); setSub(existing); }
      printFrame();
    });
    let dirty = false;
    const touch = () => { dirty = true; setDirty(true); refreshTotals(); refreshAutos(); refreshPreview(); };

    // Événements : tout changement met à jour les totaux, les champs automatiques et l'aperçu.
    head.inputs.contact_id.addEventListener('change', () => { refreshDeals(); const c = contactOf(head.inputs.contact_id.value); if (c && !head.inputs.deal_id.value) { const d = activeDeal(c); if (d) head.inputs.deal_id.value = d.id; } touch(); });
    head.inputs.deal_id.addEventListener('change', () => { const d = dealOf(head.inputs.deal_id.value); if (d?.contact_id && !head.inputs.contact_id.value) { head.inputs.contact_id.value = d.contact_id; refreshDeals(); } touch(); });

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
        if (await save('crm_documents', { file_path: path }, existing.id)) { setDirty(false); open('doc', existing.id); say('Fichier joint.', 'ok'); }
      });
      const view = existing.file_path ? button('Ouvrir le fichier', 'admin-mini', async () => {
        const { data: signed, error } = await client.storage.from('documents').createSignedUrl(existing.file_path, 300);
        if (error) return say(error.message, 'error');
        window.open(signed.signedUrl, '_blank', 'noopener');
      }) : null;
      return card('Fichier signé ou facture Indy', [
        el('p', { className: 'ck-hint', textContent: existing.file_path ? `Joint : ${existing.file_path.split('/').pop().replace(/^\d+-/, '')}` : 'Joins ici le PDF signé par le client ou la facture officielle téléchargée depuis Indy. Stockage privé, visible par toi seul.' }),
        actions(input, upload, view)
      ], 'admin-card--wide');
    })() : null;
    const more = [];
    if (existing) {
      more.push(button('Dupliquer', 'admin-mini', () => open('doc', { template: model.id, deal: existing.deal_id, contact: existing.contact_id, title: existing.title, lines: clone(existing.lines || []), data: clone(existing.data || {}) })));
      if (kind === 'devis') {
        const already = sum(S.docs.filter(d => d.kind === 'facture' && d.status !== 'annule' && d.deal_id && d.deal_id === existing.deal_id), d => d.total);
        const rateA = Number(s.acompte) || ACOMPTE_MODELE;
        more.push(button(`Facture d’acompte (${rateA} %)`, 'admin-mini', () => open('doc', { template: 'facture', deal: existing.deal_id, contact: existing.contact_id, title: `Acompte : ${existing.title || existing.number}`, data: { NumeroDevis: existing.number }, lines: [{ label: `Acompte de ${rateA} % sur le devis ${existing.number}`, qty: 1, unit: Math.round(existing.total * rateA) / 100 }] })));
        more.push(button('Facture du solde', 'admin-mini', () => open('doc', { template: 'facture', deal: existing.deal_id, contact: existing.contact_id, title: `Solde : ${existing.title || existing.number}`, data: { NumeroDevis: existing.number }, lines: [{ label: `Solde du devis ${existing.number}${already ? `, après ${money(already)} déjà facturés` : ''}`, qty: 1, unit: Math.max(0, Math.round((existing.total - already) * 100) / 100) }] })));
        more.push(button('Contrat correspondant', 'admin-mini', () => open('doc', { template: existing.template === 'devis_mission' ? 'contrat_mission' : 'contrat_datee', deal: existing.deal_id, contact: existing.contact_id, title: existing.title, data: { NumeroDevis: existing.number } })));
      }
      if (existing.kind !== 'facture' || existing.status === 'brouillon') more.push(armed('Supprimer', 'Confirmer la suppression', async () => {
        if (existing.file_path) await client.storage.from('documents').remove([existing.file_path]);
        if (await remove('crm_documents', existing.id)) { setDirty(false); go('documents'); say('Document supprimé.', 'ok'); }
      }));
    }
    // Pour un document neuf : changer de modèle sans perdre client et projet.
    const sibling = isNew ? MODELS().filter(m => m.kind === kind && m.id !== model.id) : [];
    const contactNow = contactOf(doc.contact_id);
    const formCol = el('div', { className: 'dv-form' }, [
      card('Client, projet et suivi', [
        sibling.length ? actions(...sibling.map(m => button(`Utiliser plutôt : ${m.label}`, 'admin-mini', () => open('doc', { ...preset, template: m.id, contact: head.inputs.contact_id.value || undefined, deal: head.inputs.deal_id.value || undefined })))) : null,
        head.node,
        el('p', { className: 'ck-hint', textContent: 'Choisir le client et le projet remplit tout ce qui est déjà connu. Un champ que tu as modifié à la main n’est jamais écrasé.' })
      ], 'admin-card--wide'),
      ...sectionCards,
      more.length ? card('Autres actions', [actions(...more)], 'admin-card--wide') : null,
      fileCard
    ]);
    formCol.addEventListener('input', e => { const name = e.target?.name; if (name && F[name] && e.target === F[name].input) F[name].manual = true; touch(); });
    formCol.addEventListener('change', e => { if (e.target.type === 'checkbox') touch(); });
    const previewCol = el('aside', { className: 'dv-preview' }, [
      el('div', { className: 'dv-preview__bar' }, [el('strong', { textContent: 'Aperçu fidèle au modèle' }), actions(button('Ouvrir dans un onglet', 'admin-mini', () => openTab(false)))]),
      frameBox, frameNote,
      el('p', { className: 'ck-hint', textContent: 'Impression : destination « Enregistrer au format PDF », et décoche « En-têtes et pieds de page » dans « Plus de paramètres ».' })
    ]);
    refreshTotals();
    if (isNew) setTimeout(() => refreshAutos(), 0);
    const backTo = contactNow ? back(fullName(contactNow), 'contact', contactNow.id) : back('Documents', 'documents');
    const view = el('div', { className: 'dv' }, [
      el('div', { className: 'admin-bar' }, [heading2, el('div', { className: 'admin-row' }, [backTo, submit, printBtn])]),
      el('div', { className: 'dv-layout' }, [formCol, previewCol])
    ]);
    return view;
  });

  // ------------------------------------------------------------ Messages : carte du parcours
  const stepCard = (r, contact, deal, extra = {}) => {
    const m = extra.msg || pickMessage(r, deal);
    const b = button('', `jm-node is-${r.state}${extra.className ? ` ${extra.className}` : ''}`, () => (m ? open('message', { msg: m.id, contact: contact?.id, deal: deal?.id }) : null), `${extra.title || r.step.label} : ${contact ? stateLabel[r.state] : 'ouvrir le message'}`);
    const chans = [...new Set((extra.msgs || r.msgs).map(x => x.channel))];
    b.append(
      el('span', { className: 'jm-node__top' }, [el('strong', { textContent: extra.title || r.step.label }), ...chans.map(ch => pill(CHANNELS[ch], `ch-${ch}`))]),
      el('span', { className: 'jm-node__when' }, [el('b', { textContent: 'Quand : ' }), el('span', { textContent: extra.when || r.step.when })]),
      el('span', { className: 'jm-node__why' }, [el('b', { textContent: 'Pourquoi : ' }), el('span', { textContent: extra.why || r.step.why })]),
      contact ? el('span', { className: 'jm-node__state' }, [el('span', { className: 'ck-dot' }), el('span', { textContent: r.sent ? `Envoyé le ${shortDate(r.sent.sent_at)}` : stateLabel[r.state] })]) : null
    );
    return b;
  };
  V.messages = guard(() => {
    const f = isObj(S.focus) ? S.focus : (typeof S.focus === 'string' ? { deal: S.focus } : {});
    let deal = dealOf(f.deal);
    const contact = contactOf(f.contact || deal?.contact_id);
    if (contact && !deal) deal = activeDeal(contact);
    const pick = form([
      { name: 'contact', label: 'Client', type: 'select', options: contactOptions('Aucun : voir la carte seule') },
      { name: 'deal', label: 'Projet', type: 'select', options: [['', 'Projet en cours'], ...S.deals.filter(d => contact && d.contact_id === contact.id).map(d => [d.id, d.title])] }
    ], { contact: contact?.id || '', deal: deal?.id || '' });
    pick.inputs.contact.addEventListener('change', () => open('messages', { contact: pick.inputs.contact.value || undefined }));
    pick.inputs.deal.addEventListener('change', () => open('messages', { contact: contact?.id, deal: pick.inputs.deal.value || undefined }));
    const j = journey(contact, deal);
    const R = Object.fromEntries(j.rows.map(r => [r.step.id, r]));
    const lane = (title, nodes, active) => el('div', { className: `jm-lane${active ? ' is-active' : ''}` }, [el('p', { className: 'jm-lane__title', textContent: title }), ...nodes]);
    const devisMsgs = id => { const m = msgById(id); return m ? [m] : []; };
    const shared = id => el('li', { className: 'jm-row jm-row--shared' }, [stepCard(R[id], contact, deal)]);
    const devisRow = R.devis;
    const datee = devisMsgs('02a-devis-contrat-prestation-datee'), mission = devisMsgs('02b-devis-contrat-mission-continue');
    const branchState = b => (devisRow.state === 'na' || devisRow.state === 'sent' ? devisRow : { ...devisRow, state: contact && j.branch !== b ? 'na' : devisRow.state });
    const tree = el('ol', { className: 'jm-tree' }, [
      shared('contact'),
      el('li', { className: 'jm-row jm-row--fork' }, [
        lane('Prestation datée', [stepCard(branchState('datee'), contact, deal, { msg: datee[0], msgs: datee, title: 'Devis et contrat', when: datee[0]?.when, why: datee[0]?.why })], j.branch === 'datee'),
        lane('Mission continue', [stepCard(branchState('mission'), contact, deal, { msg: mission[0], msgs: mission, title: 'Devis et contrat', when: mission[0]?.when, why: mission[0]?.why })], j.branch === 'mission')
      ]),
      shared('bienvenue'),
      el('li', { className: 'jm-row jm-row--fork' }, [
        lane('Prestation datée', [stepCard(R.j7, contact, deal), stepCard(R.veille, contact, deal)], j.branch === 'datee'),
        lane('Mission continue', [el('p', { className: 'jm-skip', textContent: 'Pas de rappel J-7 ni de veille, sauf si une phase a une date précise.' })], j.branch === 'mission')
      ]),
      shared('merci'), shared('livraison'), shared('avis'), shared('reco'), shared('suivi')
    ]);
    // Bibliothèque : tous les modèles, rangés par étape.
    const library = el('details', { className: 'ck-details jm-library' }, [el('summary', { textContent: `Tous les modèles de messages (${MSG().messages.length})` }),
      ...MSG().steps.map(step => el('section', {}, [el('h4', { textContent: step.label }), el('ul', { className: 'ck-list' }, MSG().messages.filter(m => m.step === step.id).map(m => el('li', {}, [button(m.label, 'ck-link', () => open('message', { msg: m.id, contact: contact?.id, deal: deal?.id })), pill(CHANNELS[m.channel], `ch-${m.channel}`), m.branch ? pill(m.branch === 'datee' ? 'Prestation datée' : 'Mission continue') : null, el('small', { textContent: m.when })])))]))]);
    const legend = el('ul', { className: 'jm-legend' }, ['now', 'sent', 'later', 'missed', 'na'].map(k => el('li', { className: `is-${k}` }, [el('span', { className: 'ck-dot' }), el('span', { textContent: stateLabel[k] })])));
    return el('div', {}, [
      bar2('Messages', 'La carte du parcours : quoi envoyer, quand et pourquoi. Choisis un client pour voir où il en est, puis clique sur une étape.', contact ? back(fullName(contact), 'contact', contact.id) : null),
      v2Notice(),
      card('Pour quel client ?', [pick.node, contact ? el('p', { className: 'ck-hint', textContent: `${deal ? `Projet : ${deal.title} (${STAGE[deal.stage].label}). ` : 'Aucun projet en cours. '}Parcours ${j.branch === 'mission' ? 'mission continue' : 'prestation datée'}.` }) : el('p', { className: 'ck-hint', textContent: 'Sans client, la carte sert de mode d’emploi ; les messages s’ouvrent avec des variables à compléter.' })], 'admin-card--wide ck-mb'),
      contact ? legend : null,
      tree,
      library
    ]);
  });

  // Un message prêt à envoyer : rempli, modifiable, puis marqué comme envoyé.
  V.message = guard(() => {
    const f = isObj(S.focus) ? S.focus : {};
    const msg = msgById(f.msg) || MSG().messages[0];
    if (!msg) return el('p', { className: 'admin-alert', textContent: 'Les modèles de messages ne sont pas chargés : recharge la page.' });
    const contact = contactOf(f.contact), deal = dealOf(f.deal) || activeDeal(contact);
    const step = stepOf(msg.step);
    const r = contact ? journey(contact, deal).rows.find(x => x.step.id === msg.step) : null;
    const variants = MSG().messages.filter(m => m.step === msg.step);
    const missing = new Set();
    const vars = msgVars(contact, deal, msg);
    const subject = el('input', { className: 'admin-input', value: fillMessage(msg.subject, vars, missing) });
    subject.setAttribute('aria-label', 'Objet');
    const body = fillMessage(msg.body, vars, missing);
    const area = el('textarea', { className: 'admin-input admin-input--area jm-body', rows: Math.min(22, body.split('\n').length + 2), value: body });
    area.setAttribute('aria-label', `Texte : ${msg.label}`);
    const phone = (contact?.phone || '').replace(/[^\d+]/g, '').replace(/^0/, '+33').replace(/^\+/, '');
    const href = () => (msg.channel === 'email' ? `mailto:${encodeURIComponent(contact?.email || '')}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(area.value)}` : `https://wa.me/${phone}?text=${encodeURIComponent(area.value)}`);
    const send = (msg.channel === 'email' ? contact?.email : phone) ? link(msg.channel === 'email' ? 'Ouvrir dans ma messagerie ↗' : 'Ouvrir dans WhatsApp ↗', href(), 'admin-button') : null;
    const note = el('input', { className: 'admin-input', placeholder: 'Note (facultatif) : ex. envoyé avec la galerie' });
    note.setAttribute('aria-label', 'Note sur l’envoi');
    const mark = button('Marquer comme envoyé', 'admin-button admin-button--ember', async () => {
      if (!contact) return say('Choisis d’abord un client pour mémoriser l’envoi.', 'warn');
      if (!S.v2) return say('Exécute d’abord admin_v2_schema.sql pour mémoriser les envois.', 'warn');
      mark.disabled = true;
      const { error } = await client.from('crm_messages').insert({ contact_id: contact.id, deal_id: deal?.id || null, message_id: msg.id, channel: msg.channel, note: note.value.trim() || null, sent_at: new Date().toISOString() }).select().single();
      mark.disabled = false;
      if (error) return say(`Enregistrement impossible : ${error.message}`, 'error');
      await load(); setDirty(false); open('contact', contact.id); say(`« ${msg.label} » marqué comme envoyé à ${fullName(contact)}.`, 'ok');
    });
    if (send) {
      [subject, area].forEach(x => x.addEventListener('input', () => { send.href = href(); }));
      send.addEventListener('click', () => { mark.classList.add('is-pulse'); say('Une fois le message parti, clique « Marquer comme envoyé » pour le suivi.', 'warn'); });
    }
    [subject, area].forEach(x => x.addEventListener('input', () => setDirty(true)));
    const copy = button('Copier le texte', 'admin-mini', async () => { try { await navigator.clipboard.writeText(msg.channel === 'email' && subject.value ? `${subject.value}\n\n${area.value}` : area.value); say('Message copié.', 'ok'); } catch { say('Copie impossible : sélectionne le texte.', 'warn'); } });
    const pick = form([
      { name: 'contact', label: 'Client', type: 'select', options: contactOptions('Aucun client') },
      { name: 'deal', label: 'Projet', type: 'select', options: [['', 'Aucun projet'], ...S.deals.filter(d => !contact || d.contact_id === contact.id).map(d => [d.id, d.title])] }
    ], { contact: contact?.id || '', deal: deal?.id || '' });
    pick.inputs.contact.addEventListener('change', () => open('message', { msg: msg.id, contact: pick.inputs.contact.value || undefined }));
    pick.inputs.deal.addEventListener('change', () => open('message', { msg: msg.id, contact: contact?.id, deal: pick.inputs.deal.value || undefined }));
    const history = contact ? S.sent.filter(m => m.contact_id === contact.id).sort((a, b) => String(a.sent_at).localeCompare(String(b.sent_at))) : [];
    return el('div', {}, [
      bar2(msg.label, [contact ? fullName(contact) : 'Sans client', CHANNELS[msg.channel], step?.label].filter(Boolean).join(' · '), back('Carte du parcours', 'messages', { contact: contact?.id, deal: deal?.id })),
      el('div', { className: 'admin-grid' }, [
        card('Quand et pourquoi', [
          el('p', {}, [el('strong', { textContent: 'Quand : ' }), el('span', { textContent: msg.when })]),
          el('p', {}, [el('strong', { textContent: 'Pourquoi : ' }), el('span', { textContent: msg.why })]),
          r ? el('p', { className: `ck-next is-${r.state}` }, [el('span', { className: 'ck-dot' }), el('span', { textContent: r.sent ? `Déjà envoyé le ${longDate(iso(r.sent.sent_at))}.` : stateLabel[r.state] })]) : null,
          variants.length > 1 ? el('div', { className: 'ck-tabs' }, variants.map(v => { const b = button(`${v.label} (${CHANNELS[v.channel]})`, 'ck-tab', () => open('message', { msg: v.id, contact: contact?.id, deal: deal?.id })); b.setAttribute('aria-pressed', String(v.id === msg.id)); return b; })) : null
        ], 'admin-card--wide'),
        card('Destinataire', [pick.node, contact && !(msg.channel === 'email' ? contact.email : phone) ? el('p', { className: 'admin-alert', textContent: msg.channel === 'email' ? 'Pas d’email sur la fiche : copie le texte, ou complète la fiche.' : 'Pas de téléphone sur la fiche : copie le texte, ou complète la fiche.' }) : null], 'admin-card--wide'),
        card('Message', [
          missing.size ? el('p', { className: 'admin-alert', textContent: `À compléter avant l’envoi : ${[...missing].join(', ')}. Ces valeurs se règlent dans la fiche, le projet, l’agenda ou les Réglages.` }) : el('p', { className: 'admin-ok', textContent: 'Toutes les informations sont remplies. Relis, ajuste si besoin.' }),
          msg.channel === 'email' ? el('label', { className: 'admin-field' }, [el('span', { textContent: 'Objet' }), subject]) : null,
          area,
          actions(send, copy),
          el('div', { className: 'jm-mark' }, [note, mark])
        ], 'admin-card--wide'),
        contact ? card('Déjà envoyé à ce client', [history.length ? el('ol', { className: 'ck-list ck-sent' }, history.map(m => el('li', {}, [el('time', { textContent: shortDate(m.sent_at) }), el('span', { textContent: msgById(m.message_id)?.label || m.message_id }), pill(CHANNELS[m.channel] || m.channel)]))) : el('p', { className: 'ck-hint', textContent: 'Rien pour l’instant.' })], 'admin-card--wide') : null
      ])
    ]);
  });

  // ------------------------------------------------------------ Agenda
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
      bar2('Agenda', 'Tournages, livraisons et rendez-vous. Chaque événement peut s’ajouter à Google Agenda en un clic.', button('+ Événement', 'admin-button', () => open('event', null))),
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
      { name: 'location', label: 'Lieu (repris dans les documents et les messages)', full: true },
      { name: 'deal_id', label: 'Projet', type: 'select', options: dealOptions() },
      { name: 'notes', label: 'Notes (horaires, contacts sur place, matériel)', type: 'textarea', full: true }
    ], e ? { ...e, starts_at: local(e.starts_at), ends_at: e.ends_at ? local(e.ends_at) : '' } : { kind: 'tournage', title: deal?.title || '', starts_at: deal?.event_date ? `${deal.event_date}T10:00` : '', deal_id: deal?.id || '' });
    f.node.addEventListener('input', () => setDirty(true));
    const submit = button(e ? 'Enregistrer' : 'Ajouter', 'admin-button', async () => {
      const row = f.read();
      if (!row.title || !row.starts_at) return say('Titre et début sont obligatoires.', 'warn');
      row.starts_at = new Date(row.starts_at).toISOString(); row.ends_at = row.ends_at ? new Date(row.ends_at).toISOString() : null; row.deal_id = row.deal_id || null;
      submit.disabled = true; const saved = await save('crm_events', row, e?.id); submit.disabled = false;
      if (saved) { setDirty(false); go('agenda'); say('Événement enregistré.', 'ok'); }
    });
    return el('div', {}, [
      bar2(e ? e.title : 'Nouvel événement', '', back('Agenda', 'agenda'), submit),
      el('div', { className: 'admin-grid' }, [card('Événement', [f.node], 'admin-card--wide'),
        e ? card('Supprimer', [armed('Supprimer l’événement', 'Confirmer la suppression', async () => { if (await remove('crm_events', e.id)) { setDirty(false); go('agenda'); say('Événement supprimé.', 'ok'); } })]) : null])
    ]);
  });

  // ------------------------------------------------------------ Finances
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
      const csv = [['Date d’encaissement', 'Référence de la facture', 'Client', 'Nature de la prestation', 'Montant encaissé (€)', 'Mode de règlement'], ...rows.map(d => [d.paid_at, d.indy_number || d.number, contactOf(d.contact_id)?.company || fullName(contactOf(d.contact_id)), d.title || '', String(cashed(d)).replace('.', ','), d.payment_method || ''])].map(r => r.map(csvCell).join(';')).join('\r\n');
      download(`livre-des-recettes-${y}.csv`, csv); say(`${rows.length} encaissement(s) exporté(s).`, 'ok');
    });
    return el('div', {}, [
      bar2('Finances', 'Chiffre d’affaires encaissé (régime micro : ce qui compte, c’est la date d’encaissement).', yearPick, exportBook),
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

  // ------------------------------------------------------------ Réglages
  V.reglages = guard(() => {
    const groups = [
      ['Activité et objectifs', [
        { name: 'objectifAnnuel', label: 'Objectif de chiffre d’affaires annuel (€)', type: 'number' },
        { name: 'activite', label: 'Catégorie URSSAF', type: 'select', options: Object.entries(ACTIVITES).map(([k, a]) => [k, `${a.label} : ${String(a.taux).replace('.', ',')} %`]), hint: 'Elle figure sur ton attestation d’immatriculation et sur ton espace URSSAF.' },
        { name: 'periodicite', label: 'Déclaration URSSAF', type: 'select', options: [['trimestrielle', 'Trimestrielle'], ['mensuelle', 'Mensuelle']] },
        { name: 'acompte', label: 'Acompte demandé (%)', type: 'number', hint: 'Les modèles de devis et de contrat prévoient 40 %.' },
        { name: 'delaiPaiement', label: 'Délai de paiement des factures (jours)', type: 'number' },
        { name: 'validiteDevis', label: 'Validité des devis (jours)', type: 'number' },
        { name: 'delaiRelanceDevis', label: 'Relancer un devis sans réponse après (jours)', type: 'number' }]],
      ['Coordonnées imprimées sur tes documents', [
        { name: 'adresseFacturation', label: 'Ton adresse professionnelle (factures, rétractation)', type: 'textarea', rows: 2, full: true },
        { name: 'telephoneFacturation', label: 'Téléphone', type: 'tel' },
        { name: 'titulaire', label: 'Titulaire du compte' },
        { name: 'banque', label: 'Banque' },
        { name: 'iban', label: 'IBAN' },
        { name: 'bic', label: 'BIC' }]],
      ['Messages : liens et délais', [
        { name: 'lienQuestionnaire', label: 'Lien du questionnaire de préparation', type: 'url' },
        { name: 'lienEspace', label: 'Lien de l’espace projet (message de bienvenue)', type: 'url' },
        { name: 'lienAvis', label: 'Lien pour laisser un avis Google', type: 'url' },
        { name: 'delaiLivraison', label: 'Délai de livraison habituel', placeholder: 'Ex. 3 à 4 semaines' },
        { name: 'dureeGalerie', label: 'Durée d’accès à la galerie', placeholder: 'Ex. 3 mois' },
        { name: 'dureeVideo', label: 'Durée d’accès au lien vidéo', placeholder: 'Ex. 3 mois' },
        { name: 'metier', label: 'Ton métier dans les messages WhatsApp', placeholder: 'Ex. photographe' }]]
    ];
    const forms = groups.map(([title, defs]) => [title, form(defs, S.settings)]);
    forms.forEach(([, f]) => f.node.addEventListener('input', () => setDirty(true)));
    const submit = button('Enregistrer les réglages', 'admin-button', async () => {
      submit.disabled = true;
      const data = { ...S.settings, ...Object.assign({}, ...forms.map(([, f]) => f.read())) };
      Object.keys(data).forEach(k => { if (data[k] === null) data[k] = ''; });
      const { error } = await client.from('crm_settings').upsert({ key: 'cockpit', data, updated_at: new Date().toISOString() });
      submit.disabled = false;
      if (error) return say(`Enregistrement impossible : ${error.message}`, 'error');
      await load(); setDirty(false); go('reglages'); say('Réglages enregistrés.', 'ok');
    });
    return el('div', {}, [
      bar2('Réglages', 'Objectifs, taux, coordonnées imprimées sur tes documents et liens de tes messages. Visibles par toi seul, jamais publiés sur le site.', submit),
      el('div', { className: 'admin-grid' }, forms.map(([title, f]) => card(title, [f.node], 'admin-card--wide')))
    ]);
  });

  // ------------------------------------------------------------ Recherche globale (client, projet, document, numéro)
  const search = q => {
    const n = norm(q.trim()); if (n.length < 2) return [];
    const hit = (...v) => v.some(x => norm(x).includes(n));
    const out = [];
    S.contacts.filter(c => hit(fullName(c), c.name, c.company, c.email, c.phone)).forEach(c => out.push({ kind: 'Client', label: displayName(c), sub: [c.email, c.phone].filter(Boolean).join(' · '), go: () => open('contact', c.id) }));
    S.deals.filter(d => hit(d.title)).forEach(d => out.push({ kind: 'Projet', label: d.title, sub: [fullName(contactOf(d.contact_id)), STAGE[d.stage]?.label].filter(Boolean).join(' · '), go: () => open('deal', d.id) }));
    S.docs.filter(d => hit(d.number, d.title, d.data?.NomPersonne, d.indy_number)).forEach(d => out.push({ kind: kindLabel(d.kind, true), label: `${d.number}${d.title ? ` : ${d.title}` : ''}`, sub: [fullName(contactOf(d.contact_id)), DOC_STATUS[d.status]].filter(Boolean).join(' · '), go: () => open('doc', d.id) }));
    S.events.filter(e => hit(e.title, e.location)).forEach(e => out.push({ kind: 'Agenda', label: e.title, sub: shortDate(e.starts_at), go: () => open('event', e.id) }));
    return out.slice(0, 8);
  };

  return {
    sections: [
      { id: 'pilotage', label: 'Pilotage', group: 'Activité' },
      { id: 'clients', label: 'Clients', group: 'Activité' },
      { id: 'demandes', label: 'Demandes et projets', group: 'Activité' },
      { id: 'documents', label: 'Documents', group: 'Activité' },
      { id: 'messages', label: 'Messages', group: 'Activité' },
      { id: 'agenda', label: 'Agenda', group: 'Activité' },
      { id: 'finances', label: 'Finances', group: 'Activité' }
    ],
    footer: [{ id: 'reglages', label: 'Réglages', group: 'Réglages' }],
    parent: { deal: 'demandes', contact: 'clients', doc: 'documents', newdoc: 'documents', event: 'agenda', message: 'messages' },
    views: V,
    load,
    search,
    badge: id => (S.missing ? 0 : id === 'pilotage' ? todoAll().length : id === 'messages' ? dueMessages().length : 0)
  };
};
