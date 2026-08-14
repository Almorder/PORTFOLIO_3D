# LEGAL READINESS — Nolan Arc V20 harmonisée

Date : 14 août 2026

## Source de vérité commerciale

- Réservation / lancement : devis signé + contrat signé + acompte exact de 40 % encaissé.
- Prestation datée : solde de 60 % au plus tard avant le début de la prestation le jour convenu.
- Mission continue : échéancier du devis ; à défaut, solde avant remise des livrables définitifs.
- Annulation prestation datée : au moins 2 mois avant = acompte remboursé ; moins de 2 mois = acompte conservé, aucun solde supplémentaire réclamé du seul fait de l’annulation.
- Report : une fois, J-14 minimum, nouvelle date dans les 6 mois, sous réserve de disponibilité.
- Force majeure Nolan Arc : possibilité de proposer une mise en relation avec un professionnel indépendant sans obligation de résultat ni obligation de financer un surcoût ; à défaut, remboursement des sommes correspondant aux prestations non exécutées ; pas d’indemnité contractuelle supplémentaire du seul fait de la force majeure, sous réserve du droit impératif.
- Aucune clause +100 % / doublement automatique du prix.
- Livrables finaux : copie de sécurité 6 mois ; RAW / rushes / sources non inclus par défaut.
- Propriété intellectuelle : pas de cession générale automatique ; usages définis au devis/contrat.

## Blocages avant finalisation B2C

1. `content/legal.mjs` : renseigner une adresse professionnelle publiable et un téléphone professionnel publiable puis passer `publicLegalContactsConfirmed` à `true`.
2. Adhérer effectivement à un médiateur de la consommation référencé, puis renseigner `legal.mediator.name`, `address`, `website`.
3. Archiver avec chaque dossier client la version des CGV remise avant signature.
4. Pour un consommateur demandant un démarrage avant 14 jours, recueillir la demande expresse dans le contrat.

## Important

Le build peut être techniquement valide alors que les deux blocs administratifs ci-dessus restent incomplets. Ne pas interpréter un `QA OK` comme une validation juridique externe.
