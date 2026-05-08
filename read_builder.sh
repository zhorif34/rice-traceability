#!/bin/bash
echo "=== detect ==="
docker exec peer0.org1.example.com cat /opt/hyperledger/ccaas_builder/bin/detect 2>&1
echo ""
echo "=== build ==="
docker exec peer0.org1.example.com cat /opt/hyperledger/ccaas_builder/bin/build 2>&1
echo ""
echo "=== release ==="
docker exec peer0.org1.example.com cat /opt/hyperledger/ccaas_builder/bin/release 2>&1
