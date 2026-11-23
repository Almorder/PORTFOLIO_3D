# Ajouter et faire vivre le contenu de nolanarc.com

Tout se fait dans l'admin (`/admin/`), puis **Enregistrer et publier**. Le site se reconstruit seul sur Cloudflare Pages (quelques minutes). Rien n'est à copier à deux endroits : l'accueil, la page Work, les pages projet, le plan du site et `llms.txt` lisent les mêmes données.

## Où apparaît quoi

| Dans l'admin | Sur le site |
|---|---|
| Projets (les 5 premiers) | Accueil, « Ma sélection » (bento) |
| Projets (tous les visibles) | Work, catalogue ; page `/projet/<adresse>/` si « Page projet au clic » |
| Vidéos | Accueil, téléphone « Social media videos » ; Work, catalogue |
| Photos, case « Visible dans le catalogue » | Work, catalogue (clic = photo en grand) |
| Photos, case « Dans la tuile Photographie » | Accueil, tuile Photographie du bento |
| Images, « Accueil · Bannière » | Bannière de l'accueil : vidéo ordinateur (16:9) et vidéo mobile (9:16) |
| Images, emplacements `home.wedding.*` | Accueil, polaroïds Mariage (clic = Work filtré sur Mariage) |
| Avis | Accueil (au-dessus de la FAQ), Contact, À propos |
| Tarifs | `content/pricing.mjs` (code) : cartes et « Ce qui est inclus », accueil et Work |

## Ajouter un projet et ses catégories
1. Projets > **+ Ajouter un projet**. Titre obligatoire ; type, rôle, contexte, client, année si tu les as (un champ vide n'apparaît jamais).
2. **Catégories du catalogue** : coche toutes celles qui s'appliquent (Photo, Vidéo, Réseaux sociaux, Mariage, Direction artistique). Une demande en mariage va dans **Mariage**.
3. Ajoute les médias (photos, lien YouTube, lien Instagram avec son image, fichier vidéo). Le premier est la couverture ; glisse pour réordonner. Le nombre de médias affiché sur le site est compté automatiquement.
4. **Page projet au clic** pour une vraie fiche ; sinon un lien externe facultatif.
5. Coche **Visible sur le site**, puis publie.

Un contenu publié avant les catégories reçoit un classement proposé (type de média, ancienne catégorie, texte). Il est déjà coché dans l'admin : vérifie-le et enregistre.

## Bannière de l'accueil (vidéo)
Images > **Accueil · Bannière**. Deux emplacements : **Bannière ordinateur (16:9)** et **Bannière mobile (9:16)**. L'affiche (image montrée avant la lecture, et à la place de la vidéo pour qui préfère moins d'animations) est tirée de la vidéo ; « Remplacer l'affiche » pour en choisir une autre.
- Ordinateur : MP4 H.264, 1920 x 1080 (ou 2560 x 1440), 25 ou 30 i/s, 12 à 20 Mbit/s, sans piste son, 10 à 20 s pensées pour boucler, 50 Mo maximum.
- Mobile : MP4 H.264, 1080 x 1920, 25 ou 30 i/s, 10 à 16 Mbit/s, sans piste son, 10 à 20 s, 50 Mo maximum.
- Export conseillé (Premiere / Media Encoder) : H.264, profil High, débit variable 2 passes, audio désactivé.
- Le fichier est servi tel quel (aucun réencodage) : la qualité en ligne est celle de l'export. Sans fichier, la bannière garde la vidéo YouTube d'origine.

## Mettre en avant
Case **Mis en avant** dans Projets, Vidéos et Photos : l'élément passe en tête du catalogue Work et de « Ma sélection » (accueil), puis l'ordre manuel s'applique.

## Ajouter une vidéo courte
Vidéos > ajouter. Source Instagram (colle le lien de la publication) ou fichier (MP4, MOV, WebM, 50 Mo maximum, exporte en H.264, 1080 x 1920, environ 8 à 12 Mbit/s). Coche ses catégories. Une vidéo Instagram n'est chargée qu'au clic du visiteur ; son lien Instagram reste affiché.

## Ajouter une photo
Photos > envoyer (JPEG, PNG ou WebP ; l'admin réduit, convertit et retire la position GPS). Texte alternatif obligatoire, écrit en français : ce que montre la photo, en une phrase. Série, lieu, année, catégories.

## Lien Instagram
Projet : média « Vidéo Instagram ». Vidéo courte : source Instagram. Le lien de la publication d'origine est affiché à côté de la vidéo.

## Étude de cas
Dans la fiche du projet, ouvre « Textes de la page projet et données Google » : texte de contexte, intention, décisions (titre + texte). La page projet les affiche dans l'ordre : média, fiche, galerie, intention, suite. Ne mets que des faits réels (résultat vérifié, client communicable).

## Métadonnées (Google)
- Titre et description d'une page projet : tirés du titre, du type, de l'année et du résumé (écris un résumé de 100 à 160 caractères).
- Vidéo : date de mise en ligne (AAAA-MM-JJ) et durée (ex. PT1M30S) pour que Google la décrive.
- Plan du site (`sitemap.xml`) : chaque page projet y entre seule.

## llms.txt
Généré à chaque publication (`templates/seo.mjs`) : identité, pages, tarifs, projets visibles avec leur vraie adresse, catégories du catalogue. Rien à faire à la main. Il ne garantit aucune visibilité dans les assistants IA.

## Vérifier avant de publier
1. Aperçu : texte alternatif présent, catégories cochées, titre sans faute (ex. « Alumni »).
2. Après publication : ouvre `/work/?categorie=<catégorie>` (plusieurs catégories : `?categorie=mariage,video`) et la page du projet, sur téléphone aussi.
3. Côté code : `npm run check` doit finir par `QA OK` (titres, descriptions, liens, ancres, redirections, `llms.txt`, tarifs identiques accueil et Work).
