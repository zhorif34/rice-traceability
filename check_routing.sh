#!/bin/bash
echo "=== Testing direct peer connectivity from backend ==="
docker exec rice-traceability-backend-1 wget -q -O- http://peer0.org1.example.com:7051 2>&1 || echo "Direct HTTP failed (expected for gRPC)"

echo ""
echo "=== Testing orderer connectivity from backend ==="
docker exec rice-traceability-backend-1 wget -q -O- http://orderer.example.com:7050 2>&1 || echo "Direct HTTP failed (expected for gRPC)"

echo ""
echo "=== Backend can resolve peer? ==="
docker exec rice-traceability-backend-1 getent hosts peer0.org1.example.com 2>&1

echo ""
echo "=== Backend can resolve orderer? ==="
docker exec rice-traceability-backend-1 getent hosts orderer.example.com 2>&1

echo ""
echo "=== Backend TLS certs exist? ==="
docker exec rice-traceability-backend-1 ls -la /app/fabric/crypto/ 2>&1
