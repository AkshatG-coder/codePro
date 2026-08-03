#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Judge0 Deep Diagnostic & Auto-Fix Script
#  Run on DigitalOcean: bash scripts/fix-judge0.sh
# ═══════════════════════════════════════════════════════════════════

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
pass() { echo -e "  ${GREEN}✅ $1${NC}"; }
fail() { echo -e "  ${RED}❌ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "═══════════════════════════════════════════════════"
echo "  Judge0 Deep Diagnostic & Auto-Fix Script"
echo "═══════════════════════════════════════════════════"

# ── 1. Cgroup version ─────────────────────────────────
echo ""
echo "1️⃣  Checking cgroup version..."
CGROUP_V2=false
if [ -f /sys/fs/cgroup/cgroup.controllers ]; then
    fail "System is using cgroups v2 (unified hierarchy)"
    CGROUP_V2=true
    echo "     Judge0 isolate REQUIRES cgroups v1."
    echo ""
    echo "     Checking GRUB config..."
    GRUB_LINE=$(grep "^GRUB_CMDLINE_LINUX=" /etc/default/grub 2>/dev/null || echo "NOT FOUND")
    echo "     Current: $GRUB_LINE"
    if echo "$GRUB_LINE" | grep -q "unified_cgroup_hierarchy=0"; then
        warn "GRUB has the flag but it didn't take effect. May need both params."
    else
        fail "GRUB is missing cgroups v1 flag entirely"
    fi
    echo ""
    echo "     FIX: Run these commands and reboot:"
    echo '     sudo sed -i '"'"'s/GRUB_CMDLINE_LINUX="[^"]*"/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 systemd.legacy_systemd_cgroup_controller"/'"'"' /etc/default/grub'
    echo "     sudo update-grub"
    echo "     sudo reboot"
else
    pass "System is using cgroups v1 (legacy hierarchy)"
fi

# ── 2. Cgroup mounts ──────────────────────────────────
echo ""
echo "2️⃣  Checking cgroup mounts..."
echo "     All cgroup mounts:"
mount | grep cgroup | while read line; do
    echo "     $line"
done

echo ""
echo "     Checking /sys/fs/cgroup/memory..."
if [ -d /sys/fs/cgroup/memory ]; then
    pass "/sys/fs/cgroup/memory directory exists"
    
    # Check if writable
    if touch /sys/fs/cgroup/memory/.judge0_test 2>/dev/null; then
        rm -f /sys/fs/cgroup/memory/.judge0_test
        pass "Memory cgroup is WRITABLE"
    else
        fail "Memory cgroup is READ-ONLY!"
        echo ""
        echo "     Attempting auto-fix: remounting as read-write..."
        if mount -o remount,rw cgroup /sys/fs/cgroup/memory 2>/dev/null; then
            if touch /sys/fs/cgroup/memory/.judge0_test 2>/dev/null; then
                rm -f /sys/fs/cgroup/memory/.judge0_test
                pass "Successfully remounted memory cgroup as rw!"
            else
                fail "Remount succeeded but still not writable"
            fi
        else
            warn "Remount failed. Trying alternative mount..."
            mount -t cgroup -o memory cgroup /sys/fs/cgroup/memory 2>/dev/null && \
                pass "Alternative mount succeeded" || \
                fail "Alternative mount also failed"
        fi
    fi
else
    fail "/sys/fs/cgroup/memory does NOT exist!"
    echo "     This means cgroups v1 memory controller is not available."
    
    # Try to create it
    echo "     Attempting to mount memory cgroup..."
    mkdir -p /sys/fs/cgroup/memory 2>/dev/null
    mount -t cgroup -o memory cgroup /sys/fs/cgroup/memory 2>/dev/null && \
        pass "Successfully mounted memory cgroup!" || \
        fail "Could not mount memory cgroup controller"
fi

# ── 3. Docker info ────────────────────────────────────
echo ""
echo "3️⃣  Docker cgroup configuration..."
DOCKER_CGROUP=$(docker info 2>/dev/null | grep -i "Cgroup Driver" || echo "Unknown")
DOCKER_CGROUPNS=$(docker info 2>/dev/null | grep -i "Cgroup Version" || echo "Unknown")
echo "     $DOCKER_CGROUP"
echo "     $DOCKER_CGROUPNS"

# ── 4. Container status ──────────────────────────────
echo ""
echo "4️⃣  Container status..."
docker compose -f docker-compose.prod.yml ps 2>/dev/null || docker-compose -f docker-compose.prod.yml ps 2>/dev/null

# ── 5. Judge0 logs ────────────────────────────────────
echo ""
echo "5️⃣  Judge0 Server logs (last 5 lines)..."
docker logs codepro_judge0_server --tail 5 2>&1 | head -10

echo ""
echo "6️⃣  Judge0 Workers logs (last 10 lines)..."
docker logs codepro_judge0_workers --tail 10 2>&1 | head -20

# ── 6. Direct Judge0 API test ─────────────────────────
echo ""
echo "7️⃣  Testing Judge0 API with a simple C++ program..."
SUBMIT_RESULT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:2358/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "source_code": "#include <iostream>\nusing namespace std;\nint main() { cout << 42 << endl; return 0; }",
    "language_id": 54,
    "stdin": "",
    "expected_output": "42\n"
  }' 2>/dev/null)

