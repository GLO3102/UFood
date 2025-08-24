# UFood

Le projet de session consiste à développer une application permettant de trouver des restaurants et de partager ses favoris entre amis.

## Consignes générales

- Le projet doit être fait en équipe de 4 à 6 étudiants.
- L’équipe doit utiliser les dépôts GitHub fournis par l'enseignant.
- L'application doit être réalisée en anglais.
- Les dates de remise exactes peuvent être consultées via le portail des cours.
- La correction sera réalisée utilisant Google Chrome.
- Les formats d'écrans utilisés pour la correction seront
  - Desktop
  - iPad
  - iPhone
- Tous les frameworks CSS et JS sont permis - en cas de doute vérifiez avec l'enseignant.
- TypeScript est permis pour le projet.
- Si vous désirez réaliser le projet de session avec un autre framework que Vue (React, Angular etc.) - veuillez communiquer avec l'enseignant avant de commencer.

### Remises

Les remises ne seront pas effectuées par le portail des cours, mais plutôt gérées à partir de GitHub.

Pour chaque livrable, les équipes devront suivre la procédure suivante:

1. Créer une branche nommée release-X (où X est le numéro du livrable) dans le dépôt GitHub.
2. Fournir un README du livrable avec les instructions pour les correcteurs.

La branche ne doit plus être touchée une fois la date de remise passée. Une modification de la branche après la date de remise peut entraîner de fortes pénalités. Les correcteurs utiliseront le code directement sur GitHub.

**ATTENTION**

Votre application doit fonctionner sans aucune manipulation du correcteur. Si l’application n’est pas fonctionnelle et que le correcteur n’est pas en mesure de corriger, vous **risquez la note de zéro.**

## Livrable 1

Le livrable 1 consiste en définir le _design_ de votre application et choisir les différents frameworks qui seront nécessaires à la réalisation du projet.

### Consignes générales

