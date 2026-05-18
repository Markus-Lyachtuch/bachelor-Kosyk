resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%^&*()-_=+[]{}<>?"
}

resource "aws_db_subnet_group" "public" {
  name       = "${var.project}-db-public"
  subnet_ids = module.vpc.public_subnets
}

resource "aws_db_instance" "postgres" {
  identifier          = "${var.project}-postgres"
  engine              = "postgres"
  engine_version      = "15"
  instance_class      = var.db_instance_class
  allocated_storage   = 20
  db_subnet_group_name = aws_db_subnet_group.public.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_name             = var.db_name
  username            = var.db_user
  password            = random_password.db_password.result
  skip_final_snapshot = true
  publicly_accessible = true
  storage_type        = "gp3"
  multi_az            = var.multi_az
}
