terraform {
  required_providers {
    stackit = {
      source  = "stackitcloud/stackit"
      version = "0.19.0"
    }
  }
}

provider "stackit" {
  region                = "eu01"
  service_account_token = var.service_account_token
}
