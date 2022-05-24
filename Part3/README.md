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

dans la config du proxy décommenté ServerName

pour ecrir dans le container apt-get update + apt-get install vim

ajouter 
ProxyPass "/api/xxx" "http://172.17.0.3:3000/"
ProxyPassReverse "/api/xxx" "http://172.17.0.3:3000/"


ProxyPass "/" "http://172.17.0.2:80/"
ProxyPassReverse "/" "http://172.17.0.2:80/"