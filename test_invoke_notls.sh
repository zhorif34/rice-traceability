#!/bin/bash
echo "=== Try direct peer chaincode invoke WITHOUT TLS ==="
docker exec peer0.org1.example.com peer chaincode invoke \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"GetAllBatches","Args":[]}' \
  --peerAddresses peer0.org1.example.com:7051 2>&1
