#!/bin/bash
echo "=== Chaincode latest logs ==="
docker logs --since 2m riceTraceability_chaincode 2>&1

echo ""
echo "=== Peer latest logs (last 20) ==="
docker logs --tail 20 peer0.org1.example.com 2>&1
