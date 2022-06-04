## Partie 1 - Serveur statique 

Dans cette partie, nous avons dû créer et dockeriser un serveur statique Apache.

Voici le *Dockerfile* utilisé pour le serveur statique: 

```dockerfile
FROM httpd:2.4
COPY ./public-html/ /usr/local/apache2/htdocs/

COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf
```

Comme le projet consiste en une simple pag html, nous avons décidé de prendre l'image httpd la plus simple. 

Dans cette image, le contenu du site se trouve dans le dossier `/usr/local/apache2/htdocs/` et les fichiers de configuration dans le dossier `/usr/local/apache2/conf/`.

Afin de récuperer le ficher de configuration de base de Apache, nous avons utilisé cette commande: 
`docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf > my-httpd.conf`

Malheureusement, PowerShell utilise l'operateur `>` pour transferer des fichier text et non des fichier binaires. nous avons donc du utilisé cette commande pour récuperer le fichier de configuration dans le bon encodage:
`COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf`

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

Pour le reverse proxy, nous avons décidé de prendre une image php afin de profiter des commande a2enmod et a2ensite qui facilitent la configuration du reverse proxy. Dans cette nouvelle image Apache, les fichiers de configurations se trouvent dans le dossier `/etc/apache2/`.

La commande `RUN a2enmod proxy proxy_http` permet d'ajouter les module **proxy** et **proxy_http**. Sans ces deux module, il n'est pas possible de faire du reverse proxy sur cette image.

La commande `RUN a2ensite 000-* 001-*` permet d'activer les sites dont la configuration commence par **000-** et **001-** 

### Fichiers de configuration

Le fichier `000-default.conf` ne contient aucune configuration. Cela est utile pour ne pas laisser accès au serveurs si le client ne spécifie pas l'host voulu dans l'en-tête de la requête.

Le fichier `001-reverse-proxy.conf` quant à  lui, contient la définition du nom du serveur ainsi que des différentes routes pour accéder à l'un ou l'autre des serveur (le statique ou le dynamique).

La définition des routes se fait à l'aide des lignes suivantes:

```c
ProxyPass "/api/fortune-cookies/" "http://172.17.0.3:3000/"
ProxyPassReverse "/api/fortune-cookies/" "http://172.17.0.3:3000/"

ProxyPass "/" "http://172.17.0.2:80/"
ProxyPassReverse "/" "http://172.17.0.2:80/"
```

Ces 4 linges sont séparées en deux pour définir deux routes. Les routes les plus spécifiques doivent être déclarées avant les plus générales sinon elles ne seront pas déviées sur la bonne route.

Pour définir une route, il faut deux lignes, la ligne **ProxyPass** et la ligne **ProxyPassReverse**, afin de permettre à Apache de réécrire (si besoin) les requêtes dans les deux sens.
Ces deux lignes contiennent deux arguments, le premier, correspond à ce qui es reçu dans la requête HTTP et le deuxième correspond à la route vers la machine à laquelle on veut envoyer la requête.

> Le port d'écoute du serveur dynamique a changé par rapport à la partie 2 donc la ligne `EXPOSE` du *dockerfile* du serveur dynamique expose le port 3000 maintenant.

Afin de définir ces routes, nous avons besoin des adresses IP des machine dans docker. Pour les trouver, il y a deux commande possible: 

1. `docker inspect `*`nomDuContainer`*` | grep -i ipaddress` 
1. `docker network insect bridge`

La première option nous revoit directement les lignes intéressantes grâce au *grep*. Cependant il faut la faire une fois pour chaque serveur. Alors que la deuxième commande nous revoit toutes les adresses de tous les containers actifs sur docker. Cependant, toutes les autres informations du réseau sont aussi présentes.

### Script

Comme les adresses IP des serveurs sont directement hard-codées dans la configuration du reverse proxy, nous avons fait des scripts pour nous aider à lancer et arrêter les containers. En effet, pour espérer avoir toujours les mêmes adresses IP, il nous faut toujours créer les containers dans le même ordre. 

Voici les lignes qui créent les containers:
```
docker run -dit --rm --name ctr-stat img-stat
docker run -dit --rm --name ctr-dyn img-dyn
docker run -dit --rm -p 80:80 --name ctr-proxy img-proxy
```

