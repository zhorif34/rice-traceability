#!/bin/bash
echo "=== Docker images related to chaincode ==="
docker images 2>&1 | grep -iE "chaincode|rice|traceab"
