#!/bin/bash
set -e

NETWORK_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$NETWORK_DIR")"
FABRIC_VERSION="${FABRIC_VERSION:-2.5}"

FABRIC_TOOLS_IMAGE="hyperledger/fabric-tools:${FABRIC_VERSION}"
USER_FLAG="-u $(id -u):$(id -g)"

echo "============================================"
echo "  Step 1: Generating Crypto Materials"
echo "============================================"

if [ -d "${NETWORK_DIR}/organizations/peerOrganizations" ]; then
    echo "Crypto materials already exist. Skipping..."
    echo "To regenerate, remove ${NETWORK_DIR}/organizations/peerOrganizations and ${NETWORK_DIR}/organizations/ordererOrganizations"
else
    docker run --rm \
        ${USER_FLAG} \
        -v "${NETWORK_DIR}":/network \
        -w /network \
        ${FABRIC_TOOLS_IMAGE} \
        cryptogen generate \
        --config=./crypto-config.yaml \
        --output="organizations"

    echo "Crypto materials generated successfully."
fi

echo ""
echo "============================================"
echo "  Step 2: Generating Channel Artifacts"
echo "============================================"

mkdir -p "${NETWORK_DIR}/channel-artifacts"
mkdir -p "${NETWORK_DIR}/organizations/channel-artifacts"

if [ -f "${NETWORK_DIR}/channel-artifacts/mychannel.block" ]; then
    echo "Channel artifacts already exist. Skipping..."
else
    docker run --rm \
        ${USER_FLAG} \
        -v "${NETWORK_DIR}":/network \
        -w /network \
        -e FABRIC_CFG_PATH=/network \
        ${FABRIC_TOOLS_IMAGE} \
        configtxgen \
        -profile RiceTraceabilityChannel \
        -outputBlock ./channel-artifacts/mychannel.block \
        -channelID mychannel

    cp "${NETWORK_DIR}/channel-artifacts/mychannel.block" "${NETWORK_DIR}/organizations/channel-artifacts/"

    echo "Channel artifacts generated successfully."
fi

echo ""
echo "============================================"
echo "  Generation Complete"
echo "============================================"
