#!/bin/bash
echo "=== Restarting orderer ==="
docker restart orderer.example.com 2>&1
sleep 5

echo "=== Orderer logs ==="
docker logs --tail 5 orderer.example.com 2>&1

echo ""
echo "=== Restarting peer ==="
docker restart peer0.org1.example.com 2>&1
sleep 10

echo ""
echo "=== Wait for chaincode to re-register ==="
for i in $(seq 1 15); do
  if docker logs --since 1m riceTraceability_chaincode 2>&1 | grep -q "Successfully established"; then
    echo "Chaincode registered!"
    break
  fi
  echo "Waiting... ($i)"
  sleep 3
done

echo ""
echo "=== Chaincode logs ==="
docker logs --tail 5 riceTraceability_chaincode 2>&1

echo ""
echo "=== Restart backend ==="
docker restart rice-traceability-backend-1 2>&1
sleep 5

echo ""
echo "=== Backend logs ==="
docker logs --tail 5 rice-traceability-backend-1 2>&1
