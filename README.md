# Nolan Arc — Portfolio 2026
## V10 · Components + fiabilité

Repository complet de `nolanarc.com`.

La V10 corrige le blocage du preloader et consolide les composants Framer demandés dans une architecture HTML/CSS/JS statique compatible GitHub Pages.

### Changements V10

- preloader avec sortie JS prioritaire + fail-safe CSS ;
- Gradient Motion Background reconstruit avec styles Radial / Conic / Mesh / Linear / Diamond ;
- Animated Stats Pro conservé avec `easeOutExpo`, stagger et bandeau responsive ;
- Line Menu TOC vertical et fixe à gauche sur desktop ;
- Video Slide Show en éventail de 5 cartes portrait, proche de la référence fournie ;
- formulaire Contact transformé en composer glass compact ;
- navigation mobile et barre de progression horizontale conservées.

Le détail des 12 composants est dans `COMPONENT_IMPLEMENTATION_V10.md`.

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

Cette commande reconstruit le site, vérifie les routes, les assets hashés, la syntaxe JS, les liens internes, les H1, les alt, les pages légales, le formulaire et les invariants des composants V10.

Le build de production est généré dans `dist/`. Ne modifie pas `dist/` manuellement.

## Remplacer le repository actuel

Garde le repository GitHub `Almorder/PORTFOLIO_3D` et son dossier `.git`.

1. Décompresse le ZIP V10.
2. Dans ton dossier local cloné `PORTFOLIO_3D`, supprime l'ancien contenu **sans supprimer `.git`**.
3. Copie le contenu du ZIP directement à la racine.
4. Dans GitHub Desktop : `Commit to main` puis `Push origin`.
5. GitHub Pages doit rester configuré sur `Settings → Pages → Source → GitHub Actions`.

## Fichiers principaux

- `content/site.mjs` : identité et preuves ;
- `content/projects.mjs` : projets ;
- `content/legal.mjs` : données légales ;
- `templates/pages.mjs` : pages et copy ;
- `templates/components.mjs` : composants ;
- `src/styles.css` : UI ;
- `src/app.js` : interactions ;
- `scripts/check.mjs` : QA.

## Médias à remplacer progressivement

Les illustrations génériques Home / Services restent temporaires. Le portrait Nolan est attendu sous `public/assets/nolan-portrait.jpg`.
