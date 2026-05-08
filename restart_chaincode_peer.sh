#!/bin/bash
echo "=== Step 1: Restart chaincode ==="
docker restart riceTraceability_chaincode 2>&1
sleep 5

echo "=== Step 2: Wait for chaincode bootstrap ==="
for i in $(seq 1 10); do
  if docker logs --since 30s riceTraceability_chaincode 2>&1 | grep -q "Bootstrap process completed"; then
    echo "Bootstrap completed!"
    break
  fi
  sleep 2
done

echo "=== Step 3: Restart peer (to reconnect to chaincode) ==="
docker restart peer0.org1.example.com 2>&1
sleep 10

echo "=== Step 4: Wait for chaincode to register ==="
for i in $(seq 1 15); do
  if docker logs --since 1m riceTraceability_chaincode 2>&1 | grep -q "Successfully established"; then
    echo "Chaincode registered!"
    break
  fi
  echo "Waiting for registration... ($i)"
  sleep 3
done

echo ""
echo "=== Chaincode logs ==="
docker logs --tail 10 riceTraceability_chaincode 2>&1

echo ""
echo "=== Restart backend ==="
docker restart rice-traceability-backend-1 2>&1
sleep 5

echo ""
echo "=== Backend logs ==="
docker logs --tail 5 rice-traceability-backend-1 2>&1
