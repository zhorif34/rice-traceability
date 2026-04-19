#!/bin/bash
echo "Starting query at $(date)"
docker exec cli peer chaincode query \
  --channelID mychannel \
  --name riceTraceability \
  --ctor '{"function":"getBatch","Args":["BATCH_PETANI_001"]}' \
  --tls \
  --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1
echo "Query result: $?"
echo "Finished at $(date)"
