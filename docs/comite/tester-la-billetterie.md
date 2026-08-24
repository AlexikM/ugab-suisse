# Tester la billetterie

*Pour la personne qui organise l'événement. Une heure, **avant chaque grande
soirée** — pas seulement la première fois.*

## Pourquoi recommencer à chaque fois

Parce que la configuration n'est pas celle du site : c'est celle de
**l'événement**. Les catégories de billets, les prix, la capacité de la salle,
les moyens de paiement, les dates d'ouverture et de clôture, le texte du courriel
de confirmation — tout cela se ressaisit à chaque création. Un test qui s'est
bien passé pour le gala de l'an dernier ne prouve rien sur celui de cette année.

Et le coût d'une erreur est concentré sur une seule soirée. Une catégorie
mal tarifée, ce sont deux cents billets vendus au mauvais prix. Une salle dont la
capacité n'a pas été reportée, ce sont des places vendues en trop à un dîner
assis, et il faut les reprendre à quelqu'un, à l'entrée, le soir même.

Comptez une heure. Faites-le une fois l'événement configuré et **avant d'en
publier l'annonce**.

## Ce qu'il faut avoir sous la main

- L'accès à la billetterie Infomaniak — voir la
  [carte des comptes](carte-des-comptes.md), fiche 8
- Une carte bancaire personnelle, ou TWINT (les achats seront remboursés)
- Une adresse e-mail à vous, pour recevoir les billets
- Un téléphone avec l'application de scan installée

## Les quatre passages

### 1. Un billet de chaque catégorie

Achetez **un billet par catégorie** — par personne, par couple, table VIP —
jusqu'au bout du paiement.

Vérifiez, pour chacun :

- [ ] Le prix débité est celui que vous avez annoncé, au centime
- [ ] Le courriel de confirmation arrive, et dans un délai raisonnable
- [ ] Le billet y est joint, et il est lisible sur un téléphone
- [ ] Le courriel **nomme la date et le lieu** — c'est ce que le Comité a promis
      dans son texte de confirmation, et c'est le prestataire qui le porte, pas
      le site
- [ ] Le scan du billet fonctionne avec l'application

Puis **remboursez ces commandes** depuis le tableau de bord, et vérifiez que le
remboursement arrive.

### 2. Une commande payée sur facture

C'est la voie des tables d'entreprise, celle qui a le plus d'étapes et que vous
n'emprunterez que deux fois par an. C'est exactement pour cela qu'elle se teste.

- [ ] Passez une commande en choisissant le **paiement sur facture**
- [ ] Vérifiez que les places sont **retenues immédiatement**, avant tout
      paiement : la capacité restante doit avoir diminué
- [ ] Marquez la commande payée depuis le tableau de bord
- [ ] Vérifiez que les billets partent à ce moment-là, et pas avant

Annulez ensuite la commande de test.

### 3. Un billet saisi depuis la console

C'est la vente au téléphone, et celle prise à l'entrée.

- [ ] Saisissez un billet depuis la console de la billetterie
- [ ] Vérifiez qu'il **décompte la même capacité** que les ventes en ligne
- [ ] Vérifiez qu'il apparaît dans la liste d'entrée comme les autres

### 4. Une salle délibérément pleine

Le passage qui compte le plus, parce que c'est le seul dont l'échec est visible
par deux cents personnes à la fois.

- [ ] Ramenez temporairement la capacité au nombre de billets déjà vendus
- [ ] Vérifiez que la billetterie refuse une réservation supplémentaire
- [ ] **Ouvrez la page de l'événement sur le site** et vérifiez qu'elle annonce
      « Complet » — c'est le module de réservation qui l'affiche, sans que
      personne n'ait rien coché
- [ ] Remettez la capacité réelle, et vérifiez que la réservation redevient
      possible

Ne cochez pas la case « Complet » de la fiche pour ce test : elle masquerait le
module et vous testeriez le contraire de ce que vous voulez vérifier. Voir
[Publier un événement](publier-un-evenement.md).

## Si quelque chose ne va pas

**Un prix faux, une catégorie manquante, une capacité mal reportée** se corrigent
dans la billetterie, et le test se refait. N'annoncez pas l'événement avant.

**Le module ne s'affiche pas sur la page** — vérifiez d'abord que l'identifiant
de la boutique est bien collé dans la fiche, et que la case « Complet » n'est pas
cochée. Si les deux sont en ordre, écrivez au webmaster.

**Le courriel de confirmation n'arrive pas, ou arrive en indésirable** — c'est un
réglage du prestataire, et c'est à régler avant la soirée : un acheteur sans
billet écrira au Comité, et il aura raison.

## Ce que ce test ne couvre pas

La billetterie est un service loué. Son moteur de vente, son encaissement et son
envoi de billets sont testés par son éditeur, pas par nous. Ce qui est vérifié
ici, c'est **notre configuration** — et c'est la seule partie que nous pouvons
nous tromper.
