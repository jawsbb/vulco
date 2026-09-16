# Vulco

Application web de suivi de patrimoine personnel : placements, immobilier, comptes, crédits, objectifs et estimations fiscales, le tout stocké localement dans le navigateur.

## Stack

React 18, TypeScript, Vite 5, Tailwind CSS 3, Recharts, Vitest 3.

## Prérequis

Node 22 (voir `.nvmrc`).

## Commandes

```bash
npm ci        # installation des dépendances
npm run dev   # serveur de développement Vite
npm run check # typecheck (tsc -b) puis lint (eslint) puis test (vitest run) puis build (vite build)
```

Les étapes de `check` sont aussi disponibles séparément : `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`.

## Pages et fonctionnalités

- **Dashboard** : synthèse du patrimoine net, répartition des actifs, évolution dans le temps et performance par type de placement (graphiques Recharts).
- **Placements** : suivi des actions, crypto, SCPI, PEA et assurances-vie avec montant investi, valorisation, revenus générés et plus-values.
- **Immobilier** : biens détenus avec prix d'achat, frais d'acquisition, valorisation, loyers et charges mensuels, et rendement calculé.
- **Comptes** : comptes courants et épargne par banque, avec solde et date de dernière mise à jour.
- **Crédits** : emprunts en cours avec montant initial, capital restant dû, taux, mensualité et durée restante.
- **Historique** : relevés mensuels du patrimoine (actifs, passifs, net).
- **Objectifs** : objectifs financiers (épargne, investissement, remboursement, patrimoine, revenu) avec montant cible, date limite, priorité et progression calculée sur les données réelles.
- **Fiscal** : estimations IFI, plus-values immobilières et mobilières, revenus fonciers et mobiliers, par année.
- **Notifications** : alertes générées à partir des données (objectifs, échéances, fiscalité, performance), filtrables et marquables comme lues.
- **Connexions** : import CSV et sauvegarde/restauration JSON.

## Import CSV

Deux formats sont acceptés sur la page Connexions :

- Banque : en-têtes `nomCompte,banque,type,soldeActuel,derniereMiseAJour,notes`
- Broker : en-têtes `nom,type,dateAchat,montantInvesti,valorisationActuelle,revenusGeneres,notes`

Le séparateur (`,` ou `;`) est détecté automatiquement sur la ligne d'en-tête. Les cellules entre guillemets peuvent contenir le séparateur, un retour à la ligne ou un guillemet doublé (`""`). Les montants sont acceptés au format français (`1 234,56`) ou anglais (`1234.56`) ; une valeur illisible vaut 0.

## Stockage

Les données vivent dans le `localStorage` du navigateur, sous la clé `patrimoine-data`. Aucun serveur, aucun compte. Pour sauvegarder ou changer de machine : exporter les données complètes en JSON, puis les recharger depuis la page Connexions (la restauration remplace l'intégralité des données existantes).

## Avertissement

Les calculs fiscaux (IFI, plus-values, revenus) sont une estimation simplifiée destinée au pilotage personnel. Ils ne remplacent pas une déclaration ni l'avis d'un professionnel.
