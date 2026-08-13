# Component implementation V14

La V14 conserve les moteurs d’interaction développés avant la bascule Fabrica, mais les harmonise avec la DA Nolan Arc.

1. **Page View Counter** — moteur Supabase et SQL présents ; affichage uniquement si Supabase est réellement configuré.
2. **Hold Confirm** — maintien, progression, annulation, tactile et clavier ; utilisé pour l’activation volontaire de la vidéo.
3. **Glassy Button** — CTA et contrôles avec profondeur, shine et états pressed.
4. **Focus Testimonials** — flux de citations ; focus / blur desktop, lecture simple sur mobile, expander.
5. **Glass Showcase** — WebGL/Three.js en progressive enhancement + fallback.
6. **Logo Preloader** — structure Fabrica, typo/couleurs Nolan Arc, percentage et fail-safe.
7. **Ambient Video Player** — halo adapté au projet, sans prétendre lire les pixels de l’iframe YouTube.
8. **Stacked Flow** — profondeur, molette, swipe, clavier et contrôles.
9. **Video Slide Show** — cartes portrait, drag/inertie, dots, autoplay et activation vidéo.
10. **Animated Stats Pro** — IntersectionObserver, count-up, easeOutExpo, blur/slide/fade/scale, replay.
11. **Line Menu TOC** — vertical à gauche sur desktop, compact/repliable ; masqué sur mobile.
12. **Gradient Motion Background** — radial/conic/mesh/linear/diamond, utilisé seulement sur certaines scènes.

## Mobile
Le dock glass fixe reprend quatre destinations prioritaires : Accueil / Work / Services / Contact. Les composants tactiles ne dépendent pas du hover.
