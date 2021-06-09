#!/bin/bash

for d in ./*/ ;
do
    kubectl delete -f $d;
done

# kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml
