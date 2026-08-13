# Nolan Arc — Components V10

Cette version garde les 12 composants demandés comme cahier des charges fonctionnel.

## Règle d'honnêteté

- Je n'indique jamais qu'un **code source propriétaire Framer** a été copié lorsqu'il n'a pas été fourni ou rendu accessible.
- Les composants Premium / Single-Use sont reconstruits indépendamment à partir de leurs comportements et options publiquement décrits.
- Le module direct `GradientMotionBackground-WD0KcZ.js@0XzNSaACkRVeYaCYXGIe` fourni par Nolan n'a pas pu être récupéré par l'outil web utilisé pendant cette révision. La V10 reproduit donc le comportement public documenté de **Gradient Motion**, mais ne prétend pas embarquer ce fichier source exact.

## 1 — Page View Counter

Implémentation réelle via Supabase REST, SQL fourni dans `supabase/page_views.sql`, compteur masqué si Supabase n'est pas configuré.

## 2 — Hold Confirm

Maintien, progression, annulation, clavier et tactile. Utilisé uniquement pour l'activation volontaire du lecteur externe.

## 3 — Glassy Button

Verre, reflet, profondeur, hover et pressed. Utilisé pour les CTA et contrôles compacts.

## 4 — Focus Testimonials

Flux de citations, focus au hover/clavier, atténuation des autres, expansion des retours et comportement mobile sans hover obligatoire.

## 5 — Glass Showcase Pro

Reconstruction indépendante avec Three.js / WebGL, verre physique, progression au scroll, fallback DOM et particules.

## 6 — Logo Preloader

Le préloader reste court mais possède maintenant deux sécurités indépendantes :

1. le JavaScript de sortie est exécuté avant tous les autres modules du site ;
2. une animation CSS `preloaderFailsafe` rend le calque invisible même si le JavaScript de la page plante plus loin.

Le visiteur ne doit donc jamais rester prisonnier du préloader.

## 7 — Ambient Video Player

Halo ambiant autour du film. Avec YouTube, les pixels de l'iframe ne sont pas accessibles au site : la couleur du halo est donc pilotée par la palette du projet et non par un faux sampling de frame.

## 8 — Stacked Flow

Pile interactive avec profondeur, molette, tactile, clavier, flèches et clic sur carte arrière.

## 9 — Video Slide Show

La V10 rapproche la forme de la référence fournie :

- 5 cartes portrait 9:16 ;
- carte centrale nette ;
- cartes voisines décalées en éventail, réduites et floutées ;
- grand plateau clair arrondi ;
- pagination par points dans une capsule ;
- contrôle son rond en haut à droite ;
- flèches discrètes au survol sur desktop ;
- swipe mobile ;
- 5 timecodes du même film, jamais présentés comme 5 projets différents.

## 10 — Animated Stats Pro

Reconstruction indépendante conforme au comportement public : trigger au scroll, `easeOutExpo`, stagger, décimales, Blur / Slide / Fade / Scale et responsive. La présentation V10 devient un seul bandeau premium arrondi plutôt que trois cartes sans lien.

## 11 — Line Menu TOC

La V10 applique la demande actuelle : **orientation verticale et placement à gauche sur desktop**. Les lignes restent minimales au repos, s'allongent au hover/état actif et révèlent le label. Le TOC est masqué sur petit écran pour ne pas entrer en concurrence avec le dock mobile.

## 12 — Gradient Motion Background

La V10 remplace l'ancien système `drift/pulse/rotate/swirl` par un composant autonome `gradient-motion-bg` qui couvre les options publiques documentées de Gradient Motion :

- styles `radial`, `conic`, `mesh`, `linear`, `diamond` ;
- palette custom ;
- vitesse ;
- blur ;
- opacité ;
- échelle ;
- `prefers-reduced-motion`.

Il est placé sur les zones où il apporte réellement de la profondeur : CTA Home, Services, À propos et Contact.

## Contact V10

Le formulaire est reconstruit comme un **composer en verre** et non comme un formulaire administratif : besoin → message → nom/email → détails facultatifs → envoi. Le message reste visible immédiatement, y compris sur mobile.

## Résumé

Les **12 composants** restent présents dans la V10. Les différences avec les composants Framer originaux sont documentées lorsque le code source propriétaire ou le module direct n'était pas accessible.
