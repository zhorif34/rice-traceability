#!/bin/bash
echo "=== Chaincode environment ==="
docker inspect riceTraceability_chaincode --format '{{range .Config.Env}}{{println .}}{{end}}' 2>&1

echo ""
echo "=== Chaincode CMD ==="
docker inspect riceTraceability_chaincode --format '{{.Config.Cmd}}' 2>&1
echo ""
echo "=== Chaincode Entrypoint ==="
docker inspect riceTraceability_chaincode --format '{{.Config.Entrypoint}}' 2>&1

echo ""
echo "=== Can chaincode reach peer port 7052? ==="
docker exec riceTraceability_chaincode timeout 3 wget -q -O- http://peer0.org1.example.com:7052 2>&1 || echo "Cannot reach peer:7052 (expected for gRPC)"

echo ""
echo "=== Can chaincode resolve peer? ==="
docker exec riceTraceability_chaincode getent hosts peer0.org1.example.com 2>&1 || echo "Cannot resolve"
