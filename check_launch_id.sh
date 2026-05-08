#!/bin/bash
echo "=== Chaincode ID ==="
docker exec riceTraceability_chaincode env | grep CHAINCODE_ID 2>&1

echo ""
echo "=== Peer launch error - which build ID? ==="
docker logs peer0.org1.example.com 2>&1 | grep -oE "riceTraceability:[a-f0-9]+" | sort -u

echo ""
echo "=== Chaincode registered with which ID? ==="
docker logs riceTraceability_chaincode 2>&1 | grep -i "chaincode-id\|chaincode_id\|register" | tail -5

echo ""
echo "=== Check if peer has a running chaincode record ==="
docker exec peer0.org1.example.com find /var/hyperledger/production -name "running*" -o -name "launched*" -o -name "started*" 2>&1 | head -10

echo ""
echo "=== Peer full error with context ==="
docker logs peer0.org1.example.com 2>&1 | grep -B2 -A2 "timeout expired while starting" | tail -20
