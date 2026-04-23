#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/.."
export FABRIC_BIN="/home/zhorif34/fabric-samples/bin"
export PATH="$FABRIC_BIN:$PATH"
export FABRIC_CFG_PATH="$NETWORK_DIR"

echo "=== Step 1: Stop and clean existing network ==="
cd "$NETWORK_DIR"
docker compose -f docker-compose-net.yaml down -v 2>/dev/null || true

echo "=== Step 2: Build all images ==="
docker compose -f docker-compose-net.yaml build 2>&1 | tail -5

echo "=== Step 3: Start orderer + CouchDB ==="
docker compose -f docker-compose-net.yaml up -d orderer.example.com couchdb0
sleep 3

echo "=== Step 4: Create channel ==="
osnadmin channel join \
  --channelID mychannel \
  --config-block "$NETWORK_DIR/channel-artifacts/mychannel.block" \
  -o orderer.example.com:7053 \
  --ca-file "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt" \
  --client-cert "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt" \
  --client-key "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

echo "=== Step 5: Start chaincode server FIRST (so DNS is ready for peer) ==="
docker compose -f docker-compose-net.yaml up -d chaincode
sleep 5
echo "Chaincode logs:"
docker logs riceTraceability_chaincode 2>&1 | tail -5

echo "=== Step 6: Start peer + CLI ==="
docker compose -f docker-compose-net.yaml up -d peer0.org1.example.com cli
sleep 5

echo "=== Step 7: Join peer to channel ==="
docker exec cli peer channel join \
  -b /opt/fabric/channel-artifacts/mychannel.block \
  --tls --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "=== Step 8: Create and install chaincode package ==="
bash "$SCRIPT_DIR/create-package.sh"
docker cp /tmp/riceTraceability.tar.gz cli:/tmp/riceTraceability.tar.gz
INSTALL_OUTPUT=$(docker exec cli peer lifecycle chaincode install /tmp/riceTraceability.tar.gz \
  --tls --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1)
echo "$INSTALL_OUTPUT"
PACKAGE_ID=$(echo "$INSTALL_OUTPUT" | grep -oP 'Chaincode code package identifier: \K\S+')
echo "Package ID: $PACKAGE_ID"

echo "=== Step 9: Approve chaincode ==="
docker exec cli peer lifecycle chaincode approveformyorg \
  --channelID mychannel \
  --name riceTraceability \
  --version 1.0 \
  --package-id "$PACKAGE_ID" \
  --sequence 1 \
  -o orderer.example.com:7050 \
  --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt

echo "=== Step 10: Commit chaincode ==="
docker exec cli peer lifecycle chaincode commit \
  --channelID mychannel \
  --name riceTraceability \
  --version 1.0 \
  --sequence 1 \
  -o orderer.example.com:7050 \
  --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "=== Step 11: Verify chaincode ==="
sleep 3
docker logs riceTraceability_chaincode 2>&1 | tail -5
echo ""
docker logs peer0.org1.example.com 2>&1 | grep -i -E "chaincode|external|riceTraceability" | tail -10

echo ""
echo "=== Network is ready! ==="
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E 'orderer|peer|couchdb|chaincode|cli'
