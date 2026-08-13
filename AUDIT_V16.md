# AUDIT V16 — Nolan Arc

## 1. Décision de structure

V16 verrouille enfin le rôle de chaque page au lieu de faire varier l'architecture à chaque itération.

### Home
Objectif : voir le travail, comprendre les trois dimensions, disposer de preuves, connaître un ordre de prix et pouvoir écrire sans friction.

Ordre : Hero → Work → Stats → 3 dimensions → Journey → Écosystème → Pricing → Retours → FAQ → Quick Contact.

### Work
Objectif : regarder d'abord. Le Video Slide Show sert l'exploration, la galerie donne la matière, puis un switch compact permet au visiteur de choisir l'expertise qui l'intéresse.

### Services
Objectif : projeter une collaboration. Une seule expertise est développée à la fois via le switch Réalisation / Direction artistique / Stratégie. La section « les trois ensemble » explique la valeur de la transversalité.

### À propos
Objectif : comprendre Nolan, pas relire les Services. Portrait, curiosité, logique des trois disciplines, manière de travailler, puis Work / Contact.

### Contact
Objectif : écrire immédiatement. Nom, email et message sont prioritaires ; qualification et budget restent facultatifs.

## 2. Copywriting

Les textes V16 évitent d'expliquer aux professionnels ce qu'est un tournage, un storyboard ou une direction artistique. Ils décrivent surtout :

- l'étendue réelle de la prise en charge ;
- ce que la continuité de vision évite de perdre ;
- ce que le client gagne ;
- comment les trois expertises se contaminent positivement.

Le chiffre `+105 %` est présenté uniquement comme une croissance de chiffre d'affaires observée sur Ouilove, pas comme une promesse universelle.

## 3. Preuves

Home utilise quatre repères :

- 50+ vidéos réalisées ;
- pratique vidéo depuis 2022 ;
- pratique photo + vidéo ;
- +105 % de croissance de CA observée sur Ouilove.

Les stats utilisent le moteur scroll-triggered avec `IntersectionObserver`, `easeOutExpo`, stagger et count-up.

## 4. Prix

Le pricing Home est un seul module avec trois états :

- mariage : à partir de 1 500 €, film 30 min, couverture 12 h → 00 h ;
- direction artistique : à partir de 200 € ;
- stratégie de marque : 89 € / heure ; accompagnement plus large sur devis.

## 5. Parcours

- Home → Work ou quick contact.
- Work → expertise sélectionnée → Services.
- Projet → Work / Services / Contact.
- Services → Contact et preuves.
- À propos → Work / Contact.
- Journal → accessible par footer et ponts contextuels.

Aucun gros CTA identique n'est répété mécaniquement partout.

## 6. Performance

- scroll regroupé dans `requestAnimationFrame` ;
- curseur custom ne tourne plus en boucle lorsqu'il est immobile ;
- WebGL monté à l'approche / visible uniquement ;
- pixel ratio WebGL plafonné ;
- médias secondaires lazy-loadés ;
- routes probables préfetchées au repos, autres routes au hover/focus ;
- `content-visibility:auto` sur les sections coûteuses hors écran ;
- aucun preloader sur les pages internes ;
- `prefers-reduced-motion` respecté.

L'objectif est une sensation fluide sur les écrans à haut taux de rafraîchissement, sans promettre un FPS matériel constant.

## 7. Vie privée

À la demande de Nolan, le site public ne contient pas son numéro de téléphone ni son adresse personnelle/professionnelle. Le QA cherche explicitement ces valeurs pour empêcher leur réapparition accidentelle.

Cette décision doit être conciliée séparément avec les obligations réglementaires applicables aux mentions légales avant validation juridique finale.

## 8. QA

`npm run check` contrôle notamment :

- 30 HTML générés / redirections ;
- une H1 par page ;
- routes et liens internes ;
- assets CSS / JS hashés ;
- Home V16 dans l'ordre attendu ;
- 4 stats et contextualisation du +105 % ;
- 6 cartes écosystème ;
- pricing 3 états ;
- Work slideshow + inertie ;
- switch 3 expertises sur Work et Services ;
- film first + une seule grille technique sur le projet ;
- Journal absent du header mais présent dans le footer ;
- téléphone / adresse interdits dans les sources publiques ;
- pas d'analytics / stockage navigateur ;
- YouTube uniquement après action explicite.
