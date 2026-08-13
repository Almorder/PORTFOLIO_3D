# Nolan Arc — Portfolio 2026 · V6

Ce dossier est le repository complet destiné à remplacer le contenu actuel de `PORTFOLIO_3D`.

## V6 — changements principaux

- *Le bol d’en face* utilise sa vraie miniature lorsqu’il est présenté comme projet.
- Home : espaces desktop resserrés et trois voies visibles simultanément sous forme de cartes verticales arrondies.
- Work : le projet principal arrive plus vite ; les collaborations partielles restent séparées des études de cas documentées.
- Services : une seule page, reconstruite autour du besoin, du bénéfice client et de preuves concrètes.
- À propos : hook personnel, tension, parcours, bénéfices client, preuve et emplacement pour un vrai portrait de Nolan.
- Journal : notes pratiques plutôt que textes décoratifs.
- Motion : barre de progression horizontale, révélations au scroll, transitions de pages progressives et mouvements de médias ; `prefers-reduced-motion` est respecté.
- Responsive : composants et métadonnées projet reconfigurés pour mobile.

## Portrait de Nolan

La page `/a-propos/` attend une vraie photo à cet emplacement :

`public/assets/nolan-portrait.jpg`

Aucune photo stock n’est utilisée pour prétendre représenter Nolan. Tant que le fichier manque, un fallback graphique s’affiche.

## Remplacer le contenu du repository

1. Garde une sauvegarde ZIP de l’ancien dépôt.
2. Dans le dossier local cloné `PORTFOLIO_3D`, supprime tous les anciens fichiers **sans supprimer le dossier caché `.git`**.
3. Copie tout le contenu de ce repository V6 à la racine de `PORTFOLIO_3D`.
4. Ne copie pas `dist/` s’il existe localement : GitHub Actions le reconstruit.
5. Dans GitHub Desktop : `Commit to main`, puis `Push origin`.

## Tester localement

Node.js 24 ou plus récent :

```bash
npm install
npm run check
npm run dev
```

Le serveur de développement indique l’URL locale à ouvrir.

## Déploiement GitHub Pages

Le workflow `.github/workflows/pages.yml` :

1. utilise Node 24 ;
2. exécute `npm run check` ;
3. construit `dist/` ;
4. publie l’artefact avec GitHub Pages.

Dans GitHub : `Settings → Pages → Source → GitHub Actions`.

## Domaine

Le domaine attendu est `nolanarc.com`. Le domaine personnalisé se configure dans `Settings → Pages → Custom domain`.

## Contenu

- `content/projects.mjs` : projets et collaborations ;
- `content/site.mjs` : identité, liens, clients ;
- `content/journal.mjs` : notes ;
- `content/legal.mjs` : données juridiques et commerciales ;
- `templates/pages.mjs` : pages ;
- `src/styles.css` : direction visuelle et responsive ;
- `src/app.js` : interactions, formulaire, scroll et vidéo.

## Médias

Voir `ASSET_MANIFEST.md`. Les images d’illustration temporaires servent à juger le site et ne doivent jamais être présentées comme des réalisations Nolan Arc.

## Légal

Les pages suivantes sont générées :

- `/mentions-legales/`
- `/confidentialite/`
- `/cgv/`
- `/cookies/`
- `/retractation/`

Le médiateur de la consommation n’est pas inventé. Son absence ne bloque plus techniquement le build, mais doit être régularisée si des prestations B2C sont commercialisées.
