#!/bin/sh

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
export REACT_APP_LOCALES_HASH=$(echo ${hashstring[0]}) # Export the hash as environment variable
