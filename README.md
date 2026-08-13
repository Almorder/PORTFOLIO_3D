# Nolan Arc — Portfolio 2026 · V16

Repository source de `nolanarc.com`.

## Direction verrouillée

Fabrica reste la référence de **structure et de rythme** : Work prioritaire, grands médias, sections lisibles, preuve avant explication, transitions visibles mais utiles.

Nolan Arc reste la **direction artistique** : Yrsa / Syne / DM Sans, noir chaud `#080706`, ivoire `#F0EBE2`, orange `#CC460C`, grain, grands arrondis, verre ponctuel, profondeur et mouvements liés au scroll.

Les trois dimensions professionnelles sont désormais :

1. Réalisation & vidéo ;
2. Direction artistique ;
3. Stratégie de marque.

## Architecture V16

### Home
Hero → Work sélectionné → chiffres → 3 dimensions → Comprendre / Choisir / Tenir le fil → écosystème de production → pricing → retours → FAQ → quick contact → footer.

### Work
Hero → Video Slide Show à inertie → galerie → switch Réalisation / DA / Stratégie → footer.

### Projet
Film → métadonnées → contexte / intention / décisions → suite. Le Video Slide Show n'est pas répété ici.

### Services
Hero → switch des 3 expertises → combinaison des expertises → FAQ Services → Contact.

### À propos
Nolan + portrait → curiosité → pourquoi les 3 disciplines → manière de travailler → témoignage → Work / Contact.

### Contact
Formulaire immédiat → détails facultatifs → Nolan / prochaine étape → FAQ Contact.

Le Journal reste hors navigation principale et vit dans le footer.

## Stack

- HTML sémantique généré statiquement
- CSS natif
- JavaScript ES modules
- Node.js 24 pour build / QA
- GitHub Pages + GitHub Actions
- Three.js chargé à la demande uniquement pour Glass Showcase
- aucune dépendance npm de production

## Tester

```bash
npm install
npm run dev
```

Avant chaque push :

```bash
npm run check
```

La commande doit terminer par `QA OK`.

## Remplacer le repository actuel

Garder le repository `Almorder/PORTFOLIO_3D` et surtout son dossier caché `.git`.

1. Décompresser le ZIP V16.
2. Dans le dossier local cloné `PORTFOLIO_3D`, supprimer l'ancien contenu sans supprimer `.git`.
3. Copier le contenu de V16 directement à la racine.
4. GitHub Desktop → `Commit to main` → `Push origin`.
5. Attendre le workflow GitHub Pages vert.

## Fichiers principaux

- `content/site.mjs` — identité, stats, témoignages, FAQ, navigation.
- `content/projects.mjs` — projets.
- `content/legal.mjs` — données légales / commerciales.
- `templates/pages.mjs` — structure et copy des pages.
- `templates/components.mjs` — composants réutilisables.
- `src/styles.css` — design system / responsive.
- `src/app.js` — interactions / animations / performance.
- `scripts/check.mjs` — QA V16.

## Portrait

À propos et Contact utilisent :

`public/assets/nolan-portrait.jpg`

Le chemin est câblé. Si le fichier manque après remplacement, remettre le vrai portrait Nolan déjà utilisé dans l'ancien site à cet emplacement.

## Documentation

- `AUDIT_V16.md`
- `DESIGN_SYSTEM_V16.md`
- `COMPONENT_IMPLEMENTATION_V16.md`
- `ASSET_MANIFEST.md`
- `CONTENT_MANIFEST.md`
- `LEGAL_READINESS.md`
