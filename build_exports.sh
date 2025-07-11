#!/bin/sh

cat src/options_prefs.js | awk -f build_exports.awk > src/EXPORT_options_prefs.js


echo "EXPORT_ versions of common js files created!!!"
