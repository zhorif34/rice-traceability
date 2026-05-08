#!/bin/bash
echo "Waiting for chaincode to register with peer..."
for i in $(seq 1 12); do
  if docker logs riceTraceability_chaincode 2>&1 | grep -q "ready"; then
    echo "Chaincode is READY!"
    break
  fi
  echo "Waiting... ($i)"
  sleep 5
done

docker logs --tail 5 riceTraceability_chaincode 2>&1
