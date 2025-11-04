#!/bin/bash

# S3 Deployment Script for Frontend Static Assets
# This script uploads the frontend build to S3 and invalidates CloudFront cache

set -e

S3_BUCKET=${S3_BUCKET:-"travel-platform-frontend"}
CLOUDFRONT_DISTRIBUTION_ID=${CLOUDFRONT_DISTRIBUTION_ID:-""}

echo "Deploying frontend to S3..."

# Build frontend
cd frontend
npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache if distribution ID is provided
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
fi

echo "Deployment complete!"

