variable "project_bucket_name" {
  type        = string
  default     = ""
  description = "S3 bucket name for project data storage"
}

variable "project" {
  description = "Project name prefix (used for naming resources)"
  type        = string
  default     = ""
}

variable "aws_account_id" {
  description = "account id"
  type        = string
  default     = ""
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = ""
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = ""
}

variable "public_subnets" {
  description = "List of public subnet CIDRs"
  type        = list(string)
  default     = [""]
}

variable "private_subnets" {
  description = "List of private subnet CIDRs"
  type        = list(string)
  default     = [""]
}

variable "availability_zones" {
  description = "AZs to use for subnets"
  type        = list(string)
  default     = [""]
}

variable "task_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory (MB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Number of ECS tasks to run"
  type        = number
  default     = 1
}

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
}

variable "ecr_repo_name" {
  description = "Name of ECR repository"
  type        = string
  default     = ""
}

variable "db_name" {
  description = "Postgres database name"
  type        = string
  default     = ""
}

variable "db_user" {
  description = "Postgres master username"
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t4g.micro"
}

variable "multi_az" {
  description = "Enable multi-AZ deployment (true for production)"
  type        = bool
  default     = false
}

variable "alb_idle_timeout" {
  description = "ALB idle timeout (seconds)"
  type        = number
  default     = 60
}

variable "tags" {
  description = "A map of tags to assign to resources"
  type        = map(string)
  default     = {}
}

variable "domain_name" {
  description = "main domain name (e.g., example.com)"
  type        = string
  default     = ""
}

variable "subdomain" {
  description = "subdomain for the backend (e.g., api)"
  type        = string
  default     = ""
}

variable "enable_https" {
  description = "https certificate enables"
  type        = bool
  default     = true
}
