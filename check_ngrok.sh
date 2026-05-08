#!/bin/bash
echo "=== Ngrok container status ==="
docker ps --filter name=ngrok --format "table {{.Names}}\t{{.Status}}" 2>&1

echo ""
echo "=== Ngrok container logs ==="
docker logs rice-traceability-ngrok-1 2>&1 | tail -20
