#!/bin/bash
echo "=== Try direct peer chaincode invoke (bypass Gateway SDK) ==="
docker exec peer0.org1.example.com peer chaincode invoke \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"GetAllBatches","Args":[]}' \
  --tls \
  --cafile /etc/hyperledger/fabric/tls/ca.crt \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /etc/hyperledger/fabric/tls/ca.crt 2>&1
