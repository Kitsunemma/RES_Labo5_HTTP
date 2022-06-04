## Part 1

Lancement de Docker
`$ docker build -t static-server .`

`$ docker run -dit --rm --name my-running-app -p 8080:80 static-server`

Pour recuperer la config de base
`$ docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf > my-httpd.conf`

Pour mettre notre config (Dans le dockerfile)
`COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf`

Pour ouvrir un terminal dans le container
`docker exec -it my-running-app /bin/bash`

## Part 2

## Create the image

`docker build -t dynamic-server .`

## Launch the container

`docker run -d --rm -p 80:80 dynamic-server`

## Part 3

Get ip address
`$ docker inspect static | grep -i ipaddress`

sans grep: 
`$ docker network insect bridge`

responsees:
static
"SecondaryIPAddresses": null,
"IPAddress": "172.17.0.2",
        "IPAddress": "172.17.0.2",
dynamic
"SecondaryIPAddresses": null,
"IPAddress": "172.17.0.3",
        "IPAddress": "172.17.0.3",

je crois quil faut le port 80 pour static et 3000 pour dynamic

Changer le nom du ficher de config?

dans la config du proxy décommenté ServerName (nom=demo.res.ch)

pour ecrir dans le container apt-get update + apt-get install vim

ajouter 
ProxyPass "/api/xxx/" "http://172.17.0.3:3000/"
ProxyPassReverse "/api/xxx/" "http://172.17.0.3:3000/"


ProxyPass "/" "http://172.17.0.2:80/"
ProxyPassReverse "/" "http://172.17.0.2:80/"

service apache2 restart

activer a2ensite

pour activer: service apache2 reload

module: a2enmod proxy et proxy_http

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*

Serveur DNS modifier fichier Host

## Part 4

(static contien de quoi faire des requete a dynamique pour aller chercher les données et les afficher)

Ajouter un script javascript dans le static

## Part 5

**IMPORTANT !!!** Traefik ne réécrit PAS le chemin comme Apache.
- Apache remplace `/api/fortune-cookies/` par `/` et ExpressJS lit `/`
- Traefik conserve `/api/fortune-cookies/` et ExpressJS lit `/api/fortune-cookies/`

Pour savoir ce qu'un container affiche, faire :

`docker logs my-container`

Pour afficher les logs en continu :

`docker logs -f my-container`

Pour lancer le service `foo` décrit dans le fichier `compose.yaml` :

`docker-compose up -d foo`

Pour démarrer N instances du service `foo` :

`docker-compose up -d --scale foo=N`

Démarrer tous les services :

`docker-compose up`

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