#!/bin/bash
echo "=== Peer core.yaml external builder config ==="
docker exec peer0.org1.example.com cat /etc/hyperledger/fabric/core.yaml 2>&1 | grep -A 30 "externalBuilders:" | head -35

echo ""
echo "=== Peer external builder scripts ==="
docker exec peer0.org1.example.com ls -la /opt/fabric/externalbuilders/ 2>&1 || true
docker exec peer0.org1.example.com find /opt/fabric/externalbuilders -type f 2>&1 || true

echo ""
echo "=== Check builder bin directory ==="
docker exec peer0.org1.example.com ls -la /builders/ 2>&1 || true
docker exec peer0.org1.example.com find /builders -type f 2>&1 || true
