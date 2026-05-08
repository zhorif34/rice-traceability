#!/bin/bash
echo "=== Direct chaincode query ==="
docker exec peer0.org1.example.com peer chaincode query \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"GetAllBatches","Args":[]}' 2>&1
