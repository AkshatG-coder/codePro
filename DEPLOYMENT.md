# Code Pro Deployment Guide

Welcome to the **Code Pro** deployment guide. This document describes the platform's multi-tier architecture, production containerization via Docker Compose, orchestration using Kubernetes, and the automated CI/CD pipeline.

---

## 🏗️ System Architecture

Code Pro is built as a microservices-based monorepo consisting of:
1. **Next.js Web Frontend**: Server-side rendered UI.
2. **Express API Server**: Handles core platform logic, authentication, and submits jobs to Judge0.
3. **Background Worker**: A lightweight Node.js/TypeScript daemon that polls Judge0 and updates submission statuses.
4. **Judge0 CE**: An open-source, sandbox-secured code execution engine.
5. **PostgreSQL**: Stores persistent relational data (users, problems, submissions, and contest rankings).
6. **Redis**: In-memory message broker used by Judge0 for job queueing.

### Traffic & Data Flow Diagram

```mermaid
graph TD
    Client[User / Browser] -->|HTTP Traffic| Ingress[Ingress Controller / Load Balancer]
    
    Ingress -->|Path: /api/*| API[Express API Server - Port 4000]
    Ingress -->|Path: /*| Web[Next.js Web Frontend - Port 3000]
    
    Web -->|Direct Database Connection| DB[(PostgreSQL DB: syncboard)]
    API -->|Direct Database Connection| DB
    Worker[Code Pro Worker] -->|Poll & Update Status| DB
    
    API -->|Submit Code Batches| JServer[Judge0 CE Server - Port 2358]
    Worker -->|Poll for Submissions| JServer
    
    JServer -->|Job Storage| DB
    JServer -->|Job Queueing| Redis[(Redis Broker)]
    JWorker[Judge0 CE Worker] -->|Execute & Evaluate| Redis
```

---

## 🐳 Option 1: Containerized Deployment via Docker Compose

We provide two different Docker Compose configurations depending on your requirements:

### A. Development Mode (Infrastructure-Only)
In development, the databases and Judge0 run in containers while you run the application code locally for rapid hot-reloading.

1. **Start infrastructure services**:
   ```bash
   docker compose up -d
   ```
   *This starts PostgreSQL, Redis, and Judge0.*
2. **Install node dependencies and push schema**:
   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```
3. **Start the local development server**:
   ```bash
   npm run dev
   ```

### B. Production Mode (Full Stack in Containers)
In production, all services—including the Web, API, and Worker applications—are built as optimized production containers.

1. **Verify your environment variables**:
   Create a root `.env` or verify that your services are pointing to `db` instead of `localhost` in production.
2. **Build and start the complete stack**:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. **How it works behind the scenes**:
   * **`db-migrate`**: Spins up temporarily to run `npx prisma db push` and `npx tsx seed` to prepare the database.
   * **Health checks**: Services like `api` and `web` wait to launch until `db-migrate` has successfully exited.
4. **Access the application**:
   * Web App: [http://localhost:3000](http://localhost:3000)
   * API Server: [http://localhost:4000](http://localhost:4000)
   * Judge0 API: [http://localhost:2358](http://localhost:2358)

---

## ☸️ Option 2: Orchestration via Kubernetes (K8s)

For high-availability, scalability, and rolling updates, we deploy Code Pro to Kubernetes.

### Manifest Configuration Structure
The `k8s/` folder contains standard declarative manifests:
* **`secrets.yaml`**: Contains Base64-encoded credentials (DB connection strings, JWT/OAuth secrets).
* **`postgres-deployment.yaml`**: Sets up PostgreSQL with a 2Gi `PersistentVolumeClaim` (PVC) for data durability and an init script ConfigMap to automatically bootstrap the `judge0` database.
* **`redis-deployment.yaml`**: Runs a Redis deployment for Judge0 queueing.
* **`judge0-deployment.yaml`**: Deploys Judge0 Server (privileged mode for sandboxing) and Workers using a central ConfigMap.
* **`api-deployment.yaml`**: Express backend API with resource limits, liveness, and readiness probes.
* **`web-deployment.yaml`**: Next.js frontend with resource limits, liveness, and readiness probes.
* **`worker-deployment.yaml`**: Evaluator worker listening to Judge0.
* **`ingress.yaml`**: NGINX Ingress controller configuration routing `/api` to the backend and `/` to the frontend.

### Automated Deployment to Local Cluster
If you are running a local Kubernetes cluster (such as the built-in Kubernetes in **Docker Desktop**, **Minikube**, or **Kind**), you can automate the entire build, deployment, and database migration process using the provided scripts.

**On Windows (PowerShell):**
```powershell
./scripts/k8s-deploy.ps1
```

**On Linux / macOS (Bash):**
```bash
chmod +x ./scripts/k8s-deploy.sh
./scripts/k8s-deploy.sh
```

**What the script automates:**
1. Builds the latest `api`, `web`, and `worker` images locally.
2. Deploys the persistent volumes, database services, and cache services.
3. Spins up a temporary Kubernetes job to run `prisma db push` and `prisma db seed` in order to initialize the database tables and sample problems inside Kubernetes.
4. Applies all core application deployments.
5. Monitors rollout progress until all services are healthy and ready to receive traffic.

---

## 🔄 CI/CD Pipeline (GitHub Actions)

The repository features an automated workflow configured in [ci-cd.yml](file:///.github/workflows/ci-cd.yml) that triggers on pushes or pull requests to the `main` branch.

### 1. Integration Phase (CI)
* Clones the repository.
* Installs dependencies via `npm ci`.
* Generates the Prisma client types.
* Lints the codebase (`npm run lint`).
* Compiles the Next.js, Express, and Worker source code to check for compilation/type errors (`npm run build`).

### 2. Delivery Phase (CD)
* Automatically runs after the Integration Phase passes.
* Logs into the **GitHub Container Registry (GHCR)**.
* Dynamically builds Docker images for `api`, `web`, and `worker` using Docker Buildx and caches.
* Tags and pushes the resulting images to `ghcr.io/akshatg-coder/codepro-<service>:latest`.
