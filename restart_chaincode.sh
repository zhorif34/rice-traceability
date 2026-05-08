#!/bin/bash
echo "=== Removing old container ==="
docker rm -f riceTraceability_chaincode 2>&1

echo ""
echo "=== Rebuilding chaincode image from correct Dockerfile ==="
docker build -t rice-traceability_chaincode:latest \
  -f network/Dockerfile.chaincode \
  . 2>&1 | tail -5

echo ""
echo "=== Starting chaincode in CCAAS server mode ==="
docker run -d \
  --name riceTraceability_chaincode \
  --network network_rice-network \
  -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
  -e CORE_CHAINCODE_ID_NAME=riceTraceability:5073cc6ffba898296bf685a2f29b39f56aee95d34c87383813be785cf98a63c6 \
  --entrypoint "sh" \
  rice-traceability_chaincode:latest \
  -c "npm run server -- --chaincode-address 0.0.0.0:9999 --chaincode-id riceTraceability:5073cc6ffba898296bf685a2f29b39f56aee95d34c87383813be785cf98a63c6" 2>&1

echo ""
echo "Waiting 5 seconds..."
sleep 5

echo ""
echo "=== Chaincode logs ==="
docker logs riceTraceability_chaincode 2>&1 | tail -15

echo ""
echo "=== Container running? ==="
docker ps --filter name=riceTraceability_chaincode --format "{{.Status}}" 2>&1
