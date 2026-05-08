#!/bin/bash
echo "=== Peer logs (last 50 lines) ==="
docker logs --tail 50 peer0.org1.example.com 2>&1 | grep -iE "error|warn|abort|endorse|reject|riceTraceability" | tail -20

echo ""
echo "=== Chaincode logs (last 10) ==="
docker logs --tail 10 riceTraceability_chaincode 2>&1
