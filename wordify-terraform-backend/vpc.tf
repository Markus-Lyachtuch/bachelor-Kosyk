module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name = "${var.project}-vpc"
  cidr = var.vpc_cidr

  azs             = var.availability_zones
  public_subnets  = var.public_subnets

  enable_nat_gateway = false
  single_nat_gateway = false

  enable_dns_support   = true
  enable_dns_hostnames = true
}
