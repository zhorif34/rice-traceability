#!/bin/bash
docker restart rice-traceability-backend-1 2>&1
echo "Waiting for backend to start..."
sleep 5
echo "=== Backend logs ==="
docker logs rice-traceability-backend-1 2>&1 | tail -10
echo ""
echo "=== Health check ==="
docker exec rice-traceability-frontend-1 wget -q -O- http://backend:5000/api/health 2>&1
