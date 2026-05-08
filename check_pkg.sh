#!/bin/bash
echo "=== Peer error with full context ==="
docker logs peer0.org1.example.com 2>&1 | grep -E "5073cc6f|82de5acd|d4fbd3a3|launch|start.*chaincode" | tail -20

echo ""
echo "=== Check chaincode package info ==="
docker exec peer0.org1.example.com find /var/hyperledger/production/externalbuilder -name "metadata.json" -exec sh -c 'echo "=== {} ===" && cat {}' \; 2>&1
