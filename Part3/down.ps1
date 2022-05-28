docker kill ctr-stat
docker kill ctr-dyn
docker kill ctr-proxy

docker image rm img-stat
docker image rm img-dyn
docker image rm img-proxy

docker image ls -a
