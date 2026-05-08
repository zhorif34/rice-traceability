#!/bin/bash
echo "=== Orderer recent logs ==="
docker logs --since 1m orderer.example.com 2>&1 | grep -iE "error|warn|start|channel|ready|block" | head -20
