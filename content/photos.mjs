// Photographies de Nolan affichées sur la page Work (tuile « Photographie » du bento et section dédiée).
//
// RÈGLE R1 : uniquement des photos réelles de Nolan, jamais d'image de stock. Tant qu'il y a moins de
// trois photos, la tuile et la section ne sont pas affichées (jamais de cadre vide en ligne).
// Pour ajouter une photo : déposer le fichier dans public/assets/photo/ puis ajouter une ligne, par exemple :
//   { src: '/assets/photo/portrait-atelier.jpg', width: 1600, height: 2000, alt: 'Portrait d’une créatrice dans son atelier', series: 'Portraits', place: 'Paris', year: '2025' },
// width et height : dimensions réelles du fichier (évitent que la page saute au chargement).
export const photos = [];

export const MIN_PHOTOS = 3;
