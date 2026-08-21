# Exporter les dons et établir les attestations

*Pour le trésorier ou la trésorière. Une fois par an, au bouclement.*

Le site n'enregistre aucun don. Il n'en a jamais connaissance : le formulaire de
don appartient au prestataire de paiement, et l'argent va du donateur au
prestataire, puis du prestataire au compte de l'association. **Le tableau de bord
du prestataire est la seule source qui fasse foi.**

Cette page décrit ce que le trésorier fait avec, sans avoir à demander à
personne.

## Avant de commencer

Le prestataire de dons n'est pas encore arrêté — RaiseNow ou Payrexx, voir
ADR-0001. Les manipulations exactes dépendent de celui qui sera retenu et se
complètent ici le jour de la mise en place :

- **Prestataire retenu** — *à fournir par le Comité*
- **Adresse du tableau de bord** — *à fournir par le Comité*
- **Chemin de l'export** — *à fournir par le Comité*
- **Qui a accès** — voir la [carte des comptes](carte-des-comptes.md)

Ce qui suit ne dépend pas du prestataire et vaut dans tous les cas.

## Une fois par an, au bouclement

1. **Exportez les transactions de l'exercice**, au format CSV, depuis le tableau
   de bord du prestataire. Prenez l'année civile entière, du 1er janvier au
   31 décembre.
2. **Exportez la liste des donateurs**, si le prestataire la propose séparément.
3. **Rapprochez avec le compte bancaire.** Les montants ne correspondront pas
   ligne à ligne : le prestataire verse par lots, après déduction de ses
   commissions. Ce que vous vérifiez, c'est que le total des versements reçus
   correspond au total des dons encaissés, moins les commissions.
4. **Conservez les deux fichiers avec les pièces comptables de l'exercice.** Ils
   font partie de la comptabilité, et le droit comptable suisse impose de les
   garder — en principe dix ans.
5. **Notez la date de l'export** dans la carte des comptes, à la ligne du
   prestataire de dons.

Faites-le même si vous n'avez pas besoin d'attestations cette année-là. C'est
aussi ce qui rend un changement de prestataire indolore ; voir
[Quitter un prestataire](quitter-un-prestataire.md).

## Les dons récurrents

Un donateur peut avoir mis en place un don mensuel ou annuel. Deux choses à
savoir :

- Ils apparaissent dans l'export comme des transactions distinctes, une par
  échéance. Pour l'attestation, c'est le **total de l'année** qui compte.
- Un don récurrent est enregistré chez le prestataire et **ne se transfère pas**
  à un autre. C'est le seul vrai coût d'un changement de prestataire.

## Les attestations de dons

**Une question doit être tranchée avant que la première attestation parte**, et
elle ne l'est pas encore. Deux points, tous deux à confirmer par écrit :

1. **L'association dispose-t-elle d'une décision cantonale d'exonération pour
   utilité publique ?** Sans elle, un donateur ne peut pas déduire, et le lui
   annoncer serait faux. C'est la seule phrase du site qui bloque la mise en
   ligne tant qu'elle n'est pas vérifiée.
2. **Qui établit les attestations, quand, et sur quelle demande ?** Aucun des
   prestataires envisagés n'en émet automatiquement. C'est donc un travail du
   Comité, à faire une fois par an.

- Décision cantonale d'exonération : *à fournir par le Comité*
- Qui établit les attestations : *à fournir par le Comité*
- À quel moment de l'année : *à fournir par le Comité*

Tant que ces trois lignes sont vides, **n'annoncez aucune déductibilité à un
donateur** et ne promettez pas d'attestation.

### Une fois la question tranchée

La marche à suivre est mécanique :

1. Dans l'export de l'année, additionnez les dons **par donateur**.
2. Établissez une attestation par donateur, portant le total annuel, la période,
   le nom et l'adresse du donateur, et la référence de la décision cantonale.
3. Envoyez-les, de préférence toutes au même moment, en début d'année suivante.
4. Conservez une copie avec les pièces comptables.

## Ce qu'il ne faut pas faire

**Ne recopiez pas les montants à la main depuis le compte bancaire.** Les
versements du prestataire sont des lots nets de commission : le montant reçu par
l'association n'est pas le montant donné, et c'est le second qui figure sur une
attestation.

**N'effacez rien à la demande d'un donateur.** Une pièce comptable ne se supprime
pas avant la fin de sa durée de conservation légale, même si la personne le
demande. Voir [En cas de problème](en-cas-de-probleme.md).

**Ne conservez pas d'export sur un ordinateur personnel** en dehors de ce qui est
nécessaire. Un fichier de donateurs est une liste de personnes nommées avec leurs
adresses.