HTTP_CODE=$(echo "$SUBMIT_RESULT" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$SUBMIT_RESULT" | grep -v "HTTP_CODE:")

echo "     HTTP Status: $HTTP_CODE"
echo "     Response: $BODY"

TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    pass "Got token: $TOKEN"
    echo "     Waiting 5 seconds for execution..."
    sleep 5
    
    STATUS=$(curl -s "http://localhost:2358/submissions/$TOKEN?base64_encoded=false&fields=stdout,stderr,status,compile_output,message" 2>/dev/null)
    echo "     Result: $STATUS"
    
    if echo "$STATUS" | grep -q '"id":3'; then
        pass "Judge0 executed code successfully! Status: Accepted"
    elif echo "$STATUS" | grep -q '"id":13'; then
        fail "Judge0 returned Internal Error (status 13)"
        echo "     This confirms the cgroup/sandbox issue."
    elif echo "$STATUS" | grep -q '"id":1\|"id":2'; then
        warn "Still processing. Waiting 5 more seconds..."
        sleep 5
        STATUS=$(curl -s "http://localhost:2358/submissions/$TOKEN?base64_encoded=false&fields=stdout,stderr,status,compile_output,message" 2>/dev/null)
        echo "     Result: $STATUS"
    else
        warn "Unexpected status: $STATUS"
    fi
else
    fail "Could not submit to Judge0 API"
fi

# ── 7. Memory & Disk ──────────────────────────────────
echo ""
echo "8️⃣  System resources..."
echo "     Memory:"
free -h | head -3
echo ""
echo "     Disk:"
df -h / | tail -1

# ── Summary ───────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════"
echo "  SUMMARY & RECOMMENDED FIXES"
echo "═══════════════════════════════════════════════════"
echo ""

if [ "$CGROUP_V2" = true ]; then
    echo "  🔴 CRITICAL: System still on cgroups v2."
    echo "     Run this, then reboot:"
    echo '     sudo sed -i '"'"'s/GRUB_CMDLINE_LINUX="[^"]*"/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 systemd.legacy_systemd_cgroup_controller"/'"'"' /etc/default/grub'
    echo "     sudo update-grub && sudo reboot"
    echo ""
fi

echo "  After reboot (or if already on cgroups v1):"
echo "  1. Remount memory cgroup as writable:"
echo "     sudo mount -o remount,rw cgroup /sys/fs/cgroup/memory"
echo ""
echo "  2. Restart Judge0 containers:"
echo "     cd ~/codePro"
echo "     docker compose -f docker-compose.prod.yml up -d --force-recreate judge0-server judge0-workers"
echo ""
echo "  3. Wait 10s and test again:"
echo "     bash scripts/fix-judge0.sh"
echo ""
echo "  ─── ALTERNATIVE (no cgroup headache) ───"
echo "  Use RapidAPI hosted Judge0 (free tier):"
echo "  1. Go to: https://rapidapi.com/judge0-official/api/judge0-ce"
echo "  2. Subscribe (free) and copy your API key"
echo "  3. Add to docker-compose.prod.yml environment:"
echo "     RAPIDAPI_KEY=your_key_here"
echo "     JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com"
echo "═══════════════════════════════════════════════════"
