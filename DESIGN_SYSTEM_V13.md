# Design system V13 — Nolan Arc × Fabrica grammar

## Couleurs

- Background : `#F3F3F0`
- Card : `#FAFAF8`
- Ink : `#090909`
- Muted : `#6D6D68`
- Nolan accent : orange chaud, usage rare

## Typographie

- Grandes accroches / titres système : Syne
- Textes et UI courante : DM Sans
- Signature `Nolan.Arc` dans le header : Yrsa, afin de préserver l’identité déjà définie

## Géométrie

- grands médias : rayon 22–32 px
- petits éléments : rayon 12–20 px
- pas de diagonales structurelles
- séparateurs fins, souvent 1 px
- cadres larges plutôt que multiplication de cards

## Motion

- reveal vertical très faible
- scale média discret
- transitions de section lentes mais non bloquantes
- preloader court
- composants interactifs uniquement là où ils servent l’exploration
- reduced motion toujours respecté

## Grain

Texture globale fixe, non interactive, faible opacité. Elle unifie les fonds clairs et sombres sans rendre les textes sales.

## Règle de composition

Chaque section doit posséder au minimum deux des trois fonctions suivantes :

- transmettre une information utile ;
- montrer une preuve ou un média ;
- offrir une prochaine action logique.

Si elle ne remplit aucune de ces fonctions, elle doit être supprimée.
