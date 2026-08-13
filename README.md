# Nolan Arc — Portfolio 2026

Ce dossier est **le nouveau repository complet** de `nolanarc.com`.

Il a été construit pour remplacer l'ancien dépôt `PORTFOLIO_3D` sans conserver son ancienne architecture React/Three/Tailwind/HTML monolithique.

## Ce que contient cette version

- Home avec scrollytelling et level design inspiré de la logique de mise en page de Clyde, adapté à Nolan Arc.
- Work content-driven.
- Case study réel : `Le bol d'en face`.
- Services : Marques / Moments / Récits.
- À propos / démarche / sens de l'Arc.
- Journal.
- Contact fonctionnel via FormSubmit.
- 404.
- Mentions légales.
- Sitemap / robots.
- 14 redirections depuis les anciennes routes.
- Workflow GitHub Pages automatique.
- Aucun framework ou package externe requis au runtime.

---

# 1. Avant de remplacer l'ancien repository

> **Ne bascule pas encore `nolanarc.com` en production tant que le médiateur de la consommation n'est pas renseigné et que `npm run check` ne termine pas avec `QA OK`.**

Tu peux préparer le remplacement manuellement, mais garde d'abord une sauvegarde ZIP de l'ancien dépôt sur ton ordinateur. L'historique GitHub restera normalement disponible si tu remplaces simplement les fichiers, mais une sauvegarde locale est plus rassurante.

Quand le contrôle final est validé, dans ton repository `PORTFOLIO_3D` :

1. Supprime tous les anciens fichiers et dossiers du dépôt.
2. Copie **tout le contenu de ce dossier** à la racine du repository.
3. Vérifie notamment que `.github/workflows/pages.yml` est bien présent.
4. **Ne copie pas le dossier `dist/` s'il est présent localement : GitHub Actions le reconstruit.**
5. Commit / push sur la branche `main`.

Si tu utilises GitHub Desktop, tu peux simplement remplacer le contenu du dossier local du repository puis faire :

- `Commit to main`
- `Push origin`

---

# 2. Tester sur ton ordinateur

Il faut Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvre :

`http://127.0.0.1:4173`

Le site ne possède actuellement **aucune dépendance npm**, donc `npm install` est quasiment instantané.

---

# 3. Vérifier avant publication

```bash
npm run check
```

Cette commande :

1. reconstruit le site ;
2. contrôle la syntaxe JavaScript ;
3. vérifie les pages HTML ;
4. vérifie les IDs dupliqués.

Puis :

```bash
npm run build
```

Le site de production est généré dans :

`dist/`

Ne modifie pas manuellement `dist/`. Il est reconstruit à chaque build.

---

# 4. Activer GitHub Pages avec GitHub Free

Le repository doit rester **public** pour utiliser GitHub Pages avec GitHub Free.

Dans GitHub :

1. Ouvre `Settings`.
2. Ouvre `Pages`.
3. Dans **Build and deployment / Source**, sélectionne **GitHub Actions**.
4. Retourne dans l'onglet `Actions`.
5. Le workflow **Deploy Nolan Arc to GitHub Pages** doit se lancer automatiquement après un push sur `main`.

Le workflow :

- exécute `npm run check` ;
- génère `dist/` ;
- publie le build sur GitHub Pages.

---

# 5. Rattacher nolanarc.com

Dans :

`Settings → Pages → Custom domain`

entre :

`nolanarc.com`

Puis mets à jour les DNS chez ton fournisseur de domaine selon les valeurs indiquées par GitHub Pages.

Important : **configure d'abord le domaine dans GitHub Pages**, puis modifie tes DNS.

Quand GitHub le propose, active :

`Enforce HTTPS`

Le fichier `public/CNAME` est présent comme documentation du domaine, mais avec un workflow GitHub Actions le domaine doit surtout être défini dans les réglages Pages du repository.

---

# 6. Modifier les informations générales

Fichier :

`content/site.mjs`

Tu peux y modifier :

- nom ;
- rôle ;
- email ;
- Instagram ;
- YouTube ;
- Calendly ;
- localisation ;
- clients.

---

# 7. Ajouter ou modifier un projet

Fichier :

`content/projects.mjs`

Chaque projet contient notamment :

- `slug`
- `title`
- `territory`
- `type`
- `role`
- `year`
- `context`
- `status`
- `href`
- `poster`
- `summary`

Le projet `Le bol d'en face` est l'exemple de référence.

Une réalisation ne doit passer en `verified` que lorsque son média, son contexte et ton rôle sont suffisamment sûrs.

---

# 8. Ajouter les vrais médias Ouilove / A One Permis / Moments

Voir :

`ASSET_MANIFEST.md`

Le système est déjà conçu pour recevoir ces médias sans refaire le site.

Ne remplace pas les médias manquants par de fausses réalisations générées par IA.

---

# 9. Modifier la direction visuelle

Fichier principal :

`src/styles.css`

Les variables essentielles sont tout en haut :

- couleurs ;
- typographies ;
- easing ;
- dimensions globales.

Le langage de scroll est géré par :

`src/app.js`

Les principales scènes utilisent une variable CSS `--p` comprise entre `0` et `1`, calculée selon la progression dans la scène. Cela permet de créer les transformations sans dépendance externe.

---

# 10. Formulaire de contact

Le formulaire envoie actuellement les messages vers :

`nolanribcontact@gmail.com`

via FormSubmit.

Le mail est centralisé dans :

`content/site.mjs`

Si FormSubmit demande une activation lors du premier message après migration, suis simplement le lien reçu par email.

Aucune clé API n'est stockée dans le repository.

---

# 11. Analytics / cookies

Cette version ne charge volontairement **aucun analytics par défaut**.

Conséquences :

- pas de Google Analytics chargé avant consentement ;
- pas de bannière cookie décorative ;
- moins de scripts ;
- moins de risque juridique ;
- meilleure performance.

Si un outil analytics est ajouté plus tard, il faudra ajouter une vraie gestion du consentement avant de le charger si nécessaire.

---

# 12. Anciennes URLs

Voir :

`MIGRATION_ROUTES.md`

Les anciennes URLs importantes produisent désormais des pages de redirection afin de ne pas envoyer les visiteurs vers des 404.

---

# 13. Fichiers que tu ne dois plus retrouver

Ils ont volontairement disparu de la nouvelle architecture :

- ancien `dist/` versionné ;
- `netlify.toml` ;
- `vercel.json` ;
- Tailwind ;
- PostCSS ;
- React ;
- React Three Fiber ;
- Three.js ;
- post-processing WebGL ;
- anciennes pages HTML monolithiques ;
- ancien curseur custom ;
- ancienne scène 3D torique ;
- anciens filtres Work surdimensionnés ;
- anciens placeholders `YOUTUBE_ID_ICI` ;
- `@ts-nocheck` ;
- faux impacts business non prouvés.

---

# En cas de problème

### Le build échoue

```bash
npm run check
```

Lis le message affiché : il indique généralement le fichier concerné.

### Le domaine ouvre encore l'ancien site

Le DNS pointe probablement encore vers l'ancien hébergeur. Vérifie `Settings → Pages → Custom domain`, puis les enregistrements DNS de `nolanarc.com`.

### Le formulaire ne fonctionne pas

Écris directement à `nolanribcontact@gmail.com`, puis vérifie que FormSubmit a bien été activé pour cette adresse.

### Une ancienne URL affiche une 404

Ajoute-la dans l'objet `redirects` de :

`scripts/build.mjs`

avec sa nouvelle destination.
