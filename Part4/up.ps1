docker build --no-cache -t img-stat ./static-server/
docker build --no-cache -t img-dyn ./dynamic-server/
docker build --no-cache -t img-proxy ./reverse-proxy/

docker run -dit --rm --name ctr-stat img-stat
docker run -dit --rm --name ctr-dyn img-dyn
docker run -dit --rm -p 80:80 --name ctr-proxy img-proxy

docker ps -a
