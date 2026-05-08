#!/bin/bash
echo "=== Chaincode container full logs ==="
docker logs riceTraceability_chaincode 2>&1 | grep -E "register|establish|ready|error|warn|fail" | tail -20

echo ""
echo "=== Check chaincode gRPC connection to peer ==="
docker exec riceTraceability_chaincode netstat -an 2>&1 | grep -E "7052|ESTABLISHED" || echo "netstat not available"

echo ""
echo "=== Peer debug logs ==="
docker logs --since 5m peer0.org1.example.com 2>&1 | grep -iE "chaincode.*connect|handler|chaincodeStream" | tail -10
