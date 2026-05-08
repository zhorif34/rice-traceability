#!/bin/bash
echo "=== Full peer logs around endorsement time ==="
docker logs --since 10m peer0.org1.example.com 2>&1 | grep -E "16:2[5-7]" | head -40
