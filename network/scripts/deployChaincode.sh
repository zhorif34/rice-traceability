#!/bin/bash
set -e

echo "=========================================="
echo " Deploying Rice Traceability Chaincode"
echo "=========================================="

CC_NAME="riceTraceability"
CC_PATH="/opt/gopath/src/github.com/chaincode"
CC_LANG="node"
CHANNEL="mychannel"

echo "[1/3] Packaging chaincode..."
docker exec cli peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_PATH} --lang ${CC_LANG} --label ${CC_NAME}

echo "[2/3] Installing chaincode on peers..."
docker exec cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "[3/3] Approving and committing chaincode..."
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled --output json | grep -o '"PackageId":"[^"]*"' | cut -d'"' -f4)
docker exec cli peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID ${CHANNEL} --name ${CC_NAME} --version 1.0 --package-id ${PACKAGE_ID} --sequence 1
docker exec cli peer lifecycle chaincode commit -o orderer.example.com:7050 --channelID ${CHANNEL} --name ${CC_NAME} --version 1.0 --sequence 1

echo "=========================================="
echo " Chaincode deployed successfully!"
echo "=========================================="
