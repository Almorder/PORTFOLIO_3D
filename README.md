# Nolan Arc — Portfolio 2026
## V9 · 12 composants réellement implémentés

Ce dossier est le repository complet de `nolanarc.com`.

La V9 ferme le point laissé incomplet en V8 : les 12 comportements demandés ont maintenant une implémentation réelle dans le repository. Les composants premium sont reconstruits indépendamment à partir de leur comportement public ; aucun code source propriétaire Framer n’est présenté comme ayant été copié.


## Composants V9

Le détail exact est dans `COMPONENT_IMPLEMENTATION_V9.md`.

Implémentés : Page View Counter, Hold Confirm, Glassy Button, Focus Testimonials, Glass Showcase, Logo Preloader, Ambient Video Player, Stacked Flow, Video Slide Show, Animated Stats, Line Menu TOC et Gradient Motion BG.

Deux limites externes restent explicites :

- **Page View Counter** : nécessite `SUPABASE_URL` et `SUPABASE_ANON_KEY` pour compter de vraies vues. Le SQL est fourni dans `supabase/page_views.sql`.
- **Ambient Video Player** : avec un iframe YouTube cross-origin, le site ne peut pas lire chaque frame. Le halo est donc piloté par la palette du projet plutôt que par un faux sampling.

### Principes de cette version

- le Work arrive très tôt et reste la preuve principale ;
- la Home suit une logique proche des meilleurs sites produit/créatifs : promesse → preuve → travail → méthode → besoins → preuve sociale → personne → contact ;
- aucun espace important n'est créé par une ligne de grille vide ;
- les trois entrées Marques / Récits / Moments sont visibles ensemble sur desktop, dans des cartes verticales ;
- les pages projet donnent la priorité au film puis au contexte et aux décisions ;
- les Services sont formulés en `besoin → prise en charge → bénéfice` ;
- l'À propos raconte une tension réelle plutôt qu'une liste de principes ;
- la navigation principale est volontairement courte : Work / Services / À propos / Contact ;
- le Journal reste disponible dans le footer mais ne concurrence plus le Work dans la navigation principale ;
- la barre de progression horizontale reste fixe en haut ;
- les composants privilégient les rayons arrondis, la transparence et la profondeur plutôt que les diagonales ;
- le mobile conserve le dock vitré Accueil / Work / Services / Contact.

## Ce qui est vérifié

- `Le bol d'en face` : projet réel, vidéo YouTube, contexte 1minute2court, rôle, année, lieu, format et caméra ;
- Ouilove Proposal, A One Permis, Carat Créations Paris et Reka Security : collaborations identifiées ;
- formulaire Contact via FormSubmit ;
- pages légales, sitemap, robots, 404 et redirections historiques ;
- workflow GitHub Pages ;
- contrôle automatique par `npm run check`.

## Médias encore temporaires

Les images génériques de Home / Services sont des illustrations Unsplash temporaires. Elles sont listées dans `ASSET_MANIFEST.md` et ne sont pas présentées comme des réalisations Nolan Arc.

Priorité de remplacement :

1. vrais médias Ouilove Proposal ;
2. vrais médias A One Permis ;
3. vrais films/stills Moments ;
4. vrai portrait de Nolan pour `/a-propos/` sous `public/assets/nolan-portrait.jpg`.

## Installation

```bash
npm install
npm run dev
```

Serveur local : `http://127.0.0.1:4173`

## Contrôle avant push

```bash
npm run check
```

La commande reconstruit le site et contrôle notamment :

- les routes ;
- les titres / descriptions ;
- les H1 ;
- les liens internes ;
- les `alt` images ;
- les IDs dupliqués ;
- les assets CSS/JS hashés ;
- l'absence de stockage navigateur / analytics réintroduits ;
- les pages légales ;
- le formulaire ;
- l'absence d'iframe YouTube avant action explicite ;
- la barre de progression horizontale ;
- l'absence de l'ancien rail vertical ;
- la structure Home / Services / À propos / case study ;
- la présence et le câblage des **12 composants V9**, y compris Video Slide Show, WebGL Glass Showcase et Page View Counter.

Le build de production est généré dans `dist/`. Ne modifie pas `dist/` manuellement.

## Remplacer le repository actuel

Garde le repository GitHub `Almorder/PORTFOLIO_3D` et son dossier `.git`.

Avec GitHub Desktop :

1. ouvre le dossier local cloné `PORTFOLIO_3D` ;
2. supprime son ancien contenu **sans supprimer `.git`** ;
3. copie le contenu décompressé de ce repository directement à la racine ;
4. vérifie `.github/workflows/pages.yml` ;
5. `Commit to main` ;
6. `Push origin`.

Avec GitHub Free, le repository doit rester public pour GitHub Pages.

Dans GitHub : `Settings → Pages → Source → GitHub Actions`.

## Domaine

Dans `Settings → Pages → Custom domain`, configure `nolanarc.com`, puis les DNS, puis active `Enforce HTTPS` lorsque GitHub le propose.

## Contenu

- identité générale : `content/site.mjs`
- projets : `content/projects.mjs`
- notes : `content/journal.mjs`
- données légales : `content/legal.mjs`
- pages / copy : `templates/pages.mjs`
- composants communs : `templates/components.mjs`
- design : `src/styles.css`
- interactions : `src/app.js`

## Juridique

La publication n'est plus techniquement bloquée par le champ médiateur. L'adhésion et l'affichage d'un médiateur de la consommation restent toutefois à régulariser si l'activité est proposée à des consommateurs. Voir `LEGAL_READINESS.md`.
