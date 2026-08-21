# En cas de problème

*Pour le Comité. À lire une fois maintenant, à rouvrir le jour où c'est utile.*

Cette page couvre ce qui arrive vraiment. Chaque situation tient en trois
choses : ce que vous voyez, la première chose à faire, et qui prévenir. Il n'est
pas nécessaire de comprendre le problème pour bien réagir.

Une précision d'abord, parce qu'elle change la façon de lire tout le reste : le
site est constitué de pages figées, sans base de données ni logiciel à mettre à
jour. C'est un choix, expliqué dans ADR-0001. Concrètement, il y a très peu de
choses qui peuvent tomber en panne toutes seules — et quand quelque chose ne
fonctionne pas, c'est presque toujours chez un prestataire, pas dans le site.

## Est-ce urgent ?

| C'est urgent | Cela peut attendre le prochain jour ouvrable |
| --- | --- |
| Le site est inaccessible | Une faute de frappe, une photo mal cadrée |
| Les dons ou les billets ne fonctionnent plus | Un texte à modifier |
| Une photographie doit être retirée immédiatement | Une idée d'amélioration |
| Un avis d'expiration de domaine | Une question sur le fonctionnement |
| Une demande de suppression de données personnelles | Une statistique de visites |

Dans la colonne de gauche, écrivez tout de suite, même si vous n'êtes sûr de
rien. Dans celle de droite, rassemblez plutôt plusieurs points et envoyez-les
ensemble : c'est plus efficace pour tout le monde.

## Ce qu'il faut mettre dans un signalement

Un signalement complet reçoit une réponse ; un signalement incomplet reçoit une
question, et vous perdez une journée.

1. **L'adresse exacte de la page**, copiée depuis la barre du navigateur.
2. **Ce que vous attendiez**, et **ce qui s'est passé à la place**.
3. **Une capture d'écran.** Elle vaut trois paragraphes.
4. **Quand** cela s'est produit, et si cela se reproduit à chaque essai.
5. **Avec quoi** : ordinateur ou téléphone, quel navigateur.
6. **Le message d'erreur en entier**, s'il y en a un — y compris la partie qui
   semble incompréhensible, qui est souvent la seule qui compte.

---

## Le site ne répond pas

**Ce que vous voyez** — une page blanche, une erreur du navigateur, ou une page
du fournisseur à la place du site.

**Première action** — vérifiez d'abord que ce n'est pas votre connexion : ouvrez
un autre site. Puis ouvrez le site depuis un téléphone en données mobiles, hors
du Wi-Fi. S'il s'affiche là, le problème vient de votre connexion ou de votre
réseau, et non du site.

**Ensuite** — si le site est inaccessible partout, il y a deux causes probables,
dans cet ordre :

1. **Une panne chez l'hébergeur.** Consultez la page d'état d'Infomaniak. Si une
   panne est annoncée, il n'y a rien à faire d'autre qu'attendre et prévenir le
   référent du site. Personne ne peut accélérer les choses.
2. **Le nom de domaine a expiré.** C'est la cause la plus grave et la plus
   fréquente dans une association. Voir plus bas.

**Qui contacter** — le référent du site, puis le webmaster.

**Ce qu'il ne faut pas faire** — ne modifiez rien dans le compte d'hébergement
pour « essayer de réparer ». Une panne d'hébergeur se règle chez l'hébergeur ;
les réglages modifiés dans la précipitation, eux, restent.

---

## Les e-mails n'arrivent pas, ou arrivent dans les indésirables

**Ce que vous voyez** — un message envoyé par le formulaire de contact ne
parvient à personne, un reçu de don n'arrive pas, ou tout ce que le Comité envoie
tombe dans les indésirables.

**Première action** — regardez le dossier « indésirables » de la boîte concernée,
et écrivez-vous un message de test depuis une adresse extérieure.

**Ensuite** — distinguez deux situations :

- **Rien n'arrive dans la boîte.** Vérifiez, dans la
  [carte des comptes](carte-des-comptes.md), que la redirection est bien
  configurée et pointe vers une adresse encore valide. Une redirection vers la
  boîte d'un membre parti est une cause classique.
