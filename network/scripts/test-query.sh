#!/bin/bash
docker exec cli peer chaincode query \
  --channelID mychannel \
  --name riceTraceability \
  --ctor '{"function":"GetAllBatches","Args":[]}' \
  --tls \
  --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
