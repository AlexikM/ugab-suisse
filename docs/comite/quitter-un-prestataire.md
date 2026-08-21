# Quitter un prestataire

*Pour le Comité. À lire une fois, pour savoir que c'est possible.*

« Vous n'êtes prisonniers de personne » est une phrase que tout le monde dit. Ce
document la transforme en marche à suivre : pour chaque prestataire, ce qu'il
détient, comment le récupérer, et ce que partir demanderait réellement.

Rien ici n'invite à partir. Ces pages servent le jour où un prestataire augmente
ses tarifs, ferme, ou cesse simplement de convenir. Ce jour-là, la question ne
doit pas être « est-ce qu'on peut ? » mais « est-ce qu'on veut ? ».

## Les deux raisons de fond

Deux décisions d'architecture, prises au départ, expliquent pourquoi ce document
est court.

**Le contenu est dans un dépôt git, pas dans un logiciel.** Chaque texte, chaque
fiche d'événement et chaque photographie est un fichier dans le dépôt du Comité,
avec l'historique de toutes ses versions. Il n'y a pas de base de données dont il
faudrait extraire quoi que ce soit. C'est ce qui rend la phrase « pleine
propriété du Comité » littéralement vraie plutôt qu'aspirationnelle.

**Aucun flux d'argent n'est construit sur mesure.** Les dons et les billets
passent par des prestataires que l'on peut remplacer parce qu'ils ne sont pas
imbriqués dans le site : ils occupent un emplacement défini dans une page.

## Hébergement — Infomaniak

**Ce qu'il détient** — les pages du site telles qu'elles sont servies, les boîtes
e-mail et leur historique, les journaux techniques du serveur.

**Comment récupérer** — les pages n'ont pas à être récupérées : elles sont
reconstruites à partir du dépôt. Ce qui doit l'être, ce sont **les boîtes
e-mail** : exportez chaque boîte au format standard (IMAP ou `.mbox`) avant toute
fermeture de compte. C'est la seule chose qui n'existe qu'ici.

**Ce que partir demanderait** — une demi-journée pour un professionnel :
reconstruire le site chez un autre hébergeur, recréer les boîtes, importer les
archives, faire pointer le domaine ailleurs. Le site est fait de fichiers
statiques ; presque n'importe quel hébergeur convient.

**Ce qui ne suit pas** — les journaux techniques du serveur, sans intérêt. Et
prévoyez quelques heures de battement pendant que le domaine se propage.

## Noms de domaine

**Ce qu'il détient** — l'adresse elle-même. C'est le seul élément véritablement
irremplaçable de toute cette liste.

**Comment récupérer** — un nom de domaine se transfère d'un registrar à un autre.
Il faut : le compte au nom de l'association, le verrou de transfert désactivé le
temps de l'opération, et le code d'autorisation fourni par le registrar actuel.

**Ce que partir demanderait** — quelques jours d'attente, une somme modique, et
aucune interruption du site si l'opération est menée correctement.

**Le point de vigilance** — c'est le seul actif que l'on peut perdre
définitivement, non pas en changeant de prestataire, mais en oubliant de payer.
Voir la [carte des comptes](carte-des-comptes.md).

## Le contenu et l'interface d'édition

**Ce qu'ils détiennent** — rien de plus que le dépôt. L'interface d'édition est
une fenêtre sur les fichiers du dépôt ; elle ne conserve rien pour elle-même.

**Comment récupérer** — il n'y a rien à exporter. Les textes sont des fichiers
Markdown, les photographies des fichiers image, dans le dépôt du Comité.

**Ce que partir demanderait** — changer d'interface d'édition ne touche pas au
contenu. C'est la conséquence directe du choix décrit dans ADR-0001, et c'est
l'endroit où il paie.

## GitHub

**Ce qu'il détient** — le dépôt : le code, les contenus, l'historique complet, et
les décisions consignées dans les tickets.

**Comment récupérer** — `git clone` copie l'intégralité du dépôt et de son
historique sur n'importe quelle machine. Un dépôt git est complet par nature :
chaque copie contient tout. Les tickets et les discussions s'exportent séparément
depuis les outils de GitHub.

**Ce que partir demanderait** — une heure. Un dépôt git se déplace vers n'importe
quel autre hébergeur de code, ou vers un simple disque.

**À faire dès maintenant, sans attendre de partir** — que deux membres du Comité
au minimum soient propriétaires de l'organisation.

## Prestataire de dons

**Ce qu'il détient** — la liste des dons, les coordonnées des donateurs, les
dons récurrents en cours, et l'historique comptable.

**Comment récupérer** — exportez les transactions et les donateurs depuis son
tableau de bord, au format CSV, **avant** de fermer le compte. Faites-le de toute
façon une fois par an, au moment du bouclement : c'est la même manipulation, et
elle vous donne aussi de quoi établir les attestations.

**Ce que partir demanderait** — la difficulté n'est pas technique. Elle tient aux
**dons récurrents** : un ordre permanent enregistré chez un prestataire ne se
transfère pas à un autre. Il faut écrire aux donateurs concernés et leur demander
de le mettre en place à nouveau. Une partie ne le fera pas. C'est le seul vrai
coût d'un changement de prestataire de dons, et il se paie en dons perdus, pas en
heures de travail.

**Ce qui ne suit pas** — les moyens de paiement enregistrés des donateurs, jamais
transférables, pour de bonnes raisons.

## Prestataire de billetterie

**Ce qu'il détient** — les événements, les billets vendus, les participants, les
listes d'entrée.

**Comment récupérer** — exportez la liste des participants après chaque
événement, au format CSV. Faites-le systématiquement : c'est aussi le moment de
demander au prestataire la suppression des listes une fois l'événement clos et sa
comptabilité bouclée, ce que la politique de confidentialité du site annonce.

**Ce que partir demanderait** — peu de choses, entre deux événements. Un
prestataire de billetterie est le plus facile à remplacer de la liste, parce que
chaque événement est un cycle qui se termine.

**Le point de vigilance** — ne changez pas de prestataire alors qu'un événement
est en vente. Attendez qu'il soit passé.

## Le récapitulatif

| Prestataire | Ce qu'il faut exporter avant de partir | Difficulté |
| --- | --- | --- |
| Hébergement | Les boîtes e-mail | Faible |
| Nom de domaine | Rien ; on le transfère | Faible, mais irremplaçable |
| Contenu et interface d'édition | Rien ; tout est dans le dépôt | Nulle |
| GitHub | Les tickets ; le code se clone | Nulle |
| Prestataire de dons | Transactions et donateurs, en CSV | Moyenne — les dons récurrents |
| Prestataire de billetterie | Participants, en CSV | Faible |

## Trois habitudes qui rendent tout cela théorique

Prises maintenant, elles font qu'un départ éventuel ne demande aucune préparation
particulière.

1. **Exportez les dons une fois par an**, au bouclement des comptes, et conservez
   le fichier avec les pièces comptables.
2. **Exportez les participants après chaque événement**, puis demandez au
   prestataire de supprimer la liste.
3. **Gardez la [carte des comptes](carte-des-comptes.md) à jour.** Sans elle, le
   premier obstacle n'est pas l'export : c'est de retrouver comment se connecter.
