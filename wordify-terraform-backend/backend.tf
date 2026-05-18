terraform {
  backend "s3" {
    bucket         = "your-s3-bucket-name"
    key            = "project/backend/terraform.tfstate"
    region         = "your-aws-region"
    dynamodb_table = "your-dynamodb-table-name"
    encrypt        = true
  }
}
