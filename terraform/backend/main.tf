terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# ECR Repository
resource "aws_ecr_repository" "app" {
  name = "infinite-cookbook-api"
  image_tag_mutability = "MUTABLE"
}

# Lambda Function
resource "aws_lambda_function" "api" {
  function_name = "infinite-cookbook-api"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.app.repository_url}:latest"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 30
  memory_size   = 256
  skip_destroy  = false
  reserved_concurrent_executions = -1
  publish = false
  tracing_config {}
  ephemeral_storage {}
  logging_config {}

  environment {
    variables = {
      DATABASE_URL = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
    }
  }
  depends_on = [aws_db_instance.postgres]
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "infinite-cookbook-lambda"
  max_session_duration = 3600
  force_detach_policies = false
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  inline_policy {}
}

# API Gateway
resource "aws_apigatewayv2_api" "lambda" {
  name          = "infinite-cookbook-api"
  protocol_type = "HTTP"

  api_key_selection_expression = "$request.header.x-api-key"
  route_selection_expression  = "$request.method $request.path"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id
  name   = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id
  integration_uri    = aws_lambda_function.api.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
  connection_type = "INTERNET"
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_route" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
  api_key_required = false
  authorization_type = "NONE"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}