#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NETWORK_DIR="$SCRIPT_DIR/.."
export FABRIC_BIN="/home/zhorif34/fabric-samples/bin"
export PATH="$FABRIC_BIN:$PATH"
export FABRIC_CFG_PATH="$NETWORK_DIR"

echo "=== Memastikan /etc/hosts ==="
if ! grep -q "orderer.example.com" /etc/hosts 2>/dev/null; then
  echo "127.0.0.1 orderer.example.com peer0.org1.example.com" | sudo tee -a /etc/hosts 2>/dev/null || echo "WARNING: Could not add to /etc/hosts (may need manual add)"
fi

echo "=== Menghentikan container lama ==="
cd "$NETWORK_DIR"
docker compose -f docker-compose-net.yaml down -v 2>&1 | tail -3

echo "=== Memulai orderer + CouchDB ==="
docker compose -f docker-compose-net.yaml up -d orderer.example.com couchdb0 2>&1 | tail -3
sleep 3

echo "=== Membuat channel ==="
osnadmin channel join \
  --channelID mychannel \
  --config-block "$NETWORK_DIR/channel-artifacts/mychannel.block" \
  -o orderer.example.com:7053 \
  --ca-file "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt" \
  --client-cert "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt" \
  --client-key "$NETWORK_DIR/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key" 2>&1

echo "=== Memulai peer + CLI ==="
docker compose -f docker-compose-net.yaml up -d peer0.org1.example.com cli 2>&1 | tail -3
sleep 5

echo "=== Bergabung ke channel ==="
docker exec cli peer channel join \
  -b /opt/fabric/channel-artifacts/mychannel.block \
  --tls --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1

echo "=== Membuat package chaincode ==="
bash "$SCRIPT_DIR/create-package.sh" 2>&1

echo "=== Menginstall chaincode ==="
docker cp /tmp/riceTraceability.tar.gz cli:/tmp/riceTraceability.tar.gz
INSTALL_OUTPUT=$(docker exec cli peer lifecycle chaincode install /tmp/riceTraceability.tar.gz \
  --tls --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1)
echo "$INSTALL_OUTPUT"
PACKAGE_ID=$(echo "$INSTALL_OUTPUT" | grep -oP 'Chaincode code package identifier: \K\S+')
echo "Package ID: $PACKAGE_ID"

echo "=== Menjalankan chaincode dengan package ID yang benar ==="
docker stop riceTraceability_chaincode 2>/dev/null || true
docker rm riceTraceability_chaincode 2>/dev/null || true
docker run -d \
  --name riceTraceability_chaincode \
  --network network_rice-network \
  -e CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999 \
  -e CORE_CHAINCODE_ID_NAME="$PACKAGE_ID" \
  --entrypoint "npm" \
  rice-traceability_chaincode \
  run server -- --chaincode-address "0.0.0.0:9999" --chaincode-id "$PACKAGE_ID" 2>&1
sleep 3
echo "Chaincode status:"
docker logs riceTraceability_chaincode 2>&1 | tail -5

echo "=== Approve chaincode ==="
docker exec cli peer lifecycle chaincode approveformyorg \
  --channelID mychannel --name riceTraceability --version 1.0 \
  --package-id "$PACKAGE_ID" --sequence 1 \
  -o orderer.example.com:7050 --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt 2>&1

echo "=== Commit chaincode ==="
docker exec cli peer lifecycle chaincode commit \
  --channelID mychannel --name riceTraceability --version 1.0 --sequence 1 \
  -o orderer.example.com:7050 --tls \
  --cafile /opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt \
  --peerAddresses peer0.org1.example.com:7051 \
  --tlsRootCertFiles /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1

echo "=== Memeriksa chaincode ==="
sleep 3
docker exec cli peer lifecycle chaincode querycommitted --channelID mychannel \
  --tls --cafile /opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt 2>&1

echo ""
echo "=== SELESAI ==="
docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E 'orderer|peer|couchdb|chaincode|cli'
echo ""
echo "Package ID: $PACKAGE_ID"
echo "Simpan package ID ini jika diperlukan untuk konfigurasi backend."