Il faut aussi s'assurer que seul le reverse proxy ait un mapping de port afin que les autres serveurs ne soient pas accessible sans passer par le revers proxy.

## Partie 4 - AJAX

Dans cette partie, nous avons dû modifier les serveur statique afin qu'il fassent des requêtes au serveur dynamique en utilisant des requêtes AJAX.

Pour ce faire, il a fallut commencer par importer JQuery. Ceci se fait en 2 étapes:

1. Télécharger le fichier `jquery-3.6.0.min.js`.
1. Ajouter une balise de script dans la page html.

Voici la balise ajoutée: 
```html
<script type='text/javascript' src='assets/js/jquery-3.6.0.min.js'></script>
```

Ensuite, nous avons ajouté un autre script javascript afin de faire une requete au serveur dynamique et de traiter sa réponse.

Pour ce faire, nous avons utilisé la fonction suivante:
```js
$.getJSON( "/api/fortune-cookies/", ( cookie ) => {
        // traitement des données récupérées du serveur dynamique
});
```

A nouveau, il faut ajouter une balise script a notre ficher html afin qu'il prenne en compte le contenu de notre script:
```html
<script type='text/javascript' src='assets/js/fortune-cookies.js'></script>
```

## Partie 5 - Reverse proxy dynamique

Dans cette partie, nous avons dû remplacer le reverse proxy de la partie 3 par un reverse proxy dynamique afin de ne plus avoir les adresses IP hard-codées. 

Pour ce faire,  nous avons dû utiliser docker compose afin de lancer toutes les images en même temps.

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
Ce bout de fichier `compose.yaml` est complètement repris de la [documentation de Traefik](https://doc.traefik.io/traefik/getting-started/quick-start/).
**TODO ECE Plus?**

Ensuite viens la description du serveur statique:
```yaml
http-static:
  image: img-stat
  labels:
    - "traefik.http.routers.rt-not-api.rule=Host(`fortune-cat.local`) && !PathPrefix(`/api/`)"
    - "traefik.http.routers.rt-not-api.service=sv-static" # (facultatif si 1 seul service)
    - "traefik.http.services.sv-static.loadbalancer.server.port=80" # (facultatif si 1 seul port exposé)
```

Le premier label est le plus important. Il permet de définir la route accès à ce serveur. Ici, il faut que l'host de la requête soit `fortune-cat.local` et que le chemin ne soit **pas** prefixé par `/api/`.

Les deux autres linges permettent de définir que le serveur statique (qui est un service Docker) soit aussi un service Traefik et qu'il écoute sur le port 80.

Enfin viens la description du serveur dynamique:
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

De nouveau, la première ligne est la plus imporante pour définire la route d'accès du serveur. Ici, de nouveau le host doit être `fortune-cat.local`, cependant, le chemin doit être préfixé par `/api/`.

Les deux lignes suivantes permettent de définir un middleware et le nom du service Traefik. 

Le middleware est utilisé pour réécrire le chemin d'accès afin d'enlever le `/api`. CCeci correspond aux deux ligne suivantes:
```yaml
    - "traefik.http.middlewares.mw-api-path.replacepathregex.regex=^/api/(.*)"
    - "traefik.http.middlewares.mw-api-path.replacepathregex.replacement=/$$1"
```

Enfin la dernière ligne est utilisée de la même manière que la dernière ligne du serveur statique, elle indique le numéro de port auquel le service écoute.

**TODO ECE** pour démo restart = Scale (+ script)

### Plusieurs noeuds serveur

replica: 2
`docker-compose up -d`

### Round-robin for dynamic server and sticky session

round-robin gratuit

sticky session => réglage Traefik cookie et cookie.name.

Pour le voir, démarrer 2 instances du serveur statique et faire Ctrl+F5 depuis un navigateur A pour voir que l'instance 1 répond à chaque fois. Même chose avec un autre navigateur B qui utilisera l'instance 2.

### Dynamic cluster management

docker-compose up -d --scale http-dynamic=2

### Managmeent UI

npm i dockerode

list container
start ocntainer
stop container
??? (voir ce que Dockerode propose)