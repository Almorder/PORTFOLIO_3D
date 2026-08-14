# AUDIT V19 — polish visuel + stabilité

## Correctifs demandés

- Sony : correction optique à 50 % dans une boîte logo normalisée afin que tous les logos occupent la même zone.
- PGYTECH : remplacement de la source distante par le PNG fourni par Nolan, détouré sur fond transparent et servi localement.
- Trois dimensions : nouvelle présentation éditoriale avec bande visuelle, grand signe typographique, bénéfice explicite et CTA mieux hiérarchisé. Le contenu métier d'origine est conservé.
- Retours : remplacement de l'avis A One Permis par l'avis de Lola, sans modifier la structure bento V16 ni son interaction de focus/flou.
- Pricing / FAQ : les interactions restent couvertes par le test runtime de V18.

## Passe stabilité / performance

Les causes les plus coûteuses observées dans la V18 étaient surtout des traitements visuels permanents ou chargés trop tôt :

1. l'iframe YouTube du hero était chargée en `eager` dès le HTML initial ;
2. Three.js pouvait être importé avant que la section « Comment je travaille » soit proche de l'écran ;
3. le grain animé du pricing repeignait une grande surface en continu ;
4. les révélations utilisaient un blur CSS généralisé ;
5. certains backdrop-filters restaient actifs sur mobile.

V19 conserve le rendu mais :
- monte la vidéo YouTube après le premier paint / en période idle, la démonte hors écran et la remonte si nécessaire ;
- charge WebGL uniquement à proximité de la section, sur desktop non contraint ;
- réduit le pixel ratio et la géométrie du calque Three.js ;
- garde un fallback CSS/image complet si WebGL n'est pas utilisé ;
- fige le grain du pricing au lieu de le repeindre en boucle ;
- retire le blur des animations d'entrée générales ;
- désactive les backdrop-filters les plus coûteux sous 900 px.

## Validation

- `npm run check` : doit rester vert.
- Pricing : changement Mariage / Direction artistique / Stratégie.
- FAQ : ouverture/fermeture d'un seul item à la fois.
- Retours : structure V16 conservée ; focus/flou au survol desktop.
- Hero : aucune iframe YouTube préchargée dans le HTML initial.