- **Tout arrive, mais dans les indésirables.** C'est un problème
  d'authentification du courrier — les enregistrements SPF, DKIM et DMARC du
  domaine. Cela se règle une fois, du côté technique, et cela peut se dérégler
  après une modification du domaine faite pour un prestataire de paiement.

**Qui contacter** — le webmaster pour le second cas ; le référent du site pour le
premier.

**Ce qu'il ne faut pas faire** — ne créez pas une nouvelle adresse pour
contourner le problème. Vous en auriez alors deux, dont une que personne ne
relève, et le site continuerait d'afficher l'ancienne.

---

## Un don n'apparaît pas

**Ce que vous voyez** — un donateur affirme avoir donné, et vous ne voyez rien.

**Première action** — ouvrez le tableau de bord du prestataire de dons et
cherchez la transaction par date et par montant. Le site n'enregistre aucun don :
il n'en a jamais connaissance. **Le tableau de bord du prestataire est la seule
source qui fasse foi**, et le compte bancaire ne reflète les dons qu'après le
versement groupé du prestataire, avec quelques jours de décalage.

**Ensuite** — trois cas :

- **La transaction figure au tableau de bord.** Le don est bien passé. Il
  apparaîtra sur le compte au prochain versement. Rassurez le donateur.
- **La transaction est marquée en échec.** Le paiement n'a pas abouti, souvent du
  côté de la banque du donateur. Invitez-le à recommencer.
- **Aucune trace.** Demandez au donateur le message de confirmation qu'il a
  reçu ; s'il n'en a pas, le paiement n'est très probablement pas parti.

**Qui contacter** — le trésorier d'abord. Le webmaster seulement si le formulaire
de don lui-même ne s'affiche pas, ce qui est un problème différent.

**Ce qu'il ne faut pas faire** — ne promettez pas d'attestation fiscale tant que
le Comité n'a pas tranché la question de la déductibilité. Elle est ouverte, elle
bloque la mise en ligne, et annoncer une déduction à un donateur qui ne pourra
pas déduire est le seul risque à ne pas prendre. Voir
[Exporter les dons](exporter-les-dons.md).

---

## Le module de billetterie ne s'affiche pas

**Ce que vous voyez** — un cadre vide, ou un espace blanc, à l'endroit où les
billets devraient se réserver.

**Première action** — rechargez la page, puis essayez avec un autre navigateur ou
en navigation privée. Un bloqueur de publicités installé sur votre ordinateur
empêche fréquemment ce type de module de s'afficher, et le problème n'existe
alors que pour vous.

**Ensuite** — si le module reste absent partout, la cause est presque toujours
chez le prestataire de billetterie : ouvrez son tableau de bord et sa page
d'état. Le reste du site continue de fonctionner ; seul le module est concerné.

**Dans l'immédiat, si l'événement est proche** — la vente ne doit pas s'arrêter.
Demandez au webmaster de remplacer le module par un lien direct vers la page de
billetterie du prestataire. C'est moins élégant et cela fonctionne.

**Qui contacter** — le référent du site, en précisant la date de l'événement :
c'est elle qui détermine l'urgence.

---

## Un avis de renouvellement de domaine arrive

**Ce que vous voyez** — un courriel du registrar annonçant que le nom de domaine
expire.

**Première action** — **vérifiez que le message est authentique.** Les faux avis
de renouvellement sont une escroquerie courante et bien faite. Trois contrôles :

1. Le nom du registrar correspond-il à celui inscrit dans la
   [carte des comptes](carte-des-comptes.md) ?
2. Le montant correspond-il à celui que vous y avez noté ?
3. **N'utilisez jamais le lien du message.** Connectez-vous au compte du
   registrar comme vous le faites d'habitude, et vérifiez la date d'expiration
   sur place.

