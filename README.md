# Nolan Arc — Portfolio 2026 · V15

Repository source de `nolanarc.com`.

## Direction

La structure reprend la grammaire publique de Fabrica : clarté, Work prioritaire, grands médias, preuve tôt et animations de scroll. La direction artistique reste Nolan Arc : Yrsa, Syne, DM Sans, noir chaud, ivoire, orange, grain, arrondis et verre ponctuel.

Cette implémentation est indépendante en HTML/CSS/JS. Elle ne contient pas le code propriétaire du template Fabrica ni celui de composants Framer premium non fournis.

## Stack

- HTML sémantique statique
- CSS natif
- JavaScript ES modules
- Node.js 24 pour build/QA
- GitHub Pages + GitHub Actions
- Three.js chargé à la demande uniquement pour Glass Showcase
- aucune dépendance npm de production

## Tester

```bash
npm install
npm run dev
```

Puis `http://127.0.0.1:4173`.

Avant chaque push :

```bash
npm run check
```

Le contrôle doit terminer par `QA OK`.

## Remplacer le repository actuel

Garde le repository `Almorder/PORTFOLIO_3D` et surtout son dossier caché `.git`.

1. Décompresse le ZIP V15.
2. Dans le dossier local cloné `PORTFOLIO_3D`, supprime l’ancien contenu sans supprimer `.git`.
3. Copie le contenu de V15 directement à la racine.
4. GitHub Desktop → `Commit to main` → `Push origin`.
5. Attends le workflow GitHub Pages vert.

## Fichiers à modifier

- `content/site.mjs` : identité, clients documentés, témoignages, stats, FAQ.
- `content/projects.mjs` : projets/collaborations.
- `content/legal.mjs` : données légales/commerciales.
- `templates/pages.mjs` : structure et copy des pages.
- `templates/components.mjs` : composants réutilisables.
- `src/styles.css` : design system / responsive.
- `src/app.js` : interactions et animations.
- `scripts/check.mjs` : QA prépublication.

## Média portrait

La page À propos utilise :

`public/assets/nolan-portrait.jpg`

Le chemin est prêt. Si le fichier n’est pas présent dans le dossier local après remplacement, il faut y remettre le portrait réel déjà utilisé auparavant ; ne pas le remplacer par une personne fictive.

## Documentation

- `AUDIT_V15.md`
- `DESIGN_SYSTEM_V15.md`
- `COMPONENT_IMPLEMENTATION_V15.md`
- `ASSET_MANIFEST.md`
- `CONTENT_MANIFEST.md`
- `LEGAL_READINESS.md`
