# Nolan Arc — Portfolio 2026
## V11 · Cohérence, parcours et stabilité

Repository complet de `nolanarc.com`.

La V11 part de la V10 mais corrige les incohérences relevées en usage réel : CTA géant répété dans le footer, scène « Comprendre » trop statique, statistiques pouvant apparaître comme un bloc vide, Line Menu TOC trop ouvert par défaut et menu mobile illisible/mal positionné.

### Changements V11

- suppression du grand CTA générique répété dans le footer de toutes les pages ;
- footer réduit à la navigation, au contact et aux pages légales ;
- scène Home `Comprendre → Choisir → Tenir le fil` remise en mouvement avec déplacement continu, rotation, halo et changement de média pilotés par le scroll ;
- `Animated Stats` rendu lisible même si JavaScript ou IntersectionObserver ne s'exécute pas ;
- regroupement collaborations + statistiques dans un seul cluster de preuve ;
- `Line Menu TOC` replié au repos, ouverture au survol/focus puis fermeture différée ;
- menu mobile corrigé : `Menu` réellement en haut à droite, overlay lisible, fermeture accessible ;
- suppression de la référence aux animés dans la page À propos ;
- ajout de sorties logiques Work → Services/Contact, Journal → projet réel et À propos → Contact ;
- transitions entre sections adoucies : chevauchements arrondis, révélation des médias et continuité visuelle ;
- ajout d'un lien d'évitement accessibilité vers `#main-content`.

L'audit complet est dans `AUDIT_V11.md`. Les composants demandés restent documentés dans `COMPONENT_IMPLEMENTATION_V11.md`.

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

Le build de production est généré dans `dist/`. Ne modifie pas `dist/` manuellement.

## Remplacer le repository actuel

Garde le repository GitHub `Almorder/PORTFOLIO_3D` et son dossier `.git`.

1. Décompresse le ZIP V11.
2. Dans le dossier local cloné `PORTFOLIO_3D`, supprime l'ancien contenu **sans supprimer `.git`**.
3. Copie le contenu du ZIP directement à la racine.
4. Dans GitHub Desktop : `Commit to main` puis `Push origin`.
5. GitHub Pages reste configuré sur `Settings → Pages → Source → GitHub Actions`.

## Fichiers principaux

- `content/site.mjs` : identité et preuves ;
- `content/projects.mjs` : projets ;
- `content/legal.mjs` : données légales ;
- `templates/pages.mjs` : pages et copy ;
- `templates/components.mjs` : composants ;
- `src/styles.css` : UI ;
- `src/app.js` : interactions ;
- `scripts/check.mjs` : QA ;
- `AUDIT_V11.md` : audit parcours / cohérence / manques.

## Manques qui ne doivent pas être inventés

- portrait réel de Nolan : `public/assets/nolan-portrait.jpg` ;
- médias réels supplémentaires pour Ouilove, A One Permis et Moments ;
- davantage de vrais case studies documentés ;
- credentials Supabase si le compteur de vues doit être activé ;
- test live FormSubmit depuis `nolanarc.com`.
