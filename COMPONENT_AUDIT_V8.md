# Nolan Arc — Audit des composants Framer · V8

Objectif : intégrer les **comportements utiles** des composants sélectionnés sans transformer le portfolio en démonstration de widgets.

Le site final reste un repository statique GitHub Pages, pas un projet Framer. Les composants Marketplace gratuits sont distribués avec une licence limitée et les composants payants avec une licence Single-Use. Leur code propriétaire n'est donc pas copié dans ce repository. La V8 reconstruit les interactions à partir de leurs comportements publics et les adapte au design Nolan Arc.

## 1. Page View Counter
Source : https://www.framer.com/community/marketplace/components/page-view-counter/

### Audit
Le composant original utilise Supabase, détecte la page, crée son enregistrement puis incrémente le compteur. Sur un portfolio, un compteur peut être pertinent sur un article ou un film déjà consulté, mais afficher « 3 vues » ou « 17 vues » sur un projet créatif peut au contraire diminuer la preuve sociale.

### Décision
**Intégré techniquement mais désactivé par défaut.**

- le compteur n'apparaît que sur les pages projet ;
- il reste `hidden` tant que `SUPABASE_URL` et `SUPABASE_ANON_KEY` ne sont pas définis ;
- aucune dépendance Supabase n'est chargée : l'intégration utilise l'API REST ;
- l'activation impose une nouvelle revue de la politique de confidentialité / cookies.

Emplacement : sous le lecteur du projet, dans la ligne de métadonnées.

## 2. Hold Confirm
Source demandée : https://www.framer.com/community/marketplace/components/hold-confirm/

La page demandée n'était pas récupérable lors de l'audit. Le comportement a été recoupé avec les composants Framer « Hold to Trigger Link » / « Press and Hold Link » : maintien, progression visuelle, déclenchement uniquement après complétion.

### Décision
**Intégré uniquement sur “Lire le film”.**

Il ne doit jamais être utilisé sur :
- Contact ;
- navigation ;
- formulaire ;
- CTA commercial principal.

Cela ajouterait de la friction sans bénéfice. Sur YouTube, le maintien court de 650 ms matérialise au contraire une action volontaire avant de charger un service tiers.

## 3. Glassy Button
Source : https://www.framer.com/community/marketplace/components/glassy-button/

### Décision
**Intégré globalement.**

Les boutons Nolan Arc utilisent désormais :
- fond givré ;
- bord lumineux très fin ;
- reflet qui traverse au hover ;
- état pressé ;
- profondeur cohérente avec le dock mobile.

L'effet reste discret : le bouton ne doit pas devenir l'élément principal du site.

## 4. Focus Testimonials
Source : https://www.framer.com/community/marketplace/components/focus-testimonials/

### Décision
**Intégré sur la Home.**

Les témoignages ne sont plus trois cartes concurrentes. Ils se lisent dans un flux typographique continu. Sur desktop :
- hover/focus sur une phrase ;
- les autres se floutent et s'atténuent ;
- l'auteur apparaît sans déplacer la mise en page.

Sur mobile, aucune interaction hover n'est requise : les citations et auteurs restent directement lisibles.

Seuls des extraits déjà documentés sont utilisés. Aucun témoignage n'est inventé.

## 5. Glass Showcase Pro
Source : https://www.framer.com/community/marketplace/components/glass-showcase-pro/

### Audit
Le composant Marketplace payant combine Three.js/WebGL, verre physique, transitions de particules et images pilotées par le scroll. Copier son implémentation nécessiterait l'achat/licence du composant.

### Décision
**Réinterprétation active dans la scène “Comprendre → Choisir → Tenir le fil”.**

La V8 conserve les idées utiles :
- objet central en verre ;
- profondeur / perspective ;
- image qui change selon la progression ;
- bref éclatement de particules lors du changement ;
- fallback sans mouvement avec `prefers-reduced-motion`.

La réalisation est originale : CSS + Canvas 2D léger, sans Three.js, sans source Marketplace.

## 6. Logo Preloader
Source : https://www.framer.com/community/marketplace/components/logo-preloader/

