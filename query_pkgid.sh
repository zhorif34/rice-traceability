#!/bin/bash
echo "=== Chaincode container env ==="
docker inspect riceTraceability_chaincode --format '{{range .Config.Env}}{{println .}}{{end}}' 2>&1

echo ""
echo "=== Chaincode container network ==="
docker inspect riceTraceability_chaincode --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>&1

echo ""
echo "=== Peer container network ==="
docker inspect peer0.org1.example.com --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>&1

echo ""
echo "=== Can peer resolve chaincode? ==="
docker exec peer0.org1.example.com nslookup riceTraceability_chaincode 2>&1 || echo "nslookup failed"
docker exec peer0.org1.example.com getent hosts riceTraceability_chaincode 2>&1 || echo "getent failed"
