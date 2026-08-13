# Audit production — Nolan Arc V8

## Direction

La V8 ne cherche pas à afficher le maximum de composants. Elle utilise les interactions comme une hiérarchie :

1. entrée de marque courte ;
2. preuve / Work ;
3. profondeur visuelle pendant la méthode ;
4. choix de besoin ;
5. preuve sociale ;
6. personne ;
7. contact.

## Composants

Voir `COMPONENT_AUDIT_V8.md` pour le détail des 12 composants Framer demandés et leur statut.

## QA automatisé

`npm run check` contrôle :

- build statique ;
- syntaxe JavaScript ;
- H1, titles, descriptions ;
- liens internes ;
- alt images ;
- IDs dupliqués ;
- assets CSS/JS hashés ;
- pages légales ;
- formulaire et honeypot ;
- YouTube absent avant action utilisateur ;
- barre de progression horizontale ;
- absence du rail vertical ;
- présence des composants V8 principaux.

## Limites assumées

- Page View Counter : off tant que Supabase n'est pas configuré et que la politique de confidentialité n'est pas mise à jour.
- Video Slide Show : non affiché tant qu'il n'existe pas au moins deux vrais médias vidéo à montrer.
- Glass Showcase : réinterprétation originale CSS + Canvas 2D ; aucun code du composant Framer payant n'est copié.
- Ambient Video Player : halo visuel adapté au poster / état de lecture. Un iframe YouTube ne permet pas l'analyse directe de la couleur de chaque frame.
- Portrait Nolan : toujours attendu dans `public/assets/nolan-portrait.jpg`.

## Go / No-Go

La V8 passe le contrôle automatisé. Le dernier niveau de QA reste un contrôle visuel sur l'URL GitHub Pages en desktop et mobile, car c'est la seule manière de valider les crops, le rendu des polices distantes et les comportements réels du navigateur de production.
