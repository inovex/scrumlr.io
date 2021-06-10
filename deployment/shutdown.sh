#!/bin/bash

for d in ./*/ ;
do
    kubectl delete -f $d;
done

