# Publier un événement

*Pour le Comité. Comptez vingt minutes la première fois, cinq ensuite.*

## L'événement existe à deux endroits

C'est la première chose à comprendre, et elle ne changera pas.

Un événement vendu en ligne existe **deux fois** : comme une annonce sur le site,
et comme une billetterie chez Infomaniak. Le titre, la date, le lieu et les
tarifs se saisissent des deux côtés. Comptez cinq minutes de plus par événement,
trois à cinq fois par an.

Cela paraît absurde et ce ne l'est pas. Le site n'a pas de serveur : c'est ce qui
lui permet de fonctionner sans entretien pendant des années, et c'est aussi ce
qui l'empêche de créer quoi que ce soit chez le prestataire. Faire écrire l'un
par l'autre a été étudié et écarté — voir
[PRD 6](../prd/06-ticketing.md) — parce qu'une billetterie créée
automatiquement n'est pas une billetterie vendable : il reste toujours à ouvrir
le prestataire pour choisir les moyens de paiement, les dates d'ouverture et de
clôture, et le texte du courriel de confirmation. La visite a lieu de toute
façon.

**L'ordre compte.** Créez d'abord la billetterie, puis l'annonce : l'identifiant
que vous collerez dans la fiche n'existe pas avant.

## Avant de commencer

Réunissez ces éléments — vous n'aurez pas à chercher en cours de route :

- Le **titre**, la **date et l'heure**, le **lieu et l'adresse complète**
- Une **photo principale** : JPEG, format paysage, 1920 × 1080 minimum
- Le **programme** : déroulé, intervenants, dress code, informations pratiques
- Les **tarifs**, tels que vous voulez les voir affichés
- L'**identifiant de la boutique** de billetterie, si elle est déjà créée

Si un élément manque, publiez quand même : seuls le titre, la date et le lieu
sont obligatoires. Vous compléterez plus tard.

## Les étapes

### D'abord, la billetterie

1. **Ouvrez la billetterie Infomaniak**, dans le même compte que l'hébergement —
   il n'y a pas d'identifiant supplémentaire à retenir. Voir la
   [carte des comptes](carte-des-comptes.md), fiche 8.
2. **Créez l'événement** : titre, date, lieu, et un tarif par catégorie de
   billet — par personne, par couple, table VIP. Toutes les catégories tirent sur
   la **même capacité de salle**, ce qui est précisément ce qu'un lien de
   paiement par tarif ne sait pas faire.
3. **Choisissez les moyens de paiement** — TWINT, PostFinance, carte — et les
   **dates d'ouverture et de clôture des ventes**. Voir plus bas pourquoi la
   clôture compte.
4. **Testez avant d'annoncer.** La configuration est propre à chaque événement :
   [Tester la billetterie](tester-la-billetterie.md), à faire avant chaque
   grande soirée et pas seulement la première fois.
5. **Relevez l'identifiant de la boutique.** C'est ce que vous collerez dans la
   fiche.

### Ensuite, l'annonce

6. **Ouvrez** `https://[adresse-du-site]/admin/` et connectez-vous.
7. Dans le menu de gauche, cliquez sur **Événements**, puis sur **New Événement**.
8. **Remplissez les champs.** Chaque champ porte une explication sous son
   intitulé — lisez-la en cas de doute, elle a été écrite pour vous.
9. **Collez l'identifiant de la boutique** dans « Identifiant de la boutique ».
   Le module de réservation s'affiche alors sur la page de l'événement, et c'est
   la billetterie — pas le site — qui y annonce les places encore libres.
10. **Téléversez la photo principale.** Elle sera redimensionnée automatiquement :
    n'y touchez pas avant de l'envoyer.
11. **Enregistrez en brouillon** si vous voulez le relire à tête reposée, ou faire
    valider par un autre membre du Comité.
12. **Publiez** quand vous êtes prêt.

