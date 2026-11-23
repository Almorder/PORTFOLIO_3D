// Mariage et demande en mariage : les prestations, et les photos affichées en polaroids.
//
// PHOTOS — tant que ce tableau est vide, la section « Mariage » de l'accueil n'est pas affichée
// (jamais de cadre vide en ligne). Pour ajouter une photo : déposer le fichier dans
// public/assets/mariage/ puis ajouter une ligne ici, par exemple :
//   { src: '/assets/mariage/ceremonie.jpg', alt: 'Les mariés à la sortie de la mairie', caption: 'Film de mariage', offer: 'mariage' },
// `offer` vaut 'mariage' ou 'demande' : c'est la prestation ouverte quand on clique sur le polaroid.
// Les trois premières photos sont montrées sur l'accueil, toutes le sont sur la page Services.
export const weddingPhotos = [];

export const weddingOffers = {
  mariage: {
    id: 'mariage',
    title: 'Film de mariage',
    price: 'À partir de 1 500 €',
    facts: [['30 min', 'film final'], ['12 h → 00 h', 'couverture de la journée'], ['Sur devis', 'options et besoins supplémentaires']],
    cta: 'Parler du mariage',
    href: '/contact/?intent=moment&offre=mariage'
  },
  demande: {
    id: 'demande-en-mariage',
    title: 'Demande en mariage',
    price: 'À partir de 250 €',
    note: 'Captation vidéo et/ou photo de la demande, sans limite.',
    instagramId: 'DewEcSOCFV2',
    cta: 'Parler de la demande',
    href: '/contact/?intent=moment&offre=demande'
  }
};
