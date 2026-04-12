#!/bin/bash
set -e

echo "=========================================="
echo " Starting Hyperledger Fabric Network"
echo "=========================================="

FABRIC_PATH="${FABRIC_PATH:-$HOME/fabric-samples}"
NETWORK_DIR="$(dirname "$0")"

echo "[1/4] Starting CA services..."
docker-compose -f "$NETWORK_DIR/docker-compose-ca.yaml" up -d
sleep 3

echo "[2/4] Starting CouchDB..."
docker-compose -f "$NETWORK_DIR/docker-compose-couch.yaml" up -d
sleep 3

echo "[3/4] Starting peers and orderer..."
docker-compose -f "$NETWORK_DIR/docker-compose-net.yaml" up -d
sleep 5

echo "[4/4] Creating channel and joining peers..."
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/mychannel.block
docker exec cli peer channel join -b ./channel-artifacts/mychannel.block

echo "=========================================="
echo " Fabric Network is ready!"
echo "=========================================="
