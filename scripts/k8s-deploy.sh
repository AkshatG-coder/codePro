#!/bin/bash
# Code Pro Kubernetes Deployment Script (Bash)
# This script automates building the local images and applying K8s manifests.

set -e

echo -e "\033[0;32m🚀 Starting Code Pro Kubernetes Deployment...\033[0m"

# 1. Build local Docker images
echo -e "\n\033[0;36m[1/6] 📦 Building local Docker images...\033[0m"
# Since Docker Desktop's Kubernetes shares the host Docker daemon,
# these built images will be instantly available to the cluster.
docker compose -f docker-compose.prod.yml build api web worker

# 2. Apply secrets, configmaps, and infrastructure
echo -e "\n\033[0;36m[2/6] 🔒 Applying Secrets, ConfigMaps, and Infrastructure...\033[0m"
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/judge0-deployment.yaml

# 3. Wait for PostgreSQL to be ready
echo -e "\n\033[0;36m[3/6] ⏳ Waiting for PostgreSQL database to be ready...\033[0m"
kubectl rollout status deployment/postgres --timeout=120s

# 4. Run database migrations and seeding
echo -e "\n\033[0;36m[4/6] 🔄 Running database migrations and seeding inside the cluster...\033[0m"
# Spin up a temporary pod using the api image to run Prisma migrations & seed
echo -e "\033[0;33mStarting temporary migration pod...\033[0m"

# Delete any existing db-migrate pod if it was left over
kubectl delete pod db-migrate --now --wait=true 2>/dev/null || true

# Run the migration command and stream logs
kubectl run db-migrate --rm -i --restart=Never \
  --image=ghcr.io/akshatg-coder/codepro-api:latest \
  --image-pull-policy=IfNotPresent \
  --env="DATABASE_URL=postgresql://syncboard:syncboard_secret@db:5432/syncboard" \
  --command -- sh -c "npx prisma db push --schema=packages/db/prisma/schema.prisma --accept-data-loss && npx tsx packages/db/src/seed/index.ts"

echo -e "\033[0;32mMigration and seeding completed successfully!\033[0m"

# 5. Apply application deployments (API, Web, Worker, Ingress)
echo -e "\n\033[0;36m[5/6] 🌐 Deploying Code Pro Application (Web, API, Worker)...\033[0m"
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# 6. Wait for deployments to complete
echo -e "\n\033[0;36m[6/6] ⏳ Waiting for application deployments to be ready...\033[0m"
kubectl rollout status deployment/api --timeout=120s
kubectl rollout status deployment/web --timeout=120s
kubectl rollout status deployment/worker --timeout=120s

echo -e "\n\033[0;32m🎉 Deployment completed successfully!\033[0m"
echo -e "--------------------------------------------------------"
echo -e "\033[0;33mAccess the web app via http://localhost\033[0m"
echo -e "\033[0;33mAccess the API via http://localhost/api\033[0m"
echo -e "\033[0;33mAccess the Judge0 API via http://localhost:2358\033[0m"
echo -e "--------------------------------------------------------"
