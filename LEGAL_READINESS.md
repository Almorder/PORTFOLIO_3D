# LEGAL READINESS — Nolan Arc

Date : 13 août 2026

## Statut de la V6

Le build du portfolio n'est plus bloqué par l'absence de coordonnées du médiateur de la consommation. Cette décision permet la publication immédiate demandée par Nolan ; elle ne supprime pas l'obligation juridique lorsqu'une prestation est conclue avec un consommateur particulier.

## Informations d'entreprise intégrées

À partir de la synthèse Guichet unique fournie :

- entrepreneur individuel ;
- micro-entreprise ;
- SIREN : `987648664` ;
- SIRET : `98764866400017` ;
- APE : `7420Z` ;
- TVA non applicable, art. 293 B du CGI ;
- adresse professionnelle : 1 allée Mirabeau, 77200 Torcy ;
- téléphone : +33 (0)7 82 04 89 25.

## Conditions commerciales intégrées

Les règles communiquées par Nolan ont été intégrées au contenu juridique du site :

- acompte de réservation d'au moins **40 %** ;
- aucun escompte pour paiement anticipé ;
- annulation par lettre recommandée avec accusé de réception au plus tard **2 mois avant** la prestation ;
- report demandé au plus tard **2 semaines avant** la prestation ;
- nouvelle date dans les **6 mois** suivant la date initiale, sous réserve de disponibilité ;
- aucune cession de droits par défaut : le périmètre d'utilisation / cession / licence est défini au devis ou au contrat.

## Pénalités de retard

La formule demandée de `1/14 du prix total par jour`, plafonnée au prix total de la prestation, n'a pas été publiée automatiquement dans les CGV.

Pour les clients professionnels, la base actuelle du site utilise le régime légal B2B de retard de paiement et l'indemnité forfaitaire de recouvrement. Toute clause pénale supplémentaire particulièrement élevée doit être validée avant ajout définitif.

## Médiateur de la consommation — tâche restante

Si Nolan Arc vend des prestations à des particuliers, il faut adhérer réellement à un médiateur de la consommation compétent puis renseigner dans `content/legal.mjs` :

- `mediator.name` ;
- `mediator.address` ;
- `mediator.website`.

La V6 peut techniquement être construite et déployée sans ces trois champs. Les pages juridiques n'inventent aucun médiateur.

## Documents commerciaux à synchroniser

Les modèles PDF fournis précédemment contiennent encore des règles anciennes et ne doivent pas être considérés comme synchronisés avec la V6 tant qu'ils ne sont pas mis à jour, notamment :

- ancien acompte à 30 % ;
- anciennes conditions d'annulation / report.

Le devis et le contrat utilisés avec un client doivent reprendre les mêmes règles que les CGV applicables à la prestation concernée.

## Formulaire

Le formulaire utilise FormSubmit. À faire après déploiement :

1. envoyer une vraie demande depuis le domaine publié ;
2. confirmer l'adresse destinataire si le service le demande ;
3. vérifier réception, spam et affichage de l'état de succès ;
4. vérifier les conditions de traitement de données du prestataire ;
5. remplacer le prestataire plus tard si nécessaire.

## Pages générées

- `/mentions-legales/`
- `/confidentialite/`
- `/cookies/`
- `/cgv/`
- `/retractation/`

## QA

```bash
npm run check
```

La commande doit afficher `QA OK`. Le médiateur manquant reste signalé comme tâche juridique dans la documentation, mais n'est plus un verrou de build.

## Note

Ces pages fournissent une base éditoriale et technique construite à partir des informations communiquées. Elles ne remplacent pas une validation personnalisée par un professionnel du droit pour les clauses à enjeu élevé.
