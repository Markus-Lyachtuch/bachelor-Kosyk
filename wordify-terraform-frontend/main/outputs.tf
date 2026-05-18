output "website_url" {
  value       = aws_cloudfront_distribution.website_cf.domain_name
  description = "CloudFront distribution URL"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.website_cf.id
  description = "CloudFront distribution ID"
}
