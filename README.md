# Nolan Arc — Portfolio 2026
## V14 · Fabrica structure × Nolan Arc DA

Repository source de `nolanarc.com`.

La V14 garde **Fabrica comme référence de structure** : hiérarchie forte, Work prioritaire, grands médias, espaces maîtrisés, navigation simple et pages clairement différenciées. Elle restaure en revanche **l’identité Nolan Arc** : noir chaud, ivoire, orange, grain, Yrsa / Syne / DM Sans, surfaces arrondies, profondeur glass et composants interactifs déjà validés dans les versions précédentes.

> Le code reste une implémentation indépendante HTML/CSS/JS. Aucun code propriétaire du template Fabrica ou de composants premium Framer n’est présenté comme ayant été copié.

## Direction V14

- **Structure** : Fabrica.
- **Palette** : `#080706`, `#F0EBE2`, `#CC460C`, `#E97736`.
- **Titres / signature** : Yrsa.
- **Navigation / labels / UI** : Syne.
- **Lecture / formulaires** : DM Sans.
- **Matière** : grain continu, arrondis, verre ponctuel, profondeur douce.
- **Mobile** : header compact + menu à droite + dock glass Accueil / Work / Services / Contact.
- **Contact** : retour au composer compact de la V11.

## Composants conservés

- Logo Preloader avec fail-safe.
- Glassy Button.
- Animated Stats Pro engine.
- Focus Testimonials en flux interactif.
- Glass Showcase / WebGL progressive enhancement.
- Ambient Video Player.
- Hold Confirm.
- Stacked Flow.
- Video Slide Show avec inertie.
- Line Menu TOC vertical à gauche sur desktop.
- Gradient Motion Background localisé.
- Page View Counter prêt pour Supabase, masqué sans configuration.

## Stack

- HTML sémantique généré statiquement
- CSS natif
- JavaScript ES modules
- Node.js 24 pour le build GitHub Actions
- GitHub Pages
- Three.js chargé à la demande pour Glass Showcase
- aucune dépendance npm de production

## Installation locale

```bash
npm install
npm run dev
```

Serveur local : `http://127.0.0.1:4173`

## Contrôle avant chaque push

```bash
npm run check
```

Le contrôle doit finir par `QA OK`.

## Remplacer la version actuelle

1. Décompresse le ZIP V14.
2. Dans ton dossier local cloné `PORTFOLIO_3D`, garde uniquement le dossier caché `.git`.
3. Supprime le reste de l’ancienne version.
4. Copie tout le contenu V14 directement à la racine de `PORTFOLIO_3D`.
5. GitHub Desktop → `Commit to main` → `Push origin`.
6. Attends le workflow GitHub Pages vert.
7. Contrôle Home, Work, Services, À propos, Projet et Contact en desktop + mobile.

## Fichiers importants

- `content/site.mjs` — identité, collaborations, témoignages, FAQ et repères.
- `content/projects.mjs` — projets et collaborations.
- `content/legal.mjs` — informations légales et commerciales.
- `templates/pages.mjs` — architecture et textes.
- `templates/components.mjs` — composants réutilisables.
- `src/styles.css` — design system + responsive.
- `src/app.js` — interactions.
- `scripts/check.mjs` — QA prépublication.
- `DESIGN_SYSTEM_V14.md` — règles de DA.
- `AUDIT_V14_HYBRID.md` — décisions de la V14.

## Médias encore nécessaires

- `public/assets/nolan-portrait.jpg`
- médias Ouilove Proposal
- médias A One Permis
- vrais médias Moments
- nouveaux case studies lorsqu’ils sont suffisamment documentés

Aucun média temporaire ne doit être présenté comme une réalisation réelle de Nolan Arc.
