/* Nolan Arc | messages clients et carte du parcours.
   Script classique : expose window.NolanMessages = { steps, messages }.
   steps : les étapes du parcours client, dans l'ordre. Chaque étape dit QUOI envoyer, QUAND et POURQUOI.
   messages : les modèles de Nolan (emails et WhatsApp), rangés dans l'ordre du parcours.
   Variables : {{prenom}}, {{nom}}, {{projet}}, {{date}}, {{lieu}}, {{heure}}, {{montant}}, {{acompte}}, {{solde}}, {{numero}},
   {{lien}}, {{delai}}, {{questionnaire}}, {{duree_galerie}}, {{duree_video}}, {{occasion}}, {{metier}}.
   « branch » : datee (prestation datée : mariage, demande, shooting, tournage) ou mission (mission continue :
   direction artistique, stratégie, accompagnement). Sans « branch », le message vaut pour les deux. */
(function () {
  'use strict';

  /* Déclencheurs (rule) lus par le cockpit :
     request    : une demande existe et rien n'a encore été envoyé
     quote      : un devis existe (brouillon ou envoyé), le projet n'est pas encore signé
     signed     : le projet est signé (ou en production)
     before7    : la date est dans 7 jours ou moins (et pas demain)
     before1    : la date est demain
     after0     : la date est passée depuis 0 à 3 jours
     delivered  : le projet est livré
     review     : la livraison a été envoyée il y a 10 jours ou plus
     paid       : le projet est payé, ou 30 jours après la livraison
     anniversary: un an après la date, à 15 jours près */
  const steps = [
    { id: 'contact', label: 'Premier contact', rule: 'request', when: 'Dès la demande, sous 24 h', why: 'Remercier, montrer ton univers, obtenir les détails du projet.' },
    { id: 'devis', label: 'Devis et contrat', rule: 'quote', when: 'À l’envoi du devis et du contrat', why: 'Expliquer ce qui valide la commande : devis signé, contrat signé, acompte encaissé.', branches: true },
    { id: 'bienvenue', label: 'Bienvenue', rule: 'signed', when: 'Dès la signature et l’acompte reçu', why: 'Officialiser le lancement, obtenir le questionnaire de préparation.' },
    { id: 'j7', label: 'Rappel J-7', rule: 'before7', branch: 'datee', when: '7 jours avant la date', why: 'Confirmer date, horaire, lieu et le solde : zéro surprise.' },
    { id: 'veille', label: 'Veille', rule: 'before1', branch: 'datee', when: 'La veille de la prestation', why: 'Rassurer, redonner le rendez-vous, rappeler le solde s’il reste dû.' },
    { id: 'merci', label: 'Remerciement', rule: 'after0', when: 'Le jour même ou le lendemain', why: 'Remercier à chaud et annoncer le délai de livraison.' },
    { id: 'livraison', label: 'Livraison', rule: 'delivered', when: 'Dès que la galerie ou le film est prêt', why: 'Livrer, expliquer l’accès, proposer le droit à l’image (facultatif).' },
    { id: 'avis', label: 'Avis', rule: 'review', when: '10 jours après la livraison', why: 'Obtenir un avis Google pendant que le souvenir est frais.' },
    { id: 'reco', label: 'Recommandation', rule: 'paid', when: 'Un mois après la livraison, solde payé', why: 'Encourager le bouche-à-oreille.' },
    { id: 'suivi', label: 'Suivi', rule: 'anniversary', when: 'Un an après (date marquante)', why: 'Garder le lien, ouvrir un nouveau projet.' }
  ];

  const messages = [
  {
    id: '01-premier-contact',
    step: 'contact',
    channel: 'email',
    label: 'Premier contact',
    stage: 'nouveau',
    when: 'Dès la demande, sous 24 h',
    why: 'Remercier, montrer ton univers et obtenir les détails du projet (lieu, ambiance, moments clés).',
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
    id: '02a-devis-contrat-prestation-datee',
    step: 'devis',
    branch: 'datee',
    channel: 'email',
    label: 'Devis et contrat : prestation datée',
    stage: 'devis',
    when: 'À l’envoi du devis et du contrat (prestation datée)',
    why: 'Dire clairement les trois conditions qui bloquent la date : devis signé, contrat signé, acompte encaissé.',
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
    step: 'devis',
    branch: 'mission',
    channel: 'email',
    label: 'Devis et contrat : mission continue',
    stage: 'devis',
    when: 'À l’envoi du devis et du contrat (mission continue)',
    why: 'Lancer la mission sur des bases claires : phases, livrables, échéancier.',
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
    id: '02-devis-contrat',
    step: 'devis',
    channel: 'email',
    label: 'Envoi du devis et du contrat',
    stage: 'devis',
    when: 'À l’envoi du devis et du contrat (version générale)',
    why: 'Version unique si tu hésites entre prestation datée et mission continue.',
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
    id: '03-bienvenue',
    step: 'bienvenue',
    channel: 'email',
    label: 'Bienvenue, projet lancé',
    stage: 'signe',
    when: 'Dès la signature et l’acompte reçu',
    why: 'Officialiser le lancement et obtenir le questionnaire de préparation.',
    lien: 'espace',
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
    step: 'j7',
    branch: 'datee',
    channel: 'email',
    label: 'Rappel J-7',
    stage: 'signe',
    when: '7 jours avant la date',
    why: 'Confirmer date, horaire et lieu, rappeler le solde : zéro surprise le jour J.',
    lien: 'questionnaire',
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
    id: 'wa-rappel-j7',
    step: 'j7',
    branch: 'datee',
    channel: 'whatsapp',
    label: 'Rappel J-7',
    stage: 'signe',
    when: '7 jours avant la date',
    why: 'Le même rappel, en plus court, là où le client répond le plus vite.',
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
    step: 'veille',
    branch: 'datee',
    channel: 'whatsapp',
    label: 'Veille de la prestation',
    stage: 'signe',
    when: 'La veille de la prestation',
    why: 'Rassurer et redonner le rendez-vous.',
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
    step: 'veille',
    branch: 'datee',
    channel: 'whatsapp',
    label: 'Veille de la prestation, solde restant dû',
    stage: 'signe',
    when: 'La veille, si le solde n’est pas encore réglé',
    why: 'Rassurer et rappeler, sans insister, que le solde est dû avant le début.',
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
    id: '06-remerciement',
    step: 'merci',
    channel: 'email',
    label: 'Remerciement après la prestation',
    stage: 'production',
    when: 'Le jour même ou le lendemain',
    why: 'Remercier tant que l’émotion est là et annoncer le délai de livraison.',
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
    id: 'wa-remerciement',
    step: 'merci',
    channel: 'whatsapp',
    label: 'Remerciement (jour même ou lendemain)',
    stage: 'production',
    when: 'Le jour même ou le lendemain',
    why: 'Version courte et chaleureuse du remerciement.',
    body: `Bonjour {{prenom}},

C'est Nolan. Je tenais à vous remercier pour ce beau moment. Ce fut un réel plaisir d'être présent à vos côtés.

Je commence le travail d'édition dès maintenant. Comptez environ {{delai}} pour recevoir votre galerie finale.

Je vous tiendrai informé dès que tout sera prêt.

Merci encore pour votre confiance.

Nolan`,
    vars: ['prenom', 'delai']
  },
  {
    id: '07-livraison',
    step: 'livraison',
    channel: 'email',
    label: 'Livraison de la galerie',
    stage: 'livre',
    when: 'Dès que la galerie ou le film est prêt',
    why: 'Livrer, expliquer les durées d’accès et proposer l’autorisation de droit à l’image (facultative).',
    lien: 'galerie',
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
    id: 'wa-livraison',
    step: 'livraison',
    channel: 'whatsapp',
    label: 'Livraison de la galerie',
    stage: 'livre',
    when: 'Dès que la galerie ou le film est prêt',
    why: 'Prévenir tout de suite que la livraison est disponible.',
    lien: 'galerie',
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
    id: 'wa-livraison-demande-mariage',
    step: 'livraison',
    channel: 'whatsapp',
    label: 'Livraison : demande en mariage',
    stage: 'livre',
    when: 'Livraison d’une demande en mariage',
    why: 'Version dédiée, plus personnelle, avec la demande d’autorisation facultative.',
    lien: 'galerie',
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
  },
  {
    id: '08-avis',
    step: 'avis',
    channel: 'email',
    label: 'Demande d’avis',
    stage: 'livre',
    when: '10 jours après la livraison',
    why: 'Obtenir un retour et un avis Google pendant que le souvenir est frais.',
    lien: 'avis',
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
    id: 'wa-avis',
    step: 'avis',
    channel: 'whatsapp',
    label: 'Demande d’avis (10 jours après la livraison)',
    stage: 'livre',
    when: '10 jours après la livraison',
    why: 'Relance courte pour l’avis, là où le client lit ses messages.',
    lien: 'avis',
    body: `Bonjour {{prenom}},

C'est Nolan. J'espère que vous profitez bien de vos souvenirs.

Si vous avez un instant, votre avis m'aiderait énormément. Un retour honnête, même en quelques mots, sur Google :
{{lien}}

Merci pour le temps accordé, et encore bravo pour ce beau moment.

Nolan`,
    vars: ['prenom', 'lien']
  },
  {
    id: '09-recommandation',
    step: 'reco',
    channel: 'email',
    label: 'Merci et recommandation',
    stage: 'paye',
    when: 'Environ un mois après la livraison, solde payé',
    why: 'Remercier et encourager le bouche-à-oreille, ta première source de clients.',
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
    step: 'suivi',
    channel: 'email',
    label: 'Suivi : occasion particulière',
    stage: 'paye',
    when: 'À une date marquante (un an après, anniversaire)',
    why: 'Garder le lien et ouvrir la porte à un nouveau projet.',
    subject: 'Nolan Arc | {{occasion}}',
    body: `Bonjour {{prenom}},

Je me permets de vous écrire en cette occasion particulière. {{occasion}}. Le temps passe, et je tenais à vous adresser mes sincères félicitations pour cette belle étape.

J'espère que vous êtes toujours aussi heureux et que la vie vous réserve de belles surprises.

Si l'envie vous prend un jour de marquer un nouveau chapitre (séance anniversaire, portraits de famille ou tout autre projet), ce sera toujours un plaisir d'en discuter.

En attendant, je vous souhaite une magnifique journée,

Nolan
Nolan Arc`,
    vars: ['prenom', 'occasion']
  }
  ];

  window.NolanMessages = { steps, messages };
})();