Si la billetterie n'est pas encore prête, publiez quand même : l'annonce
fonctionne sans, et propose au visiteur d'écrire au Comité. Vous reviendrez
coller l'identifiant plus tard.

## Les trois états d'une annonce

**Brouillon** — la case « Brouillon » est cochée. Vous préparez l'annonce ;
elle n'apparaît nulle part sur le site, et son adresse n'existe pas encore.

**En relecture** — la case est toujours cochée, et une autre personne du Comité
relit l'annonce. C'est l'étape qui évite les erreurs de date et les fautes de
frappe sur un nom propre : deux paires d'yeux avant que ce soit public.

**Publiée** — vous décochez la case. L'annonce est en ligne pour tout le monde,
tout de suite.

Un **site de préproduction** est prévu : une copie privée du site, protégée par
un mot de passe, où les brouillons s'affichent comme de vraies pages. La
relecture s'y fera alors sur la page elle-même plutôt que sur le formulaire. Il
dépend de l'hébergement, qui n'est pas encore ouvert ; tant qu'il n'est pas en
place, faites relire l'annonce directement dans l'interface d'édition.

## Ce que la billetterie prélève, et comment en tenir compte

**La commission est retenue sur nos recettes, pas ajoutée au prix de l'acheteur.**
C'est l'inverse de ce que font certains prestataires, et il vaut mieux le savoir
en fixant le prix qu'en recevant le premier versement.

| Moyen de paiement | Ce que cela nous coûte |
| --- | --- |
| Carte | 2,5 % + CHF 0,89 par billet |
| TWINT ou PostFinance | 2,5 % + CHF 0,20 par billet |
| Billet saisi depuis la console | la part fixe seulement, sans pourcentage |

Concrètement : un billet annoncé à **CHF 120** nous coûte environ **CHF 3,90**
s'il est payé par carte. Il reste donc CHF 116 pour la soirée. **Fixez le prix
affiché commission comprise** — c'est la seule façon que la recette soit celle
sur laquelle vous avez compté.

**Les ventes hors ligne ne coûtent presque rien, alors servez-vous en.** Un
billet saisi depuis la console de la billetterie ne supporte que la part fixe :
ni pourcentage, ni frais bancaires. Une table VIP à CHF 2'000 saisie à la main
coûte moins d'un franc, contre une cinquantaine si elle passe par le paiement
par carte.

C'est aussi ce qu'il faut faire d'une **réservation prise au téléphone ou à
l'entrée** : saisissez-la dans la console. Elle décompte alors les mêmes places
que les ventes en ligne, et la salle reste juste. Notée sur un carnet, elle ne
décompte rien, et la billetterie continue de vendre le siège concerné.

**Une entreprise qui veut une facture commande elle aussi dans le système**, en
choisissant le paiement sur facture. Ses places sont retenues pendant que le
virement se fait ; vous lui envoyez une facture QR depuis l'e-banking de
l'association ; l'argent arrive directement sur le compte ; vous marquez la
commande payée et les billets partent. Une table convenue par courriel, elle, ne
retient aucune place.

## Fermez les ventes avant la soirée

La date de clôture des ventes se règle dans la billetterie, au moment de créer
l'événement. Réglez-la : le traiteur est commandé plusieurs jours à l'avance, et
une place vendue la veille au soir est une place qui n'a pas de couvert.

## Le soir même, et après

**La liste d'entrée et le scan des billets** sont fournis par la billetterie :
une application gratuite qui fonctionne même sans réseau, et une liste
exportable. Le site n'y participe pas et n'a besoin de rien.

**Les exports** — Excel et PDF — servent à trois choses : préparer le placement
et le traiteur, tenir l'entrée, et rapprocher la recette au bouclement. Le
trésorier en a besoin ; voir [Exporter les dons](exporter-les-dons.md), qui
explique aussi pourquoi un **soutien ajouté à une commande de billets** arrive
dans cet export-là et non dans celui du prestataire de dons.

## Après l'événement

