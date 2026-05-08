#!/bin/bash
echo "=== Try initLedger (lowercase i) ==="
docker exec peer0.org1.example.com peer chaincode query \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"initLedger","Args":[]}' 2>&1

echo ""
echo "=== Try getBatch ==="
docker exec peer0.org1.example.com peer chaincode query \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"getBatch","Args":["BATCH_001"]}' 2>&1

echo ""
echo "=== Try getAllBatchesByEntity ==="
docker exec peer0.org1.example.com peer chaincode query \
  -C mychannel \
  -n riceTraceability \
  -c '{"function":"getAllBatchesByEntity","Args":["farmer"]}' 2>&1
