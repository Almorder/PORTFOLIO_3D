# Audit V20.1 — Performance, médias locaux et mobile

## Périmètre volontairement limité

Cette passe ne redessine pas le site et ne rouvre pas les chantiers éditoriaux / Work / Journal / légal. Elle traite uniquement :

1. performance et stabilité d'affichage ;
2. dépendances d'images externes ;
3. collisions responsive signalées sur mobile ;
4. ajout de trois miniatures dédiées dans « Trois dimensions ».

## Performance

- CSS de production minifié au build sans réécriture de sélecteurs ni de valeurs ;
- images de stock / ambiance remplacées par des fichiers WebP locaux très légers ;
- suppression du preconnect Unsplash devenu inutile ;
- `decoding="async"` ajouté aux logos / miniatures non critiques ;
- conservation des optimisations V19/V20 : lazy media, content-visibility, WebGL conditionnel, reduced motion.

Le CSS source reste volontairement lisible. Seul le fichier produit dans `dist/assets/` est minifié afin d'éviter une passe de purge agressive susceptible de modifier le rendu.

## Médias locaux

Les `<img>` générés par le site ne dépendent plus d'URL distante. Sont désormais servis depuis `/assets/` :

- hero poster ;
- visuels temporaires Work / Services ;
- cinq références visuelles du carrousel Work ;
- poster du Bol d'en face ;
- Sony, Sigma, Adobe, NiSi, SmallRig et PGYTECH ;
- OG par défaut ;
- miniatures des trois dimensions.

YouTube reste externe uniquement comme vidéo consentie, Google Fonts reste externe, Three.js reste chargé à la demande : ils ne font pas partie de cette passe image.

## Trois dimensions

Trois fichiers distincts sont utilisés, sans réemploi ailleurs :

- `dimensions/realisation.webp` ;
- `dimensions/direction-artistique.webp` ;
- `dimensions/strategie.webp`.

Ils sont insérés comme miniatures dans la zone graphique de chaque carte, sans changer le contenu ou le CTA.

## Mobile

Le hero ne dépend plus de trois coordonnées absolues concurrentes sous 760 px. Les rôles, la phrase « Une idée… » et les CTA occupent maintenant trois lignes de grille dédiées. Cela empêche la phrase de se superposer aux expertises sur les écrans courts.

Des garde-fous supplémentaires ont été ajoutés aux cartes projets, dimensions, pricing, FAQ et grilles étroites : `min-width:0`, metadata de projet sur deux lignes et hauteurs de cartes auto.

Le bandeau de consentement est également relevé au-dessus du dock mobile.

## QA

`npm run check` : OK — 30 HTML.

Le QA V20.1 vérifie en plus :

- présence des 3 miniatures uniques ;
- présence des 5 médias locaux du carrousel Work ;
- absence de `<img src="https://…">` dans le build.

## Point préexistant non modifié

Le repository référence toujours `/assets/nolan-portrait.jpg`, mais le portrait réel n'était pas fourni dans la base V20. Il n'a pas été inventé ni remplacé dans cette passe, conformément au principe de ne pas fabriquer un portrait utilisateur.
