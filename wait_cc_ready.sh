#!/bin/bash
echo "Waiting for chaincode to register..."
for i in $(seq 1 20); do
  LOG=$(docker logs --since 3m riceTraceability_chaincode 2>&1)
  if echo "$LOG" | grep -q "Successfully established"; then
    echo "Chaincode registered with peer!"
    echo "$LOG" | grep "Successfully"
    break
  fi
  echo "Waiting... ($i)"
  sleep 3
done

echo ""
echo "=== Chaincode recent logs ==="
docker logs --tail 8 riceTraceability_chaincode 2>&1
