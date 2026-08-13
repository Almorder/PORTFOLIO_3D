# Nolan Arc — Composants demandés · V9

Cette version traite les 12 composants demandés comme un cahier des charges fonctionnel.

## Règle d'honnêteté

- Les composants **Premium / Single-Use** ne sont pas copiés depuis leur code source propriétaire : leurs comportements publiquement décrits sont reconstruits indépendamment pour Nolan Arc.
- Les composants gratuits dont le Marketplace affiche « Copy Component » n'exposent pas leur code source via l'outil web utilisé pour cet audit. Leur comportement visible/documenté est donc reproduit, mais le repository ne prétend pas contenir leur source originale.
- `Hold Confirm` : l'URL exacte fournie n'était pas récupérable lors de l'audit du 13 août 2026. L'implémentation est un vrai contrôle press-and-hold autonome (progression, annulation, clavier), mais elle n'est pas présentée comme une copie de cette source inaccessible.

## 1 — Page View Counter
Source : https://www.framer.com/community/marketplace/components/page-view-counter/

Implémenté : **oui**.

- détection automatique du chemin courant ;
- lecture / création / incrément dans `page_views` via Supabase REST ;
- compteur animé ;
- rendu responsive ;
- configuration via `SUPABASE_URL` + `SUPABASE_ANON_KEY` ;
- SQL prêt dans `supabase/page_views.sql`.

Limite : sans les identifiants publics du projet Supabase de Nolan, le composant reste masqué plutôt que d'inventer des vues.

## 2 — Hold Confirm
Source demandée : https://www.framer.com/community/marketplace/components/hold-confirm/

Implémenté : **oui**.

- maintien 650 ms ;
- barre de progression ;
- relâchement avant terme = retour arrière ;
- souris, tactile, clavier ;
- état confirmé ;
- sens de remplissage configurable (`ltr` / `rtl`).

Usage : activation volontaire du lecteur YouTube.

## 3 — Glassy Button
Source : https://www.framer.com/community/marketplace/components/glassy-button/

Implémenté : **oui**.

- verre dépoli ;
- profondeur et reflet interne ;
- shine au hover ;
- état pressed ;
- variante claire ;
- cohérence avec le dock mobile.

## 4 — Focus Testimonials
Source : https://www.framer.com/community/marketplace/components/focus-testimonials/

Implémenté : **oui**.

- témoignages dans un flux continu ;
- focus au hover / clavier ;
- autres témoignages floutés et atténués ;
- badge auteur sans déplacement de layout ;
- correction du badge pour éviter le débordement viewport ;
- `Voir tous les retours / Réduire` ;
- mobile sans dépendance au hover.

## 5 — Glass Showcase Pro
Source : https://www.framer.com/community/marketplace/components/glass-showcase-pro/

Implémenté : **oui, reconstruction indépendante**.

- couche WebGL / Three.js chargée à la demande ;
- `MeshPhysicalMaterial` avec transmission, IOR, thickness et clearcoat ;
- légère flottabilité ;
- progression reliée au scroll ;
- images qui changent par étape ;
- transition de particules qui explose puis se reforme ;
- fallback HTML / images toujours présent ;
- reduced motion ;
- si le CDN Three.js échoue, le site garde le rendu CSS/DOM.

Le code premium Framer n'est pas inclus.

## 6 — Logo Preloader
Source : https://www.framer.com/community/marketplace/components/logo-preloader/

Implémenté : **oui**.

- entrée douce du logo ;
- spotlight ;
- hold configurable ;
- barre courte ;
- fade-out ;
- ignoré sur navigation interne / back-forward / reduced motion.

## 7 — Ambient Video Player
Source : https://www.framer.com/community/marketplace/components/ambient-video-player/

Implémenté : **oui, avec limite YouTube documentée**.

- halo ambiant autour du lecteur ;
- intensité / blur / spread contrôlés par CSS ;
- halo plus vivant pendant la lecture.

Limite : un iframe YouTube cross-origin ne permet pas au site de lire chaque frame pour calculer honnêtement sa couleur dominante. La version Nolan Arc utilise donc la palette du projet ; elle ne prétend pas faire un sampling de pixels inexistant.

## 8 — Stacked Flow
Source : https://www.framer.com/community/marketplace/components/stacked-flow/

Implémenté : **oui, reconstruction indépendante**.

- cartes réellement superposées ;
- échelle / profondeur / luminosité selon la distance à la carte active ;
- flèches ;
- molette / trackpad ;
- tactile / swipe ;
- clavier ;
- clic sur carte inactive = la ramener au premier plan ;
- clic sur carte active = ouvrir la destination ;
- responsive mobile conservant la logique de pile.

## 9 — Video Slide Show
Source : https://www.framer.com/community/marketplace/components/video-slide-show/

Implémenté : **oui** en V9.

- cartes vidéo verticales ;
- profondeur / perspective / scale / blur / opacity ;
- flèches ;
- dots ;
- autoplay du carousel ;
- pause au hover / focus ;
- swipe tactile ;
- lecture YouTube seulement à la demande ;
- boucle de navigation ;
- responsive.

Placement : uniquement dans la fiche `Le bol d'en face`, avec trois points d'entrée temporels du même film. Le site ne les présente pas comme trois projets différents.

## 10 — Animated Stats Pro
Source : https://www.framer.com/community/marketplace/components/animated-stats-pro/

Implémenté : **oui, reconstruction indépendante**.

- trigger au scroll ;
- easing `easeOutExpo` ;
- stagger ;
- décimales ;
- styles Blur / Slide / Fade / Scale ;
- responsive ;
- possibilité de replay via attribut.

Les chiffres restent des données vérifiables et non des KPI inventés.

## 11 — Line Menu TOC
Source : https://www.framer.com/community/marketplace/components/line-menu-toc/

Implémenté : **oui**.

- lignes fines par défaut ;
- ligne qui s'étend ;
- label révélé ;
- section active suivie par `IntersectionObserver` ;
- clavier ;
- responsive.

Adaptation volontaire : orientation horizontale sous le header afin de ne pas recréer le rail vertical de progression qui a été supprimé du portfolio.

## 12 — Gradient Motion BG
Source : https://www.framer.com/community/marketplace/components/gradient-motion-bg/

Implémenté : **oui**.

- quatre comportements disponibles : `drift`, `pulse`, `rotate`, `swirl` ;
- grain déterministe ;
- palette Nolan Arc ;
- usage local, pas de fond animé partout ;
- reduced motion.

## Résumé

Les **12 composants ont désormais une implémentation réelle dans le repository V9**.

Cela ne signifie pas que les sources propriétaires Framer ont été copiées. Cela signifie que chacune des 12 fonctionnalités demandées possède maintenant du HTML, du CSS et/ou du JavaScript réel dans Nolan Arc, avec les limitations externes explicitement indiquées ci-dessus.
