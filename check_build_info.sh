#!/bin/bash
for d in $(docker exec peer0.org1.example.com ls /var/hyperledger/production/externalbuilder/builds/ 2>&1); do
  echo "=== $d/build-info.json ==="
  docker exec peer0.org1.example.com cat /var/hyperledger/production/externalbuilder/builds/$d/build-info.json 2>&1
  echo ""
done
