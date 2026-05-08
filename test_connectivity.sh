#!/bin/bash
# Test 1: Check if frontend can reach backend via proxy
echo "=== Test 1: Frontend -> Backend via proxy ==="
docker exec rice-traceability-frontend-1 wget -q -O- http://localhost:3000/api/health 2>&1
echo ""

# Test 2: Check frontend logs for proxy issues
echo "=== Test 2: Frontend recent logs ==="
docker logs rice-traceability-frontend-1 2>&1 | tail -15

# Test 3: Check if backend has any recent activity
echo "=== Test 3: Backend recent logs (last 5 lines) ==="
docker logs rice-traceability-backend-1 2>&1 | tail -5

# Test 4: Test the actual farmer batch endpoint
echo "=== Test 4: Direct backend farmer endpoint (no auth) ==="
docker exec rice-traceability-frontend-1 wget -q -O- --post-data='{"test":true}' --header='Content-Type: application/json' http://backend:5000/api/farmer/batch 2>&1
echo ""

# Test 5: Check what port the frontend is bound to
echo "=== Test 5: Frontend listening ports ==="
docker exec rice-traceability-frontend-1 cat /proc/net/tcp 2>&1 | head -10
