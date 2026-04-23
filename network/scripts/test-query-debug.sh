#!/bin/bash
docker exec cli peer chaincode query \
  --channelID mychannel \
  --name riceTraceability \
  --ctor '{"function":"GetAllBatches","Args":[]}' \
  --tls \
  --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt &
QUERY_PID=$!

sleep 5
echo "=== Peer logs after query attempt ==="
docker logs peer0.org1.example.com --since 10s 2>&1 | strings | grep -E 'start container|externalbuilder|run|Launch|chaincode.*Start|callChaincode|CheckInvocation|connection_info|chaincode.*launch|error.*chaincode' | tail -20

wait $QUERY_PID 2>/dev/null
echo "Query exit code: $?"
