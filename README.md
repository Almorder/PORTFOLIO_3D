# Nolan Arc — Portfolio 2026 · V19

Repository source de `nolanarc.com`.

## Direction verrouillée

- **Structure** : grammaire Fabrica — Work prioritaire, grands médias, hiérarchie lisible, rythme de scroll et preuves placées tôt.
- **DA Nolan Arc** : Yrsa / Syne / DM Sans, noir chaud `#080706`, ivoire `#F0EBE2`, orange `#CC460C`, grain, grands rayons, verre ponctuel et profondeur.
- **Règle produit** : une correction locale ne doit plus supprimer une interaction déjà validée ailleurs.

Cette implémentation est indépendante en HTML/CSS/JS. Elle ne contient pas le code propriétaire du template Fabrica ni celui de composants Framer premium non fournis.

## Correctifs V19

- Présentation « Trois dimensions » redesignée sans changer le fond métier.
- Logos normalisés ; Sony réduit optiquement de 50 % ; PGYTECH utilise le PNG local fourni.
- Avis de Lola remplace A One Permis dans le bento V16.
- Passe performance : hero vidéo différé, WebGL lazy, grain statique, blur d'entrée supprimé, mobile allégé.

## Héritage V17 / V18

- Focus Testimonials restauré : survol/focus d’un avis = avis net, autres avis estompés/floutés sur desktop.
- `Comprendre → Choisir → Tenir le fil` restauré comme scène sticky pilotée par le scroll ; le viewport reste sur la scène pendant que média, texte, halo et arc évoluent.
- Contact = composer V15 restauré ; le Quick Contact de la Home reste distinct.
- Work = Video Slide Show d’ambiance distinct de *Le bol d’en face*, avec drag/inertie conservés.
- À propos = page enrichie avec portrait, parcours, tournant, curiosité, méthode de travail et preuve extérieure.
- Home Stats = bloc recentré et mieux intégré dans la largeur de page.

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

1. Décompresse le ZIP V19.
2. **Avant de supprimer l’ancienne version, conserve `public/assets/nolan-portrait.jpg` si ce fichier existe déjà dans ton clone.** Le fichier binaire n’est pas présent dans l’archive générée ici.
3. Dans le dossier local cloné `PORTFOLIO_3D`, supprime l’ancien contenu sans supprimer `.git`.
4. Copie le contenu de V19 directement à la racine.
5. Remets le portrait réel dans `public/assets/nolan-portrait.jpg` si nécessaire.
6. GitHub Desktop → `Commit to main` → `Push origin`.
7. Attends le workflow GitHub Pages vert.

## Fichiers à modifier

- `content/site.mjs` : identité, témoignages, stats, FAQ.
- `content/projects.mjs` : projets et collaborations documentées.
- `content/legal.mjs` : données légales/commerciales.
- `templates/pages.mjs` : structure et copy des pages.
- `templates/components.mjs` : composants réutilisables.
- `src/styles.css` : design system / responsive.
- `src/app.js` : interactions et animations.
- `scripts/check.mjs` : QA prépublication.

## Documentation

- `AUDIT_V17.md`
- `DESIGN_SYSTEM_V17.md`
- `COMPONENT_IMPLEMENTATION_V17.md`
- `ASSET_MANIFEST.md`
- `CONTENT_MANIFEST.md`
- `LEGAL_READINESS.md`
