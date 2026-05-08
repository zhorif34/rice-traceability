#!/bin/bash
# Check if ngrok is running
echo "=== Ngrok processes ==="
docker exec rice-traceability-frontend-1 ps aux 2>&1 | grep -i ngrok || echo "No ngrok in frontend container"

# Check host for ngrok
ps aux 2>/dev/null | grep -i ngrok || echo "No ngrok on WSL host"

# Check all docker networks
echo "=== Docker networks ==="
docker network ls 2>&1

# Check frontend container's network
echo "=== Frontend container networks ==="
docker inspect rice-traceability-frontend-1 --format='{{json .NetworkSettings.Networks}}' 2>&1 | python3 -m json.tool 2>/dev/null || docker inspect rice-traceability-frontend-1 --format='{{json .NetworkSettings.Networks}}' 2>&1

# Check backend container's network
echo "=== Backend container networks ==="
docker inspect rice-traceability-backend-1 --format='{{json .NetworkSettings.Networks}}' 2>&1 | python3 -m json.tool 2>/dev/null || docker inspect rice-traceability-backend-1 --format='{{json .NetworkSettings.Networks}}' 2>&1
