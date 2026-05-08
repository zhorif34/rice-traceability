#!/bin/bash
echo "=== Restarting peer ==="
docker restart peer0.org1.example.com 2>&1
echo "Waiting for peer to be ready..."
sleep 10

echo "=== Restarting chaincode ==="
docker restart riceTraceability_chaincode 2>&1
sleep 5

echo "=== Chaincode logs ==="
docker logs --tail 5 riceTraceability_chaincode 2>&1

echo ""
echo "=== Restarting backend ==="
docker restart rice-traceability-backend-1 2>&1
sleep 5

echo "=== Backend logs ==="
docker logs --tail 5 rice-traceability-backend-1 2>&1
