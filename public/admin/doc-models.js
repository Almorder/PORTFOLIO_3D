/* Nolan Arc | modèles de documents : ce que l'admin sait des fichiers de public/admin/docs/.
   Script classique : expose window.NolanDocModels = { models, settingsFields }.

   Les fichiers HTML de public/admin/docs/ sont les modèles d'origine de Nolan, tels quels. Chaque zone à remplir
   y est un <span class="pdf-marker" data-field="Nom"> ; chaque case, un [[CHK:nom]]. Ici, on déclare pour chaque
   modèle tous ces champs, rangés par section du modèle, avec :
   - col : la valeur vient d'une colonne du document (numéro, date, objet, total) au lieu de « data » ;
   - type : text (défaut), textarea, date (enregistrée AAAA-MM-JJ, imprimée « 14 juin 2027 »), amount (nombre en euros) ;
   - auto : d'où vient le préremplissage (fiche client, projet, agenda, devis lié, Réglages), voir cockpit.js ;
   - readonly : calculé, non modifiable ici.
   Le dépôt est public : aucune coordonnée bancaire ni téléphone ici, ils viennent des Réglages (settingsFields). */
(function () {
  'use strict';

  // Coordonnées imprimées sur les modèles, remplies depuis les Réglages de l'admin (table crm_settings).
  const settingsFields = { Telephone: 'telephoneFacturation', Titulaire: 'titulaire', Banque: 'banque', IBAN: 'iban', BIC: 'bic' };

  const CLIENT = [
    { name: 'Client', label: 'Client / Société', auto: 'client' },
    { name: 'Contact', label: 'Email / Téléphone', auto: 'contactLine' },
    { name: 'AdresseClient', label: 'Adresse / SIRET si professionnel', type: 'textarea', auto: 'addressSiret' }
  ];
  const BANK = { title: 'Coordonnées bancaires (virement)', settings: ['Titulaire', 'Banque', 'IBAN', 'BIC'] };
  const QUOTE_CHECKS = [
    { name: 'accept_quote', label: 'Devis et CGV reçus et acceptés (à cocher par le client)' },
    { name: 'b2c_info_received', label: 'Client consommateur : information sur la rétractation reçue' }
  ];
  const CONTRACT_B2C = [
    { name: 'b2c_start_early', label: 'Consommateur : démarrage demandé avant la fin du délai de 14 jours' },
    { name: 'b2c_acknowledge', label: 'Consommateur : conséquences de la rétractation reconnues' }
  ];
  const CONTRACT_ACCEPT = [{ name: 'accept_contract', label: 'Devis, contrat et CGV reçus et acceptés (à cocher par le client)' }];
  const MONEY_DATED = [
    { name: 'MontantTotal', label: 'Total net', col: 'total', type: 'amount', readonly: true },
    { name: 'MontantAcompte', label: 'Acompte 40 %', auto: 'acompte' },
    { name: 'MontantSolde', label: 'Solde 60 %', auto: 'solde' }
  ];

  const models = [
    {
      id: 'devis_datee', kind: 'devis', branch: 'datee', label: 'Devis : prestation datée', file: 'devis-prestation-datee.html',
      lines: { slots: [{ category: 'main', label: 'Prestation principale', rows: [1, 2, 3] }, { category: 'option', label: 'Options & add-ons', rows: [4, 5, 6] }] },
      sections: [
        { title: 'En-tête', fields: [{ name: 'NumeroDevis', label: 'N° du devis', col: 'number', readonly: true }, { name: 'DateDevis', label: 'Date du devis', col: 'issue_date', type: 'date' }] },
        { title: 'Client', fields: CLIENT },
        { title: '01 · Cadre', fields: [
          { name: 'TypePrestation', label: 'Type de prestation', auto: 'offer' },
          { name: 'DateHeure', label: 'Date / horaire', auto: 'dateHeure' },
          { name: 'Lieux', label: 'Lieu(x)', auto: 'lieu' }] },
        { title: '02 · Périmètre & livrables', fields: [
          { name: 'DescriptionMission', label: 'Mission', type: 'textarea', auto: 'dealTitle' },
          { name: 'Livrables', label: 'Livrables', type: 'textarea' },
          { name: 'Revisions', label: 'Révisions incluses' },
          { name: 'DelaiLivraison', label: 'Délai de livraison' }] },
        { title: '03 · Prix', lines: true, fields: MONEY_DATED },
        { title: '04 · ' + BANK.title, settings: BANK.settings },
        { title: '05 · Droits & usages', fields: [
          { name: 'UsagesAutorises', label: 'Usages client inclus', type: 'textarea' },
          { name: 'DroitsDetail', label: 'Supports / durée / territoire', type: 'textarea' }] },
        { title: '07 · Acceptation', checks: QUOTE_CHECKS }
      ]
    },
    {
      id: 'devis_mission', kind: 'devis', branch: 'mission', label: 'Devis : mission continue', file: 'devis-mission-continue.html',
      sections: [
        { title: 'En-tête', fields: [{ name: 'NumeroDevis', label: 'N° du devis', col: 'number', readonly: true }, { name: 'DateDevis', label: 'Date du devis', col: 'issue_date', type: 'date' }] },
        { title: 'Client', fields: CLIENT },
        { title: '01 · Mission', fields: [
          { name: 'Objectif', label: 'Objectif', type: 'textarea', auto: 'dealTitle' },
          { name: 'Perimetre', label: 'Périmètre', type: 'textarea' },
          { name: 'Phases', label: 'Phases', type: 'textarea' },
          { name: 'Livrables', label: 'Livrables', type: 'textarea' },
          { name: 'Revisions', label: 'Révisions / validations' }] },
        { title: '02 · Calendrier', fields: [
          { name: 'DateDebut', label: 'Démarrage estimé', type: 'date', auto: 'eventDate' },
          { name: 'Calendrier', label: 'Échéance / durée' }] },
        { title: '03 · Prix & échéancier', fields: [
          { name: 'MontantTotal', label: 'Total net (€)', col: 'total', type: 'amount', auto: 'dealAmount' },
          { name: 'MontantAcompte', label: 'Acompte de lancement : 40 %', auto: 'acompte' },
          { name: 'Phase2', label: 'Ligne 2 : phase', auto: 'phase2' },
          { name: 'Montant2', label: 'Ligne 2 : montant', auto: 'solde' },
          { name: 'Echeance2', label: 'Ligne 2 : échéance', auto: 'echeance2' },
          { name: 'Phase3', label: 'Ligne 3 : phase' },
          { name: 'Montant3', label: 'Ligne 3 : montant' },
          { name: 'Echeance3', label: 'Ligne 3 : échéance' }] },
        { title: '04 · ' + BANK.title, settings: BANK.settings },
        { title: '05 · Droits & confidentialité', fields: [
          { name: 'DroitsDetail', label: 'Usages / licence / cession', type: 'textarea' },
          { name: 'ConfidentialiteProjet', label: 'Confidentialité / embargo', type: 'textarea' },
          { name: 'AutorisationReference', label: 'Référence commerciale Nolan Arc', type: 'textarea' }] },
        { title: '07 · Acceptation', checks: QUOTE_CHECKS }
      ]
    },
    {
      id: 'contrat_datee', kind: 'contrat', branch: 'datee', label: 'Contrat : prestation datée', file: 'contrat-prestation-datee.html',
      sections: [
        { title: 'En-tête', fields: [{ name: 'ReferenceContrat', label: 'Référence du contrat', col: 'number', readonly: true }, { name: 'NumeroDevis', label: 'N° du devis associé', auto: 'quoteNumber' }] },
        { title: '01 · Parties', fields: CLIENT },
        { title: '02 · Objet', fields: [
          { name: 'DateAcceptation', label: 'Devis accepté le', type: 'date', auto: 'quoteSigned' },
          { name: 'DateHeure', label: 'Date / horaire', auto: 'q:DateHeure|dateHeure' },
          { name: 'Lieux', label: 'Lieu(x)', auto: 'q:Lieux|lieu' },
          { name: 'Perimetre', label: 'Périmètre', type: 'textarea', auto: 'q:DescriptionMission|dealTitle' },
          { name: 'Livrables', label: 'Livrables', type: 'textarea', auto: 'q:Livrables' },
          { name: 'Revisions', label: 'Révisions', auto: 'q:Revisions' },
          { name: 'DelaiLivraison', label: 'Délai', auto: 'q:DelaiLivraison' }] },
        { title: '03 · Réservation & paiement', fields: [
          { name: 'MontantTotal', label: 'Prix total', auto: 'quoteTotal' },
          { name: 'MontantAcompte', label: 'Acompte 40 %', auto: 'quoteAcompte' },
          { name: 'MontantSolde', label: 'Solde 60 %', auto: 'quoteSolde' }] },
        { title: '09 · Propriété intellectuelle', fields: [{ name: 'DroitsDetail', label: 'Usages accordés au Client', type: 'textarea', auto: 'q:DroitsDetail' }] },
        { title: '13 · Rétractation B2C', checks: CONTRACT_B2C },
        { title: '15 · Acceptation', checks: CONTRACT_ACCEPT }
      ]
    },
    {
      id: 'contrat_mission', kind: 'contrat', branch: 'mission', label: 'Contrat : mission continue', file: 'contrat-mission-continue.html',
      sections: [
        { title: 'En-tête', fields: [{ name: 'ReferenceContrat', label: 'Référence du contrat', col: 'number', readonly: true }, { name: 'NumeroDevis', label: 'N° du devis associé', auto: 'quoteNumber' }] },
        { title: '01 · Parties & objet', fields: [
          { name: 'Client', label: 'Client', auto: 'client' },
          { name: 'Contact', label: 'Contact', auto: 'contactLine' },
          { name: 'Mission', label: 'Mission', type: 'textarea', auto: 'q:Objectif|dealTitle' }] },
        { title: '02 · Périmètre, phases & livrables', fields: [
          { name: 'Perimetre', label: 'Périmètre', type: 'textarea', auto: 'q:Perimetre' },
          { name: 'Phases', label: 'Phases', type: 'textarea', auto: 'q:Phases' },
          { name: 'Livrables', label: 'Livrables', type: 'textarea', auto: 'q:Livrables' },
          { name: 'Revisions', label: 'Révisions / validations', auto: 'q:Revisions' },
          { name: 'Calendrier', label: 'Calendrier', auto: 'q:Calendrier' }] },
        { title: '03 · Formation & paiement', fields: [
          { name: 'MontantTotal', label: 'Prix total / mode de calcul', auto: 'quoteTotal' },
          { name: 'MontantAcompte', label: 'Acompte 40 %', auto: 'quoteAcompte' },
          { name: 'Echeancier', label: 'Échéancier' }] },
        { title: '07 · Propriété intellectuelle', fields: [{ name: 'DroitsDetail', label: 'Usages, supports, durée, territoire accordés', type: 'textarea', auto: 'q:DroitsDetail' }] },
        { title: '09 · Référence commerciale & droit à l’image', fields: [{ name: 'AutorisationReference', label: 'Autorisation de référence commerciale', type: 'textarea', auto: 'q:AutorisationReference' }] },
        { title: '12 · Rétractation B2C', checks: CONTRACT_B2C },
        { title: '14 · Acceptation', checks: CONTRACT_ACCEPT }
      ]
    },
    {
      id: 'droit_image', kind: 'droit_image', label: 'Autorisation de droit à l’image', file: 'autorisation-droit-image.html',
      sections: [
        { title: '01 · Personne concernée', fields: [
          { name: 'NomPersonne', label: 'Nom / prénom', auto: 'fullName' },
          { name: 'DateNaissance', label: 'Date de naissance', type: 'date' },
          { name: 'EmailPersonne', label: 'Email', auto: 'email' },
          { name: 'AdressePersonne', label: 'Adresse', type: 'textarea', auto: 'address' }] },
        { title: '02 · Images concernées', fields: [
          { name: 'TypePrestation', label: 'Prestation / projet', auto: 'dealTitle' },
          { name: 'DatePriseDeVue', label: 'Date', type: 'date', auto: 'eventDate' },
          { name: 'LieuPriseDeVue', label: 'Lieu', auto: 'lieu' }] },
        { title: '03 · Finalités et supports', note: 'Aucune case n’est cochée à l’avance : coche seulement ce que la personne accepte.', checks: [
          { name: 'usage_portfolio', label: 'Portfolio et site Nolan Arc' },
          { name: 'usage_social', label: 'Réseaux sociaux organiques Nolan Arc' },
          { name: 'usage_print', label: 'Supports imprimés / présentation commerciale' },
          { name: 'usage_paid', label: 'Publicité payante / contenu sponsorisé' },
          { name: 'usage_press', label: 'Concours / sélection professionnelle / presse métier' },
          { name: 'usage_other', label: 'Autre usage précisément décrit' }],
          fields: [{ name: 'AutreUsage', label: 'Autre usage (description)', type: 'textarea' }] },
        { title: '04 · Durée et territoire', checks: [
          { name: 'duration_1y', label: '1 an' }, { name: 'duration_3y', label: '3 ans' }, { name: 'duration_5y', label: '5 ans' }, { name: 'duration_other', label: 'Autre durée' }],
          fields: [{ name: 'Duree', label: 'Autre durée (préciser)' }, { name: 'Territoire', label: 'Territoire des autres supports' }] },
        { title: '07 · Mineur', fields: [
          { name: 'Representant1', label: 'Représentant légal 1' }, { name: 'Qualite1', label: 'Qualité' },
          { name: 'Representant2', label: 'Représentant légal 2 si requis' }, { name: 'Qualite2', label: 'Qualité' }] }
      ]
    },
    {
      id: 'retractation', kind: 'retractation', label: 'Formulaire de rétractation', file: 'formulaire-retractation-b2c.html',
      sections: [
        { title: 'Destinataire', fields: [{ name: 'AdresseProfessionnelle', label: 'Ton adresse professionnelle', type: 'textarea', auto: 'proAddress' }] },
        { title: 'Notification', fields: [
          { name: 'Prestation', label: 'Prestation', auto: 'offer' },
          { name: 'DateContrat', label: 'Devis / contrat accepté le', type: 'date', auto: 'quoteSigned' },
          { name: 'Reference', label: 'Référence', auto: 'quoteNumber' },
          { name: 'Nom', label: 'Nom du consommateur', auto: 'fullName' },
          { name: 'Contact', label: 'Email / téléphone', auto: 'contactLine' },
          { name: 'Adresse', label: 'Adresse', type: 'textarea', auto: 'address' }] }
      ]
    },
    {
      id: 'facture', kind: 'facture', label: 'Facture pro forma', file: 'facture-pro-forma.html',
      computed: ['ResteDu'],
      lines: { slots: [{ category: 'main', label: 'Prestation', rows: [1, 2, 3, 4, 5, 6] }] },
      sections: [
        { title: 'En-tête', fields: [
          { name: 'NumeroFacture', label: 'N° de la pro forma', col: 'number', readonly: true },
          { name: 'DateFacture', label: 'Date', col: 'issue_date', type: 'date' },
          { name: 'DateEcheance', label: 'Échéance de paiement', col: 'due_date', type: 'date' }] },
        { title: 'Client et prestataire', fields: [...CLIENT, { name: 'AdresseProfessionnelle', label: 'Ton adresse (prestataire)', type: 'textarea', auto: 'proAddress' }], flags: [{ name: 'ClientPro', label: 'Client professionnel (pénalités de retard et indemnité de 40 € imprimées)', auto: 'isPro' }] },
        { title: '01 · Objet', fields: [
          { name: 'Objet', label: 'Objet', col: 'title', auto: 'dealTitle' },
          { name: 'DatePrestation', label: 'Date de la prestation', type: 'date', auto: 'eventDate' },
          { name: 'NumeroDevis', label: 'Devis associé', auto: 'quoteNumber' }] },
        { title: '02 · Détail', lines: true, fields: [
          { name: 'MontantTotal', label: 'Total net', col: 'total', type: 'amount', readonly: true },
          { name: 'MontantRegle', label: 'Déjà réglé (€)', col: 'paid_amount', type: 'amount' }] },
        { title: '03 · ' + BANK.title, settings: BANK.settings },
        { title: '05 · Facture officielle', fields: [{ name: 'ReferenceIndy', label: 'Référence de la facture officielle sur Indy', col: 'indy_number' }] }
      ]
    }
  ];

  window.NolanDocModels = { models, settingsFields };
})();
