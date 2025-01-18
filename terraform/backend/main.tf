terraform {
  backend "s3" {
    bucket         = "infinite-cookbook-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"

    # dynamodb_table = "infinite-cookbook-terraform-state-lock"
    # encrypt        = true
  }

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
  force_delete = true

  lifecycle {
    prevent_destroy = false
    ignore_changes = [name]
  }
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
  ephemeral_storage {
    size = 1024
  }

  environment {
    variables = {
      DATABASE_URL = "postgresql+asyncpg://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
      GROQ_API_KEY = var.groq_api_key
      EXA_API_KEY = var.exa_api_key
      PYTHONUNBUFFERED = "1"
      LOG_LEVEL = "INFO"
      AWS_LAMBDA_LOG_LEVEL = "INFO"
      PYTHONIOENCODING = "UTF-8"
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

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "infinite-cookbook-vpc"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "infinite-cookbook-igw"
  }
}

resource "aws_subnet" "public" {
  count             = 2  # Create 2 subnets for high availability
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = "us-east-1${count.index == 0 ? "a" : "b"}"
  map_public_ip_on_launch = true

  tags = {
    Name = "infinite-cookbook-public-${count.index + 1}"
  }
}

# resource "aws_subnet" "private" {
#   count             = 2
#   vpc_id            = aws_vpc.main.id
#   cidr_block        = "10.0.${count.index + 10}.0/24"  # Using different CIDR range from public subnets
#   availability_zone = "us-east-1${count.index == 0 ? "a" : "b"}"

#   tags = {
#     Name = "infinite-cookbook-private-${count.index + 1}"
#   }
# }

# Create route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "infinite-cookbook-public"
  }
}

# Associate public subnets with the public route table
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# For API Gateway logging
resource "aws_iam_role" "cloudwatch" {
  name = "api-gateway-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "cloudwatch" {
  name = "api-gateway-cloudwatch-policy"
  role = aws_iam_role.cloudwatch.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# Make sure API Gateway account settings use the CloudWatch role
resource "aws_api_gateway_account" "main" {
  cloudwatch_role_arn = aws_iam_role.cloudwatch.arn
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 14
}

resource "aws_iam_role_policy" "lambda_logging" {
  name = "lambda_logging"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = ["${aws_cloudwatch_log_group.lambda.arn}:*"]
      }
    ]
  })
}