#!/bin/bash
echo "=== Can peer resolve chaincode hostname? ==="
docker exec peer0.org1.example.com getent hosts riceTraceability_chaincode 2>&1 || echo "CANNOT resolve!"

echo ""
echo "=== Can peer reach chaincode port? ==="
docker exec peer0.org1.example.com timeout 3 nc -zv riceTraceability_chaincode 9999 2>&1 || echo "Cannot connect"

echo ""
echo "=== Peer and chaincode networks ==="
echo "Peer networks:"
docker inspect peer0.org1.example.com --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>&1
echo "Chaincode networks:"
docker inspect riceTraceability_chaincode --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>&1

echo ""
echo "=== Chaincode IP ==="
docker inspect riceTraceability_chaincode --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>&1
echo "=== Peer IP ==="
docker inspect peer0.org1.example.com --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>&1