Revenez sur la fiche et ajoutez des photos dans la **galerie**. L'événement
rejoint alors la page « Événements passés » : c'est ce que regarde une personne
qui hésite à acheter un billet pour la prochaine soirée.

## Les points qui prêtent à confusion

**« Complet » est une exception, pas une habitude.** Quand l'événement est vendu
par la billetterie, c'est elle qui sait si la salle est pleine, et elle l'annonce
d'elle-même sur la page : vous n'avez rien à faire. Cocher la case par réflexe
masque alors une réservation qui fonctionne — sur un événement qui se vend
encore — et rien sur le site ne vous le signalera.

Elle sert dans deux cas, et ils sont réels : un événement qui ne passe pas par la
billetterie du tout, et l'urgence, quand vous voulez répondre tout de suite sans
attendre. La mention « Complet » s'affiche alors, et toute possibilité de
réserver disparaît de la page. Décochez-la si des places se libèrent.

**Les tarifs sont recopiés, et personne ne les recopie pour vous.** Le champ
« Tarifs » est ce que le visiteur lit sur la page ; le prix qu'il paie est celui
que vous avez saisi dans la billetterie. Les deux ne sont reliés par rien. C'est
volontaire — la page doit rester lisible en arménien, sans JavaScript, et à
l'intérieur de l'annonce elle-même, ce que le module de réservation ne sait pas
faire — mais cela veut dire qu'un tarif corrigé d'un seul côté est faux de
l'autre. Corrigez toujours les deux.

**« Langue de la fiche »** — un événement en français et sa version anglaise sont
deux fiches distinctes. Créez d'abord le français ; l'anglais peut attendre.

**Supprimer une photo de la médiathèque** — ne le faites pas tant qu'une fiche
l'utilise encore. Retirez d'abord la photo de la fiche, enregistrez, puis
supprimez le fichier. Dans l'autre ordre, la fiche désigne une photo qui n'existe
plus : le site refuse alors de se reconstruire, et plus rien ne se met en ligne —
ni cet événement, ni les autres pages — tant que ce n'est pas corrigé. C'est
volontaire : l'alternative était de publier une image cassée sur l'annonce d'un
gala. Si cela vous arrive, écrivez au webmaster, c'est l'affaire de deux minutes.

**L'arménien** — le site est trilingue, mais les pages arméniennes affichent le
français tant que la traduction n'est pas fournie, en le disant clairement au
visiteur. Ce n'est pas un défaut. Dès que les textes arméniens nous parviennent,
les pages basculent d'elles-mêmes, une par une.

**Les billets et les dons** — le paiement se fait chez un prestataire externe,
en français ou en anglais. Aucun prestataire suisse ne propose de paiement en
arménien.

## Ce que vous ne pouvez pas faire depuis cette interface

Ajouter une page, modifier le menu, changer la mise en page ou les couleurs.
C'est volontaire : ces éléments engagent la cohérence du site et ne devraient
pas pouvoir être modifiés par erreur la veille d'un gala. Pour tout cela,
écrivez au webmaster.

## Si quelque chose ne va pas

**Rien n'est perdu.** Chaque enregistrement est conservé, y compris la
suppression d'une fiche : l'historique des modifications s'affiche dans le
panneau « History », à droite de l'éditeur.

**Mais il n'y a pas de bouton pour rétablir une version précédente.** Le bouton
« Revert Changes » annule seulement les modifications que vous n'avez pas encore
enregistrées. Pour revenir à une version antérieure, écrivez au webmaster : c'est
possible à tout moment, et c'est l'affaire de quelques minutes.

En cas de doute, ne supprimez rien et signalez-le.

---

**Ne publiez jamais un événement fictif, même « pour tester ».** Le site annonce
des soirées réelles dans des lieux réels à des prix réels : une fiche de test
qui passe en ligne est une fausse annonce au nom de l'UGAB. Le site refuse
d'ailleurs de se construire si une fiche est marquée comme exemple.
