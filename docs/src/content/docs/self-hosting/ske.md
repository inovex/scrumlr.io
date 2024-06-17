---
title: SKE (StackIT Kubernetes Engine)
description: Deploy Scrumlr using SKE
sidebar:
    order: 5
---

## Pre-requisites
The following pre-requisites are required to deploy Scrumlr using SKE:
- StackIT Project
- Service Account with a valid Token for the StackIT API

## Deployment

### Clone the Repository
```sh
git clone https://github.com/inovex/scrumlr.io.git
```
```sh
cd scrumlr.io/deployment/ske
```

### Deploy SKE and Postgres Flex using Terraform
In order to gurantee the correct deployment of SKE and Postgres Flex, you can use our premade Terraform code.
```sh
cd terraform
```
You need to create a `terraform.tfvars` file with the following variables:
```
service_account_token = "YOUR_SERVICE_ACCOUNT_TOKEN
project_id = "YOUR_PROJECT_ID"
```
Now you can deploy SKE and Postgres Flex using Terraform.
```sh
terraform init
terraform apply
```

### Deploy Scrumlr
Now that you have successfully deployed SKE and Postgres Flex, you can deploy Scrumlr.
We have created a bash script which will bootstrap the deployment of Scrumlr.
For this to work you need an active `kubectl` context.
If you used the terraform code above, we recommend using `kubecm`for managing your kubectl contexts.
You can install kubecm from [here](https://kubecm.cloud/en-us/install).
```sh
cd ..
kubecm add  -f terraform/kubeconfig.yaml
```
Switch to the external cluster context:
```sh
# Make sure to select the external cluster context
kubecm sw
```
Now you can deploy Scrumlr using the following command:
```sh
./deploy.sh <DB_URL>
```
Make sure to replace `<DB_URL>` with the URL of your Postgres Flex instance.
You can view the url by running the following command:
```sh
cat terrafrom/postgres_connection_url.txt
```

#### DNS Configuration
During Execution the script will ask you to enter the domain you want to use for Scrumlr.
This requires a DNS entry pointing to the LoadBalancer IP of the Ingress Controller.
You can either use your own DNS provider or use the StackIT DNS service.
Stackit provides free DNS subdomains you can use.
You need to create the following A records:
- `www.<your-domain>` pointing to the LoadBalancer IP
- `<your-domain>` pointing to the LoadBalancer IP
After creating the necessary A record simply enter <your-domain> when prompted by the script and press enter.
