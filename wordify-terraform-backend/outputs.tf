output "db_endpoint" {
  description = "Postgres endpoint"
  value       = aws_db_instance.postgres.address
}

output "db_url" {
  description = "Postgres db url"
  value = "postgresql://${var.db_user}:${local.encoded_db_password}@${aws_db_instance.postgres.address}:5432/${var.db_name}?schema=public"
  sensitive = true
}

output "api_public_url" {
  value = "https://${var.subdomain}.${var.domain_name}"
}
