#!/bin/bash
# ── Judge0 Diagnostic & Fix Script ──────────────────────────────
# Run this on your DigitalOcean server: bash scripts/debug-judge0.sh
# From the ~/codePro directory

echo "═══════════════════════════════════════════════════"
echo "  Judge0 Diagnostic Script"
echo "═══════════════════════════════════════════════════"

echo ""
echo "1️⃣  Checking container status..."
docker compose -f docker-compose.prod.yml ps

echo ""
echo "2️⃣  Judge0 Server logs (last 30 lines)..."
docker logs codepro_judge0_server --tail 30 2>&1

echo ""
echo "3️⃣  Judge0 Workers logs (last 30 lines)..."
docker logs codepro_judge0_workers --tail 30 2>&1

echo ""
echo "4️⃣  App Worker logs (last 20 lines)..."
docker logs codepro_app_worker --tail 20 2>&1

echo ""
echo "5️⃣  Testing Judge0 API from host..."
curl -s http://localhost:2358/statuses | head -c 200
echo ""

echo ""
echo "6️⃣  Testing Judge0 API from worker container..."
docker exec codepro_app_worker sh -c "wget -qO- http://judge0-server:2358/statuses 2>&1 | head -c 200" 2>&1 || echo "FAILED - worker cannot reach Judge0"

echo ""
echo "7️⃣  Checking judge0 database exists..."
docker exec codepro_db psql -U codepro -lqt 2>&1 | grep judge0 || echo "❌ judge0 database does NOT exist!"

echo ""
echo "8️⃣  Memory & Disk check..."
free -h
df -h /

echo ""
echo "═══════════════════════════════════════════════════"
echo "  If Judge0 containers are not running, try:"
echo "  docker compose -f docker-compose.prod.yml up -d judge0-server judge0-workers"
echo ""
echo "  If judge0 DB is missing:"
echo "  docker exec codepro_db psql -U codepro -c 'CREATE DATABASE judge0;'"
echo "  Then restart Judge0:"
echo "  docker compose -f docker-compose.prod.yml restart judge0-server judge0-workers"
echo "═══════════════════════════════════════════════════"
