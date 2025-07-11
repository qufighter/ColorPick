#!/bin/sh

echo "cloning files to suport module insanity..."
./build_exports.sh

echo "moving into directory ColorPick/data..."
cd src
./build.sh $1
