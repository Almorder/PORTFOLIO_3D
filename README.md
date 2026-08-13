# Nolan Arc — Portfolio 2026
## V13 · Fabrica direction

Repository source de `nolanarc.com`.

La V13 est une refonte visuelle majeure. La référence principale est désormais **Fabrica®**, le template Framer d’Anatolii Dmitrienko : structure monochrome, grande typographie sans-serif, médias arrondis, grain, navigation minimale, preuves rapides, projets très présents et transitions sobres.

> Important : ce repository est une **implémentation indépendante HTML/CSS/JS**. Il ne contient ni le code source ni les assets propriétaires du template Fabrica. Si une reproduction littérale du template source est souhaitée, il faut acquérir la licence du template et fournir les fichiers/remix autorisés.

## Ce que la V13 change

- nouveau hero plein écran inspiré de la grammaire Fabrica : grand wordmark Nolan.Arc, média monochrome, liste de domaines, promesse courte et carte contact ;
- grain global continu sur l’ensemble du site ;
- nouveau preloader noir avec identité Nolan.Arc, pourcentage et barre de progression, avec fail-safe anti-blocage ;
- navigation desktop beaucoup plus calme et compacte ;
- menu mobile clair, pleine largeur, typographie forte ;
- collaborations placées très tôt comme preuve ;
- Work en grande grille éditoriale, projets prioritaires ;
- Services construits comme de grands chapitres numérotés plutôt que comme une succession de petites cartes ;
- À propos pensé comme une page Studio adaptée à une personne : portrait, histoire, preuves, regard et méthode ;
- Contact en split layout très simple, formulaire immédiatement accessible ;
- footer éditorial structuré ;
- les composants interactifs demandés précédemment restent disponibles, mais leur apparence est désormais harmonisée avec le système Fabrica ;
- refonte des contrôles QA pour vérifier cette nouvelle architecture au lieu des anciennes V12.

## Stack

- HTML sémantique généré statiquement
- CSS natif
- JavaScript ES modules
- Node.js 24 pour le build
- GitHub Pages + GitHub Actions
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

Le contrôle doit terminer par `QA OK`.

## Remplacer la version actuellement clonée

Garde le repository GitHub `Almorder/PORTFOLIO_3D` et son dossier caché `.git`.

1. Décompresse le ZIP V13.
2. Dans le dossier local cloné `PORTFOLIO_3D`, supprime l’ancien contenu **sans supprimer `.git`**.
3. Copie tout le contenu de la V13 directement à la racine du repository.
4. GitHub Desktop : `Commit to main` puis `Push origin`.
5. Attends que le workflow GitHub Pages soit vert.
6. Contrôle la Home, Work, Services, À propos, Projet et Contact en desktop + mobile.

## Arborescence utile

- `content/site.mjs` — identité, collaborations, témoignages, FAQ et repères
- `content/projects.mjs` — projets et collaborations
- `content/legal.mjs` — données légales et commerciales
- `templates/pages.mjs` — structure et copy des pages
- `templates/components.mjs` — composants réutilisables
- `src/styles.css` — design system et responsive
- `src/app.js` — interactions et animations
- `scripts/build.mjs` — génération statique
- `scripts/check.mjs` — QA prépublication
- `supabase/page_views.sql` — compteur de vues optionnel
- `ASSET_MANIFEST.md` — état des médias
- `CONTENT_MANIFEST.md` — provenance et statut du contenu
- `AUDIT_V13_FABRICA.md` — décisions de structure et écarts assumés

## Assets encore nécessaires

Ne pas les inventer :

- portrait réel : `public/assets/nolan-portrait.jpg` ;
- médias Ouilove Proposal ;
- médias A One Permis ;
- vrais médias Moments ;
- 2 à 4 case studies supplémentaires à terme.

Les illustrations temporaires servent uniquement à vérifier la composition. Elles ne sont jamais présentées comme des réalisations de Nolan.

## QA visuel

Le build, les routes, la structure, les composants, les liens internes, les pages légales, le chargement différé YouTube et les assets hashés sont automatisés. Chromium headless ne termine pas correctement dans l’environnement de génération ; le dernier contrôle pixel-perfect doit donc être fait sur l’URL GitHub Pages après push.
