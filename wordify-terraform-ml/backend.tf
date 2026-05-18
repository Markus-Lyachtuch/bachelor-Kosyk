terraform {
  backend "s3" {
    bucket         = "wordify-ml-tfstate-bucket"
    key            = "project/ml/terraform.tfstate"
    region         = "eu-north-1"
    dynamodb_table = "terraform-ml-lock-table"
    encrypt        = true
  }
}