- Le livrable 1 est **statique** - pas d'intégration avec l'API nécessaire. Toutes les données peuvent être **hardcodées** pour l'instant.
- Toutes les sections devront être responsives (supporter les différents formats d'écran).

### Fonctionnalités demandées

- Page d'accueil de l'application incluant les éléments suivants:
  - Une liste des restaurants
  - Une barre de recherche *(permet la recherche de restaurants)*
  - Une facon de filtrer la liste des restaurants (par fourchette de prix, par genre)
- Un menu incluant les éléments suivants:
  - Barre de recherche *(permet la recherche de restaurants - servira également pour la recherche d'utilisateurs au Livrable 3)*
  - Lien vers la page d'accueil
  - Lien pour se connecter/déconnecter
  - Le nom de l'utilisateur courant si connecté
  - Lien vers le profil de l'usager si connecté
- Afficher la page d'un seul restaurant incluant les éléments suivants:
  - Nom du restaurant
  - Adresse
  - Numéro de téléphone
  - Position géographique sur la carte **FONCTIONNEL**
  - Bouton pour directions vers le restaurant **FONCTIONNEL** - l'itinéraire doit être affiché à même la carte dans la page
  - Heures d'ouverture
  - Photos du restaurant (on s'attend ici à voir plusieurs photos!)
  - Genre(s) associé(s) au restaurant
  - Fourchette de prix du restaurant
  - Cote moyenne du restaurant
- Afficher la page du profil utilisateur
  - Nom de l'utilisateur
  - Score de l'utilisateur
  - Une liste des restaurants visités récemment, incluant le nombre de visite(s) à chaque restaurant
  - Dans le cas d'aucune visite(s), un lien vers la page d'accueil
- README adéquat
  - Expliquer comment lancer l’application

## Livrable 2

Le livrable 2 consiste en l'intégration des fonctionnalités du livrable 1 avec l'API ainsi que l'ajout de certaines fonctionnalités supplémentaires.

### Consignes générales

- Toutes les données du livrables 2 doivent être **dynamiques** sauf le profil usager (l'authentification sera fait au livrable 3).
- Toutes les sections devront être responsives (supporter les différents formats d'écran).
- Le livrable 2 utilisera la version non sécurisée de l'API.
- Tous les formulaires doivent être validés via JavaScript **avant** d’être soumis au serveur.

### Fonctionnalités demandées

- Page d'accueil:
  - Intégrer la page complètement avec l'API
  - Supporter de marquer un restaurant comme _visité_, ce qui ouvrira la modale de visite (voir détails plus bas)
- Modale de visite d'un restaurant:
  - L'usager doit pouvoir rentrer la date de visite, la cote donnée au restaurant ainsi qu'un commentaire.
- Page d'un restaurant:
  - Intégrer la page complètement avec l'API
  - Bouton pour ajouter le restaurant à une liste de favoris existante
  - Bouton pour entrer une visite d'un restaurant, ouvrant la modale de visite du restaurant.
- Page du profil utilisateur
  - Intégrer la page complètement avec l'API
  - Pour chaque visite d'un restaurant, pouvoir ouvrir la modale de visite d'un restaurant en mode _read-only_ avec les informations reliées à la visite. La page du restaurant doit également être accessible à partir de la modale. 
  - Permettre de créer une liste de restaurants favoris et de lui donner un nom.
  - Visualiser les listes de restaurants favoris de l'usager et leur contenu.
  - Permettre de modifier une liste de restaurants
    - Changer le nom de la liste
    - Ajouter/Retirer des restaurants d'une liste
    - Supprimer une liste
    - Permettre de visualiser un restaurant directement à partir de la liste
- S'assurer que tous les liens soient **dynamiques**
- README adéquat
  - Expliquer comment lancer l’application
  - Donner des détails sur comment voir chacune des pages
    - urls
    - boutons à cliquer
    - facilitez la vie des correcteurs!

## Livrable 3

Le livrable 3 consiste en l'intégration de l'authentification ainsi que l'ajout de certaines fonctionnalités supplémentaires.

### Consignes générales

- Toutes les sections devront être responsives (supporter les différents formats d'écran).
- Le livrable 3 utilisera la version sécurisée de l'API.
- Tous les formulaires doivent être validés via JavaScript **avant** d’être soumis au serveur.
- Vos composants devront avoir une couverture de tests unitaires minimales, fait avec Jest ou Vitest.

### Fonctionnalités demandées

- Modifier le menu afin de supporter les états usager connecté/non connecté.
- Ajouter une page d'authentification
  - L’utilisateur doit pouvoir se connecter avec son courriel et mot de passe
  - Si l'utilisateur n'a pas de compte, il doit pouvoir s'enregistrer en entrant son nom, courriel et mot de passe.
  - L’application doit supporter l'expiration du _token_ usager.
  - La page doit afficher un message d’erreur clair en cas de mauvaise combinaison courriel et mot de passe.
- S'assurer que toutes les actions dans l'application sont indisponibles si l'usager n'est pas connecté, et invite l'usager à se connecter.
  - Valide pour les actions telles que identifier une visite à un restaurant, ajouter un restaurant à une liste de favoris etc.
  - **NOTEZ** que dépendamment de vos choix d'implémentation, il est possible d'utiliser l'API unsecure à ce point.
- Ajouter un mode **map** à la page d'accueil
  - La page d'accueil doit permettre d'alterner entre la liste de restaurants et une vue en mode carte géographique
  - La recherche doit pouvoir s'exécuter en fonction de la position courante de l'usager
  - L'usager doit pouvoir zoomer in/out et se déplacer sur la carte
  - Les fonctionnalités telles que filtering, recherche par nom etc. doivent être 100% fonctionnelles en mode carte.
- Supporter la recherche d'usagers en mode connecté dans la barre de recherche du **menu**
- Permettre d'afficher la liste des followers dans la page profil utilisateur
- Permettre d'afficher la liste des usagers suivis (following) dans la page profil utilisateur
- Permettre de voir le profil d'un usager en mode connecté.
  - Permettre de follow/unfollow cet usager.
- Fonctionnalités avancées (**choisir 2 parmis les propositions suivantes**)
  - La barre de recherche offre l’autocomplétion des résultats pendant que l’utilisateur tappe au clavier
  - Afficher une photo de l’utilisateur avec gravatar
  - L'application permet de supporter un login externe: Google, Facebook etc.
  - Montrer le _feed_ Instagram du restaurant si applicable
  - Obtenir des suggestions de restaurants similaires au restaurant courant
  - Une fonctionnalité de votre choix
    - Cette fonctionnalité doit être approuvée par l'enseignant du cours.
- README adéquat
  - Expliquer comment lancer l’application et les tests
  - Donner des détails sur comment voir chacune des pages
    - urls
    - boutons à cliquer
    - facilitez la vie des correcteurs!
  - Expliquer vos 2 fonctionnalités avancées et comment les voir en action

Bonne chance!
