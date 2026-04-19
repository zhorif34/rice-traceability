#!/bin/bash
docker exec cli peer chaincode invoke \
  -C mychannel -n riceTraceability \
  -c '{"function":"initLedger","Args":[]}' \
  --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  -o orderer.example.com:7050 2>&1
