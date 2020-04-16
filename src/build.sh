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
mkdir build

echo "copying files"

cp -r * build  2> /dev/null

echo "cleaning up"
#remove any build folder in build folder and build.sh
rm -fr build/build*
rm -fr build/$PROG.*.zip
rm -fr build/.git
rm -fr build/*-ff-extra.js
rm -fr build/*-ff.html
rm -fr build/*-ff.js
rm -fr build/*-ff.css
rm -fr build/chrome-api*
rm -fr build/*.psd
rm -fr build/*.sh
rm -fr build/*.awk
rm -fr build/fin*

echo "determining version number"
vers=`cat manifest.json | awk -f build.awk`

echo "manifest version detected: "$vers

cd build

cat manifest.json | grep -v browser_specific_settings > manifest2.json
mv -f manifest2.json manifest.json

find . -name ".DS_Store" -delete

echo "Creating zip"
which zip
if [ $? -eq 0 ]; then
	zip -r "../$PROG.$vers.zip" *
else
	"c:\Program Files\WinRAR\WinRAR.exe" a -afzip -r "../$PROG.$vers.zip" *
fi
echo "Cleaning up temporary files ..."
cd ..
rm -rf build

echo "the built zip is now in the current directory (src)"
mv "$PROG.$vers.zip" "../$PROG.$vers.zip"

echo "The built zip should be up one level from your current location"

cd ..

mv "$PROG.$vers.zip" "../$PROG.$vers.zip"

echo "The built zip should be up two levels from your current location"

cd ..

pwd
echo "the built zip is now in your builds folder two levels up from pwd"

mv "$PROG.$vers.zip" "builds/$PROG.$vers.zip"
cd builds
cp "$PROG.$vers.zip" "$PROG.$vers.xpi"

