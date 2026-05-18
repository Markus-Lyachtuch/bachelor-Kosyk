provider "aws" {
  alias  = "use1"
  region = "us-east-1"
}

resource "aws_acm_certificate" "cert" {
  provider          = aws.use1
  domain_name       = var.dns_site_name
  validation_method = "DNS"
}

resource "aws_route53_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.dns_hosted_zone_id
}

resource "aws_acm_certificate_validation" "cert" {
  provider                = aws.use1
  certificate_arn         = aws_acm_certificate.cert.arn
  validation_record_fqdns = [for record in aws_route53_record.acm_validation : record.fqdn]
}

resource "aws_route53_record" "cf_record" {
  zone_id = var.dns_hosted_zone_id
  name    = var.dns_site_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website_cf.domain_name
    zone_id                = aws_cloudfront_distribution.website_cf.hosted_zone_id
    evaluate_target_health = false
  }
}
