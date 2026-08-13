# Publication immédiate — point juridique restant

Cette variante laisse le site se construire et se déployer sans bloquer sur les coordonnées du médiateur de la consommation. **Cela ne signifie pas que l'obligation légale a disparu.** Si Nolan Arc conclut des prestations avec des consommateurs particuliers, il faut adhérer à un médiateur référencé et ajouter son nom, son adresse et son site dans `content/legal.mjs`, les CGV et les documents commerciaux.

Le reste des informations d'entreprise disponibles a été intégré.

---

# LEGAL READINESS — Nolan Arc

## Statut actuel

Les informations d’identification publiques conservées dans cette version sont : entrepreneur individuel en micro-entreprise, SIREN 987648664, SIRET 98764866400017, APE 7420Z et franchise en base de TVA. À la demande explicite de Nolan, l’adresse et le numéro de téléphone ne sont pas exposés dans le repository public ni dans les pages générées.

Les conditions commerciales communiquées le 13 août 2026 ont également été intégrées :

- acompte de réservation d'au moins **40 %** ;
- aucun escompte pour paiement anticipé ;
- annulation par LRAR au plus tard **2 mois** avant la prestation ;
- report demandé au plus tard **2 semaines** avant la prestation ;
- nouvelle date de report dans les **6 mois** suivant la date initiale, sous réserve de disponibilité ;
- aucune cession de droits par défaut : les droits accordés au client sont définis au devis/contrat.

## Point non intégré : pénalité de 1/14 du prix par jour

La proposition « 1/14 du prix total par jour de retard, plafonnée au prix total de la prestation » n'a volontairement pas été publiée dans les CGV.

Pour les clients professionnels, le site utilise le régime de pénalités de retard prévu par le Code de commerce : pénalités exigibles dès le lendemain de l'échéance au taux BCE de refinancement + 10 points, sans pouvoir être inférieur à trois fois le taux d'intérêt légal, ainsi que l'indemnité forfaitaire légale de 40 € pour frais de recouvrement.

Une clause pénale contractuelle supplémentaire peut être modérée par un juge lorsqu'elle est manifestement excessive. Une pénalité atteignant 100 % du prix en 14 jours est donc à faire valider par un professionnel du droit avant de l'ajouter aux documents B2B/B2C.

## Blocage restant : médiateur de la consommation

La page `Moments` vise des particuliers. Dans ce cas, Nolan Arc doit **adhérer à un médiateur de la consommation référencé** puis communiquer :

- son nom ;
- son adresse ;
- l'adresse de son site internet.

Il ne s'agit pas forcément d'une « page médiateur » distincte. Le site doit surtout afficher ces coordonnées de façon lisible, notamment dans les CGV (et les documents contractuels concernés).

Le médiateur n’est pas renseigné dans cette version. `npm run check` signale les invariants techniques mais ne bloque plus la publication sur ce champ ; cette régularisation reste à traiter séparément avant validation juridique définitive.

## Documents commerciaux existants à synchroniser

Les PDF actuels fournis par Nolan ne sont plus alignés avec les nouvelles règles commerciales :

- le devis affiche encore **30 % d'acompte** ;
- le contrat affiche encore **30 % d'acompte** ;
- le contrat prévoit encore une annulation à moins de **3 mois** et un report avec **7 jours** de préavis.

Avant de les réutiliser avec des clients, les modèles de devis et de contrat doivent donc être mis à jour pour correspondre aux CGV du site.

## Formulaire

Le formulaire est branché sur FormSubmit. Avant bascule :

1. soumettre un vrai test depuis le domaine de préproduction / production ;
2. confirmer l'adresse email lorsque FormSubmit le demande ;
3. vérifier réception, spam, erreur et double envoi ;
4. vérifier les conditions de sous-traitance et les éventuels transferts internationaux de données du prestataire ;
5. conserver ou changer de prestataire selon cette vérification.

## Pages générées

- `/mentions-legales/`
- `/confidentialite/`
- `/cookies/`
- `/cgv/`
- `/retractation/`

## Contrôle avant mise en ligne

```bash
npm run check
```

Le site ne doit être basculé vers `nolanarc.com` que lorsque cette commande termine avec `QA OK` et après un test réel du formulaire. Les points juridiques encore ouverts — notamment médiation B2C et adéquation des mentions légales avec le choix de ne pas publier d’adresse — restent à valider séparément.

## Note

Les pages juridiques du site constituent une base technique et éditoriale cohérente avec les informations fournies. Elles ne remplacent pas une validation par un professionnel du droit, particulièrement pour les clauses d'annulation, de responsabilité, de propriété intellectuelle ou de pénalité contractuelle.
