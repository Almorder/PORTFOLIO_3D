export const legal = {
  // Données issues de la formalité d'entreprise fournie par Nolan Ribeiro.
  businessForm: 'Entrepreneur individuel — micro-entreprise',
  // Les mentions légales d'une EI doivent publier une adresse et un téléphone de contact.
  // Ils restent volontairement vides ici pour ne pas réexposer des coordonnées privées sans validation explicite.
  publicLegalContactsConfirmed: false,
  professionalAddress: '',
  professionalPhone: '',
  siren: '987648664',
  siret: '98764866400017',
  ape: '7420Z',
  vat: 'Franchise en base de TVA — TVA non applicable, art. 293 B du CGI',
  paymentTerms: 'La commande est validée après signature du devis, signature du contrat correspondant et encaissement d’un acompte de 40 % du prix total. Pour une prestation datée, la date n’est bloquée qu’à ce moment. Le solde de 60 % est exigible au plus tard avant le début de la prestation le jour convenu. Pour une mission continue, l’échéancier est indiqué au devis ; à défaut, le solde est exigible avant la remise des livrables définitifs. Les paiements sont acceptés par virement bancaire ou en espèces dans les limites légales. Aucun livrable final n’est remis avant encaissement intégral des sommes exigibles.',
  latePenaltyB2B: 'exigibles dès le jour suivant la date de règlement figurant sur la facture, au taux égal au taux d’intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente majoré de 10 points de pourcentage, sans pouvoir être inférieur à trois fois le taux d’intérêt légal',
  discountTerms: 'Aucun escompte n’est accordé pour paiement anticipé.',
  cancellationPolicy: 'Pour une prestation datée, toute annulation doit être notifiée clairement par écrit, par email ou courrier recommandé. Si la demande est reçue au moins deux mois avant la date prévue, l’acompte de 40 % est remboursé intégralement. Si elle est reçue à moins de deux mois, l’acompte de 40 % reste acquis à Nolan Arc et le solde n’est pas réclamé du seul fait de l’annulation. Un report peut être demandé une seule fois, au moins 14 jours calendaires avant la date initiale, pour une nouvelle date dans les six mois, sous réserve des disponibilités de Nolan Arc. L’acompte reste affecté au dossier et s’impute sur la nouvelle date. Les frais tiers distincts, approuvés par écrit et irréversiblement engagés, suivent les conditions annoncées avant leur engagement. Les droits légaux de rétractation du consommateur restent réservés.',
  continuousCancellationPolicy: 'Pour une mission continue ou exécutée par phases, la règle des deux mois ne s’applique pas. Sauf condition particulière au devis, le client peut demander la fin de la mission par écrit ; restent dus les travaux effectivement réalisés, les phases déjà engagées et les frais tiers préalablement approuvés et irréversiblement engagés. L’acompte s’impute sur ces sommes et tout trop-perçu éventuel est remboursé.',
  forceMajeurePolicy: 'La force majeure s’apprécie au sens de l’article 1218 du Code civil. En cas d’empêchement temporaire, les obligations concernées sont suspendues et un report ou un aménagement est recherché lorsqu’il reste compatible avec la mission. Si une force majeure empêche Nolan Arc d’assurer personnellement tout ou partie d’une mission et qu’une substitution est pertinente, Nolan Arc s’efforce raisonnablement, sans obligation de résultat, de rechercher et proposer un professionnel indépendant au profil et à l’univers visuel aussi proches que raisonnablement possible. Le client reste libre d’accepter ou non cette mise en relation ; sauf accord écrit contraire, le professionnel proposé contracte directement avec le client et Nolan Arc n’est pas tenu de financer un éventuel surcoût. Si aucun remplacement n’est trouvé ou accepté et que tout ou partie de la mission devient définitivement impossible, Nolan Arc restitue les sommes encaissées correspondant aux prestations non exécutées ; pour une prestation datée non commencée, les sommes encaissées au titre de cette prestation sont remboursées. Aucune indemnité contractuelle supplémentaire n’est due du seul fait de la force majeure, sous réserve des règles impératives applicables. Nolan Arc ne se réserve pas de droit général d’annuler discrétionnairement une prestation confirmée.',
  archivalPolicy: 'Les fichiers RAW, rushes, sources et fichiers de travail ne sont pas livrés par défaut. Nolan Arc conserve une copie de sécurité des livrables finaux pendant six mois après leur livraison, sans garantie d’archivage au-delà. Le client est responsable de ses propres sauvegardes dès réception.',
  ipPolicy: 'Aucune cession de droits de propriété intellectuelle n’est consentie par défaut. Nolan Ribeiro conserve les droits attachés aux créations réalisées. Toute cession ou licence d’exploitation — notamment quant aux usages, supports, durée, territoire, exclusivité, adaptations et éventuelles déclinaisons — doit être expressément prévue dans le devis ou le contrat et, le cas échéant, faire l’objet d’une rémunération distincte. À défaut, seuls les usages expressément autorisés dans les documents contractuels sont permis.',
  publicationDirector: 'Nolan Ribeiro',
  host: {
    name: 'GitHub, Inc.',
    address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
    website: 'https://pages.github.com/',
    phone: '',
    phoneNote: 'GitHub indique ne pas proposer d’assistance téléphonique et ne publie pas de numéro de support.'
  },
  mediator: {
    // Obligatoire avant toute mise en ligne de l'offre B2C « Moments » :
    // Nolan doit adhérer à un médiateur de la consommation référencé et renseigner ses coordonnées exactes.
    name: '',
    address: '',
    website: ''
  },
  formProcessor: {
    name: 'FormSubmit',
    website: 'https://formsubmit.co/'
  },
  privacyContact: 'nolanribcontact@gmail.com',
  prospectRetention: '3 ans à compter du dernier contact émanant du prospect, sauf obligation légale ou relation contractuelle ultérieure',
  clientRetention: 'pendant la relation contractuelle puis selon les durées légales applicables aux pièces contractuelles, comptables et à la défense des droits'
};

export const legalRequiredFields = [
  ['businessForm', legal.businessForm],
  ['siren', legal.siren],
  ['siret', legal.siret],
  ['paymentTerms', legal.paymentTerms],
  ['latePenaltyB2B', legal.latePenaltyB2B],
  ['discountTerms', legal.discountTerms],
  ['cancellationPolicy', legal.cancellationPolicy],
  ['ipPolicy', legal.ipPolicy],
];
