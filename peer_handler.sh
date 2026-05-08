#!/bin/bash
echo "=== Peer chaincode handler logs ==="
docker logs --since 5m peer0.org1.example.com 2>&1 | grep -iE "chaincode|handler|external|builder|riceTrace|connect|dial" | head -30
