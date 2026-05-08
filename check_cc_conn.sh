#!/bin/bash
echo "=== Peer chaincode address config ==="
docker exec peer0.org1.example.com cat /etc/hyperledger/fabric/core.yaml 2>&1 | grep -A 5 "chaincodeAddress\|address\|external" | head -20

echo ""
echo "=== Peer environment for chaincode ==="
docker exec peer0.org1.example.com env 2>&1 | grep -iE "chaincode|address|external|builder" | head -10

echo ""
echo "=== Can peer reach chaincode? ==="
docker exec peer0.org1.example.com wget -q -O- http://riceTraceability_chaincode:9999 2>&1 || echo "Cannot reach chaincode"

echo ""
echo "=== Can peer reach chaincode via Docker DNS? ==="
docker exec peer0.org1.example.com nslookup riceTraceability_chaincode 2>&1 || echo "nslookup not available"

echo ""
echo "=== Check peer connectivity to chaincode IP ==="
docker exec peer0.org1.example.com ping -c 1 -W 2 riceTraceability_chaincode 2>&1 || echo "ping failed"
