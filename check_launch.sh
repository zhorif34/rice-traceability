#!/bin/bash
echo "=== Peer chaincode list ==="
docker exec peer0.org1.example.com peer chaincode list \
  --installed 2>&1

echo ""
echo "=== Check chaincode containers peer sees ==="
docker exec peer0.org1.example.com ls -la /var/hyperledger/production/chaincodes/ 2>&1 || echo "No chaincodes dir"

echo ""
echo "=== Check chaincode launch info ==="
docker exec peer0.org1.example.com ls -laR /var/hyperledger/production/externalbuilder/ 2>&1 | head -30
