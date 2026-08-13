# Audit V13 — Direction Fabrica

## 1. Pourquoi ce pivot

Les versions précédentes avaient accumulé plusieurs langages : éditorial serif, glassmorphism, composants Framer recréés, grandes scènes de scroll et cartes très différentes selon les pages. Le site pouvait avoir de bons éléments isolés mais manquer d’une identité système immédiatement lisible.

La V13 choisit une référence principale : **Fabrica**. On reprend sa grammaire publique, pas son code propriétaire.

## 2. Grammaire retenue

- monochrome dominant ;
- fond ivoire / gris très clair ;
- noir presque pur ;
- grande typographie sans-serif ;
- wordmark monumental ;
- média hero sombre et monochrome ;
- grain continu ;
- petites métadonnées numérotées ;
- blocs visuels larges avec coins arrondis ;
- navigation très courte ;
- preuve client tôt ;
- Work au centre ;
- alternance claire / sombre ;
- CTA peu nombreux mais positionnés à la fin d’une décision ;
- animations d’apparition, scroll et médias, sans transformer chaque élément en démonstration technique.

L’orange Nolan Arc reste un accent ponctuel, pas une couleur structurante omniprésente.

## 3. Transposition sur Nolan Arc

### Home

1. Hero Nolan.Arc : identité + métier + promesse + contact.
2. Collaborations documentées.
3. Work.
4. Pourquoi travailler ensemble + stats réelles.
5. Services.
6. Méthode / intention avant l’image.
7. Retours.
8. FAQ.
9. Contact.

### Work

Le Work utilise une grande grille éditoriale puis le Video Slide Show et Stacked Flow. La priorité reste le travail plutôt que la liste des compétences.

### Projet

Le film apparaît avant l’explication. Les métadonnées ne sont affichées qu’une fois. La fiche déroule contexte → intention → décisions → suite.

### Services

Trois grands chapitres : Marques / Récits / Moments. Chaque chapitre répond à un problème puis explique ce qui est pris en charge et ce que le client obtient.

### À propos

La page fonctionne comme un Studio page à l’échelle d’une personne : identité, tension personnelle, manière de regarder, preuve, méthode et sorties vers Work/Contact.

### Contact

Le message est accessible immédiatement. Les données facultatives viennent après. L’email direct et Calendly restent visibles.

## 4. Preloader

Le preloader V13 est volontairement beaucoup plus proche du langage Fabrica :

- plein écran noir ;
- Nolan.Arc monumental ;
- petite ligne métier ;
- compteur 00 → 100 ;
- barre fine ;
- grain ;
- sortie rapide ;
- fail-safe CSS et JS afin qu’il ne puisse plus bloquer la Home.

Il ne se rejoue pas inutilement pendant une navigation interne.

## 5. Grain

Un calque global de texture légère est appliqué au viewport avec `feTurbulence`. Il reste en `pointer-events:none`, à faible opacité et ne réduit pas la lisibilité du contenu.

## 6. Composants hérités des versions précédentes

Ils restent fonctionnels mais leur rôle est secondaire face au système global :

- Animated Stats : preuve ;
- Focus Testimonials : retours ;
- Glass Showcase : méthode ;
- Stacked Flow : collaborations ;
- Video Slide Show : Work ;
- Ambient Player + Hold Confirm : fiche projet ;
- Line Menu TOC : pages longues ;
- FAQ : Home et Contact ;
- Page View Counter : optionnel via Supabase.

Leur skin ne doit plus donner l’impression que 12 templates différents vivent sur le même site.

## 7. Limites honnêtes

- Le template Fabrica est commercial et son source n’est pas inclus dans ce repository.
- Les illustrations temporaires ne sont pas des réalisations Nolan Arc.
- Le portrait réel manque encore.
- Le nombre de vrais case studies documentés reste faible.
- Le QA pixel-perfect devra être effectué sur la version live après push.

## 8. Critère de validation

La V13 doit pouvoir être évaluée sur trois questions :

1. Est-ce qu’un visiteur comprend en quelques secondes qui est Nolan et où cliquer pour voir son travail ?
2. Est-ce que toutes les pages donnent l’impression d’appartenir au même site ?
3. Est-ce que le style sert les projets au lieu de devenir lui-même le sujet principal ?
