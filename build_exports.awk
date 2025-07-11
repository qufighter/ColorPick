#!/bin/awk
# This script copies files and makes them module compatible if the files are ready for that noise
# author  < http://vidsbee.com >

BEGIN{
  FS=";"
}

{
  split($1,k,"export ")
  if( k[1]=="//" || k[1] == "// "){
    sub("// export", "//export", $1)
    sub("//export", "export", $1)
    print $1
  }else{
    split($1,k,"import ")
    if( k[1]=="//" || k[1] == "// "){
      sub("// import", "//import", $1)
      sub("//import", "import", $1)
      print $1
    }else{
     print $0
    }
  }
}

END{ }
