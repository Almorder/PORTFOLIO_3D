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
  paymentTerms: 'Sauf conditions particulières prévues au devis ou au contrat, la réservation n’est définitive qu’après acceptation du devis ou du contrat et encaissement d’un acompte d’au moins 40 % du prix total. Le solde est exigible au plus tard la veille de la prestation lorsqu’une date de prestation est prévue ; pour les autres missions, l’échéance du solde est indiquée au devis. Aucun livrable final n’est remis avant encaissement intégral des sommes exigibles.',
  latePenaltyB2B: 'exigibles dès le jour suivant la date de règlement figurant sur la facture, au taux égal au taux d’intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente majoré de 10 points de pourcentage, sans pouvoir être inférieur à trois fois le taux d’intérêt légal',
  discountTerms: 'Aucun escompte n’est accordé pour paiement anticipé.',
  cancellationPolicy: 'Hors droit légal de rétractation lorsqu’il s’applique, toute demande d’annulation doit être notifiée par courrier recommandé avec accusé de réception au plus tard deux mois avant la date de la prestation. Toute demande de report doit être formulée au plus tard deux semaines avant la prestation. Un report peut être accepté, sous réserve des disponibilités de Nolan Arc, pour une nouvelle date située dans les six mois suivant la date initialement prévue. Les conséquences financières d’une annulation ou d’un report, notamment le sort de l’acompte et des frais déjà engagés, sont précisées dans le devis ou le contrat accepté.',
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
