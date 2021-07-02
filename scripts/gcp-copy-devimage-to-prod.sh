#!/bin/sh

COMMIT=$(basename "$1")

if [ "$1" = "" ]
then
    echo "no dev image path given (should start with gcr.io)"
    exit 1
elif [ "$2" = "" ]
then
    echo "no prod directory path given"
    exit 1
else
    sudo usermod -a -G docker ${USER}
    gcloud auth login
    gcloud auth configure-docker

    docker pull $1
    docker tag $1 $2$COMMIT
    docker push $2$COMMIT
fi