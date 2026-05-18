resource "aws_iam_role" "lambda_exec" {
  name = "${var.project}-lambda-role"

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
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_s3_access" {
  statement {
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]

    resources = [
      "arn:aws:s3:::${var.project_bucket_name}",
      "arn:aws:s3:::${var.project_bucket_name}/*",
    ]
  }
}

resource "aws_iam_policy" "lambda_s3_access" {
  name   = "${var.project}-lambda-s3-access"
  policy = data.aws_iam_policy_document.lambda_s3_access.json
}

resource "aws_iam_role_policy_attachment" "lambda_s3_attachment" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_s3_access.arn
}


resource "aws_lambda_function" "api" {
  function_name = "${var.project}-api"
  role          = aws_iam_role.lambda_exec.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.app.repository_url}:${var.image_tag != "" ? var.image_tag : "initial"}"
  architectures = ["x86_64"]
  timeout       = 180
  memory_size   = 512

    environment {
    variables = {
      NODE_ENV     = "production"
      DATABASE_URL = "postgresql://${var.db_user}:${local.encoded_db_password}@${aws_db_instance.postgres.address}:5432/${var.db_name}?schema=public&pool_timeout=30"
      PORT = "8080"
      JWT_SECRET = ""
      JWT_EXPIRES_IN = "0.5h"
      REFRESH_EXPIRES_IN = "168h"
      REFRESH_SECRET = ""
      GOOGLE_CLIENT_ID = ""
      GOOGLE_CLIENT_SECRET = ""
      GOOGLE_REDIRECT_URI = "https://${var.subdomain}.${var.domain_name}/api/auth/google/callback"
      FRONTEND_URL = "https://${var.domain_name}"
      DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2"
      DATAMUSE_API_URL = "https://api.datamuse.com/words"
      ML_API_URL = "https://ml-api.${var.domain_name}/api"
      # AWS_REGION = var.aws_region not needed as Lambda provides it by default
      AWS_S3_BUCKET_NAME = "${var.project_bucket_name}"
      PEXELS_API_KEY=""
      PEXELS_BASE_URL="https://api.pexels.com/v1"
      EMAIL_FOR_SENDING_NOTIFICATIONS=""
      RESEND_API_KEY=""
      SMTP_HOST="smtp.resend.com"
      SMTP_PORT="465"
      SMTP_USER="resend"
    }
  }

  ephemeral_storage {
    size = 3008 
  }
  reserved_concurrent_executions = 5

  depends_on = [null_resource.docker_push]
}

resource "aws_lambda_function_url" "api_url" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"
}
