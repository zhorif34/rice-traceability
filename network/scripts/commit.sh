#!/bin/bash
docker exec cli peer lifecycle chaincode commit \
  --channelID mychannel \
  --name riceTraceability \
  --version 1.0 \
  --sequence 1 \
  -o orderer.example.com:7050 \
  --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
