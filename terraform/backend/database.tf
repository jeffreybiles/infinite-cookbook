# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier        = "infinite-cookbook"
  engine            = "postgres"
  engine_version    = "15.10"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "recipes"
  username = "postgres"
  password = var.db_password

  # Allow public access for development (be cautious in production!)
  publicly_accessible    = true
  skip_final_snapshot   = true
  vpc_security_group_ids = [aws_security_group.postgres.id] // this is causing a warning, wrong format
  db_subnet_group_name = aws_db_subnet_group.postgres.name

  apply_immediately = false
  delete_automated_backups = true
  auto_minor_version_upgrade = true
  monitoring_interval = 0
  copy_tags_to_snapshot = false
  performance_insights_enabled = false
}

resource "aws_db_subnet_group" "postgres" {
  name       = "infinite-cookbook-postgres"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "infinite-cookbook-postgres"
  }
}

# Security group for RDS
resource "aws_security_group" "postgres" {
  name        = "infinite-cookbook-postgres"
  description = "Security group for RDS instance"
  vpc_id      = aws_vpc.main.id
  revoke_rules_on_delete = false

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = ""
    ipv6_cidr_blocks = []
    prefix_list_ids = []
    security_groups = []
    self = false
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = ""
    ipv6_cidr_blocks = []
    prefix_list_ids = []
    security_groups = []
    self = false
  }
}