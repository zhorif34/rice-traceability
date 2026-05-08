#!/bin/bash
echo "=== Full chaincode logs ==="
docker logs riceTraceability_chaincode 2>&1

echo ""
echo "=== Chaincode exit code ==="
docker inspect riceTraceability_chaincode --format '{{.State.ExitCode}}' 2>&1
docker inspect riceTraceability_chaincode --format '{{.State.Error}}' 2>&1
