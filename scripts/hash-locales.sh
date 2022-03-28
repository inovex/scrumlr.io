#!/bin/bash
#
# Hash all files in the public/locales directory and return a checksum based on the file content.
# The checksum will be printed to the console.

files=("public/locales/*" "public/locales/**/*")
hashstring=""

for filename in ${files[@]}; do
    if [[ -f $filename ]]
    then
        filehash=($(cksum $filename))
        hashstring=$hashstring${filehash[0]}
    fi
done

hashstring=($(cksum <<< $hashstring))
echo ${hashstring[0]} # Print the checksum, so it can be further processed.
