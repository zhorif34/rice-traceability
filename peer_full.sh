#!/bin/bash
echo "=== Peer logs - all recent ==="
docker logs --since 3m peer0.org1.example.com 2>&1 | tail -40
