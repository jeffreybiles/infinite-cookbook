output "api_endpoint" {
  value = aws_apigatewayv2_stage.lambda.invoke_url
}

output "database_url" {
  sensitive = true
  value     = "postgresql://${aws_db_instance.postgres.username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
}