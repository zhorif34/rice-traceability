#!/bin/bash
echo "=== ALL peer logs after lifecycle query ==="
docker logs --since 3m peer0.org1.example.com 2>&1 | tail -30
