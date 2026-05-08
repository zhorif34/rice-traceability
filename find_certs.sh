#!/bin/bash
echo "=== Find TLS cert ==="
docker exec peer0.org1.example.com find /etc/hyperledger -name "*.crt" -o -name "*.pem" 2>&1 | head -20

echo ""
echo "=== Find orderer TLS cert ==="
docker exec orderer.example.com find /etc/hyperledger -name "*.crt" -o -name "*.pem" 2>&1 | head -20
