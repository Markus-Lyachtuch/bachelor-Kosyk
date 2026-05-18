variable "aws_s3_bucket" {
  type        = string
  default     = ""
  description = "description"
}

variable "dns_hosted_zone_id" {
  type        = string
  default     = ""
  description = "hosted zone id for the domain name"
}

variable "dns_site_name" {
  type        = string
  default     = ""
  description = "Domain name for website"
}
