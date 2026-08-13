# AUDIT V11 — Nolan Arc

## 1. Diagnostic des bugs remontés

### CTA dupliqué dans le footer
Le grand bloc « Un projet en tête ? » était rendu sur chaque page alors que Home, Projet, Services et Contact possèdent déjà leurs propres actions de sortie. Cela rallongeait artificiellement toutes les pages et répétait le même message sans nouvelle information.

**Correction V11 :** suppression du bloc. Le footer redevient un footer : identité, navigation, contact, légal.

### Scène Home « Comprendre » devenue statique
Le contenu changeait encore par étapes mais la sensation de déplacement avait été trop réduite.

**Correction V11 :** la progression de scroll pilote maintenant le déplacement horizontal/vertical de l'objet, sa rotation, l'arc, le halo et les changements de média. Le fallback image continue de fonctionner sans WebGL.

### Bloc vide sous les collaborations
Le composant Animated Stats pouvait devenir visuellement vide parce que les cartes étaient mises à `opacity:0` avant leur déclenchement. Si l'observer ou une autre partie du JS ne s'exécutait pas comme prévu, le conteneur restait visible mais son contenu non.

**Correction V11 :** contenu réel visible par défaut ; JavaScript ne fait qu'améliorer l'entrée et le comptage. Collaborations et statistiques sont regroupées comme un seul cluster de preuve.

### Line Menu TOC trop envahissant
Le label de la section active gardait le menu partiellement ouvert en permanence.

**Correction V11 :** état de repos = rail compact. Le menu s'ouvre uniquement au survol ou au focus, puis reste ouvert environ 1,9 seconde après la sortie du pointeur avant de se replier.

### Menu mobile
Le bouton `Menu` était auto-placé dans la deuxième colonne de la grille, donc visuellement centré. Les liens du menu héritaient parfois d'une couleur sombre sur fond sombre.

**Correction V11 :** bouton forcé en colonne 3 / haut-droite, texte Menu/Fermer, overlay sombre lisible, focus trap, Escape et restauration du focus.

### Page À propos
La phrase sur « un animé » ne servait pas le positionnement professionnel et risquait de détourner l'attention de l'idée utile : Nolan remarque la cohérence d'un univers dans ses détails.

**Correction V11 :** reformulation autour de la cohérence, du cadrage, de la matière et du rythme.

---

## 2. Audit par rapport au plan maître

### Phase 0 — Reconnaissance
**État : solide.** Les routes, contenus, fonctionnalités, intégrations, légales et assets historiques ont été recensés.

### Phase 1 — Content Inventory
**État : solide mais dépendant des médias manquants.** Les contradictions historiques ont été évitées dans le nouveau Work. Un seul projet reste suffisamment documenté pour une étude de cas complète : *Le bol d'en face*.

### Phase 2 — Audit visiteur
**État V11 : amélioré.**
- DA / agence : Work reste accessible immédiatement et le projet réel arrive avant le manifeste.
- Marketing / marque : Services explicite besoin → prise en charge → bénéfice.
- Prospect événementiel : branche Moments reliée directement au contact.
- Visiteur novice : Hero puis trois entrées expliquent les trois contextes sans demander de comprendre une taxonomie interne.

### Phase 3 — Positionnement
**État : cohérent.** `L'intention avant l'image` reste le fil stratégique. Le site évite de réduire Nolan à une liste de compétences.

### Phase 4 — Information Architecture
**État : cohérent, avec un manque éditorial.**
- Home
- Work
- Projet
- Services
- À propos
- Journal
- Contact
- Légal

Le Journal n'a pas encore de vraies pages article individuelles car les contenus source ne sont pas assez développés pour les créer sans inventer.

### Phase 5 — Wireframe / parcours
**État V11 : corrigé.**

Home : compréhension → preuve → travail → méthode → projection → témoignages → Nolan → contact.

Work : projet vérifié → autres collaborations → bifurcation Services / Contact.

Projet : film → fiche → intention → décisions → extraits → Work / Services / Contact.

Services : problème → valeur → preuve → contact par intention.

À propos : personne → tension → regard → bénéfice client → preuve → Work / Contact.

Journal : idées → preuve concrète via le film.

Contact : qualification légère → message → identité → détails optionnels → envoi.

### Phase 6 — Design System
**État : cohérent mais à surveiller.** Le système possède désormais beaucoup de composants interactifs. La règle V11 est donc : chaque interaction doit avoir une fonction claire. Les composants Framer recréés ne doivent pas devenir un catalogue d'effets.

Signature dominante : arrondis + verre + profondeur + trajectoire/arc + mouvement piloté par le scroll.

### Phase 7 — Prototype système
**État : fonctionnel.** Shell, Home, Work, projet réel, Services, About, Contact et responsive existent.

### Phases 8/9 — Industrialisation & QA
**État : partiel.** Les checks automatisés sont solides, mais plusieurs validations réelles restent nécessaires après push.

---

## 3. Parcours client et liens entre pages

### Home
- CTA principal → Work
- CTA secondaire → Contact
- satellites → sections Services
- 3 besoins → ancrages Services
- À propos → About
- finale → Contact

### Work
- projet réel → case study
- collaborations partielles → Services contextualisés
- fin de page → Services ou Contact

### Projet
- retour Work
- fin → Work / Services / Contact

### Services
- Marques → Contact préqualifié
- Récits → Projet réel
- Moments → Contact préqualifié
- cas non classable → Contact

### À propos
- preuve extérieure → Work
- action secondaire → Contact

### Journal
- pont explicite vers *Le bol d'en face* afin que la réflexion mène à une preuve réelle.

---

## 4. Ce qui manque encore pour atteindre complètement le brief initial

### 1. Davantage de travail réel
C'est le manque le plus important. L'UI ne peut pas remplacer 3 à 5 case studies réellement documentés.

### 2. Portrait réel de Nolan
La page À propos possède sa place mais pas le média final. Sans portrait, l'identification humaine reste moins forte que prévu.

### 3. Médias Ouilove / A One Permis / Moments
Les collaborations sont réelles mais l'expérience visuelle reste illustrative tant que leurs vrais assets ne sont pas raccordés.

### 4. Journal long format
Le plan cible prévoyait des articles dédiés. Il faut des contenus sources suffisants avant de publier des pages complètes.

### 5. Validation production
À faire sur URL réelle :
- FormSubmit réel ;
- GitHub Pages refresh sur routes ;
- 320 / 390 / 768 / 1280 / 1440 / 1600+ ;
- Safari iOS ;
- Chrome Android ;
- clavier ;
- reduced motion ;
- réseau lent ;
- WebGL indisponible.

### 6. Compteur de vues
Le code existe, mais Supabase doit être réellement configuré avant qu'une métrique puisse être affichée.

### 7. Médiation B2C
La configuration juridique contient toujours un médiateur non renseigné. Le build ne bloque plus dessus, mais l'obligation doit être régularisée si les prestations B2C restent proposées.

---

## 5. Règle de QA V11

Le site ne doit plus pouvoir passer `npm run check` si :
- le CTA géant du footer réapparaît ;
- la référence aux animés réapparaît ;
- le rail TOC n'a plus son comportement de repli ;
- la scène Journey perd ses variables de mouvement ;
- le menu mobile perd son placement haut-droite ;
- les pages principales perdent leur `main-content` accessible ;
- Work / Journal / About perdent leurs sorties logiques vers la suite du parcours.
