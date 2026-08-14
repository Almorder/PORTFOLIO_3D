# Nolan Arc — V20 polish ciblé

Cette version applique uniquement les points validés après l'audit V19. Les chantiers nécessitant davantage de contenu (nouvelles études de cas, remplacement complet des visuels temporaires, développement du Journal, preuves supplémentaires) restent volontairement en attente.

## Changements visibles validés
- Hero : ajout de « Une idée. Une direction. Un rendu qui tient jusqu’au bout. »
- Écosystème outils : davantage d'espace de respiration, sans changer son rôle ni son contenu.
- Pricing : « Interventions ciblées dès 200 € » et « Session ciblée — 89 € / h », avec « Accompagnement — sur devis ».
- OG Home : utilisation de l'ellipse Nolan Arc fournie par le propriétaire du site.

## Accessibilité
- Suppression des `tabindex` inutiles sur les avis non interactifs.
- Relations ARIA complètes entre tabs et tabpanels (pricing, Work, Services).
- Roving tabindex clavier pour les tabs d'expertise.
- FAQ : `aria-labelledby`, `role=region`, `aria-hidden` et `inert` cohérents avec l'état ouvert/fermé.
- Information explicite lors de l'activation d'un lecteur YouTube de projet.

## Performance / stabilité
- Le hero YouTube ne déclenche plus aucune requête vidéo avant consentement.
- Après consentement, le lecteur reste monté de manière différée et est déchargé hors écran / onglet masqué comme en V19.
- Nouvelles sections lourdes protégées par `content-visibility:auto` sans modifier le rendu final.
- Les optimisations WebGL différées de V19 sont conservées.
- Aucun changement de design system, de ratio d'image ou d'animation principale n'a été introduit au nom de la performance.

## Légal
- Consentement préalable pour le fond vidéo YouTube.
- Refus aussi accessible que l'acceptation.
- Choix modifiable depuis le footer.
- Pages Confidentialité/Cookies synchronisées avec le comportement réel.
- La mention FormSubmit a été rendue factuelle sans durée tierce non vérifiée.
- **Médiateur B2C : action externe toujours requise.** Il serait illégitime d'inventer ou de publier un médiateur avant adhésion.
