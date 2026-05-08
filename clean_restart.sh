#!/bin/bash
echo "=== Step 1: Stop chaincode ==="
docker stop riceTraceability_chaincode 2>&1

echo "=== Step 2: Restart peer ==="
docker restart peer0.org1.example.com 2>&1
sleep 8

echo "=== Step 3: Start chaincode ==="
docker start riceTraceability_chaincode 2>&1
sleep 5

echo "=== Step 4: Wait for chaincode to register ==="
for i in $(seq 1 15); do
  if docker logs --since 30s riceTraceability_chaincode 2>&1 | grep -q "Successfully established"; then
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
echo "=== Step 5: Restart orderer ==="
docker restart orderer.example.com 2>&1
sleep 5

echo ""
echo "=== Step 6: Restart backend ==="
docker restart rice-traceability-backend-1 2>&1
sleep 5

echo ""
echo "=== Backend ready ==="
docker logs --tail 3 rice-traceability-backend-1 2>&1
