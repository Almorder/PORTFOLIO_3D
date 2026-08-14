# Modifications légales à appliquer au site Nolan Arc V20

Date de référence : 14 août 2026

Le dossier `nolanarc_v20_legal_harmonized` joint à la livraison contient déjà ces modifications appliquées à la base V20.

## Source de vérité à remplacer / mettre à jour

### `content/legal.mjs`
- Acompte fixé à **40 %** (et non « au moins 40 % »).
- Commande validée après **devis signé + contrat signé + acompte encaissé**.
- Prestation datée : solde dû **avant le début de la prestation le jour convenu**.
- Mission continue : échéancier au devis ; à défaut, solde avant livraison définitive.
- Annulation prestation datée :
  - au moins 2 mois avant : acompte remboursé ;
  - moins de 2 mois avant : acompte conservé, solde non réclamé du seul fait de l'annulation.
- Report : une fois, demande au moins 14 jours avant, nouvelle date dans les 6 mois, sous réserve de disponibilité.
- Fin anticipée d'une mission continue : travaux réalisés + phases engagées + frais tiers approuvés restent dus ; acompte imputé ; trop-perçu remboursé.
- Force majeure Nolan Arc : Nolan Arc **s'efforce raisonnablement, sans obligation de résultat**, de rechercher un remplaçant similaire lorsque la substitution est pertinente ; le client reste libre ; le remplaçant contracte directement avec le client sauf accord contraire ; Nolan Arc ne finance pas un éventuel surcoût ; à défaut de remplacement et en cas d'impossibilité définitive, remboursement des sommes correspondant aux prestations non exécutées.
- Archivage de sécurité des livrables finaux : **6 mois**, sans garantie au-delà.
- Maintien de la règle : aucune cession globale de droits par défaut.

### `templates/pages.mjs`
Les CGV visibles doivent refléter les mêmes branches :
- paiement prestation datée / mission continue ;
- retard B2B distinct du B2C, sans doublement automatique du prix ;
- annulation/report uniquement pour la prestation datée ;
- fin anticipée pour mission continue ;
- force majeure et mécanisme de remplacement ;
- archive de sécurité 6 mois ;
- droit à l'image distinct des droits d'auteur.

## Informations encore impossibles à finaliser sans donnée réelle

### Coordonnées professionnelles publiques
À compléter dans `content/legal.mjs` :
- `professionalAddress`
- `professionalPhone`
- `publicLegalContactsConfirmed`

### Médiateur de la consommation
À compléter seulement après adhésion effective à un médiateur référencé :
- nom ;
- adresse ;
- site web.

Ne jamais inventer un médiateur ni publier un organisme auquel Nolan Arc n'a pas adhéré.

## Point important : annulation par Nolan Arc

Le site et les contrats NE donnent PAS à Nolan Arc un droit général d'annuler une prestation confirmée « pour X ou Y raison » sans conséquence.
Le mécanisme de remplacement/remboursement sans indemnité contractuelle supplémentaire est réservé à une **force majeure répondant aux critères légaux**.
Si l'empêchement est imputable à Nolan Arc mais ne constitue pas une force majeure, le droit commun reste applicable.

Cette distinction est volontaire : elle évite qu'une clause B2C soit rédigée comme une faculté discrétionnaire unilatérale.
