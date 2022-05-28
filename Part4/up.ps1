docker build --no-cache -t img-stat ./static-server/
docker build --no-cache -t img-dyn ./dynamic-server/
docker build --no-cache -t img-proxy ./reverse-proxy/

docker run -d --rm --name ctr-stat img-stat
docker run -d --rm --name ctr-dyn img-dyn
docker run -d --rm -p 80:80 --name ctr-proxy img-proxy

docker ps -a
