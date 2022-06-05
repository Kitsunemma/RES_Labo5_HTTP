# RES_Labo5_HTTP

**Auteurs:** Emmanuelle Comte et Fabien Terrani

## Partie 1 - Serveur statique 

Dans cette partie, nous avons dû créer et dockeriser un serveur statique Apache.

Voici le *Dockerfile* utilisé pour le serveur statique: 

```dockerfile
FROM httpd:2.4
COPY ./public-html/ /usr/local/apache2/htdocs/
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
```

Comme le projet consiste en une simple page HTML, nous avons décidé de prendre l'image httpd la plus simple. 

Dans cette image, le contenu du site se trouve dans le dossier `/usr/local/apache2/htdocs/` et les fichiers de configuration dans le dossier `/usr/local/apache2/conf/`.

Afin de récupérer le ficher de configuration de base de Apache, nous avons utilisé cette commande: 

```bash
docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf > my-httpd.conf
```

Malheureusement, PowerShell utilise l'operateur `>` pour transférer des fichier texte et non des fichier binaires. Nous avons donc du utilisé cette commande pour récupérer le fichier de configuration dans le bon encodage:
```powershell
Start-Process -FilePath "powershell" -ArgumentList "docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf" -NoNewWindow -Wait -RedirectStandardOutput my-httpd.conf
```

## Partie 2 - Serveur dynamique

Dans cette partie, nous avons dû créer et dockeriser un serveur dynamique utilisant express.js.

Voici le *Dockerfile* utilisé pour le serveur dynamique: 

```dockerfile
FROM node:alpine
EXPOSE 80
WORKDIR /usr/app/
COPY app/ .
RUN npm install

CMD ["node", "index.js"]
```

Comme le serveur dynamique doit utiliser express.js, nous avons choisi d'utiliser l'image alpine de Node car elle est plus légère.

La ligne `RUN npm install` permet d'installer toutes les dépendances qui sont décrites dans le fichier **package.json** dont le contenu est le suivant: 

```json
{
  "dependencies": {
    "express": "^4.18.1"
  }
}
```
Cela nous permet d'utiliser express.js.

Enfin, la ligne `CMD ["node", "index.js"]` du fichier Dockerfile permet de lancer la commande `node index.js` qui permet de lancer le serveur.

## Partie 3 - Reverse proxy

Dans cette partie, nous avons du dû créer et dockeriser un reverse proxy avec Apache. 

### Dockerfile 

Voici le *Dockerfile* utilisé pour le reverse proxy:

```dockerfile
FROM php:5.6-apache
COPY ./conf/ /etc/apache2/
RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

Pour le reverse proxy, nous avons décidé de prendre une image PHP afin de profiter des commandes `a2enmod` et `a2ensite` qui facilitent la configuration du reverse proxy. Dans cette nouvelle image Apache, les fichiers de configuration se trouvent dans le dossier `/etc/apache2/`.

La commande `RUN a2enmod proxy proxy_http` permet d'activer les module **proxy** et **proxy_http**. Sans ces deux modules, il n'est pas possible de faire du reverse proxy sur cette image.

La commande `RUN a2ensite 000-* 001-*` permet d'activer les sites dont la configuration commence par **000-** et **001-** 

### Fichiers de configuration

Le fichier `000-default.conf` ne contient aucune configuration. Cela est utile pour ne pas laisser accès aux serveurs si le client ne spécifie pas l'host voulu dans l'en-tête de la requête.

Le fichier `001-reverse-proxy.conf` quant à  lui, contient la définition du nom du serveur ainsi que des différentes routes pour accéder à l'un ou l'autre des serveur (le statique ou le dynamique).

La définition des routes se fait à l'aide des lignes suivantes:

```apache
ProxyPass "/api/fortune-cookies/" "http://172.17.0.3:3000/"
ProxyPassReverse "/api/fortune-cookies/" "http://172.17.0.3:3000/"

