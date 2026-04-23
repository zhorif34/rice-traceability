#!/bin/bash
set -e

CHANNEL_NAME="mychannel"
CHAINCODE_NAME="riceTraceability"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQ="1"

ORDERER_CA="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
PEER_CA="/opt/fabric/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"

PEER_ADDRESS="peer0.org1.example.com:7051"
ORDERER_ADDRESS="orderer.example.com:7050"

ORDERER_ADMIN_TLS_SIGN_CERT="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
ORDERER_ADMIN_TLS_PRIVATE_KEY="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

CHANNEL_EXISTS=false
PEER_JOINED=false
CHAINCODE_COMMITTED=false

echo "Checking existing state..."

CHANNEL_LIST=$(osnadmin channel list \
    -o orderer.example.com:7053 \
    --ca-file "${ORDERER_CA}" \
    --client-cert "${ORDERER_ADMIN_TLS_SIGN_CERT}" \
    --client-key "${ORDERER_ADMIN_TLS_PRIVATE_KEY}" 2>/dev/null || echo "")

if echo "${CHANNEL_LIST}" | grep -q "${CHANNEL_NAME}"; then
    CHANNEL_EXISTS=true
    echo "  Channel '${CHANNEL_NAME}' already exists on orderer."
else
    echo "  Channel '${CHANNEL_NAME}' does not exist on orderer."
fi

PEER_CHANNELS=$(peer channel list \
    --tls \
    --cafile "${PEER_CA}" 2>/dev/null || echo "")

if echo "${PEER_CHANNELS}" | grep -q "${CHANNEL_NAME}"; then
    PEER_JOINED=true
    echo "  Peer has already joined '${CHANNEL_NAME}'."
else
    echo "  Peer has not joined '${CHANNEL_NAME}'."
fi

CC_QUERY=$(peer lifecycle chaincode querycommitted \
    --channelID ${CHANNEL_NAME} \
    --tls \
    --cafile "${PEER_CA}" 2>/dev/null || echo "")

if echo "${CC_QUERY}" | grep -q "${CHAINCODE_NAME}"; then
    CHAINCODE_COMMITTED=true
    echo "  Chaincode '${CHAINCODE_NAME}' is already committed on '${CHANNEL_NAME}'."
else
    echo "  Chaincode '${CHAINCODE_NAME}' is not committed on '${CHANNEL_NAME}'."
fi

echo ""

if [ "$CHANNEL_EXISTS" = false ]; then
    echo "============================================"
    echo "  Creating channel '${CHANNEL_NAME}'"
    echo "============================================"

    osnadmin channel join \
        --channelID ${CHANNEL_NAME} \
        --config-block /opt/fabric/channel-artifacts/mychannel.block \
        -o orderer.example.com:7053 \
        --ca-file "${ORDERER_CA}" \
        --client-cert "${ORDERER_ADMIN_TLS_SIGN_CERT}" \
        --client-key "${ORDERER_ADMIN_TLS_PRIVATE_KEY}"

    echo "Channel '${CHANNEL_NAME}' created successfully."
    echo ""
fi

if [ "$PEER_JOINED" = false ]; then
    echo "============================================"
    echo "  Joining peer to channel"
    echo "============================================"

    sleep 2

    peer channel join \
        -b /opt/fabric/channel-artifacts/mychannel.block \
        --tls \
        --cafile "${PEER_CA}"

    echo "Peer joined channel '${CHANNEL_NAME}' successfully."
    echo ""
fi

echo "============================================"
echo "  Packaging chaincode (CCAAS)"
echo "============================================"

cat > /tmp/connection.json <<EOF
{
    "address": "riceTraceability_chaincode:9999",
    "dial_timeout": "10s",
    "tls_required": false
}
EOF

echo '{"type":"ccaas","label":"riceTraceability"}' > /tmp/metadata.json
tar -czf /tmp/code.tar.gz -C /tmp connection.json
tar -czf /tmp/riceTraceability.tar.gz -C /tmp metadata.json code.tar.gz

echo "Chaincode packaged."
echo ""

echo "============================================"
echo "  Installing chaincode on peer"
echo "============================================"

INSTALL_OUTPUT=$(peer lifecycle chaincode install /tmp/riceTraceability.tar.gz \
    --tls \
    --cafile "${PEER_CA}" 2>&1 || echo "INSTALL_FAILED")

echo "${INSTALL_OUTPUT}"

PACKAGE_ID=$(echo "${INSTALL_OUTPUT}" | grep -o 'Chaincode code package identifier: [^ ]*' | awk '{print $NF}')

if [ -z "$PACKAGE_ID" ]; then
    echo "Install may have already existed. Querying..."
    PACKAGE_ID=$(peer lifecycle chaincode queryinstalled \
        --tls \
        --cafile "${PEER_CA}" \
        --output json 2>/dev/null | grep -o '"package_id":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

echo ""
echo "============================================"
echo "  Package ID"
echo "============================================"
echo "Package ID: ${PACKAGE_ID}"
echo ""

if [ "$CHAINCODE_COMMITTED" = false ]; then
    echo "============================================"
    echo "  Approving chaincode for Org1"
    echo "============================================"

    peer lifecycle chaincode approveformyorg \
        -o ${ORDERER_ADDRESS} \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME} \
        --version ${CHAINCODE_VERSION} \
        --package-id ${PACKAGE_ID} \
        --sequence ${CHAINCODE_SEQ} \
        --tls \
        --cafile "${ORDERER_CA}"

    echo "Chaincode approved for Org1."
    echo ""

    echo "============================================"
    echo "  Committing chaincode definition"
    echo "============================================"

    peer lifecycle chaincode commit \
        -o ${ORDERER_ADDRESS} \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME} \
        --version ${CHAINCODE_VERSION} \
        --sequence ${CHAINCODE_SEQ} \
        --tls \
        --cafile "${ORDERER_CA}"

    echo "Chaincode committed to channel."
else
    echo "Chaincode already committed. Skipping approve/commit."
fi

echo ""
echo "  Chaincode package ID: ${PACKAGE_ID}"
echo ""
echo "  Channel + Chaincode initialization COMPLETE!"
