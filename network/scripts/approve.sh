#!/bin/bash
docker exec cli peer lifecycle chaincode approveformyorg \
  --channelID mychannel \
  --name riceTraceability \
  --version 1.0 \
  --package-id riceTraceability:19b346bfd1918e84ca9d07ba3ee32a11dd91d550386f7dfd96a6a0c54600e0b7 \
  --sequence 1 \
  -o orderer.example.com:7050 \
  --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
