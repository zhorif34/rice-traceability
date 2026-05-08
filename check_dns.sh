#!/bin/bash
# Check if frontend can resolve 'backend' hostname
echo "=== DNS resolution of 'backend' from frontend ==="
docker exec rice-traceability-frontend-1 nslookup backend 2>&1 || docker exec rice-traceability-frontend-1 getent hosts backend 2>&1 || echo "Cannot resolve"

# Check if frontend can resolve 'rice-traceability-backend-1'
echo "=== DNS resolution of 'rice-traceability-backend-1' ==="
docker exec rice-traceability-frontend-1 getent hosts rice-traceability-backend-1 2>&1 || echo "Cannot resolve"

# Check what networks backend is on
echo "=== Backend networks ==="
docker inspect rice-traceability-backend-1 --format='{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' 2>&1

# Check if there's a link or extra_hosts
echo "=== Frontend links/extra_hosts ==="
docker inspect rice-traceability-frontend-1 --format='Links: {{.HostConfig.Links}} ExtraHosts: {{.HostConfig.ExtraHosts}}' 2>&1
