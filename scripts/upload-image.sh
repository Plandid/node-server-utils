#!/bin/sh

if [ "$1" = "" ]
then
    echo "no image name given"
    exit 1
elif [ "$2" = "" ]
then
    echo "no upload directory path given"
    exit 1
else
    sudo usermod -a -G docker ${USER}
    gcloud auth login
    gcloud auth configure-docker

    docker tag $1 $2$1
    docker push $2$1
fi