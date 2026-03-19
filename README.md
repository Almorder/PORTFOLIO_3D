# Nolan Arc — Cinematic Portfolio (10K WebGL)

Portfolio hybride Awwwards combinant le DOM HTML natif de `nolanarc.com` avec un puissant moteur React Three Fiber (v8) injecté aux endroits clés (WebGL Background & Cursors).

## Stack Technologique
- **Core** : HTML5, CSS3 Natif (Filtres, Animations fluides `cubic-bezier`.
- **Injection WebGL** : React 19, `@react-three/fiber`, `@react-three/drei`.
- **Post-Processing Awwwards** : `@react-three/postprocessing` (Film Grain, Bloom, Vignette).
- **Bundler** : Vite (Multi-Page App Configuré).

---

## 🚀 Guide de Déploiement (GitHub & Vercel)

Votre site est configuré en mode **Multi-Page App (MPA)**. Vite se charge de packager `index.html`, `demarche.html` et `mentions-legales.html` en une seule application ultra-optimisée.

### Étape 1 : Pousser sur GitHub
Liez ce dossier local à un répertoire GitHub en utilisant les commandes suivantes dans votre terminal :

```bash
git init
git add .
git commit -m "Initial commit - 10K Cinematic Portfolio"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/nolanarc-3d.git
git push -u origin main
```

### Étape 2 : Lancer le site en ligne (Je recommande Vercel)
Vercel est la plateforme la plus optimisée pour les applications Vite/React lourdes en WebGL.

1. Rendez-vous sur [Vercel.com](https://vercel.com) et connectez votre compte GitHub.
2. Cliquez sur **Add New Project** et importez `nolanarc-3d`.
3. Vercel détectera automatiquement **Vite**. Laissez les réglages par défaut :
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Cliquez sur **Deploy**.

*Et c'est tout ! Votre portfolio 3D interactif et SEO-optimisé est en ligne (et très rapide).*

---

## Commandes Locales (Pour travailler dessus)

```bash
# Installer (ou réinstaller)
npm install

# Démarrer le serveur live prévisualisation
npm run dev

# Vérifier le build de production strict (Erreurs TS, CSS minifié)
npm run build
```

## SEO & AEO (Artificial Engine Optimization)
Le site embarque désormais un `script type="application/ld+json"` dans le `index.html`. Ces méta-données ciblent directement les IA (ChatGPT, Gemini) et les moteurs de recherches avancés pour prouver votre expertise en tant que « Réalisateur Freelance » identifié officiellement.
