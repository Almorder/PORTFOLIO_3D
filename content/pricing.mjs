// Tarifs affichés sur l'accueil (cartes flottantes) et repris par la page Contact pour pré-remplir le message.
// `card` : la carte à jouer de l'offre (visuel /assets/cards/<key>.webp, index de coin dans le visuel).
// Sur la carte : titre, prix, CTA court. `tag` n'y paraît que si le titre seul ne dit pas le domaine (`showTag`) ;
// `text` et `facts` restent lus par les lecteurs d'écran.
// `key` sert dans le lien « ?offre= » ; `intent` choisit la catégorie du formulaire (brand, story, moment, other).
import { weddingOffers } from './wedding.mjs';
import { legal } from './legal.mjs';

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

// Détail de chaque offre (« Ce qui est inclus »), affiché sous les cartes sur l'accueil et sur Work.
// Uniquement des faits déjà publiés : textes des offres, content/wedding.mjs, FAQ (content/site.mjs) et CGV
// (content/legal.mjs). Ce qui manque (délais, formats, nombre d'allers-retours, frais de déplacement…) attend
// les réponses de Nolan : rien n'est inventé ici.
// includes : ce qui est compris ; deliverables : ce que le client reçoit ; scope : périmètre ; varies : ce qui fait évoluer le prix.
// work : catégorie du catalogue Work qui montre des réalisations de ce type (lien « Voir des réalisations »).
export const pricingDetails = {
  mariage: { work:'mariage',
    includes:['La journée filmée, de 12 h à minuit','Le montage en un vrai film'],
    deliverables:['Un film final de 30 min'],
    varies:['Options et besoins supplémentaires : sur devis'] },
  demande: { work:'mariage',
    includes:['Captation vidéo et/ou photo de la demande, sans limite'] },
  contenu: { work:'reseaux-sociaux',
    includes:['Un réel cinématique produit de A à Z, du tournage à la publication'],
    deliverables:['Un réel'],
    varies:['Tarif dégressif dès 3 réels ou posts photo'] },
  film: { work:'video',
    includes:['Une consultation du projet : on cadre l’idée ensemble, puis je vous fais un devis','Préparation, tournage, montage, encodage et livraison sous une seule direction, selon le projet'],
    scope:['L’ensemble de la chaîne ou une étape précise : le tournage seul ou le montage seul'],
    varies:['Le périmètre, la durée de production, les livrables, les droits demandés et les frais éventuels'] },
  direction: { work:'direction-artistique',
    includes:['Un point d’entrée pour un besoin précis : créer, corriger ou harmoniser'],
    scope:['La direction visuelle, la cohérence de marque ou un système créatif à appliquer ensuite par votre équipe','Sans réalisation vidéo, si vous le souhaitez'],
    varies:['Le périmètre : ce qu’il faut créer, corriger ou harmoniser'] },
  strategie: { work:'',
    includes:['Une heure de travail ciblée : audit, priorisation ou session de travail','Des décisions concrètes à appliquer'],
    varies:['La durée : facturée à l’heure ; un accompagnement plus large est chiffré sur devis'] },
};

// Valable pour toutes les offres (CGV, content/legal.mjs et FAQ Services).
export const pricingCommon = [
  'Acompte de 40 % à la commande, la date est bloquée à ce moment ; solde avant la prestation.',
  'Nombre d’allers-retours et droits d’utilisation précisés au devis.',
  'Fichiers sources non livrés par défaut ; copie de sécurité des fichiers finaux pendant 6 mois.',
  `${legal.vat}.`,
];

// Sujets de demande sans tarif publié : le formulaire de contact sait les présélectionner (?offre=…).
export const contactTopics = [
  { key:'photo-mariage', title:'Photographie de mariage', intent:'moment' },
];

export const pricingHref = offer => `/contact/?intent=${offer.intent}&offre=${offer.key}`;
// Phrase pré-remplie dans le message de la page Contact.
export const pricingMessage = offer => `Bonjour Nolan, je suis intéressé(e) par : ${offer.title}${offer.price ? ` (${offer.from ? 'à partir de ' : ''}${offer.price})` : ''}.\n\n`;
