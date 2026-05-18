resource "aws_cloudwatch_event_rule" "warmer_schedule" {
  name                = "api-warmer-schedule"
  description         = "Triggers Lambda warmer every 5 minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "ping_lambda" {
  rule      = aws_cloudwatch_event_rule.warmer_schedule.name
  target_id = "warmup-lambda"
  arn       = aws_lambda_function.lambda-ml.arn

  input = jsonencode({
    source = "aws.events"
    detail = {
      type = "warmup"
    }
  })
}

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda-ml.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.warmer_schedule.arn
}
