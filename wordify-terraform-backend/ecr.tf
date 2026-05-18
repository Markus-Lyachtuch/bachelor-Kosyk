resource "aws_ecr_repository" "app" {
  name = var.ecr_repo_name
  force_delete = true
}

resource "null_resource" "docker_push" {
  triggers = {
    always_run = "${timestamp()}" 
  }

  provisioner "local-exec" {
    interpreter = ["PowerShell", "-Command"]
    
    command = <<-EOT
      $ErrorActionPreference = "Stop"
      
      cmd /C "aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.app.repository_url}"
      
      if ($LASTEXITCODE -ne 0) { throw "Docker Login Failed" }

      docker pull public.ecr.aws/lambda/python:3.10
      docker tag public.ecr.aws/lambda/python:3.10 ${aws_ecr_repository.app.repository_url}:${var.image_tag}
      docker push ${aws_ecr_repository.app.repository_url}:${var.image_tag}
    EOT
  }
}