**Ensuite** — si le domaine expire réellement et que le renouvellement
automatique est actif, il n'y a rien à faire : c'est un avis, pas une facture.
S'il n'est pas actif, activez-le, et vérifiez que le moyen de paiement enregistré
n'a pas expiré. Une carte périmée est l'autre façon de perdre un domaine.

**Qui contacter** — le référent du site, et le trésorier pour le paiement.

**Ce qu'il ne faut pas faire** — ne payez rien depuis un lien reçu par courriel.
Jamais.

---

## Une demande relative aux données personnelles

**Ce que vous voyez** — quelqu'un écrit pour demander ce que vous détenez à son
sujet, ou pour demander l'effacement de ses données.

**Première action** — **accusez réception le jour même.** La politique de
confidentialité du site promet une réponse sous 30 jours ; l'accusé de réception
vous donne le temps de préparer la réponse sans laisser la personne sans
nouvelle.

**Ensuite**, dans cet ordre :

1. Cherchez dans la boîte `contact@`, archives comprises.
2. Cherchez dans le tableau de bord du prestataire de dons.
3. Cherchez dans le tableau de bord du prestataire de billetterie.
4. Répondez en indiquant ce qui est détenu, à quel titre, et combien de temps ce
   sera conservé.
5. Faites ce qui est demandé, ou expliquez pourquoi vous ne le pouvez pas.

Il n'y a rien d'autre à fouiller : le site lui-même ne conserve rien. Il n'a ni
base de données ni compte de visiteur.

**La seule réponse qui est un refus** — les pièces comptables liées aux dons et
aux ventes de billets ne peuvent pas être effacées avant la fin de leur durée de
conservation légale. Dites-le simplement et expliquez pourquoi, plutôt que de ne
pas répondre.

**Qui contacter** — le membre du Comité désigné pour ces demandes. En cas de
doute sur la réponse, le webmaster **avant** l'envoi, pas après.

---

## Une photographie doit être retirée immédiatement

**Ce que vous voyez** — une personne identifiable sur une photo du site demande
son retrait.

**Première action** — retirez la photo, sans discuter du bien-fondé de la
demande. C'est réversible en deux minutes ; le contraire ne l'est pas. La
manipulation est la même que pour en ajouter une : voir
[Publier un événement](publier-un-evenement.md).

**Ensuite** — vérifiez si la même photographie apparaît ailleurs sur le site,
notamment dans une galerie d'événement passé.

**Qui contacter** — le membre du Comité chargé des demandes de retrait, désigné
dans la [carte des comptes](carte-des-comptes.md).

**Pour éviter le cas suivant** — l'accord des personnes identifiables se
recueille avant la publication, pas après la réclamation.

---

## Une publication erronée est en ligne

**Ce que vous voyez** — un événement publié avec la mauvaise date, un tarif faux,
un texte qui ne devait pas paraître.

**Première action** — corrigez-le vous-même depuis l'interface d'édition. Vous
n'avez besoin de personne, et une correction faite dans l'heure ne laisse
pratiquement aucune trace. Voir
[Publier un événement](publier-un-evenement.md).

**Si l'information erronée a déjà circulé** — corrigez d'abord la page, puis
dites-le. Une date d'événement fausse relayée par courriel se rattrape par
courriel, pas par le site seul.

**Qui contacter** — personne, sauf si vous ne parvenez pas à corriger.

---

## Qui contacter, en résumé

Les noms et les adresses sont dans la
[carte des comptes](carte-des-comptes.md), parce qu'ils changent à chaque
élection et qu'une liste recopiée à deux endroits devient fausse à l'un des deux.

| Rôle | Ce qu'il traite |
| --- | --- |
| Référent du site | Le premier réflexe pour tout. Oriente le reste. |
| Trésorier | Dons, versements, renouvellements payants, attestations |
| Membre chargé des demandes de données | Accès, effacement, retrait de photographies |
| Webmaster | Ce qui est cassé dans le site lui-même |

Ce que couvre l'intervention du webmaster, ce qu'elle ne couvre pas et pendant
combien de temps : voir [Assistance et garantie](assistance-et-garantie.md).
