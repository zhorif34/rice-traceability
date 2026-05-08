#!/bin/bash
echo "=== Peer chaincode-related logs ==="
docker logs peer0.org1.example.com 2>&1 | grep -iE "external|builder|launch|start|chaincode.*riceTrace|connect|dial|ready|handler" | tail -30
