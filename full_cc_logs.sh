#!/bin/bash
echo "Checking chaincode logs for peer registration..."
docker logs riceTraceability_chaincode 2>&1
