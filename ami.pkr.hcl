variable "aws_region" {
  type    = string
  default = ""
}

variable "aws_access_key" {
  type    = string
  default = ""
}

variable "aws_secret_key" {
  type    = string
  default = ""
}

variable "base_ami_dev" {
  type    = string
  default = "ami-0dfcb1ef8550277af"
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}
source "amazon-ebs" "my-ami" {
  access_key      = "${var.aws_access_key}"
  secret_key      = "${var.aws_secret_key}"
  region          = "${var.aws_region}"
  ami_name        = "csye6225_{{timestamp}}"
  ami_description = "AMI for webapp"
  ami_regions = [
    "us-east-1",
  ]
  ami_users = ["916955218910"]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }
  profile       = "dev"
  instance_type = "t2.micro"
  source_ami    = "${var.base_ami_dev}"

  ssh_username = "${var.ssh_username}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
}
build {
  sources = ["source.amazon-ebs.my-ami"]

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/home/ec2-user/webapp.zip"
  }

  provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  provisioner "shell" {
    inline = [
      "${file("nodePostgres.sh")}"
    ]
    pause_before = "10s"
  }
}