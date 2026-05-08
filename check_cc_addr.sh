#!/bin/bash
echo "=== Check chaincode connection info ==="
docker exec peer0.org1.example.com peer lifecycle chaincode queryinstalled 2>&1 || true

echo ""
echo "=== Try with admin cert ==="
docker exec -e CORE_PEER_MSPCONFIGPATH=/opt/fabric/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp peer0.org1.example.com peer lifecycle chaincode queryinstalled 2>&1 || true

echo ""
echo "=== Check peer file system for chaincode info ==="
docker exec peer0.org1.example.com ls -la /opt/fabric/crypto/ 2>&1 || true
docker exec peer0.org1.example.com find /var/hyperledger/production -name "*.json" -path "*chaincode*" 2>&1 | head -10 || true

echo ""
echo "=== Check external chaincode discovery ==="
docker exec peer0.org1.example.com cat /var/hyperledger/production/chaincodes/riceTraceability.1.0/connection.json 2>&1 || echo "No connection.json at old path"
docker exec peer0.org1.example.com find /var/hyperledger -name "connection.json" 2>&1 | head -5
