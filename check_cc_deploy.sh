#!/bin/bash
echo "=== Chaincode address info ==="
docker inspect riceTraceability_chaincode --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>&1

echo ""
echo "=== Chaincode server address in package ==="
docker exec riceTraceability_chaincode cat /package/src/index.js 2>&1 | head -5
echo "..."
docker exec riceTraceability_chaincode env 2>&1 | grep -i "chaincode\|address\|port" | head -10

echo ""
echo "=== How was chaincode deployed? Check peer for installed chaincode ==="
docker exec peer0.org1.example.com peer lifecycle chaincode queryinstalled 2>&1 | head -20

echo ""
echo "=== Check committed chaincode ==="
docker exec peer0.org1.example.com peer lifecycle chaincode querycommitted --channelID mychannel 2>&1
