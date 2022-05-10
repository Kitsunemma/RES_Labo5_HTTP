## Part1

Lancement de Docker
$ docker build -t apache-server-part1 .
$ docker run -dit --rm --name my-running-app -p 8080:80 apache-server-part1 

Pour recuperer la config de base
$ docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf > my-httpd.conf

Pour mettre notre config (Dans le dockerfile)
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf

Pour ouvrir un terminal dans le container
docker exec -it my-running-app /bin/bash

On arrive dans /usr/local/apache2
puis faut faire un cd conf pour trouvver le fichier httpd.conf