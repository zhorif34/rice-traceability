#!/bin/bash
set -e

echo "=========================================="
echo " Stopping Hyperledger Fabric Network"
echo "=========================================="

NETWORK_DIR="$(dirname "$0")"

docker-compose -f "$NETWORK_DIR/docker-compose-net.yaml" down --volumes --remove-orphans
docker-compose -f "$NETWORK_DIR/docker-compose-couch.yaml" down --volumes
docker-compose -f "$NETWORK_DIR/docker-compose-ca.yaml" down --volumes

docker system prune -f

echo "Network stopped and cleaned."
