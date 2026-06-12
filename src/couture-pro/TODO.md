# TODO - Brancher stores (Paiements, Factures)

## Étape 1 ✅
- Lire `src/types/index.ts` et vérifier la forme attendue des `Paiement` et `Facture`.
  - `Paiement` attend : `commandeId`, `clienteId`, `userId`, `type: 'avance'|'solde'|'partiel'`, `montant`, `date`.
  - `Facture` attend : `commandeId`, `clienteId`, `userId`, `type`, `statut`.


## Étape 2
- Modifier `src/pages/paiements/Paiements.tsx` :
  - supprimer les mocks `useState` locaux
  - utiliser `usePaiementsStore` (filtrage par `user.id`)
  - au submit, appeler `ajouterPaiement(...)` au store

## Étape 3
- Modifier `src/pages/factures/Factures.tsx` :
  - supprimer les mocks `useState` locaux
  - utiliser `useFacturesStore` (filtrage par `user.id`)
  - au submit, appeler `ajouterFacture(...)`

## Étape 4
- Re-vérifier `src/pages/commandes/Commandes.tsx` (actions et état local) pour s’assurer qu’il n’y a pas de fuite multi-utilisatrice.

## Étape 5
- Lancer un build/lint/compilation pour valider que TypeScript compile.