ProxyPass "/" "http://172.17.0.2:80/"
ProxyPassReverse "/" "http://172.17.0.2:80/"
```

Ces 4 lignes sont séparées en deux pour définir deux routes. Les routes les plus spécifiques doivent être déclarées avant les plus générales sinon elles ne seront pas déviées sur la bonne route.

Pour définir une route, il faut deux lignes, la ligne **ProxyPass** et la ligne **ProxyPassReverse**, afin de permettre à Apache de réécrire (si besoin) les requêtes dans les deux sens.
Ces deux lignes contiennent deux arguments, le premier, correspond à ce qui es reçu dans la requête HTTP et le deuxième correspond à la route vers la machine à laquelle on veut envoyer la requête.

> Le port d'écoute du serveur dynamique a changé par rapport à la partie 2 donc la ligne `EXPOSE` du *Dockerfile* du serveur dynamique expose le port 3000 maintenant.

Afin de définir ces routes, nous avons besoin des adresses IP des containers Docker. Pour les trouver, il y a deux commandes possibles: 

1. `docker inspect `*`nomDuContainer`*` | grep -i ipaddress` 
1. `docker network insect bridge`

La première option nous revoit directement les lignes intéressantes grâce au *grep*. Cependant il faut la faire une fois pour chaque serveur. Alors que la deuxième commande nous renvoi toutes les adresses de tous les containers actifs sur un réseau Docker. Cependant, toutes les autres informations du réseau sont aussi présentes.

### Script

Nous avons fait des scripts pour nous aider à lancer et arrêter les containers. En effet, pour espérer avoir toujours les mêmes adresses IP, il nous faut toujours créer les containers dans le même ordre. 

Voici les lignes qui créent les containers:
```bash
docker run -dit --rm --name ctr-stat img-stat
docker run -dit --rm --name ctr-dyn img-dyn
docker run -dit --rm -p 80:80 --name ctr-proxy img-proxy
```

Il faut aussi s'assurer que seul le reverse proxy ait un mapping de port afin que les autres serveurs ne soient pas accessibles sans passer par le reverse proxy.

## Partie 4 - AJAX

Dans cette partie, nous avons dû modifier le serveur statique afin qu'il fasse des requêtes au serveur dynamique en utilisant des requêtes AJAX.

Pour ce faire, il a fallut commencer par importer jQuery. Ceci se fait en 2 étapes:

1. Télécharger le fichier `jquery-3.6.0.min.js`.
1. Ajouter une balise de script dans la page HTML.

Voici la balise ajoutée: 
```html
<script type='text/javascript' src='assets/js/jquery-3.6.0.min.js'></script>
```

Ensuite, nous avons créé un script afin de faire une requête au serveur dynamique et de traiter sa réponse.

Pour ce faire, nous avons utilisé la fonction suivante:
```js
$.getJSON( "/api/fortune-cookies/", ( fortuneCookie ) => {
        // traitement des données récupérées du serveur dynamique
});
```

A nouveau, il faut ajouter une balise script a notre ficher HTML afin qu'il prenne en compte le contenu de notre script:
```html
<script type='text/javascript' src='assets/js/fortune-cookies.js'></script>
```

## Partie 5 - Reverse proxy dynamique

Dans cette partie, nous avons dû remplacer le reverse proxy Apache de la partie 3 par un reverse proxy dynamique afin de ne plus avoir les adresses IP hard-codées. 

Pour ce faire,  nous avons dû utiliser `docker-compose` afin de lancer tous les containers en même temps.

Voici la partie du reverse proxy de Traefik:
```yaml
reverse-proxy:
  # The official v2 Traefik docker image
  image: traefik:v2.7
  # Enables the web UI and tells Traefik to listen to docker
  command: --api.insecure=true --providers.docker
  ports:
    # The HTTP port
    - "80:80"
    # The Web UI (enabled by --api.insecure=true)
    - "8080:8080"
  volumes:
    # So that Traefik can listen to the Docker events
    - /var/run/docker.sock:/var/run/docker.sock
```
Ce bout de fichier `compose.yaml` est complètement repris de la [documentation de Traefik](https://doc.traefik.io/traefik/getting-started/quick-start/). Le point d'entrée principale est le port 80. Le dashboard Traefik se trouve sur le port 8080.

Ensuite, vient la description du serveur statique:
```yaml
http-static:
  image: img-stat
  labels:
    - "traefik.http.routers.rt-not-api.rule=Host(`fortune-cat.local`) && !PathPrefix(`/api/`)"
    - "traefik.http.routers.rt-not-api.service=sv-static" # (facultatif si 1 seul service)
    - "traefik.http.services.sv-static.loadbalancer.server.port=80" # (facultatif si 1 seul port exposé)
