// Tarifs affichés sur l'accueil (cartes flottantes) et repris par la page Contact pour pré-remplir le message.
// `card` : la carte à jouer de l'offre (index de coin, visuel /assets/cards/<key>.webp).
// `key` sert dans le lien « ?offre= » ; `intent` choisit la catégorie du formulaire (brand, story, moment, other).
import { weddingOffers } from './wedding.mjs';

export const pricing = [
  { key:'mariage', card:{rank:'A',suit:'♣',red:false}, theme:'ivory', tag:'Mariage', title:weddingOffers.mariage.title, price:'1 500 €', from:true,
    text:'Votre journée filmée, puis montée en un vrai film.', facts:weddingOffers.mariage.facts.slice(0,2), cta:'Parler du mariage', intent:'moment' },
  { key:'demande', card:{rank:'K',suit:'♦',red:true}, theme:'red', tag:'Demande en mariage', title:weddingOffers.demande.title, price:'250 €', from:true,
    text:'Captation vidéo et/ou photo de la demande, sans limite, car vos souvenirs n’en ont pas.', cta:'Parler de la demande', intent:'moment' },
  { key:'contenu', card:{rank:'Q',suit:'♥',red:true}, theme:'black', tag:'Réseaux sociaux', title:'Création de contenu', price:'200 €', from:true,
    text:'Un réel cinématique produit de A à Z, du tournage à la publication. Tarif dégressif dès 3 réels ou posts photo.', cta:'Lancer un contenu', intent:'brand' },
  { key:'film', card:{rank:'J',suit:'♠',red:false}, theme:'texture', tag:'Réalisation', title:'Film de marque ou court métrage', price:'Sur devis', from:false,
    text:'Chaque film commence par une consultation du projet. On cadre l’idée ensemble, puis je vous fais un devis.', cta:'Présenter le film', intent:'story' },
  { key:'direction', card:{rank:'5',suit:'♦',red:true}, theme:'amber', tag:'Direction artistique', title:'Interventions ciblées', price:'200 €', from:true,
    text:'Un point d’entrée pour un besoin précis. Le périmètre évolue selon ce qu’il faut créer, corriger ou harmoniser.', cta:'Présenter le projet', intent:'brand' },
  { key:'strategie', card:{rank:'10',suit:'♣',red:false}, theme:'glass', tag:'Stratégie de marque', title:'Session ciblée', price:'89 € / h', from:false,
    text:'Audit, priorisation ou session de travail. Accompagnement sur devis.', cta:'Réserver une session', intent:'brand' },
];

export const pricingHref = offer => `/contact/?intent=${offer.intent}&offre=${offer.key}`;
// Phrase pré-remplie dans le message de la page Contact.
export const pricingMessage = offer => `Bonjour Nolan, je suis intéressé(e) par : ${offer.title}${offer.price ? ` (${offer.from ? 'à partir de ' : ''}${offer.price})` : ''}.\n\n`;
