provider "aws" {
  region = "eu-north-1"
}

terraform {
  backend "s3" {
    bucket         = "your-s3-bucket-name"  
    key            = "project/frontend/terraform.tfstate"
    region         = "your-aws-region"
    dynamodb_table = "your-dynamo-db-table"  
    encrypt        = true
  }
}
