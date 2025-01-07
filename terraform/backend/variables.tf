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

variable "groq_api_key" {
  description = "GROQ API Key"
  type        = string
  sensitive   = true
}

variable "exa_api_key" {
  description = "EXA API Key"
  type        = string
  sensitive   = true
}