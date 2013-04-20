#!/bin/sh
# This script builds the project as a chrome zip upload
# it should only be run from the directory that it is in

PROG="ColorPick"
mani="manifest.json"
mfj=`ls manifest.json`

if [ "$mfj" != "$mani" ]; then
   echo "manifest not found"
   exit
else
   echo "manifest found"
fi

rm -fr build
mkdir build
mkdir build/1.0

echo "copying files"

cp -r * build/1.0  2> /dev/null

echo "cleaning up"
#remove any build folder in build folder and build.sh
rm -fr build/1.0/build*
rm -fr build/1.0/$PROG.*.zip
rm -fr build/1.0/.git

echo "determining version number"
vers=`cat manifest.json | awk -f build.awk`

echo $vers

cd build

echo "Creating zip"
#gzip -qr9X "../$PROG.$vers.zip" *
"c:\Program Files\WinRAR\WinRAR.exe" a -afzip -r "../$PROG.$vers.zip" *

echo "Cleaning up temporary files ..."
cd ..
rm -rf build

echo "the built zip is now in the current directory"
mv "$PROG.$vers.zip" "../$PROG.$vers.zip"

echo "The built zip should be up one level from your current location"

cd ..
pwd
echo "the built zip is now in your builds folder one level up from pwd"

mv "$PROG.$vers.zip" "builds/$PROG.$vers.zip"