```

Le premier label est le plus important. Il permet de définir la route d'accès à ce serveur. Ici, il faut que l'host de la requête soit `fortune-cat.local` et que le chemin ne soit **pas** préfixé par `/api/`.

Les deux autres lignes permettent de définir que le serveur statique (qui est un service Docker) soit aussi un service Traefik et qu'il écoute sur le port 80.

Enfin, vient la description du serveur dynamique:
```yaml
http-dynamic:
  image: img-dyn
  labels:
    - "traefik.http.routers.rt-api.rule=Host(`fortune-cat.local`) && PathPrefix(`/api/`)"
    - "traefik.http.routers.rt-api.middlewares=mw-api-path"
    - "traefik.http.routers.rt-api.service=sv-dynamic" # (facultatif si 1 seul service)
    - "traefik.http.middlewares.mw-api-path.replacepathregex.regex=^/api/(.*)"
    - "traefik.http.middlewares.mw-api-path.replacepathregex.replacement=/$$1"
    - "traefik.http.services.sv-dynamic.loadbalancer.server.port=3000" # (facultatif si 1 seul port exposé)
```

De nouveau, la première ligne est la plus importante pour définir la route d'accès du serveur. Ici, de nouveau le host doit être `fortune-cat.local`, cependant, le chemin doit être préfixé par `/api/`.

Les deux lignes suivantes permettent de définir un middleware et d'associer un service Traefik au routeur. 

Le middleware est utilisé pour réécrire le chemin d'accès afin d'enlever le `/api`. Ceci correspond aux deux lignes suivantes:
```yaml
    - "traefik.http.middlewares.mw-api-path.replacepathregex.regex=^/api/(.*)"
    - "traefik.http.middlewares.mw-api-path.replacepathregex.replacement=/$$1"
```

Enfin, la dernière ligne est utilisée de la même manière que la dernière ligne du serveur statique; elle indique le numéro de port sur lequel le service écoute.

### Plusieurs nœuds serveur

Pour lancer plusieurs instances du même service Docker, il y a deux manières de faire:

1. La première consiste à utiliser l'option `--scale` de la commande `docker-compose up` en lui donnant le nom du service et le nombre d'instances voulues: 
>```bash
>docker-compose up --scale http-dynamic=5
>```
>Pour lancer 5 instances du service `http-dynamic`.

2. La deuxième consiste à ajouter à la définition du service dans le fichier `compose.yaml` la balise `deploy` qui contient une balise  `mode` dont la valeur doit être `replicated` et une balise ` replicas` dont la valeur est le nombre d'instances voulues:
>```yaml
>http-dynamic:
>   #...
>   deploy:
>       mode: replicated
>       replicas: 5
>```
>Pour lancer 5 instances du service `http-dynamic`.

#### Procédure de validation

Une simple commande `docker ps` permet de vérifier que le bon nombre de containers est lancé. On peut aussi le voir en regardant la sortie de la commande `docker-compose up`.

### *Round-robin* vs *sticky session*

Actuellement, Traefik ne supporte que l'algorithme de *round-robin* pour la répartition de charge (cf. [documentation](https://doc.traefik.io/traefik/routing/services/#load-balancing)). Cependant, les `sticky sessions` peuvent influencer ce comportement.

Pour utiliser l'algorithme de *round-robin* avec le serveur dynamique, nous n'avons rien à faire car c'est la configuration par défaut de Traefik.

Par contre, pour utiliser les *sticky sessions* avec le serveur statique, il nous faut ajouter la ligne suivante aux labels du service:
```yaml
- "traefik.http.services.http-static.loadbalancer.sticky.cookie={}"
```

Cependant, si nous voulons setter la valeur `cookie.name` (ou setter une autre propriété du cookie), la ligne précédente peut être remplacée par:

```yaml
- "traefik.http.services.sv-static.loadbalancer.sticky.cookie.name=COOKIE_NAME"
```

Dans notre cas, nous avons donc ajouté cette ligne au service `http-static`: 
```yaml
- "traefik.http.services.sv-static.loadbalancer.sticky.cookie.name=LOAD_BALANCING_ROUTE"
```

#### Procédure de validation

Pour valider que le serveur dynamique est bien en *round-robin*, il suffit de lancer au moins 2 instances du serveur dynamique (avec l'une des deux manières vues dans la rubrique [Plusieurs nœuds serveur](#plusieurs-noeuds-serveur)) et de ne pas mettre l'option `-d` à la commande `docker-compose up` afin de voir les détails.

Une fois les serveur démarrés, il faut ouvrir un navigateur et accéder à la page du serveur statique. 

Dans la console, nous pouvons voir en direct quels serveurs dynamiques répondent aux requêtes:

![](.\img\round-robin dynamic-server.PNG)

Pour valider que le serveur statique utilise bien les *sticky sessions*, il faut cette fois-ci lancer au moins 2 instances du serveur statique et, comme avec le serveur dynamique, ne pas mettre l'option `-d` à la commande `docker-compose up`.

Une fois les serveurs démarrés, ouvrir au moins 2 navigateurs (par exemple Google Chrome et Firefox) et accéder à la page du serveur statique. 

Premièrement, le cookie est affiché sur la page web en bas à droite. Il est donc possible de voir que les navigateurs n'ont pas tous le même cookie.

![](.\img\not-same-cookie-navigateur.PNG)

Deuxièmement, si nous faisons plusieurs `ctrl+F5` sur un des navigateur, nous voyons, dans la console, que c'est toujours le même container qui répond.

![](.\img\sticky-session-static-server.PNG)

#### Remarques

##### Reset d'un cookie

Voici la commande pour reset un cookie (dans le navigateur): `document.cookie = "COOKIE_NAME=; Max-Age=0;"`

##### Traefik et les *sticky session*

Après plusieurs tests, nous avons remarquer que Traefik utilise les cookies pour identifier les serveurs et non les clients. Il est donc possible d'avoir plusieurs client avec la même valeur de cookie car c'est le même serveur qui répond aux clients. Cela arrive si il y a plus de clients que de serveur ou en resettant les cookies. **Le cookie paramétré dans Traefik n'est pas un cookie de session! Cependant, il permet aux cookies de session de fonctionner correctement**.

Il est aussi intéressant de remarquer que les cookies des serveurs sont données aux clients en suivant l'algorithme *round-robin*.

### Gestion dynamique des clusters

Traefik détecte automatiquement les serveurs disponibles et répartit la charge entre eux. Il n'y a donc rien à implémenter pour cette partie.

#### Procédure de validation

Pour valider le fonctionnement de la gestion dynamique, il faut commencer par faire un `docker-compose up`, voir ce qui s'affiche, puis, dans un autre terminal, lancer un autre `docker-compose up` avec l'option `--scale` afin de modifier le nombre d'instance d'un service. 

### Management UI

Afin de pouvoir utiliser le module Dockerode pour gérer notre environnement Docker, nous avons dû ajouter une ligne dans le fichier `package.json` du serveur dynamique. Voici donc le nouveau contenu de ce fichier:
```json
{
  "dependencies": {
    "express": "^4.18.1",
    "dockerode": "^3.3.1"
  }
}
```

Malheureusement, l'ajout de cette dépendance ne suffit pas pour pouvoir modifier l'environnement Docker à l'aide d'une interface web. En effet, afin que le serveur dynamique puisse interagir avec Docker, il nous faut lui ajouter un volume dans le fichier `composer.yaml`: 
```yaml
http-dynamic:
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

