# DESIGN SYSTEM V17 — Fabrica structure × Nolan Arc DA

## Typographies

- **Yrsa** : wordmark, grands titres, phrases de voix éditoriale.
- **Syne** : navigation, labels, chiffres, contrôles et UI.
- **DM Sans** : corps, formulaires et lecture fonctionnelle.

## Couleurs

- Ink : `#080706`
- Ivory : `#F0EBE2`
- Ember : `#CC460C`
- Ember soft : `#E97736`

## Formes

- grands rayons ;
- surfaces glass ponctuelles ;
- pas de diagonales agressives ;
- profondeur par transparence, blur et échelle légère ;
- grain global discret.

## Motion

La motion doit aider à comprendre une relation, à maintenir l’attention ou à signaler une interaction.

- preloader Home uniquement ;
- barre de progression fine en haut ;
- reveals transform / opacity / blur ;
- **Journey sticky** : Comprendre / Choisir / Tenir le fil ;
- **Focus Testimonials** : un avis se met au point, les autres reculent ;
- Video Slide Show à inertie sur Work ;
- stats scroll-triggered ;
- logos monochrome → orange au hover ;
- transitions de panneaux Pricing / Expertise ;
- reduced motion = contenu immédiatement lisible.

## Journey V17

La scène n’est pas une succession verticale de trois blocs. Elle garde un viewport sticky pendant que :

1. le texte actif change ;
2. l’objet média se déplace ;
3. le halo évolue ;
4. l’arc tourne/progresse ;
5. le média du Glass Showcase change.

L’utilisateur continue à scroller, mais la page ne quitte la scène qu’après les trois étapes.

## Testimonials V17

Desktop :
- avis disposés dans un même flux ;
- hover/focus d’un avis = net et légèrement avancé ;
- autres avis = opacité réduite + blur léger ;
- auteur visible dans l’élément sélectionné.

Mobile :
- pas de blur au toucher ;
- avis lisibles les uns après les autres.

## Mobile

- Nolan.Arc en haut à gauche, Menu en haut à droite ;
- dock glass en bas ;
- TOC latéral masqué ;
- Journey adapté à un seul viewport avec objet plus compact et copy en bas ;
- composants tactiles sans hover obligatoire ;
- formulaires et FAQ dimensionnés pour le pouce ;
- aucune animation ne bloque un clic.
