// Tarifs affichés sur l'accueil (cartes flottantes) et repris par la page Contact pour pré-remplir le message.
// `card` : la carte à jouer de l'offre (visuel /assets/cards/<key>.webp, index de coin dans le visuel).
// Sur la carte : titre, prix, CTA court. `tag` n'y paraît que si le titre seul ne dit pas le domaine (`showTag`) ;
// `text` et `facts` restent lus par les lecteurs d'écran.
// `key` sert dans le lien « ?offre= » ; `intent` choisit la catégorie du formulaire (brand, story, moment, other).
import { weddingOffers } from './wedding.mjs';

export const pricing = [
  { key:'mariage', card:{rank:'A',suit:'♣',red:false}, tag:'Mariage', title:weddingOffers.mariage.title, price:'1 500 €', from:true,
    text:'Votre journée filmée, puis montée en un vrai film.', facts:weddingOffers.mariage.facts.slice(0,2), cta:'Réserver', intent:'moment' },
  { key:'demande', card:{rank:'K',suit:'♦',red:true}, tag:'Demande en mariage', title:weddingOffers.demande.title, price:'250 €', from:true,
    text:'Captation vidéo et/ou photo de la demande, sans limite, car vos souvenirs n’en ont pas.', cta:'Réserver', intent:'moment' },
  { key:'contenu', card:{rank:'Q',suit:'♥',red:true}, tag:'Réseaux sociaux', title:'Création de contenu', price:'200 €', from:true,
    text:'Un réel cinématique produit de A à Z, du tournage à la publication. Tarif dégressif dès 3 réels ou posts photo.', cta:'Commander', intent:'brand' },
  { key:'film', card:{rank:'J',suit:'♠',red:false}, tag:'Réalisation', title:'Film de marque ou court métrage', price:'Sur devis', from:false,
    text:'Chaque film commence par une consultation du projet. On cadre l’idée ensemble, puis je vous fais un devis.', cta:'Demander un devis', intent:'story' },
  { key:'direction', card:{rank:'5',suit:'♦',red:true}, tag:'Direction artistique', showTag:true, title:'Interventions ciblées', price:'200 €', from:true,
    text:'Un point d’entrée pour un besoin précis. Le périmètre évolue selon ce qu’il faut créer, corriger ou harmoniser.', cta:'En parler', intent:'brand' },
  { key:'strategie', card:{rank:'10',suit:'♣',red:false}, tag:'Stratégie de marque', showTag:true, title:'Session ciblée', price:'89 € / h', from:false,
    text:'Audit, priorisation ou session de travail. Accompagnement sur devis.', cta:'Réserver', intent:'brand' },
];

export const pricingHref = offer => `/contact/?intent=${offer.intent}&offre=${offer.key}`;
// Phrase pré-remplie dans le message de la page Contact.
export const pricingMessage = offer => `Bonjour Nolan, je suis intéressé(e) par : ${offer.title}${offer.price ? ` (${offer.from ? 'à partir de ' : ''}${offer.price})` : ''}.\n\n`;
