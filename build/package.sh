#!/bin/bash

NAME="container-proxy"

VERSION=$(sed -nE 's/^.*"version"[[:space:]]*:[[:space:]]*"([^"]*).*$/\1/p' src/manifest.json)

mkdir -p dist
cd src
zip -r ../dist/${NAME}-v${VERSION}.xpi *
