#!/bin/bash
echo "=== Chaincode image CMD ==="
docker inspect rice-traceability_chaincode:latest --format '{{.Config.Cmd}}' 2>&1

echo ""
echo "=== Chaincode image Entrypoint ==="
docker inspect rice-traceability_chaincode:latest --format '{{.Config.Entrypoint}}' 2>&1

echo ""
echo "=== Chaincode image Env ==="
docker inspect rice-traceability_chaincode:latest --format '{{range .Config.Env}}{{println .}}{{end}}' 2>&1

echo ""
echo "=== Chaincode Dockerfile ==="
cat /home/zhorif34/rice-traceability/chaincode/Dockerfile 2>&1

echo ""
echo "=== package.json start script ==="
cat /home/zhorif34/rice-traceability/chaincode/package.json 2>&1 | grep -A5 "scripts"
