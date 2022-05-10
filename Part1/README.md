## Part1

Lancement de Docker
$ docker build -t my-apache2 .
$ docker run -dit --name my-running-app -p 8080:80 my-apache2

Pour recuperer la config de base
$ docker run --rm httpd:2.4 cat /usr/local/apache2/conf/httpd.conf > my-httpd.conf

Pour mettre notre config (Dans le dockerfile)
COPY ./my-httpd.conf /usr/local/apache2/conf/httpd.conf