# AUDIT V6 — Nolan Arc

Date : 13 août 2026

## Verdict

La V6 passe le contrôle automatisé et peut être déployée sur GitHub Pages pour validation réelle dans le navigateur.

Cette version traite en priorité les problèmes remontés sur les captures V5 : contraste cassé sur Services/Ouilove, espaces vides excessifs sur desktop, répétition visuelle de `Le bol d'en face`, entrée Home qui imposait un carrousel inutile, manque de valeur de la page À propos et textes trop décoratifs.

## Correction structurelle principale — CSS reparti à neuf

`src/styles.css` a été réécrit intégralement pour la V6 au lieu d'empiler de nouveaux correctifs sur les anciennes couches V4/V5.

Objectif : supprimer les conflits de cascade qui pouvaient produire un nouveau HTML avec des règles devenues incompatibles, notamment les textes presque noirs sur fonds noirs visibles dans les captures Services/Ouilove.

Le langage visuel actuel utilise :

- Yrsa pour l'identité et les grands titres ;
- Syne pour l'interface ;
- DM Sans pour le corps de texte ;
- rayons arrondis et panneaux vitrés ;
- profondeur par transparence, blur et ombres souples ;
- aucune découpe diagonale comme structure principale ;
- une barre de progression horizontale de 2 px en haut du viewport.

## Home

### Selected Work

Le bloc `Selected Work` a été compacté : le titre et le premier média ne sont plus séparés par une hauteur de viewport artificielle.

`Le bol d'en face` conserve son vrai poster lorsqu'il s'agit bien de présenter ce projet. Les illustrations génériques ne servent qu'aux entrées de besoins / territoires et ne sont jamais présentées comme des réalisations Nolan Arc.

### Choix du besoin

Sur desktop, les trois entrées sont visibles simultanément dans une grille de trois cartes verticales :

- Film / image de marque ;
- Récit / création ;
- Moment / événement.

Il n'y a plus de boutons précédent/suivant sur desktop. Les cartes conservent une proportion verticale adaptée aux visuels sociaux sans afficher de mention technique de format dans l'interface.

### Espaces

Les grandes hauteurs minimales ont été retirées des blocs qui n'en avaient pas besoin. Les respirations restantes servent un changement de scène, une preuve visuelle ou une lecture ; elles ne sont plus utilisées pour « faire premium » sans contenu.

## Work et fiche projet

- La page Work met en avant le travail réellement documenté avant les collaborations partielles.
- Le filtre a été retiré tant que le nombre de case studies vérifiés ne justifie pas cette interaction.
- `Le bol d'en face` utilise son média réel.
- Sur la fiche projet, le lecteur vidéo arrive immédiatement après l'introduction.
- Les métadonnées `Contexte / Rôle / Année / Lieu / Format / Caméra` sont affichées une seule fois.
- Sur mobile, chaque métadonnée est une cellule distincte pour éviter l'écrasement observé auparavant.
- L'ancien paragraphe redondant `Détails de production / La fiche technique` est supprimé.

## Services / Ouilove

La page Services a été reconstruite en trois territoires dans une seule page plutôt qu'en sous-pages maigres :

- Marques ;
- Récits ;
- Moments.

Chaque territoire répond désormais à trois questions : quel problème est pris en charge, ce que Nolan fait réellement, ce que le client gagne.

Le lien Ouilove pointe vers `#ouilove-proof`, une preuve contextualisée dans la section Marques. Les fonds et couleurs de texte sont explicitement définis dans le nouveau CSS afin d'éviter le contraste cassé vu en V5.

## À propos — nouvelle logique narrative

La page n'est plus une succession de principes abstraits. Elle suit une tension personnelle utile au visiteur :

