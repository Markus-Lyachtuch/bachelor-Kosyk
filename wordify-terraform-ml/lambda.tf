resource "aws_iam_role" "lambda_exec_role" {
  name = "${var.lambda_name}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "lambda-ml" {
  function_name = var.lambda_name
  image_uri     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
  package_type  = "Image"
  timeout       = 300
  memory_size   = 6000
  role          = aws_iam_role.lambda_exec_role.arn 
  depends_on    = [null_resource.docker_push]

  environment {
    variables = {      
      AWS_LWA_PASS_THROUGH_PATH = "/api/v3/warmup"
    }
  }

  ephemeral_storage {
    size = 6000
  }
}

resource "aws_lambda_function_url" "ml_lambda_url" {
  function_name      = aws_lambda_function.lambda-ml.function_name 
  authorization_type = "NONE"
  
  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
    max_age           = 86400
  }
}

resource "aws_lambda_permission" "allow_public_url" {
  statement_id           = "AllowPublicFunctionUrlInvocation"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.lambda-ml.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
