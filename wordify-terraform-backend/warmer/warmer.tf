variable "backend_url" {
  description = "Full web address to lambda"
  type        = string
  default     = ""
}

resource "aws_cloudwatch_event_connection" "public_api" {
  name               = ""
  description        = "Connection to public API for warming"
  authorization_type = "API_KEY"

  auth_parameters {
    api_key {
      key   = "x-warmer"
      value = "true"
    }
  }
}

resource "aws_cloudwatch_event_api_destination" "warmer_target" {
  name                = "lambda-wordify-api-destination"
  description         = "Target URL for warming"
  invocation_endpoint = var.backend_url
  http_method         = "GET"
  connection_arn      = aws_cloudwatch_event_connection.public_api.arn
}

resource "aws_cloudwatch_event_rule" "warmer_schedule" {
  name                = "api-warmer-schedule"
  description         = "Triggers API warmer every 5 minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "ping_api" {
  rule      = aws_cloudwatch_event_rule.warmer_schedule.name
  target_id = "ping-public-api"
  arn       = aws_cloudwatch_event_api_destination.warmer_target.arn
  role_arn  = aws_iam_role.eventbridge_invoke_api.arn
}

resource "aws_iam_role" "eventbridge_invoke_api" {
  name = "eventbridge-wordify-api-backend-dest-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "eventbridge_invoke_api_policy" {
  name = "allow-invoke-destination"
  role = aws_iam_role.eventbridge_invoke_api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "events:InvokeApiDestination"
        Resource = aws_cloudwatch_event_api_destination.warmer_target.arn
      }
    ]
  })
}