1. Nolan est d'abord présenté comme une personne attirée depuis longtemps par la création, les histoires et les univers avec une identité propre.
2. Une contradiction réelle est exposée : avoir parfois passé plus de temps à se structurer qu'à créer.
3. Cette contradiction devient une méthode utile au client : clarifier le sens avant de multiplier les choix visuels.
4. La page traduit ensuite cette méthode en bénéfices concrets avant / pendant / après production.
5. Une preuve client ferme la boucle.

Un emplacement portrait réel est câblé sur `/assets/nolan-portrait.jpg`. Aucun faux portrait ni visage de stock n'est utilisé. Tant que le vrai fichier n'est pas fourni, le composant affiche un fallback graphique assumé.

## Texte / UX writing

La V6 supprime les formulations qui décrivaient le portfolio au lieu d'aider le visiteur (`le portfolio doit...`, `preuve avant promesse`, explications de prototype, etc.).

Règle éditoriale appliquée : un texte doit au moins faire l'une de ces choses :

- clarifier ce que Nolan peut prendre en charge ;
- aider le visiteur à se reconnaître dans un besoin ;
- expliquer une décision / méthode ;
- apporter une preuve ;
- réduire une objection, un risque ou un effort ;
- conduire vers l'action suivante.

Les notes du Journal ont également été transformées en conseils courts et applicables plutôt qu'en phrases d'ambiance.

## Transitions et mouvement

Le mouvement sert la continuité plutôt que la décoration :

- reveal progressif des blocs et médias à l'entrée dans le viewport ;
- légère profondeur / mise à l'échelle des médias au hover ;
- transition du header ;
- barre de progression de page ;
- transitions de navigation via l'API View Transitions lorsque le navigateur la supporte ;
- comportement sans animation agressive avec `prefers-reduced-motion`.

## Contact

Le formulaire reste compact :

1. type de projet ;
2. message ;
3. nom + email ;
4. détails facultatifs repliés ;
5. envoi.

Le but est de permettre d'écrire le besoin avant de demander une longue qualification.

Fonctionnalités câblées : validation native, honeypot, état d'envoi, succès / erreur, fallback email et notice de confidentialité.

## Pages légales

Présentes et reliées depuis le footer :

- Mentions légales ;
- Politique de confidentialité ;
- Cookies / contenus externes ;
- CGV ;
- Rétractation.

Le médiateur de la consommation reste à renseigner après adhésion réelle. Ce champ ne bloque plus techniquement le build, conformément à la décision de publication immédiate.

## QA automatique

`npm run check` doit terminer avec `QA OK`.

Le contrôle couvre notamment :

- syntaxe JavaScript ;
- title / meta description ;
- un seul H1 par page ;
- alt sur les images ;
- IDs dupliqués ;
- liens internes ;
- assets CSS / JS hashés ;
- pages légales reliées ;
- absence d'iframe YouTube dans le HTML initial ;
- formulaire, honeypot et confidentialité ;
- présence de la barre de progression horizontale ;
- absence de l'ancien rail vertical ;
- présence simultanée des trois cartes d'entrée desktop ;
- ancre Ouilove ;
- structure storytelling de l'À propos ;
- métadonnées du Bol affichées une seule fois.

## Points réels encore à compléter

1. **Portrait Nolan** : ajouter une vraie photo dans `public/assets/nolan-portrait.jpg`.
2. **Médias de collaborations** : remplacer progressivement les illustrations temporaires par les vrais médias Ouilove, A One Permis, Carat, Moments, etc.
3. **Volume de preuve** : `Le bol d'en face` reste la seule case study entièrement documentée ; ne pas inventer de résultats pour remplir la page.
4. **FormSubmit** : faire un envoi réel après déploiement et confirmer la réception.
5. **Médiateur B2C** : adhérer puis ajouter ses coordonnées dans `content/legal.mjs` et les documents commerciaux.
6. **Validation visuelle live** : le contrôle structurel est automatisé, mais le dernier sign-off 1440 px / mobile doit être fait sur l'URL GitHub Pages réellement déployée.
