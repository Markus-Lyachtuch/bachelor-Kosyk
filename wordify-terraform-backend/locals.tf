locals {
  db_password         = random_password.db_password.result
  encoded_db_password = urlencode(local.db_password)
}

locals {
  lambda_domain = replace(aws_lambda_function_url.api_url.function_url, "https://", "")
  lambda_origin_domain = trimsuffix(local.lambda_domain, "/")
}
