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