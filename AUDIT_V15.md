# Audit V15 — Nolan Arc

## Direction verrouillée

Fabrica reste la référence de structure : hiérarchie claire, Work prioritaire, grands médias, preuves rapides, CTA placés après une décision et animations de scroll lisibles.

Nolan Arc reste la direction artistique : Yrsa / Syne / DM Sans, noir chaud `#080706`, ivoire `#F0EBE2`, orange `#CC460C`, grain, arrondis, verre ponctuel et profondeur.

## Corrections V15

- bloc Animated Stats de la Home : suppression de l’étirement vertical causé par la grille ; le module suit désormais sa propre hauteur ;
- testimonials : abandon du flux typographique qui pouvait se superposer ; chaque retour possède maintenant une ligne et une zone auteur réservée, tout en conservant le focus interactif ;
- Services : tailles typographiques plafonnées, conteneurs isolés et médias séparés pour empêcher tout chevauchement ;
- FAQ : composition `FAQ.` monumentale à gauche + accordéons arrondis à droite ;
- preloader : rendu uniquement sur la Home lors d’une véritable entrée ; séquence logo courte sans faux pourcentage ;
- navigation : préchargement léger des routes clés, notamment Contact ;
- curseur : carré orange arrondi sur desktop, transparent au passage sur les éléments interactifs ;
- Home : ajout d’un écosystème de production explicitement distinct des clients ;
- Home : ajout d’une offre mariage à partir de 1 500 €, film 30 min, couverture 12 h → 00 h, options au devis ;
- À propos : suppression des stats commerciales dupliquées ; page recentrée sur Nolan, son regard et la relation de travail ;
- animations : reveal plus marqué, média plus vivant, tout en respectant `prefers-reduced-motion`.

## Parcours cible

Home : identité → collaborations → Work → preuve → écosystème → Services → pricing mariage → méthode → retours → FAQ → contact.

Services : besoin → prise en charge → bénéfice → preuve → action.

À propos : personne → tension → regard → méthode → Work / Contact.

Contact : contexte → message → identité → détails facultatifs → FAQ.

## Limites honnêtes

- Les marques Sony, Sigma, Adobe, NiSi, SmallRig et PGYTECH du bloc Home sont un écosystème de production temporaire, pas une liste de clients.
- Le code du Logo Preloader Framer n’est pas copié : l’implémentation reproduit le comportement public entrée → hold → fade-out.
- Le repository attend toujours `public/assets/nolan-portrait.jpg`. Le chemin est câblé, mais le fichier binaire n’était pas présent dans la source V14 utilisée pour cette passe.
- Le dernier contrôle pixel-perfect doit être réalisé sur l’URL live ; Chromium local reste bloqué dans l’environnement de génération.
