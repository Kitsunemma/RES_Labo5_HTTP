docker container prune --force

docker image rm img-stat
docker image rm img-dyn

docker build --no-cache -t img-stat ./static-server/
docker build --no-cache -t img-dyn ./dynamic-server/

docker image ls -a