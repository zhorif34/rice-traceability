#!/bin/bash
echo "=== Check run/status files ==="
for d in $(docker exec peer0.org1.example.com ls /var/hyperledger/production/externalbuilder/builds/ 2>&1); do
  echo "--- $d ---"
  docker exec peer0.org1.example.com ls -la /var/hyperledger/production/externalbuilder/builds/$d/ 2>&1
  echo ""
done

echo "=== Check chaincode start status ==="
docker exec peer0.org1.example.com find /var/hyperledger/production/externalbuilder -name "*.json" -exec echo {} \; 2>&1
for f in $(docker exec peer0.org1.example.com find /var/hyperledger/production/externalbuilder -name "*.json" 2>&1); do
  echo "=== $f ==="
  docker exec peer0.org1.example.com cat "$f" 2>&1
  echo ""
done
