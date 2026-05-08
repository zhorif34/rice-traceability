#!/bin/bash
echo "=== Peer recent logs ==="
docker logs --since 2m peer0.org1.example.com 2>&1 | grep -iE "error|warn|reject|endorse|submit|chaincode" | head -20

echo ""
echo "=== Chaincode recent logs ==="
docker logs --since 2m riceTraceability_chaincode 2>&1 | grep -iE "error|warn|invoke|request" | head -10
