/* Nolan Arc | gabarits des documents clients et modèles de messages.
   Script classique (pas un module) : expose window.NolanDocTemplates = { templates, messages }.

   Sécurité : chaque valeur issue de doc ou ctx passe par ctx.esc, aucune n'est placée dans un attribut.
   Aucun attribut style ni on*, aucun script, aucun lien exécutable.
   Le dépôt est public : aucune coordonnée bancaire, aucun téléphone, aucun SIRET ni email n'est écrit ici.
   Ils viennent de ctx.settings (banque, téléphone) et de ctx.business (SIRET, email). */
(function () {
  'use strict';

  /* ---------- Outils de secours, utilisés seulement si ctx ne fournit pas les siens ---------- */
  const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escFallback = s => String(s).replace(/[&<>"']/g, c => ENTITIES[c]);
  const EURO = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const moneyFallback = n => EURO.format(Number(n) || 0);
  const longDateFallback = day => {
    if (!day) return '';
    const d = new Date(`${String(day).slice(0, 10)}T12:00:00`);
    return isNaN(d.getTime()) ? String(day) : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const NUM = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
  const BLANK = '<span class="nd-blank"></span>';
  const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
  const ISO_TIME = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/;
  const TODO = 'À renseigner dans Réglages';

  const obj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  const str = v => {
    if (v === null || v === undefined || typeof v === 'boolean') return '';
    if (Array.isArray(v)) return v.map(str).filter(Boolean).join(', ');
    if (typeof v === 'object') return '';
    if (typeof v === 'number' && !Number.isFinite(v)) return '';
    return String(v).trim();
  };
  const num = v => {
    if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
    const s = str(v).replace(/\s/g, '').replace(',', '.');
    return s === '' ? NaN : Number(s);
  };
  const round2 = n => Math.round(n * 100) / 100;
  const lineTotal = l => round2((num(l.qty) || 0) * (num(l.unit) || 0));

  /* Prépare tout ce dont un gabarit a besoin à partir de doc et ctx. */
  function kit(rawDoc, rawCtx) {
    const doc = obj(rawDoc), ctx = obj(rawCtx);
    const esc = typeof ctx.esc === 'function' ? ctx.esc : escFallback;
    const money = typeof ctx.money === 'function' ? ctx.money : moneyFallback;
    const longDate = typeof ctx.longDate === 'function' ? ctx.longDate : longDateFallback;
    const data = obj(doc.data), checks = obj(data.checks);
    const contact = obj(ctx.contact), deal = obj(ctx.deal), settings = obj(ctx.settings), business = obj(ctx.business);
    const lines = Array.isArray(doc.lines) ? doc.lines.filter(l => l && typeof l === 'object') : [];

    // Texte échappé, retours à la ligne conservés ; une valeur vide devient une ligne de saisie.
    const text = v => { const s = str(v); return s ? String(esc(s)).replace(/\r\n|\r|\n/g, '<br>') : BLANK; };
    const asDate = v => {
      const s = str(v);
      if (ISO_DAY.test(s)) return str(longDate(s));
      const m = ISO_TIME.exec(s);
      return m ? `${str(longDate(m[1]))} à ${m[2]}h${m[3]}` : s;
    };
    const date = v => text(asDate(v));
    const field = name => text(asDate(data[name]));
    const has = name => str(data[name]) !== '';
    const amount = n => Number.isFinite(n) ? text(money(n)) : BLANK;
    const qty = v => { const n = num(v); return Number.isFinite(n) ? text(NUM.format(n)) : BLANK; };
    const box = name => `<span class="nd-box">${checks[name] === true ? '✓' : ''}</span>`;

    // Montants : doc.total fait foi, sinon somme des lignes, sinon montant du projet.
    const sumLines = round2(lines.reduce((t, l) => t + lineTotal(l), 0));
    const docTotal = num(doc.total);
    let total = Number.isFinite(docTotal) && (docTotal !== 0 || !lines.length) ? docTotal : sumLines;
    if (!(total > 0) && !lines.length) { const fromDeal = num(deal.amount); if (fromDeal > 0) total = fromDeal; }
    const known = total > 0 || lines.length > 0;
    let pct = num(settings.acompte);
    if (!(pct > 0 && pct <= 100)) pct = 40;
    const acompte = Math.round(total * pct) / 100;
    const solde = round2(total - acompte);

    const company = str(contact.company), name = str(contact.name);
    const legalName = str(business.legalName) || 'Nolan Ribeiro';
    const brandName = str(business.name) || 'Nolan Arc';

    return {
      doc, data, checks, contact, deal, settings, business, lines, esc,
      text, date, field, has, amount, qty, box,
      total, acompte, solde,
      totalHtml: known ? amount(total) : BLANK,
      acompteHtml: known ? amount(acompte) : BLANK,
      soldeHtml: known ? amount(solde) : BLANK,
      pct: NUM.format(pct),
      rest: NUM.format(round2(100 - pct)),
      clientName: company && name ? `${company} · ${name}` : (company || name),
      contactLine: [str(contact.email), str(contact.phone)].filter(Boolean).join(' · '),
      legalName,
      who: `${esc(legalName)} · ${esc(brandName)}`,
      email: text(business.email),
      siret: text(business.siret),
      phone: str(settings.telephoneFacturation),
      address: str(settings.adresseFacturation)
    };
  }

  /* ---------- Briques de mise en page (libellés fixes, valeurs déjà échappées) ---------- */
  const header = (kicker, title, meta) => `<header class="nd-brand"><div class="nd-brand__main"><div class="nd-kicker">${kicker}</div><h1>${title}</h1></div><div class="nd-meta">${meta}</div></header>`;
  const subtitle = s => `<p class="nd-subtitle">${s}</p>`;
  const card = (label, value, full) => `<div class="nd-field${full ? ' nd-field--full' : ''}"><div class="nd-label">${label}</div><div class="nd-value">${value}</div></div>`;
  const grid = (cards, extra) => `<div class="nd-grid${extra ? ` ${extra}` : ''}">${cards.join('')}</div>`;
  const section = (title, body, extra) => `<section class="nd-section${extra ? ` ${extra}` : ''}"><h2>${title}</h2>${body}</section>`;
  const soft = parts => `<div class="nd-soft">${parts.join('')}</div>`;
  const item = (label, value) => `<p><strong>${label}</strong> ${value}</p>`;
  const list = items => `<ul>${items.filter(Boolean).map(i => `<li>${i}</li>`).join('')}</ul>`;
  const check = (box, html, extra) => `<div class="nd-check${extra ? ` ${extra}` : ''}">${box}<span>${html}</span></div>`;
  const signatures = pairs => `<div class="nd-signatures">${pairs.map(([who, hint]) => `<div class="nd-signature"><strong>${who}</strong><small>${hint}</small></div>`).join('')}</div>`;
  const article = (classes, inner) => `<article class="nd-doc${classes ? ` ${classes}` : ''}">${inner}</article>`;

  const clientCards = T => `<section class="nd-grid">${[
    card('Client / Société', T.text(T.clientName)),
    card('Email / Téléphone', T.text(T.contactLine)),
    card('Adresse / SIRET si professionnel', T.text(T.contact.address), true)
  ].join('')}</section>`;

  const provider = T => `${T.who} · EI micro-entreprise · SIRET ${T.siret}${T.phone ? ` · ${T.esc(T.phone)}` : ''} · ${T.email}`;

  const footer = (T, compact) => `<section class="nd-footer${compact ? ' nd-footer--compact' : ''}"><h2>PROLONGEZ L'EXPÉRIENCE</h2><p>Découvrez mes dernières réalisations et plongez dans mon univers artistique sur <a href="https://nolanarc.com">nolanarc.com</a> ou rejoignez-moi sur Instagram.</p><div class="nd-identity">${T.esc(T.legalName)} • Création photographique et audiovisuelle<br>SIRET : ${T.siret} • TVA non applicable, art. 293 B du CGI<br>${T.phone ? `TÉL. ${T.esc(T.phone)} • ` : ''}EMAIL : ${T.email}</div></section>`;

  function bank(T) {
    const s = T.settings;
    const rows = [['Titulaire', s.titulaire, false], ['Banque', s.banque, false], ['IBAN', s.iban, true], ['BIC', s.bic, true]];
    if (rows.every(r => !str(r[1]))) return `<div class="nd-bank"><p class="nd-bank__todo">${TODO}</p></div>`;
    return `<div class="nd-bank"><div class="nd-bank__grid">${rows.map(([label, value, code]) => {
      const v = str(value);
      const html = !v ? `<span class="nd-bank__todo">${TODO}</span>` : code ? `<span class="nd-bank__code">${T.esc(v)}</span>` : T.esc(v);
      return `<div class="nd-bank__row${code ? ' nd-bank__row--wide' : ''}"><strong>${label}</strong> ${html}</div>`;
    }).join('')}</div></div>`;
  }

  /* Tableau de prix : rangées de catégorie « Prestation principale » et « Options & add-ons ». */
  function priceTable(T, firstHead, categories) {
    const main = T.lines.filter(l => l.category !== 'option'), opts = T.lines.filter(l => l.category === 'option');
    const row = l => `<tr class="nd-row"><td>${T.text(l.label)}</td><td>${T.qty(l.qty)}</td><td class="nd-num">${T.amount(num(l.unit))}</td><td class="nd-num">${T.amount(lineTotal(l))}</td></tr>`;
    const empty = `<tr class="nd-row"><td>${BLANK}</td><td>${BLANK}</td><td class="nd-num">${BLANK}</td><td class="nd-num">${BLANK}</td></tr>`;
    const cat = label => `<tr class="nd-cat"><td colspan="4">${label}</td></tr>`;
    const rows = (set, fallback) => set.length ? set.map(row).join('') : fallback;
    let body;
    if (categories || opts.length) {
      const none = T.lines.length ? '<tr class="nd-row nd-row--none"><td colspan="4">Aucune option retenue</td></tr>' : empty;
      body = cat('Prestation principale') + rows(main, empty) + cat('Options &amp; add-ons') + rows(opts, none);
    } else {
      body = rows(T.lines, empty);
    }
    return `<table class="nd-table"><thead><tr><th>${firstHead}</th><th>Qté</th><th class="nd-num">Prix unitaire</th><th class="nd-num">Total</th></tr></thead><tbody>${body}<tr class="nd-total"><td colspan="3">TOTAL NET · TVA non applicable, art. 293 B CGI</td><td class="nd-num">${T.totalHtml}</td></tr></tbody></table>`;
  }

  /* Mission continue : lignes (phases) puis échéancier acompte / solde. */
  function phaseTable(T) {
    const row = l => {
      const q = num(l.qty), label = str(l.label);
      const shown = label && Number.isFinite(q) && q !== 1 ? `${label} (× ${NUM.format(q)})` : label;
      return `<tr class="nd-row"><td>${T.text(shown)}</td><td class="nd-num">${T.amount(lineTotal(l))}</td><td></td></tr>`;
    };
    const empty = `<tr class="nd-row"><td>${BLANK}</td><td class="nd-num">${BLANK}</td><td>${BLANK}</td></tr>`;
    const due = T.has('Echeancier') ? T.field('Echeancier') : 'Avant la remise des livrables définitifs';
    return `<table class="nd-table"><thead><tr><th>Phase / ligne</th><th class="nd-num">Montant</th><th>Échéance</th></tr></thead><tbody>`
      + '<tr class="nd-cat"><td colspan="3">Phases &amp; lignes</td></tr>'
      + (T.lines.length ? T.lines.map(row).join('') : empty)
      + '<tr class="nd-cat"><td colspan="3">Échéancier</td></tr>'
      + `<tr class="nd-row"><td>Acompte de lancement : ${T.pct} %</td><td class="nd-num">${T.acompteHtml}</td><td>À la signature</td></tr>`
      + `<tr class="nd-row"><td>Solde : ${T.rest} %</td><td class="nd-num">${T.soldeHtml}</td><td>${due}</td></tr>`
      + `<tr class="nd-total"><td>TOTAL NET · TVA non applicable, art. 293 B CGI</td><td class="nd-num">${T.totalHtml}</td><td></td></tr></tbody></table>`;
  }

  const quoteMeta = T => {
    const validity = T.doc.due_date ? `Valable jusqu’au ${T.date(T.doc.due_date)}` : `Valable ${T.esc(String(num(T.settings.validiteDevis) > 0 ? num(T.settings.validiteDevis) : 30))} jours`;
    return `N° ${T.text(T.doc.number)}<br>Date ${T.date(T.doc.issue_date)}<br>${validity}`;
  };

  const quoteAcceptance = T => section('07 · Acceptation',
    `<div class="nd-checks">${check(T.box('accept_quote'), 'Je reconnais avoir reçu et accepté le présent devis et les CGV Nolan Arc datées du 14 août 2026.')}${check(T.box('b2c_info_received'), 'Client consommateur : je confirme avoir reçu l’information relative au droit de rétractation.')}</div>`
    + signatures([['Le Client', 'Nom, date, « Bon pour accord », signature'], [T.who, 'Date, signature']]), 'nd-no-break');

  const contractAcceptance = (T, n) => section(`${n} · Acceptation`,
    check(T.box('accept_contract'), `Je reconnais avoir reçu et accepté le devis n° ${T.field('NumeroDevis')}, le présent contrat et les CGV Nolan Arc datées du 14 août 2026.`)
    + signatures([['Le Client', 'Nom, date, « Lu et approuvé, Bon pour accord », signature'], [T.who, 'Date, signature']]), 'nd-no-break');

  const contractMeta = T => `Réf. ${T.text(T.doc.number)}<br>Devis ${T.field('NumeroDevis')}`;

  const bankSection = (T, n) => section(`${n} · Coordonnées bancaires (virement)`, bank(T), 'nd-no-break');

  /* ---------- Définitions des champs et des cases ---------- */
  const QUOTE_CHECKS = [
    { name: 'accept_quote', label: 'Devis et CGV reçus et acceptés', group: 'Acceptation' },
    { name: 'b2c_info_received', label: 'Client consommateur : information sur la rétractation reçue', group: 'Acceptation' }
  ];
  const CONTRACT_CHECKS = [
    { name: 'b2c_start_early', label: 'Consommateur : démarrage demandé avant la fin du délai de 14 jours', group: 'Rétractation B2C' },
    { name: 'b2c_acknowledge', label: 'Consommateur : conséquences de la rétractation reconnues', group: 'Rétractation B2C' },
    { name: 'accept_contract', label: 'Devis, contrat et CGV reçus et acceptés', group: 'Acceptation' }
  ];

  const templates = [
    /* ---------- Devis : prestation datée ---------- */
    {
      id: 'devis_datee',
      kind: 'devis',
      label: 'Devis : prestation datée',
      lines: true,
      fields: [
        { name: 'TypePrestation', label: 'Type de prestation', type: 'text', section: 'Cadre', prefill: 'offerLabel' },
        { name: 'DateHeure', label: 'Date / horaire', type: 'text', section: 'Cadre', prefill: 'eventDate' },
        { name: 'Lieux', label: 'Lieu(x)', type: 'text', section: 'Cadre', prefill: 'eventLocation' },
        { name: 'DescriptionMission', label: 'Mission', type: 'textarea', section: 'Périmètre & livrables', prefill: 'dealTitle' },
        { name: 'Livrables', label: 'Livrables', type: 'textarea', section: 'Périmètre & livrables' },
        { name: 'Revisions', label: 'Révisions incluses', type: 'text', section: 'Périmètre & livrables' },
        { name: 'DelaiLivraison', label: 'Délai de livraison', type: 'text', section: 'Périmètre & livrables' },
        { name: 'UsagesAutorises', label: 'Usages client inclus', type: 'textarea', section: 'Droits & usages' },
        { name: 'DroitsDetail', label: 'Supports / durée / territoire', type: 'textarea', section: 'Droits & usages' }
      ],
      checks: QUOTE_CHECKS,
      render(doc, ctx) {
        const T = kit(doc, ctx);
        return article('nd-compact', header('Nolan Arc · Devis', 'Prestation datée.', quoteMeta(T))
          + subtitle('Réalisation · direction artistique · stratégie. Ce devis cadre une intervention liée à une date précise.')
          + clientCards(T)
          + section('01 · Cadre', grid([card('Type de prestation', T.field('TypePrestation')), card('Date / horaire', T.field('DateHeure')), card('Lieu(x)', T.field('Lieux'), true)]))
          + section('02 · Périmètre &amp; livrables', soft([item('Mission.', T.field('DescriptionMission')), item('Livrables.', T.field('Livrables')), item('Révisions incluses.', T.field('Revisions')), item('Délai de livraison.', T.field('DelaiLivraison'))]))
          + section('03 · Prix', priceTable(T, 'Description de la prestation / formule', true)
            + `<div class="nd-callout"><strong>Acompte ${T.pct} % :</strong> ${T.acompteHtml} · <strong>Solde ${T.rest} % :</strong> ${T.soldeHtml}, exigible au plus tard avant le début de la prestation le jour convenu.</div>`)
          + bankSection(T, '04')
          + section('05 · Droits &amp; usages', soft([item('Usages client inclus :', T.field('UsagesAutorises')), item('Supports / durée / territoire :', T.field('DroitsDetail')), '<p>RAW, rushes et fichiers sources non inclus sauf mention expresse.</p>']))
          + section('06 · Conditions essentielles', list([
            `Commande validée uniquement après devis signé + contrat signé + acompte de ${T.pct} % encaissé.`,
            'Annulation écrite reçue au moins deux mois avant : acompte remboursé ; à moins de deux mois : acompte conservé, solde non réclamé du seul fait de l’annulation.',
            'Un report peut être demandé une fois, au moins 14 jours avant, pour une date dans les six mois, sous réserve de disponibilité.',
            'CGV Nolan Arc datées du 14 août 2026 applicables et remises au Client avant signature.'
          ]))
          + quoteAcceptance(T)
          + footer(T));
      }
    },

    /* ---------- Devis : mission continue ---------- */
    {
      id: 'devis_mission',
      kind: 'devis',
      label: 'Devis : mission continue',
      lines: true,
      fields: [
        { name: 'Objectif', label: 'Objectif', type: 'textarea', section: 'Mission', prefill: 'dealTitle' },
        { name: 'Perimetre', label: 'Périmètre', type: 'textarea', section: 'Mission' },
        { name: 'Phases', label: 'Phases', type: 'textarea', section: 'Mission' },
        { name: 'Livrables', label: 'Livrables', type: 'textarea', section: 'Mission' },
        { name: 'Revisions', label: 'Révisions / validations', type: 'text', section: 'Mission' },
        { name: 'DateDebut', label: 'Démarrage estimé', type: 'date', section: 'Calendrier', prefill: 'eventDate' },
        { name: 'Calendrier', label: 'Échéance / durée', type: 'text', section: 'Calendrier' },
        { name: 'Echeancier', label: 'Échéance du solde (si échéancier particulier)', type: 'text', section: 'Prix & échéancier' },
        { name: 'DroitsDetail', label: 'Usages / licence / cession', type: 'textarea', section: 'Droits & confidentialité' },
        { name: 'ConfidentialiteProjet', label: 'Confidentialité / embargo', type: 'textarea', section: 'Droits & confidentialité' },
        { name: 'AutorisationReference', label: 'Référence commerciale Nolan Arc', type: 'textarea', section: 'Droits & confidentialité' }
      ],
      checks: QUOTE_CHECKS,
      render(doc, ctx) {
        const T = kit(doc, ctx);
        return article('nd-compact', header('Nolan Arc · Devis', 'Mission continue.', quoteMeta(T))
          + subtitle('Direction artistique, stratégie, accompagnement ou production en phases.')
          + clientCards(T)
          + section('01 · Mission', soft([item('Objectif.', T.field('Objectif')), item('Périmètre.', T.field('Perimetre')), item('Phases.', T.field('Phases')), item('Livrables.', T.field('Livrables')), item('Révisions / validations.', T.field('Revisions'))]))
          + section('02 · Calendrier', grid([card('Démarrage estimé', T.field('DateDebut')), card('Échéance / durée', T.field('Calendrier'))]))
          + section('03 · Prix &amp; échéancier', phaseTable(T) + '<p class="nd-warning">À défaut d’échéancier particulier, le solde est exigible avant la remise des livrables définitifs.</p>')
          + bankSection(T, '04')
          + section('05 · Droits &amp; confidentialité', soft([item('Usages / licence / cession :', T.field('DroitsDetail')), item('Confidentialité / embargo :', T.field('ConfidentialiteProjet')), item('Référence commerciale Nolan Arc :', T.field('AutorisationReference'))]))
          + section('06 · Fin anticipée', '<p>En cas de fin anticipée demandée par le Client, les travaux réalisés, phases déjà engagées et frais tiers préalablement approuvés restent dus. L’acompte s’impute sur ces sommes et le trop-perçu éventuel est remboursé, conformément au contrat et aux CGV.</p>')
          + quoteAcceptance(T)
          + footer(T));
      }
    },

    /* ---------- Contrat : prestation datée ---------- */
    {
      id: 'contrat_datee',
      kind: 'contrat',
      label: 'Contrat : prestation datée',
      lines: false,
      fields: [
        { name: 'NumeroDevis', label: 'N° du devis associé', type: 'text', section: 'Références' },
        { name: 'DateAcceptation', label: 'Devis accepté le', type: 'date', section: 'Références' },
        { name: 'DateHeure', label: 'Date / horaire', type: 'text', section: 'Objet', prefill: 'eventDate' },
        { name: 'Lieux', label: 'Lieu(x)', type: 'text', section: 'Objet', prefill: 'eventLocation' },
        { name: 'Perimetre', label: 'Périmètre', type: 'textarea', section: 'Objet', prefill: 'dealTitle' },
        { name: 'Livrables', label: 'Livrables', type: 'textarea', section: 'Objet' },
        { name: 'Revisions', label: 'Révisions', type: 'text', section: 'Objet' },
        { name: 'DelaiLivraison', label: 'Délai de livraison', type: 'text', section: 'Objet' },
        { name: 'DroitsDetail', label: 'Usages accordés au Client', type: 'textarea', section: 'Propriété intellectuelle' }
      ],
      checks: CONTRACT_CHECKS,
      render(doc, ctx) {
        const T = kit(doc, ctx);
        return article('nd-compact nd-contract-dated', header('Nolan Arc · Contrat', 'Prestation datée.', contractMeta(T))
          + subtitle('Ce contrat complète le devis et les CGV pour une prestation attachée à une date précise.')
          + section('01 · Parties', grid([card('Client', T.text(T.clientName)), card('Contact', T.text(T.contactLine)), card('Adresse / SIRET si professionnel', T.text(T.contact.address), true), card('Prestataire', provider(T), true)]))
          + section('02 · Objet', `<p>Nolan Arc réalise la prestation décrite au devis n° ${T.field('NumeroDevis')}, accepté le ${T.field('DateAcceptation')}.</p>`
            + soft([item('Date / horaire :', T.field('DateHeure')), item('Lieu(x) :', T.field('Lieux')), item('Périmètre :', T.field('Perimetre')), item('Livrables :', T.field('Livrables')), item('Révisions :', T.field('Revisions')), item('Délai :', T.field('DelaiLivraison'))]))
          + section('03 · Formation de la réservation &amp; paiement', `<div class="nd-callout"><strong>La date n'est réservée qu'après :</strong> devis signé + présent contrat signé + acompte de ${T.pct} % encaissé.</div>` + list([
            `Prix total : <strong>${T.totalHtml}</strong>.`,
            `Acompte ${T.pct} % : <strong>${T.acompteHtml}</strong>, imputé sur le prix total.`,
            `Solde ${T.rest} % : <strong>${T.soldeHtml}</strong>, dû au plus tard avant le début de la prestation le jour convenu.`,
            'Virement bancaire ou espèces dans les limites légales.',
            'En cas de non-paiement du solde, Nolan Arc peut suspendre le commencement ou la poursuite de la prestation et retenir les livrables finaux.',
            'Si Nolan Arc commence exceptionnellement malgré un solde impayé, l\'échéance n\'est pas reportée.'
          ]))
          + section('04 · Annulation par le Client', `<p>Toute annulation doit être claire et écrite, par email à <strong>${T.email}</strong> ou courrier recommandé. La date de réception est prise en compte.</p>` + list([
            `<strong>Au moins deux mois avant la date prévue :</strong> remboursement intégral de l'acompte de ${T.pct} %, avec un objectif de remboursement sous 14 jours après confirmation.`,
            `<strong>À moins de deux mois :</strong> l'acompte de ${T.pct} % reste acquis à Nolan Arc ; le solde de ${T.rest} % n'est pas réclamé du seul fait de l'annulation.`,
            'Les frais tiers distincts, approuvés par écrit et irréversiblement engagés, suivent les conditions annoncées avant leur engagement.'
          ]) + '<p>Les droits légaux de rétractation du consommateur, lorsqu\'ils s\'appliquent, priment sur cette politique.</p>')
          + section('05 · Report', list([
            'Un seul report par réservation.',
            'Demande écrite au moins 14 jours calendaires avant la date initiale.',
            'Nouvelle date dans les 6 mois, sous réserve des disponibilités de Nolan Arc.',
            'L\'acompte reste affecté au dossier et est imputé sur la nouvelle date.',
            'Le report n\'est effectif qu\'après confirmation écrite de la nouvelle date.',
            'Si aucune nouvelle date compatible n\'est trouvée, le sort de l\'acompte est apprécié selon la règle d\'annulation en prenant comme référence la date de la demande initiale de report, sauf accord plus favorable.'
          ]))
          + section('06 · Force majeure &amp; impossibilité de Nolan Arc', '<p>La force majeure s\'apprécie selon les critères de l\'article 1218 du Code civil. Un événement n\'est pas qualifié automatiquement de force majeure par le présent contrat.</p>'
            + '<p>En cas d\'empêchement temporaire, les obligations concernées sont suspendues et les parties recherchent prioritairement un report lorsqu\'il reste compatible avec l\'objet de la prestation.</p>'
            + '<p>Si une force majeure empêche Nolan Arc d\'assurer personnellement la prestation datée, Nolan Arc <strong>s\'efforce raisonnablement, sans obligation de résultat</strong>, de rechercher et proposer un professionnel indépendant au profil et à l\'univers visuel aussi proches que raisonnablement possible.</p>'
            + list([
              'Le Client reste libre d\'accepter ou de refuser cette proposition.',
              'Sauf accord écrit contraire, le professionnel proposé contracte directement avec le Client.',
              'Nolan Arc n\'est pas tenu de financer un éventuel surcoût du professionnel de remplacement.',
              'Si aucun remplacement n\'est trouvé ou accepté et que l\'empêchement rend la prestation définitivement impossible, Nolan Arc restitue les sommes encaissées correspondant aux prestations non exécutées ; pour une prestation non commencée, les sommes encaissées au titre de celle-ci sont remboursées.',
              'Aucune indemnité contractuelle supplémentaire n\'est due par Nolan Arc du seul fait d\'une force majeure, sous réserve des dispositions impératives applicables.'
            ])
            + '<p class="nd-warning">Nolan Arc ne se réserve pas de droit général d\'annuler discrétionnairement une prestation confirmée. Une impossibilité imputable à Nolan Arc qui ne répond pas aux critères de la force majeure relève du droit commun.</p>')
          + section('07 · Organisation &amp; coopération', list([
            'Le Client communique les horaires, accès, contacts, programmes et contraintes utiles.',
            'Les autorisations relatives aux lieux ou éléments fournis par le Client restent à sa charge lorsqu\'elles relèvent de lui.',
            'Un retard imputable au Client ne prolonge pas automatiquement la durée réservée.',
            'Les heures supplémentaires, locations et frais non inclus sont facturés uniquement selon le devis ou après accord.',
            'Le Client informe Nolan Arc des lasers, restrictions de prise de vue, règles de sécurité et prestataires susceptibles d\'affecter la captation.'
          ]))
          + section('08 · Approche créative, livrables &amp; révisions', '<p>Le Client reconnaît avoir pris connaissance de l\'univers créatif de Nolan Arc. Nolan Arc conserve une marge d\'appréciation artistique compatible avec le brief et les validations convenues, sans exclure la correction d\'une erreur objective ou d\'une non-conformité contractuelle.</p>'
            + '<p>RAW, rushes, fichiers sources et fichiers de travail ne sont pas livrés sauf mention expresse au devis. Les demandes hors périmètre ou au-delà des révisions incluses peuvent faire l\'objet d\'un devis complémentaire.</p>'
            + '<p>Nolan Arc conserve une copie de sécurité des livrables finaux pendant 6 mois après livraison, sans garantie d\'archivage au-delà. Le Client effectue ses propres sauvegardes.</p>')
          + section('09 · Propriété intellectuelle', `<p>Nolan Arc conserve les droits attachés aux créations réalisées. Les usages accordés au Client sont ceux du devis : ${T.field('DroitsDetail')}. Aucune cession globale, implicite ou portant sur les fichiers sources n'est consentie au-delà de ce qui est écrit.</p>`)
          + section('10 · Droit à l\'image', '<p>Le présent contrat n\'autorise pas automatiquement Nolan Arc à publier l\'image identifiable du Client. Toute utilisation professionnelle par Nolan Arc est encadrée par une autorisation de droit à l\'image distincte, facultative et suffisamment précise. Pour un mineur, les autorisations écrites requises des représentants légaux doivent être recueillies.</p>')
          + section('11 · Confidentialité &amp; données', '<p>Les parties gardent confidentielles les informations non publiques reçues dans le cadre du projet. Nolan Arc traite les données nécessaires à la gestion de la relation, à l\'exécution, à la facturation, à la livraison et à la défense de ses droits conformément à la politique de confidentialité et aux obligations légales.</p>')
          + section('12 · Responsabilité', '<p>La responsabilité de Nolan Arc s\'apprécie selon la mission réellement convenue et le droit applicable. Aucune clause du contrat ne supprime ou ne réduit les droits impératifs dont bénéficie un consommateur.</p>')
          + section('13 · Rétractation B2C : bloc à utiliser si applicable', soft([
            check(T.box('b2c_start_early'), '<strong>Je suis un consommateur et je demande expressément que l\'exécution de la prestation commence avant la fin du délai légal de 14 jours.</strong>'),
            check(T.box('b2c_acknowledge'), 'Je reconnais avoir été informé qu\'après exécution complète du service, dans les conditions prévues par la loi, je ne disposerai plus du droit de rétractation et qu\'en cas de rétractation après commencement demandé, je peux être redevable de la part du service déjà fournie.', 'nd-mt'),
            '<p class="nd-mt"><small>Ne pas précocher. Ne remplir que si le contrat est conclu avec un consommateur et si le démarrage est demandé avant l\'expiration du délai.</small></p>'
          ]))
          + section('14 · Réclamations, médiation &amp; droit applicable', `<p>Réclamation : ${T.email}. Pour les Clients consommateurs, le médiateur de la consommation compétent est celui identifié dans les CGV Nolan Arc remises avec le dossier contractuel. Le contrat est soumis au droit français, sous réserve des protections impératives applicables. Aucune clause ne prive un consommateur des règles de compétence juridictionnelle qui lui sont applicables.</p>`)
          + contractAcceptance(T, '15')
          + footer(T, true));
      }
    },

    /* ---------- Contrat : mission continue ---------- */
    {
      id: 'contrat_mission',
      kind: 'contrat',
      label: 'Contrat : mission continue',
      lines: false,
      fields: [
        { name: 'NumeroDevis', label: 'N° du devis associé', type: 'text', section: 'Références' },
        { name: 'Mission', label: 'Mission', type: 'textarea', section: 'Parties & objet', prefill: 'dealTitle' },
        { name: 'Perimetre', label: 'Périmètre', type: 'textarea', section: 'Périmètre, phases & livrables' },
        { name: 'Phases', label: 'Phases', type: 'textarea', section: 'Périmètre, phases & livrables' },
        { name: 'Livrables', label: 'Livrables', type: 'textarea', section: 'Périmètre, phases & livrables' },
        { name: 'Revisions', label: 'Révisions / validations', type: 'text', section: 'Périmètre, phases & livrables' },
        { name: 'Calendrier', label: 'Calendrier', type: 'text', section: 'Périmètre, phases & livrables' },
        { name: 'Echeancier', label: 'Échéancier', type: 'text', section: 'Formation & paiement' },
        { name: 'DroitsDetail', label: 'Usages, supports, durée, territoire accordés', type: 'textarea', section: 'Propriété intellectuelle' },
        { name: 'AutorisationReference', label: 'Autorisation de référence commerciale', type: 'textarea', section: 'Référence commerciale & droit à l\'image' }
      ],
      checks: CONTRACT_CHECKS,
      render(doc, ctx) {
        const T = kit(doc, ctx);
        return article('', header('Nolan Arc · Contrat', 'Mission continue.', contractMeta(T))
          + subtitle('Direction artistique, stratégie, accompagnement créatif ou production exécutée par phases.')
          + section('01 · Parties &amp; objet', grid([card('Client', T.text(T.clientName)), card('Contact', T.text(T.contactLine)), card('Mission', T.field('Mission'), true), card('Prestataire', provider(T), true)]))
          + section('02 · Périmètre, phases &amp; livrables', soft([item('Périmètre :', T.field('Perimetre')), item('Phases :', T.field('Phases')), item('Livrables :', T.field('Livrables')), item('Révisions / validations :', T.field('Revisions')), item('Calendrier :', T.field('Calendrier'))]))
          + section('03 · Formation &amp; paiement', `<div class="nd-callout"><strong>La mission démarre après :</strong> devis signé + présent contrat signé + acompte de ${T.pct} % encaissé.</div>` + list([
            `Prix total / mode de calcul : <strong>${T.totalHtml}</strong>.`,
            `Acompte ${T.pct} % : <strong>${T.acompteHtml}</strong>.`,
            `Échéancier : ${T.field('Echeancier')}.`,
            'À défaut d\'échéancier particulier, le solde est dû avant la remise des livrables définitifs.',
            'Les livrables finaux peuvent être retenus jusqu\'au règlement intégral.'
          ]))
          + section('04 · Collaboration &amp; validations', '<p>Le Client remet dans les délais les informations, accès, contenus et validations nécessaires. Tout retard du Client peut décaler raisonnablement le calendrier. Une demande hors périmètre ou au-delà du nombre de révisions prévu peut faire l\'objet d\'un devis complémentaire avant exécution.</p>')
          + section('05 · Fin anticipée demandée par le Client', '<p>Sauf condition particulière au devis, le Client peut demander par écrit la fin de la mission. Restent dus les travaux effectivement réalisés, les phases déjà engagées et les frais tiers préalablement approuvés et irréversiblement engagés. L\'acompte s\'impute sur ces sommes ; tout trop-perçu éventuel est remboursé.</p>')
          + section('06 · Force majeure', '<p>La force majeure est appréciée selon l\'article 1218 du Code civil. En cas d\'empêchement temporaire, les obligations concernées sont suspendues et les parties recherchent un aménagement du calendrier lorsqu\'il reste pertinent.</p>'
            + '<p>Si une force majeure empêche Nolan Arc d\'assurer personnellement tout ou partie de la mission et qu\'une substitution est pertinente, Nolan Arc <strong>s\'efforce raisonnablement, sans obligation de résultat</strong>, de rechercher et proposer un professionnel indépendant au profil et à l\'univers visuel aussi proches que raisonnablement possible. Le Client reste libre d\'accepter ou non cette mise en relation. Sauf accord écrit contraire, le professionnel proposé contracte directement avec le Client et Nolan Arc n\'est pas tenu de financer un éventuel surcoût.</p>'
            + '<p>Si aucun remplacement n\'est trouvé ou accepté et que l\'empêchement devient définitif, les sommes correspondant aux prestations non exécutées sont restituées. Aucune indemnité contractuelle supplémentaire n\'est due par Nolan Arc du seul fait de la force majeure, sous réserve des règles impératives applicables.</p>'
            + '<p>Nolan Arc ne se réserve pas de droit général d\'annuler discrétionnairement une mission confirmée. Une impossibilité imputable à Nolan Arc qui ne constitue pas une force majeure relève du droit commun.</p>')
          + section('07 · Approche créative &amp; propriété intellectuelle', `<p>Nolan Arc conserve les droits attachés à ses créations. Les usages, supports, durée, territoire, exclusivité et adaptations accordés au Client sont ceux du devis : ${T.field('DroitsDetail')}.</p>`
            + '<p>RAW, rushes, sources, fichiers de travail, méthodologies internes et éléments intermédiaires ne sont pas transférés sauf mention expresse.</p>')
          + section('08 · Confidentialité', '<p>Chaque partie garde confidentielles les informations non publiques reçues de l\'autre partie, notamment stratégie, chiffres, projets non annoncés, contenus, accès, prototypes et informations personnelles. Sauf durée différente au devis, cette obligation s\'applique pendant la mission et deux ans après sa fin, sans préjudice d\'une protection légale plus longue.</p>')
          + section('09 · Référence commerciale &amp; droit à l\'image', `<p>Nolan Arc ne publie pas automatiquement les informations confidentielles, logos, résultats ou images identifiables du Client. L'autorisation suivante s'applique : ${T.field('AutorisationReference')}.</p>`
            + '<p>Lorsque des personnes identifiables apparaissent, une autorisation de droit à l\'image distincte est utilisée si nécessaire.</p>')
          + section('10 · Prestataires tiers &amp; licences', '<p>Nolan Arc peut recourir à des assistants ou prestataires techniques compatibles avec la mission. Les licences de musiques, polices, banques d\'images, logiciels et autres éléments tiers restent régies par leurs propres conditions. Les coûts tiers significatifs ou non récupérables sont validés avant engagement.</p>')
          + section('11 · Données &amp; responsabilité', '<p>Les données nécessaires à la relation sont traitées conformément à la politique de confidentialité de Nolan Arc et aux obligations légales. La responsabilité de Nolan Arc s\'apprécie selon la mission convenue et le droit applicable, sans priver un consommateur de ses droits impératifs.</p>')
          + section('12 · Rétractation B2C : si applicable', soft([
            check(T.box('b2c_start_early'), 'Je demande expressément que l\'exécution de la mission commence avant la fin du délai légal de 14 jours.'),
            check(T.box('b2c_acknowledge'), 'Je reconnais avoir été informé des conséquences prévues par la loi en cas de commencement puis de rétractation et de la perte du droit après exécution complète dans les conditions légales.', 'nd-mt'),
            '<p class="nd-mt"><small>Ne pas précocher. À utiliser uniquement lorsque le Client est un consommateur concerné.</small></p>'
          ]))
          + section('13 · Réclamations, médiation &amp; litiges', `<p>Réclamation : ${T.email}. Pour les Clients consommateurs, le médiateur de la consommation compétent est celui identifié dans les CGV Nolan Arc remises avec le dossier contractuel. Le contrat est soumis au droit français, sous réserve des protections impératives applicables. Aucune clause ne prive un consommateur des règles de compétence juridictionnelle qui lui sont applicables.</p>`)
          + contractAcceptance(T, '14')
          + footer(T));
      }
    },

    /* ---------- Autorisation de droit à l'image ---------- */
    {
      id: 'droit_image',
      kind: 'droit_image',
      label: 'Autorisation de droit à l’image',
      lines: false,
      fields: [
        { name: 'NomPersonne', label: 'Nom / prénom', type: 'text', section: 'Personne concernée', prefill: 'personName' },
        { name: 'DateNaissance', label: 'Date de naissance', type: 'date', section: 'Personne concernée' },
        { name: 'EmailPersonne', label: 'Email', type: 'text', section: 'Personne concernée', prefill: 'personEmail' },
        { name: 'AdressePersonne', label: 'Adresse', type: 'textarea', section: 'Personne concernée', prefill: 'personAddress' },
        { name: 'TypePrestation', label: 'Prestation / projet', type: 'text', section: 'Images concernées', prefill: 'dealTitle' },
        { name: 'DatePriseDeVue', label: 'Date de la prise de vue', type: 'date', section: 'Images concernées', prefill: 'eventDate' },
        { name: 'LieuPriseDeVue', label: 'Lieu de la prise de vue', type: 'text', section: 'Images concernées', prefill: 'eventLocation' },
        { name: 'AutreUsage', label: 'Autre usage précisément décrit', type: 'textarea', section: 'Finalités et supports' },
        { name: 'Duree', label: 'Durée (si autre)', type: 'text', section: 'Durée et territoire' },
        { name: 'Territoire', label: 'Territoire des autres supports', type: 'text', section: 'Durée et territoire' },
        { name: 'Representant1', label: 'Représentant légal 1', type: 'text', section: 'Mineur' },
        { name: 'Qualite1', label: 'Qualité du représentant 1', type: 'text', section: 'Mineur' },
        { name: 'Representant2', label: 'Représentant légal 2 si requis', type: 'text', section: 'Mineur' },
        { name: 'Qualite2', label: 'Qualité du représentant 2', type: 'text', section: 'Mineur' }
      ],
      checks: [
        { name: 'usage_portfolio', label: 'Portfolio et site Nolan Arc', group: 'Finalités' },
        { name: 'usage_social', label: 'Réseaux sociaux organiques Nolan Arc', group: 'Finalités' },
        { name: 'usage_print', label: 'Supports imprimés / présentation commerciale', group: 'Finalités' },
        { name: 'usage_paid', label: 'Publicité payante / contenu sponsorisé', group: 'Finalités' },
        { name: 'usage_press', label: 'Concours / sélection professionnelle / presse métier', group: 'Finalités' },
        { name: 'usage_other', label: 'Autre usage précisément décrit', group: 'Finalités' },
        { name: 'duration_1y', label: '1 an', group: 'Durée' },
        { name: 'duration_3y', label: '3 ans', group: 'Durée' },
        { name: 'duration_5y', label: '5 ans', group: 'Durée' },
        { name: 'duration_other', label: 'Autre durée', group: 'Durée' }
      ],
      render(doc, ctx) {
        const T = kit(doc, ctx);
        const usage = (name, title, hint) => check(T.box(name), `<strong>${title}</strong><small>${hint}</small>`);
        const duration = (name, label) => `<span class="nd-inline-check">${T.box(name)} ${label}</span>`;
        return article('nd-compact', header('Nolan Arc · Autorisation facultative', 'Droit à l\'image.', 'Document distinct du contrat')
          + subtitle('Cette autorisation concerne uniquement l\'utilisation professionnelle de votre image par Nolan Arc. Elle n\'est pas une condition de la prestation et n\'emporte aucune cession des droits d\'auteur de Nolan Arc.')
          + section('01 · Personne concernée', grid([card('Nom / prénom', T.field('NomPersonne')), card('Date de naissance', T.field('DateNaissance')), card('Email', T.field('EmailPersonne')), card('Adresse', T.field('AdressePersonne'))]))
          + section('02 · Images concernées', soft([item('Prestation / projet :', T.field('TypePrestation')), item('Date :', T.field('DatePriseDeVue')), item('Lieu :', T.field('LieuPriseDeVue')), item('Nature des contenus :', 'photographies et/ou vidéos réalisées dans ce contexte, dans lesquelles la personne est identifiable.')]))
          + section('03 · Finalités et supports : cochez uniquement ce que vous acceptez', '<div class="nd-checks">'
            + usage('usage_portfolio', 'Portfolio et site Nolan Arc', 'Présentation des réalisations et de l\'approche professionnelle.')
            + usage('usage_social', 'Réseaux sociaux organiques Nolan Arc', 'Publications non sponsorisées sur les comptes professionnels.')
            + usage('usage_print', 'Supports imprimés / présentation commerciale', 'Portfolio PDF, brochure, présentation ou support de prospection Nolan Arc.')
            + usage('usage_paid', 'Publicité payante / contenu sponsorisé', 'Campagnes publicitaires ou publications sponsorisées. Autorisation séparée des usages organiques.')
            + usage('usage_press', 'Concours / sélection professionnelle / presse métier', 'Uniquement dans un contexte valorisant le travail Nolan Arc.')
            + check(T.box('usage_other'), `<strong>Autre usage précisément décrit :</strong> ${T.field('AutreUsage')}`)
            + '</div><p class="nd-warning">Aucune case n\'est cochée à l\'avance. Un usage non coché n\'est pas autorisé.</p>')
          + section('04 · Durée et territoire', grid([
            card('Durée choisie', `<div class="nd-inline-checks">${duration('duration_1y', '1 an')}${duration('duration_3y', '3 ans')}${duration('duration_5y', '5 ans')}${duration('duration_other', 'Autre :')} ${T.field('Duree')}</div>`),
            card('Territoire', `Monde pour les supports internet accessibles en ligne ; autres supports : ${T.field('Territoire')}`)
          ]))
          + section('05 · Conditions d\'utilisation', list([
            'Nolan Arc n\'utilise pas les images dans un contexte illicite, trompeur, dégradant ou portant manifestement atteinte à la dignité de la personne.',
            'La présente autorisation est consentie à titre gratuit, sauf accord écrit distinct.',
            'Elle n\'autorise pas Nolan Arc à céder l\'image à un tiers pour que ce tiers mène sa propre communication. Les prestataires techniques agissant pour le compte de Nolan Arc peuvent toutefois traiter les fichiers dans la mesure nécessaire à la diffusion autorisée.',
            `La personne peut demander l'arrêt des nouveaux usages et, lorsque le traitement repose sur son consentement, retirer ce consentement pour l'avenir en écrivant à ${T.email}. Nolan Arc traite la demande dans un délai raisonnable et retire les contenus de ses supports sous son contrôle lorsque cela est juridiquement et techniquement possible.`,
            'Le retrait n\'a pas d\'effet rétroactif sur les usages licitement réalisés avant la demande ni sur les exemplaires imprimés déjà diffusés ; Nolan Arc ne peut garantir l\'effacement immédiat des caches, republications ou copies réalisées hors de son contrôle.'
          ]))
          + section('06 · Données personnelles', `<p>Les images permettant d'identifier une personne constituent des données personnelles. ${T.esc(T.legalName)} est le responsable du traitement pour les usages Nolan Arc décrits dans cette autorisation. La personne peut exercer ses droits applicables à l'adresse ${T.email} et peut saisir la CNIL dans les conditions prévues par la réglementation.</p>`)
          + section('07 · Mineur : à remplir si applicable', '<p class="nd-warning">Avant toute publication de l\'image d\'un mineur, l\'autorisation écrite du ou des représentants légaux requis doit être recueillie. Lorsque la situation familiale ou l\'exercice de l\'autorité parentale crée un doute, ne pas publier avant clarification.</p>'
            + grid([card('Représentant légal 1', T.field('Representant1')), card('Qualité', T.field('Qualite1')), card('Représentant légal 2 si requis', T.field('Representant2')), card('Qualité', T.field('Qualite2'))]))
          + section('08 · Consentement et signatures', `<p>Je confirme avoir compris les usages cochés, la durée et le territoire indiqués ci-dessus et autorise ${T.esc(T.legalName)} / Nolan Arc à utiliser mon image uniquement dans ce cadre.</p>`
            + signatures([['Personne photographiée / filmée', 'Nom, date, « Lu et approuvé », signature'], [T.who, 'Date, signature'], ['Représentant légal 1 si mineur', 'Nom, date, signature'], ['Représentant légal 2 si requis', 'Nom, date, signature']]), 'nd-no-break')
          + footer(T));
      }
    },

    /* ---------- Formulaire de rétractation (consommateur) ---------- */
    {
      id: 'retractation',
      kind: 'retractation',
      label: 'Formulaire de rétractation (consommateur)',
      lines: false,
      fields: [
        { name: 'Prestation', label: 'Prestation', type: 'text', section: 'Notification', prefill: 'offerLabel' },
        { name: 'DateContrat', label: 'Devis / contrat accepté le', type: 'date', section: 'Notification' },
        { name: 'Reference', label: 'Référence du devis ou du contrat', type: 'text', section: 'Notification' }
      ],
      checks: [],
      render(doc, ctx) {
        const T = kit(doc, ctx);
        return article('nd-compact', header('Nolan Arc · Consommateur', 'Rétractation.', 'Modèle de notification')
          + subtitle('À utiliser lorsqu\'un droit légal de rétractation s\'applique à votre contrat de prestation de services. Vous pouvez aussi envoyer toute déclaration claire et dénuée d\'ambiguïté.')
          + section('Destinataire', `<div class="nd-soft"><strong>${T.who}</strong><br>Email : ${T.email}<br>Adresse professionnelle : ${T.text(T.address)}</div>`)
          + section('Notification', '<p>Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services suivante :</p>'
            + grid([card('Prestation', T.field('Prestation'), true)])
            + grid([card('Devis / contrat accepté le', T.field('DateContrat')), card('Référence', T.field('Reference')), card('Nom du consommateur', T.text(T.contact.name)), card('Email / téléphone', T.text(T.contactLine)), card('Adresse', T.text(T.contact.address), true)], 'nd-grid--spaced'))
          + section('Envoi', `<p>Cette notification peut être envoyée à <strong>${T.email}</strong>. Conservez une preuve de votre envoi.</p>`)
          + section('Date et signature', '<p>Date : <span class="nd-line"></span></p><p>Signature du consommateur (uniquement si formulaire papier) :</p><div class="nd-sign-area"></div>')
          + footer(T));
      }
    },

    /* ---------- Facture pro forma (la facture officielle est émise via Indy) ---------- */
    {
      id: 'facture',
      kind: 'facture',
      label: 'Facture pro forma',
      lines: true,
      fields: [
        { name: 'DatePrestation', label: 'Date de la prestation', type: 'date', section: 'Prestation', prefill: 'eventDate' },
        { name: 'NumeroDevis', label: 'Devis associé', type: 'text', section: 'Prestation' }
      ],
      checks: [],
      render(doc, ctx) {
        const T = kit(doc, ctx), d = T.doc;
        const paid = num(d.paid_amount);
        const pro = str(T.contact.company) !== '';
        const objectTitle = str(d.title) || str(T.deal.title);
        const clean = s => str(s).replace(/[.\s]+$/, '');
        const penalty = clean(T.business.latePenalty) || 'au taux de la BCE majoré de 10 points';
        const discount = str(T.business.discount) || 'Aucun escompte n’est accordé pour paiement anticipé.';
        const due = d.due_date ? `Paiement au plus tard le <strong>${T.date(d.due_date)}</strong>, par virement bancaire.` : 'Paiement à réception, par virement bancaire.';
        let settled = '';
        if (paid > 0) {
          const when = d.paid_at ? ` le ${T.date(d.paid_at)}` : '';
          const how = str(d.payment_method) ? ` (${T.esc(str(d.payment_method).toLowerCase())})` : '';
          settled = `<div class="nd-callout"><strong>Déjà réglé :</strong> ${T.amount(paid)}${when}${how} · <strong>Reste dû :</strong> ${T.amount(Math.max(0, round2(T.total - paid)))}</div>`;
        }
        const indy = str(d.indy_number);
        return article('nd-compact', header('Nolan Arc · Facture', 'Facture pro forma.', `N° ${T.text(d.number)}<br>Date ${T.date(d.issue_date)}<br>Échéance ${d.due_date ? T.date(d.due_date) : 'à réception'}`)
          + subtitle('Récapitulatif de la prestation réalisée et des sommes dues.')
          + `<section class="nd-grid">${[
            card('Client / Société', T.text(T.clientName)),
            card('Email / Téléphone', T.text(T.contactLine)),
            card('Adresse / SIRET si professionnel', T.text(T.contact.address), true),
            card('Prestataire', `${T.who} · EI micro-entreprise<br>${T.text(T.address)}<br>SIRET ${T.siret} · ${T.email}`, true)
          ].join('')}</section>`
          + section('01 · Objet', soft([item('Objet.', T.text(objectTitle)), item('Date de la prestation.', T.field('DatePrestation')), T.has('NumeroDevis') ? item('Devis associé.', T.field('NumeroDevis')) : '']))
          + section('02 · Détail', priceTable(T, 'Désignation', false) + settled)
          + bankSection(T, '03')
          + section('04 · Conditions de paiement', list([
            due,
            pro ? `En cas de retard de paiement, pénalités ${T.esc(penalty)}.` : '',
            pro ? 'Indemnité forfaitaire pour frais de recouvrement en cas de retard : 40 €.' : '',
            T.esc(discount)
          ]))
          + `<div class="nd-callout"><p><strong>Document informatif.</strong> La facture officielle est émise via Indy, plateforme agréée de facturation électronique.</p>${indy ? `<p class="nd-mt">Référence Indy : ${T.text(indy)}</p>` : ''}</div>`
          + footer(T));
      }
    }
  ];

  /* ---------- Modèles de messages clients ----------
     Variables : {{prenom}}, {{nom}}, {{projet}}, {{date}}, {{lieu}}, {{montant}}, {{acompte}}, {{solde}}, {{numero}}, {{lien}},
     plus {{heure}}, {{delai}}, {{questionnaire}}, {{duree_galerie}}, {{duree_video}}, {{occasion}}, {{metier}} quand le texte l'exige. */
  const messages = [
    {
      id: '01-premier-contact',
      channel: 'email',
      label: 'Premier contact',
      stage: 'nouveau',
      subject: 'Nolan Arc | Votre projet {{projet}}',
      body: `Bonjour {{prenom}},

Merci pour votre message et pour l'intérêt que vous portez à Nolan Arc.

Votre projet de {{projet}} m'intéresse beaucoup et j'aimerais en savoir plus : le lieu envisagé, l'ambiance souhaitée, les moments qui comptent pour vous. Chaque projet est unique, et c'est en échangeant que je peux vous proposer un accompagnement sur mesure.

Je vous invite à consulter mon portfolio sur nolanarc.com pour découvrir mon approche et mon univers visuel.

Si vous le souhaitez, nous pouvons prévoir un échange téléphonique ou un rendez-vous afin d'en discuter plus en détail. Je m'adapte à vos disponibilités.

Au plaisir d'échanger avec vous,

Nolan
Nolan Arc`,
      vars: ['prenom', 'projet']
    },
    {
      id: '02-devis-contrat',
      channel: 'email',
      label: 'Envoi du devis et du contrat',
      stage: 'devis',
      subject: 'Nolan Arc | Votre devis, contrat et réservation',
      body: `Bonjour {{prenom}},

Suite à notre échange, je vous transmets en pièces jointes :

• Le devis détaillé n° {{numero}} pour votre {{projet}}
• Le contrat correspondant au cadre de la mission
• Les CGV Nolan Arc applicables

Pour valider la commande (et, pour une prestation datée, réserver définitivement la date), il faut :
1. Prendre connaissance des documents
2. Signer le devis
3. Signer le contrat
4. Me retourner les documents signés par email
5. Procéder au versement de l’acompte de 40 % ({{acompte}}) en utilisant les coordonnées bancaires indiquées sur le devis

La commande n’est validée qu’après réception des deux documents signés et encaissement de l’acompte. Pour une prestation datée, la date est bloquée à ce moment-là.

Le solde suit l’échéance indiquée au devis : pour une prestation datée, il est dû au plus tard avant le début de la prestation le jour convenu ; pour une mission continue, l’échéancier figure au devis.

Si vous êtes consommateur et que vous souhaitez que je commence la prestation avant la fin du délai légal de rétractation, le contrat contient la demande expresse correspondante.

N’hésitez pas si vous avez la moindre question.

À bientôt,

Nolan
Nolan Arc`,
      vars: ['prenom', 'numero', 'projet', 'acompte']
    },
    {
      id: '02a-devis-contrat-prestation-datee',
      channel: 'email',
      label: 'Devis et contrat : prestation datée',
      stage: 'devis',
      subject: 'Nolan Arc | Réservation de votre {{projet}} du {{date}}',
      body: `Bonjour {{prenom}},

Je vous envoie le devis n° {{numero}}, le contrat de prestation datée et les CGV applicables.

Pour bloquer définitivement le {{date}} :
• devis signé ;
• contrat signé ;
• acompte de 40 % ({{acompte}}) encaissé.

Le solde de 60 % ({{solde}}) sera dû au plus tard avant le début de la prestation le jour convenu.

Une annulation écrite reçue au moins deux mois avant la date permet le remboursement de l’acompte. À moins de deux mois, l’acompte reste acquis et le solde n’est pas réclamé du seul fait de l’annulation. Un report peut être demandé une fois, au moins 14 jours avant, pour une date dans les six mois et sous réserve de mes disponibilités. Les détails complets figurent dans le contrat et les CGV.

À bientôt,

Nolan
Nolan Arc`,
      vars: ['prenom', 'projet', 'date', 'numero', 'acompte', 'solde']
    },
    {
      id: '02b-devis-contrat-mission-continue',
      channel: 'email',
      label: 'Devis et contrat : mission continue',
      stage: 'devis',
      subject: 'Nolan Arc | Lancement de votre mission {{projet}}',
      body: `Bonjour {{prenom}},

Je vous envoie le devis n° {{numero}}, le contrat de mission continue et les CGV applicables.

Pour lancer la mission :
• devis signé ;
• contrat signé ;
• acompte de 40 % ({{acompte}}) encaissé.

Le calendrier de paiement, les phases, livrables, révisions et droits d’exploitation sont détaillés au devis. À défaut d’échéancier particulier, le solde est dû avant la remise des livrables définitifs.

À bientôt,

Nolan
Nolan Arc`,
      vars: ['prenom', 'projet', 'numero', 'acompte']
    },
    {
      id: '03-bienvenue',
      channel: 'email',
      label: 'Bienvenue, projet lancé',
      stage: 'signe',
      subject: 'Nolan Arc | Bienvenue dans votre espace projet',
      body: `Bonjour {{prenom}},

C'est officiel, votre projet est lancé. Bienvenue.

J'ai préparé un espace dédié à votre prestation, accessible ici :
{{lien}}

Vous y retrouverez vos documents, le calendrier et toutes les informations utiles pour la suite.

Prochaine étape : merci de remplir le questionnaire de préparation ci-dessous. Vos réponses me permettront de préparer la séance au plus juste, en fonction de vos attentes et de votre histoire.
{{questionnaire}}

Vous trouverez également en pièce jointe le guide de bienvenue, qui reprend les grandes étapes de notre collaboration.

Je reste disponible pour toute question.

À bientôt,

Nolan
Nolan Arc`,
      vars: ['prenom', 'lien', 'questionnaire']
    },
    {
      id: '04-rappel-j7',
      channel: 'email',
      label: 'Rappel J-7',
      stage: 'signe',
      subject: 'Nolan Arc | Votre {{projet}} approche',
      body: `Bonjour {{prenom}},

Votre {{projet}} approche et je tenais à faire un point avec vous.

Voici les informations confirmées :
• Date : {{date}}
• Horaire : {{heure}}
• Lieu : {{lieu}}

Si vous n'avez pas encore rempli le questionnaire de préparation, je vous invite à le faire dès que possible afin que je puisse préparer la séance dans les meilleures conditions :
{{lien}}

Côté administratif, vérifiez simplement que le devis et le contrat sont bien signés et que l'acompte de 40 % a été encaissé. Le solde ({{solde}}) n'est exigible qu'au plus tard avant le début de la prestation le jour convenu, sauf échéance différente écrite au devis.

De mon côté, tout est prêt. Si vous avez des questions de dernière minute ou des ajustements à prévoir, c'est le bon moment pour en discuter.

À très bientôt,

Nolan
Nolan Arc`,
      vars: ['prenom', 'projet', 'date', 'heure', 'lieu', 'lien', 'solde']
    },
    {
      id: '06-remerciement',
      channel: 'email',
      label: 'Remerciement après la prestation',
      stage: 'production',
      subject: 'Nolan Arc | Merci pour cette journée',
      body: `Bonjour {{prenom}},

Je tenais à vous remercier pour ce moment partagé. Ce fut un réel plaisir d'être présent pour capturer ces instants, et j'espère que vous avez pleinement profité de cette journée.

Je commence dès maintenant le travail d'édition et de développement de vos images. Comptez un délai de {{delai}} pour la livraison de votre galerie finale.

Vous recevrez un message dès que tout sera prêt.

En attendant, profitez de ces beaux souvenirs encore frais.

Merci encore pour votre confiance,

Nolan
Nolan Arc`,
      vars: ['prenom', 'delai']
    },
    {
      id: '07-livraison',
      channel: 'email',
      label: 'Livraison de la galerie',
      stage: 'livre',
      subject: 'Nolan Arc | Votre galerie est prête',
      body: `Bonjour {{prenom}},

J'ai le plaisir de vous annoncer que votre galerie est prête. Vous pouvez dès maintenant consulter et télécharger vos photos via le lien ci-dessous :

{{lien}}

Quelques informations importantes :
• Vous pouvez télécharger l'ensemble des photos ou faire une sélection
• Durée d’accès à la galerie : {{duree_galerie}}
• Durée d’accès au lien vidéo : {{duree_video}}
• Les éventuelles extensions d’hébergement sont proposées séparément lorsqu’elles sont disponibles

Je vous recommande de télécharger vos fichiers dès que possible et de les sauvegarder sur plusieurs supports.

J'espère sincèrement que le résultat sera à la hauteur de vos attentes. J'ai hâte d'avoir votre retour.

Par ailleurs, vous trouverez en pièce jointe une autorisation de droit à l’image distincte. Elle est entièrement facultative : elle précise les supports et usages auxquels vous acceptez éventuellement de consentir. Merci de me la retourner signée uniquement si cela vous convient.

Merci encore pour votre confiance,

Nolan
Nolan Arc`,
      vars: ['prenom', 'lien', 'duree_galerie', 'duree_video']
    },
    {
      id: '08-avis',
      channel: 'email',
      label: 'Demande d’avis',
      stage: 'livre',
      subject: 'Nolan Arc | Votre retour compte',
      body: `Bonjour {{prenom}},

J'espère que vous avez eu le temps de parcourir votre galerie et que les souvenirs sont à la hauteur du moment vécu.

Votre avis compte beaucoup pour moi. Si vous avez un instant, j'aimerais savoir ce que vous avez pensé de l'expérience dans son ensemble : la préparation, le jour J, le résultat final.

Si vous souhaitez partager votre retour publiquement, un avis Google m'aiderait énormément à faire connaître mon travail :
{{lien}}

Bien sûr, cela reste entièrement à votre convenance.

Merci pour le temps accordé,

Nolan
Nolan Arc`,
      vars: ['prenom', 'lien']
    },
    {
      id: '09-recommandation',
      channel: 'email',
      label: 'Merci et recommandation',
      stage: 'paye',
      subject: 'Nolan Arc | Merci encore',
      body: `Bonjour {{prenom}},

Je voulais simplement prendre un moment pour vous remercier encore une fois. Travailler sur votre projet a été une belle expérience.

Un petit rappel pratique : pensez à sauvegarder vos photos sur plusieurs supports (disque dur, cloud) pour les conserver en toute sécurité dans le temps.

Si dans votre entourage quelqu'un prépare un événement ou cherche un photographe, le plus beau compliment que vous puissiez me faire est d'en parler autour de vous. Le bouche-à-oreille reste la recommandation la plus précieuse.

Je vous souhaite le meilleur pour la suite,

Nolan
Nolan Arc`,
      vars: ['prenom']
    },
    {
      id: '10-suivi',
      channel: 'email',
      label: 'Suivi : occasion particulière',
      stage: 'paye',
      subject: 'Nolan Arc | {{occasion}}',
      body: `Bonjour {{prenom}},

Je me permets de vous écrire en cette occasion particulière. {{occasion}}. Le temps passe, et je tenais à vous adresser mes sincères félicitations pour cette belle étape.

J'espère que vous êtes toujours aussi heureux et que la vie vous réserve de belles surprises.

Si l'envie vous prend un jour de marquer un nouveau chapitre (séance anniversaire, portraits de famille ou tout autre projet), ce sera toujours un plaisir d'en discuter.

En attendant, je vous souhaite une magnifique journée,

Nolan
Nolan Arc`,
      vars: ['prenom', 'occasion']
    },
    {
      id: 'wa-rappel-j7',
      channel: 'whatsapp',
      label: 'Rappel J-7',
      stage: 'signe',
      body: `Bonjour {{prenom}},

C'est Nolan, votre {{metier}} pour votre {{projet}}.

Je reviens vers vous car la date approche. Voici un récapitulatif :

Date : {{date}}
Horaire : {{heure}}
Lieu : {{lieu}}

De mon côté, tout est en place. Si vous avez des questions ou des ajustements de dernière minute, n'hésitez pas.

À très bientôt,
Nolan`,
      vars: ['prenom', 'metier', 'projet', 'date', 'heure', 'lieu']
    },
    {
      id: 'wa-veille',
      channel: 'whatsapp',
      label: 'Veille de la prestation',
      stage: 'signe',
      body: `Bonjour {{prenom}},

C’est Nolan. C’est demain le grand jour.

Petit récapitulatif :
Rendez-vous à {{heure}}, {{lieu}}.

Profitez de votre soirée et du moment demain, je m’occupe du reste.

À demain,
Nolan`,
      vars: ['prenom', 'heure', 'lieu']
    },
    {
      id: 'wa-veille-solde',
      channel: 'whatsapp',
      label: 'Veille de la prestation, solde restant dû',
      stage: 'signe',
      body: `Bonjour {{prenom}},

C’est Nolan. C’est demain le grand jour.

Petit récapitulatif :
Rendez-vous à {{heure}}, {{lieu}}.

Petit rappel administratif : le solde de {{solde}} doit être réglé au plus tard avant le début de la prestation demain. Si le virement est déjà parti, vous pouvez ignorer ce message.

Profitez de votre soirée et du moment demain, je m’occupe du reste.

À demain,
Nolan`,
      vars: ['prenom', 'heure', 'lieu', 'solde']
    },
    {
      id: 'wa-remerciement',
      channel: 'whatsapp',
      label: 'Remerciement (jour même ou lendemain)',
      stage: 'production',
      body: `Bonjour {{prenom}},

C'est Nolan. Je tenais à vous remercier pour ce beau moment. Ce fut un réel plaisir d'être présent à vos côtés.

Je commence le travail d'édition dès maintenant. Comptez environ {{delai}} pour recevoir votre galerie finale.

Je vous tiendrai informé dès que tout sera prêt.

Merci encore pour votre confiance.

Nolan`,
      vars: ['prenom', 'delai']
    },
    {
      id: 'wa-livraison',
      channel: 'whatsapp',
      label: 'Livraison de la galerie',
      stage: 'livre',
      body: `Bonjour {{prenom}},

C'est Nolan. J'ai terminé l'édition de vos photos, votre galerie est prête.

Vous pouvez les consulter et les télécharger ici :
{{lien}}

Important : la galerie reste accessible pendant {{duree_galerie}}. Pensez à télécharger vos fichiers et à effectuer vos propres sauvegardes.

J'espère sincèrement que le résultat vous plaira. J'ai hâte d'avoir votre retour.

Vous recevrez également par email une autorisation de droit à l’image facultative si vous souhaitez m’autoriser certains usages professionnels des images.

Merci encore,
Nolan`,
      vars: ['prenom', 'lien', 'duree_galerie']
    },
    {
      id: 'wa-avis',
      channel: 'whatsapp',
      label: 'Demande d’avis (10 jours après la livraison)',
      stage: 'livre',
      body: `Bonjour {{prenom}},

C'est Nolan. J'espère que vous profitez bien de vos souvenirs.

Si vous avez un instant, votre avis m'aiderait énormément. Un retour honnête, même en quelques mots, sur Google :
{{lien}}

Merci pour le temps accordé, et encore bravo pour ce beau moment.

Nolan`,
      vars: ['prenom', 'lien']
    },
    {
      id: 'wa-livraison-demande-mariage',
      channel: 'whatsapp',
      label: 'Livraison : demande en mariage',
      stage: 'livre',
      body: `Bonjour {{prenom}},

C’est Nolan, votre photographe pour la demande en mariage 😊

Avant tout, je voulais encore vous adresser toutes mes félicitations pour ce beau moment. Ce fut un vrai plaisir d’être présent pour capturer cette étape importante de votre histoire. Je vous souhaite sincèrement beaucoup de bonheur, une vie remplie de sérénité, de santé et de belles choses pour la suite de votre aventure à deux.

Je reviens vers vous car j’ai terminé le développement et l’édition des photos de votre demande en mariage 📸
Vous pouvez dès maintenant les consulter et les télécharger via la galerie :

{{lien}}

Petit conseil : pensez à télécharger les photos dès que possible afin de les conserver sur vos appareils. Vous pouvez également télécharger toute la galerie en quelques clics et partager le lien avec votre fiancée, votre famille ou vos proches s’ils souhaitent découvrir les images.

J’espère sincèrement que le résultat vous plaira et j’ai hâte d’avoir votre retour.

J’aurais également une petite demande, totalement facultative : si vous êtes d’accord, j’aimerais pouvoir utiliser certaines photos de cette séance pour présenter mon travail. Je vous joins une autorisation de droit à l’image qui détaille séparément les supports possibles (portfolio/site, réseaux sociaux, communication imprimée, publicité). Vous pouvez accepter uniquement les usages qui vous conviennent, ou ne rien autoriser du tout. Cela n’a aucun effet sur votre prestation ni sur vos livrables.

Merci encore pour votre confiance et pour m’avoir permis d’immortaliser ce moment si spécial.

Je vous souhaite à tous les deux énormément de bonheur pour la suite ✨

À bientôt,
Nolan`,
      vars: ['prenom', 'lien']
    }
  ];

  window.NolanDocTemplates = { templates, messages };
})();
