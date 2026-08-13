# COMPONENT IMPLEMENTATION V16

Les composants ci-dessous sont des implémentations indépendantes HTML/CSS/JS inspirées de comportements publics. Le code propriétaire des composants Framer premium n'est pas inclus.

| Composant | V16 | Rôle |
|---|---|---|
| Logo Preloader | Actif Home uniquement | Entrée de marque courte avec fail-safe |
| Custom Cursor | Actif desktop | Carré orange arrondi, transparent sur interaction |
| Page Progress | Actif | Progression horizontale globale |
| Animated Stats Pro | Actif Home | Scroll trigger, count-up, easeOutExpo, stagger, modes Blur/Slide/Fade/Scale |
| Glass Showcase | Actif Home Journey | Verre / WebGL + fallback DOM, piloté par le scroll |
| Video Slide Show | Actif Work | 5 cartes, drag souris/tactile, vélocité, inertie, autoplay, dots |
| Expertise Switcher | Actif Work + Services | Réalisation / DA / Stratégie sans empilement vertical |
| Pricing Switcher | Actif Home | Mariage / DA / Stratégie dans un seul module |
| FAQ dynamique | Home + Services + Contact | Accordéon, une réponse ouverte à la fois |
| Bento Testimonials | Actif Home | Témoignages séparés, sans stacking/collision |
| Gradient Motion Background | Actif localement | Profondeur sur les scènes choisies |
| Line Menu TOC | Actif pages longues si rendu | Rail gauche, ouverture au hover puis fermeture temporisée |
| Ambient Video Player | Actif projet | Halo autour du lecteur externe |
| Hold Confirm | Actif projet | Action volontaire avant chargement YouTube |
| Page View Counter | Code présent, non affiché sans Supabase | Compteur facultatif |

## Performance

Three.js est importé dynamiquement et seulement si le Glass Showcase existe. Le render loop est suspendu hors viewport. Le curseur custom s'endort lorsqu'il atteint sa cible. Les routes ne sont pas toutes préchargées immédiatement : seuls les prochains chemins probables sont warmés au repos.
