#!/bin/bash
echo "=== Check if chaincode is listening ==="
docker exec riceTraceability_chaincode netstat -tlnp 2>&1 || docker exec riceTraceability_chaincode ss -tlnp 2>&1 || echo "No netstat/ss available"

echo ""
echo "=== Check from another container on same network ==="
docker exec rice-traceability-backend-1 timeout 3 sh -c 'echo test | head -1 > /dev/tcp/riceTraceability_chaincode/9999 && echo PORT_OPEN || echo PORT_CLOSED' 2>&1 || echo "Cannot test"

echo ""
echo "=== Check chaincode process ==="
docker exec riceTraceability_chaincode ps aux 2>&1 || docker top riceTraceability_chaincode 2>&1

echo ""
echo "=== Chaincode logs (last 10) ==="
docker logs --tail 10 riceTraceability_chaincode 2>&1
