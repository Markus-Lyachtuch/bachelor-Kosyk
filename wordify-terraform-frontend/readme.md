1. First of all we setup bootstrap mini project with dynamo db table and s3 bucket.
2. Simple usage just use:

- terraform init
- terraform apply -var="backend_bucket_name=your-bucket-name" -var="dynamodb_table_name=your-dynamo-db-table"

3. If eveything is succesfull we can move to main folder and create main infrastructure. Just run the same:

- terraform init
- terraform plan
- teraform apply -auto-approve
