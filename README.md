# Nolan Arc — Portfolio 2026
## V8 · système d’interactions premium, sans surcharge

Ce dossier est le repository complet de `nolanarc.com`.

La V8 conserve la hiérarchie et le copywriting de la V7, puis ajoute une couche d’interactions inspirée des composants Framer sélectionnés : verre, profondeur, préloader, témoignages focalisés, TOC, statistiques animées, lecteur vidéo ambiant et cartes empilées. Les effets sont placés en fonction du parcours utilisateur, pas ajoutés partout.


## Composants V8

L’audit complet des 12 composants demandés est dans `COMPONENT_AUDIT_V8.md`.

Actifs : Glassy Button, Focus Testimonials, Glass Showcase, Logo Preloader, Ambient Video Player, Stacked Flow, Animated Stats, Line Menu TOC, Gradient Motion BG et Hold Confirm sur le lecteur externe.

Le Page View Counter est câblé mais désactivé tant que Supabase n’est pas configuré. Video Slide Show est volontairement différé jusqu’à l’ajout de plusieurs vrais médias vidéo.

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
- la présence et le câblage des composants V8 principaux.

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
