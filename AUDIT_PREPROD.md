# AUDIT PRÉ-PRODUCTION — Nolan Arc

Date : 13 août 2026

## Verdict

Le nouveau repository est **structurellement prêt**, mais **pas encore autorisé à remplacer la production**.

Trois points restent à fermer avant bascule production :

1. choisir et renseigner le médiateur de la consommation pour l'offre B2C `Moments` ;
2. effectuer un test réseau réel du formulaire FormSubmit après activation ;
3. rattacher suffisamment de vrais médias aux collaborations encore partielles pour valider le rendu final.

## UX / mise en page — corrections appliquées

### P0 — Work trop tard dans la Home

Avant audit, la première étude de cas arrivait après le Hero puis une très longue séquence `Intention → Décision → Image`.

Correction : le `Selected Work` a été remonté immédiatement après le premier basculement de scène. Le visiteur voit donc une preuve projet avant le long passage méthodologique.

### P0 — scènes sticky trop longues

Réduction des hauteurs :

- Hero desktop : 205vh → 172vh
- Journey desktop : 360vh → 255vh
- Territories desktop : 300vh → 215vh
- About / Arc : 320vh → 235vh
- Mobile : réduction supplémentaire des scènes principales

Objectif : conserver le scrollytelling sans donner une impression de scroll confisqué.

### P0 — faux sentiment de portfolio rempli

Les projets `partial` ne sont plus présentés comme de grandes fiches Work avec faux médias. La page Work montre d'abord les case studies vérifiés puis une couche séparée de collaborations documentées.

### P1 — navigation mobile

Ajout :

- fermeture avec Escape ;
- confinement du focus ;
- restauration du focus sur le bouton Menu ;
- header conservé sur mobile comme sortie permanente.

### P1 — filtre Work

Les boutons de filtre restants lorsqu'ils sont utilisés exposent `aria-pressed`. Aucune mémoire navigateur n'est utilisée.

### P1 — fatigue visuelle

Le système garde les ruptures de scènes, diagonales et superpositions, mais évite d'appliquer le même degré de spectacle aux zones utilitaires (formulaire, informations légales, preuves).

## Fonctionnalités — état

### Navigation / routes

- Header : câblé
- Menu mobile : câblé + clavier
- Work / Services / À propos / Journal / Contact : routes générées
- Case study `Le bol d'en face` : route générée
- 14 anciennes routes : redirections générées
- 404 : présente
- sitemap.xml : généré
- robots.txt : généré

### Vidéo

- lien direct YouTube : fonctionne comme lien externe
- embed : n'est plus injecté au chargement
- activation : seulement après clic explicite sur « Charger la vidéo YouTube »

### Formulaire

Câblage :

- validation navigateur ;
- chargement ;
- succès ;
- erreur ;
- bouton désactivé pendant l'envoi ;
- honeypot ;
- fallback email ;
- qualification du type de projet via URL / clic local ;
- notice de confidentialité.

À valider en production : première activation FormSubmit et réception réelle.

### Analytics / cookies

- aucun analytics tiers ;
- aucun stockage `localStorage` / `sessionStorage` utilisé pour mémoriser le parcours ;
- aucun iframe YouTube avant choix explicite ;
- aucun bandeau cookies global nécessaire dans cette configuration technique actuelle ;
- page Cookies / contenus externes présente.

## Légal — pages présentes

- Mentions légales : oui
- Politique de confidentialité : oui
- Cookies / contenus externes : oui
- CGV / prestations de services : oui
- Rétractation B2C : oui
- Médiation de la consommation : structure présente, coordonnées réelles manquantes

Voir `LEGAL_READINESS.md`.

## QA automatique

`npm run build` : **OK**

`npm run check` : **BLOQUÉ VOLONTAIREMENT uniquement par les trois coordonnées du médiateur de la consommation** (`name`, `address`, `website`). Les autres données juridiques/commerciales demandées ont été renseignées.

Les contrôles effectués avant le blocage comprennent :

- syntaxe JavaScript ;
- title / description ;
- un seul H1 par page ;
- alt sur les images ;
- IDs dupliqués ;
- liens internes générés.

## Avant remplacement du repo actuel

Ne pas supprimer la version live maintenant.

Ordre recommandé :

1. adhérer à un médiateur de la consommation référencé et compléter ses trois coordonnées dans `content/legal.mjs` ;
2. faire passer `npm run check` ;
3. sauvegarder / taguer l'ancien état Git ;
4. remplacer les fichiers sur une branche de migration ou sur `main` sans changer les DNS immédiatement ;
5. laisser GitHub Pages produire l'URL de test ;
6. tester desktop/mobile + formulaire ;
7. seulement ensuite basculer `nolanarc.com`.

## Complément audit conformité technique — 13 août 2026

- Le QA vérifie désormais l'absence de `localStorage` / `sessionStorage` et de code Google Analytics dans le JavaScript public.
- Le QA vérifie que les cinq pages légales sont reliées depuis les pages de production.
- Le QA vérifie le honeypot et le lien de confidentialité du formulaire.
- Le QA refuse tout iframe YouTube présent dans le HTML initial : le lecteur doit être créé uniquement après action explicite.
- La politique de confidentialité expose désormais explicitement la base juridique du formulaire.
- FormSubmit indique conserver les soumissions pendant 30 jours ; la relation de sous-traitance et les transferts éventuels restent à valider avant publication.

## Correction supplémentaire — navigation / boucle

Le header desktop ne disparaît plus au scroll. Il reste accessible pendant toute l'expérience et devient légèrement plus lisible après 80 px de défilement. Cette décision privilégie les boucles Work / Services / À propos / Contact et évite de transformer les scènes immersives en cul-de-sac.

## Risques UX encore ouverts avant GO production

1. **Diversité média insuffisante (bloquant créatif)** : le même poster de `Le bol d'en face` porte encore plusieurs scènes importantes. Il faut rattacher de vrais médias Ouilove / A One Permis / Moments pour que le portfolio ne paraisse pas fiction-only ou répétitif.
2. **Volume de preuve** : une seule étude de cas est aujourd'hui `verified`. C'est honnête, mais trop léger pour la version définitive destinée à un directeur créatif. Les collaborations partielles doivent être documentées avec de vrais médias avant de devenir des cases studies.
3. **Journal non migré intégralement** : les notes actuelles sont un système éditorial de départ et ne constituent pas encore une migration vérifiée de l'ancien `journal.html`. Ne pas considérer ce contenu comme définitivement validé.
4. **Image distante YouTube** : le poster du court métrage est encore chargé depuis `img.youtube.com`. Pour la performance, la résilience et la maîtrise des requêtes tierces, il devra être copié dans `public/media/` avant la production finale.
5. **Validation visuelle navigateur** : Chromium headless de cet environnement ne parvient pas à ouvrir l'origine locale ; les contrôles DOM/CSS/JS sont réalisés, mais le sign-off visuel 1440px / 390px doit être fait sur une URL GitHub Pages de préproduction avant de basculer le domaine.