Il est intéressant de noter que cette ligne est la même que celle du service Traefik.

Ensuite, nous pouvons étendre notre API en complétant le fichier `index.js` afin de pouvoir répondre aux 3 nouvelles requêtes GET suivantes:

- `GET /docker/container/ls/` pour récupérer la liste des containers Docker.
- `GET /docker/container/stop/?id=XXX` pour stopper le container Docker dont l'id est `XXX`.
- `GET /docker/container/start/?id=XXX` pour lancer le container Docker dont l'id est `XXX`.

Une fois le serveur dynamique complété, nous pouvons ajouter une page HTML dans le serveur statique afin d'afficher une interface graphique pour envoyer les requêtes au serveur dynamique.

Nous avons donc ajouté le fichier `docker-mgmt-ui.html` qui n'a pas vraiment de contenu puisque tout ce qui y est affiché vient des réponses des requêtes au serveur dynamique. Le contenu est donc dans le fichier JavaScript suivant : `docker-mgmt-ui.js`. Les réponses des requêtes sont traitées avec la même fonction que dans la partie 4, c'est-à-dire, avec la fonction `$.getJSON(...);`.

Nous avons en plus ajouté des messages afin d'informer l'utilisateur si un service n'arrive pas à être atteint. Dans le premier cas, nous avons un message nous indiquant que nous n'arrivons pas a joindre le serveur dynamique. Cela se peut se produire si tous les serveurs dynamiques sont down. Dans le deuxième cas, nous avons un message indiquant que nous n'arrivons pas a atteindre l'API de la machine Docker. Cela se produit surtout si nous oublions d'ajouter un volume au service `http-dynamic` dans le fichier `composer.yaml`.

#### Procédure de validation 

Afin de vérifier le bon fonctionnement de notre API, il nous suffit de lancer la commande `docker-compose up`, de se rendre sur la nouvelle page (à l'aide du bouton sur la page principale ou de l'[URL](http://fortune-cat.local/docker-mgmt-ui.html)) et de tester les arrêts et redémarrages des containers. Nous pouvons voir que ces actions sont bien effectuées en examinant la sortie de `docker-compose` dans le terminal.

![](.\img\stop-start-container.PNG)