### Décision
**Intégré uniquement lors d'une vraie entrée externe sur la Home.**

Il est volontairement court (~0,9 s). Il est ignoré :
- lors d'une navigation interne ;
- lors d'un retour navigateur ;
- avec `prefers-reduced-motion`.

Donc le branding gagne un moment d'entrée sans ralentir chaque page.

## 7. Ambient Video Player
Source : https://www.framer.com/community/marketplace/components/ambient-video-player/

### Audit
Le composant original analyse la couleur dominante de la frame vidéo et adapte le halo. Un iframe YouTube est cross-origin : le site ne peut pas lire proprement ses pixels.

### Décision
**Intégré sur Le bol d'en face avec adaptation honnête.**

- halo basé sur la palette chaude du poster ;
- halo plus vivant après activation du film ;
- aucun faux échantillonnage de couleur annoncé ;
- pas d'iframe avant action utilisateur.

Si le film est un jour auto-hébergé avec `<video>`, l'analyse réelle des frames pourra être ajoutée.

## 8. Stacked Flow
Source : https://www.framer.com/community/marketplace/components/stacked-flow/

### Décision
**Intégré sur Work → Autres collaborations.**

Les collaborations partielles sont affichées en couches plutôt qu'en liste administrative :
- profondeur ;
- décalage ;
- carte active ramenée au premier plan ;
- adaptation mobile : cartes pleine largeur empilées verticalement, sans interaction fragile.

La Home conserve ses trois cartes visibles simultanément : Stacked Flow n'est pas utilisé à cet endroit car cela contredirait le besoin UX déjà validé.

## 9. Video Slide Show
Source : https://www.framer.com/community/marketplace/components/video-slide-show/

### Décision
**Non affiché dans la V8 faute de matière vidéo réelle.**

Le portfolio ne possède actuellement qu'un film réellement documenté. Dupliquer ce film trois fois ou insérer trois stock videos donnerait une fausse impression de volume. Le composant sera pertinent dès que 2 à 4 vrais reels / films courts seront rattachés au repo.

Emplacement prévu : Work, après le premier case study et avant les collaborations.

## 10. Animated Stats Pro
Source : https://www.framer.com/community/marketplace/components/animated-stats-pro/

### Décision
**Intégré après la bande de collaborations de la Home.**

Uniquement avec des données défendables :
- 4 collaborations documentées ;
- ≤ 48 h pour une première réponse ;
- 1 interlocuteur du brief au rendu.

Aucun chiffre de ROI, nombre de clients, vues ou résultats business n'est inventé.

## 11. Line Menu — TOC
Source : https://www.framer.com/community/marketplace/components/line-menu-toc/

### Décision
**Intégré sur les pages longues seulement.**

Pages :
- Projet ;
- Services ;
- À propos.

Le composant est horizontal et centré sous le header : il ne recrée pas l'ancien rail vertical que Nolan ne voulait plus. Les lignes s'étendent et révèlent les libellés ; la section active est suivie via IntersectionObserver. Sur mobile les libellés sont directement visibles.

## 12. Gradient Motion BG
Source : https://www.framer.com/community/marketplace/components/gradient-motion-bg/

### Décision
**Intégré localement, jamais comme papier peint global.**

Présent sur :
- CTA final Home ;
- Hero Services ;
- Hero À propos ;
- Hero Contact.

Les couleurs restent Nolan Arc : brun/noir, ivoire, orange. Animation lente, faible opacité, grain visuel fourni par la matière générale du site. Désactivable avec `prefers-reduced-motion`.

---

# Résultat du tri

## Actifs en V8
1. Glassy Button
2. Focus Testimonials
3. Glass Showcase
4. Logo Preloader
5. Ambient Video Player
6. Stacked Flow
7. Animated Stats
8. Line Menu TOC
9. Gradient Motion BG
10. Hold Confirm (usage limité)

## Intégré techniquement, off par défaut
11. Page View Counter

## Différé faute de contenu réel
12. Video Slide Show

Cette répartition est volontaire : mettre 12 effets visibles simultanément aurait baissé la lisibilité, la vitesse et le niveau perçu du portfolio au lieu de l'améliorer.
