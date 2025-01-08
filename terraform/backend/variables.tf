variable "aws_account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (format: owner/repo)"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
}