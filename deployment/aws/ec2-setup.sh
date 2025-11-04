#!/bin/bash

# EC2 Setup Script for Travel Platform
# Run this script on a new EC2 instance

set -e

echo "Setting up Travel Platform on EC2..."

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Install Node.js (for local development if needed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Python 3.9
sudo yum install -y python3 python3-pip

# Create application directory
mkdir -p /home/ec2-user/travel-platform
cd /home/ec2-user/travel-platform

# Clone repository (replace with your repo URL)
# git clone <your-repo-url> .

# Set up environment variables
# Create .env files for each service

echo "Setup complete!"
echo "Next steps:"
echo "1. Clone your repository"
echo "2. Set up environment variables in .env files"
echo "3. Run: docker-compose up -d"

