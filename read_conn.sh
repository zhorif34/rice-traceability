#!/bin/bash
for f in $(docker exec peer0.org1.example.com find /var/hyperledger/production/externalbuilder -name "connection.json" 2>&1); do
  echo "=== $f ==="
  docker exec peer0.org1.example.com cat "$f" 2>&1
  echo ""
done
