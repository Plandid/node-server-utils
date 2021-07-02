#!/bin/sh

if [ "$1" = "" ]; then
    echo "No commit message passed"
    exit 1
else
    npm run increment-major
    git add .
    if npm run test ; then
        git commit --no-verify -m "$1"
        exit 0
    else
        exit 1
    fi
fi