# Code Pro Kubernetes Deployment Script for Windows (PowerShell)
# This script automates building the local images and applying K8s manifests.

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Code Pro Kubernetes Deployment..." -ForegroundColor Green

# 1. Build local Docker images
Write-Host "`n[1/6] 📦 Building local Docker images..." -ForegroundColor Cyan
# Since Docker Desktop's Kubernetes shares the host Docker daemon,
# these built images will be instantly available to the cluster.
docker compose -f docker-compose.prod.yml build api web worker

# 2. Apply secrets, configmaps, and infrastructure
Write-Host "`n[2/6] 🔒 Applying Secrets, ConfigMaps, and Infrastructure..." -ForegroundColor Cyan
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/judge0-deployment.yaml

# 3. Wait for PostgreSQL to be ready
Write-Host "`n[3/6] ⏳ Waiting for PostgreSQL database to be ready..." -ForegroundColor Cyan
kubectl rollout status deployment/postgres --timeout=120s

# 4. Run database migrations and seeding
Write-Host "`n[4/6] 🔄 Running database migrations and seeding inside the cluster..." -ForegroundColor Cyan
# Spin up a temporary pod using the api image to run Prisma migrations & seed
# We use the local image since it is available in the shared Docker Desktop daemon
Write-Host "Starting temporary migration pod..." -ForegroundColor Yellow

# Delete any existing db-migrate pod if it was left over
try {
    kubectl delete pod db-migrate --now --wait=true -ErrorAction SilentlyContinue | Out-Null
} catch {}

# Run the migration command and stream logs
kubectl run db-migrate --rm -i --restart=Never `
  --image=ghcr.io/akshatg-coder/codepro-api:latest `
  --image-pull-policy=IfNotPresent `
  --env="DATABASE_URL=postgresql://syncboard:syncboard_secret@db:5432/syncboard" `
  --command -- sh -c "npx prisma db push --schema=packages/db/prisma/schema.prisma --accept-data-loss && npx tsx packages/db/src/seed/index.ts"

Write-Host "Migration and seeding completed successfully!" -ForegroundColor Green

# 5. Apply application deployments (API, Web, Worker, Ingress)
Write-Host "`n[5/6] 🌐 Deploying Code Pro Application (Web, API, Worker)..." -ForegroundColor Cyan
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 6. Wait for deployments to complete
Write-Host "`n[6/6] ⏳ Waiting for application deployments to be ready..." -ForegroundColor Cyan
kubectl rollout status deployment/api --timeout=120s
kubectl rollout status deployment/web --timeout=120s
kubectl rollout status deployment/worker --timeout=120s

Write-Host "`n🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor White
Write-Host "Access the web app via http://localhost" -ForegroundColor Yellow
Write-Host "Access the API via http://localhost/api" -ForegroundColor Yellow
Write-Host "Access the Judge0 API via http://localhost:2358" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor White
