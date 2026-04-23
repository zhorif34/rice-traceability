#!/bin/bash
set -e

cd /home/zhorif34/rice-traceability

echo "Stopping application..."
docker compose down -v --remove-orphans 2>/dev/null

echo "Stopping Explorer..."
docker compose -f network/docker-compose-net.yaml down explorer.mynetwork.com explorerdb.mynetwork.com -v 2>/dev/null

echo "Stopping Fabric network..."
docker compose -f network/docker-compose-net.yaml down -v --remove-orphans 2>/dev/null

echo "Removing crypto materials and channel artifacts..."
rm -rf network/organizations/peerOrganizations
rm -rf network/organizations/ordererOrganizations
rm -rf network/organizations/channel-artifacts
rm -rf network/channel-artifacts
rm -rf organizations/peerOrganizations
rm -rf organizations/ordererOrganizations
rm -rf organizations/channel-artifacts
rm -rf channel-artifacts

echo "Removing chaincode package..."
rm -f chaincode/riceTraceability.tar.gz

echo ""
echo "Cleanup complete. Run './start-dev.sh' to start fresh."
