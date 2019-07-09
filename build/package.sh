#!/bin/bash

NAME="container-proxy"

VERSION=$(sed -nE 's/^.*"version"[[:space:]]*:[[:space:]]*"([^"]*).*$/\1/p' src/manifest.json)

#TODO Stop if Git is in an unclean state
mkdir -p dist
cd src
zip -r ../dist/${NAME}-v${VERSION}.xpi *
