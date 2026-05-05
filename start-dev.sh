#!/bin/bash
set -e

cd /home/zhorif34/rice-traceability

echo "============================================"
echo "  Rice Traceability - Full Startup"
echo "============================================"

echo ""
echo ">>> Step 1/9: Generating crypto materials & channel artifacts..."
bash network/generate.sh

echo ""
echo ">>> Step 2/9: Starting Fabric network (orderer, peer, couchdb, cli)..."
docker compose -f network/docker-compose-net.yaml up -d --build orderer.example.com couchdb0 peer0.org1.example.com cli

echo "Waiting for peer to start..."
sleep 5

echo ""
echo ">>> Step 3/9: Initializing channel & chaincode lifecycle..."
INIT_OUTPUT=$(docker exec cli bash /tmp/init-channel.sh 2>&1)
echo "${INIT_OUTPUT}"

echo ""
echo ">>> Step 4/9: Getting chaincode package ID..."
PACKAGE_ID=$(echo "${INIT_OUTPUT}" | grep 'Chaincode code package identifier:' | awk '{print $NF}' | tail -1)

if [ -z "$PACKAGE_ID" ]; then
    PACKAGE_ID=$(echo "${INIT_OUTPUT}" | grep -o 'riceTraceability:[a-f0-9]\{64\}' | tail -1)
fi

if [ -z "$PACKAGE_ID" ]; then
    echo "ERROR: Could not determine package ID. Falling back to riceTraceability:1.0"
    export CHAINCODE_PKG_ID="riceTraceability:1.0"
else
    export CHAINCODE_PKG_ID="$PACKAGE_ID"
fi

echo "Using chaincode package ID: $CHAINCODE_PKG_ID"

echo ""
echo ">>> Step 5/9: Starting chaincode container..."
docker rm -f riceTraceability_chaincode 2>/dev/null || true
CHAINCODE_PKG_ID="$CHAINCODE_PKG_ID" docker compose -f network/docker-compose-net.yaml up -d --build chaincode

echo "Waiting for chaincode to connect to peer..."
sleep 5

echo ""
echo ">>> Step 6/9: Starting Hyperledger Explorer..."
docker compose -f network/docker-compose-net.yaml up -d explorerdb.mynetwork.com
echo "Waiting for Explorer DB to be ready..."
sleep 10
docker compose -f network/docker-compose-net.yaml up -d explorer.mynetwork.com

echo ""
echo ">>> Step 7/9: Starting application (backend, frontend, postgres, ngrok)..."
docker compose up -d --build

echo ""
echo ">>> Step 8/9: Waiting for ngrok tunnels to come online..."
NGROK_API="http://localhost:4040/api"
MAX_RETRIES=30
RETRY=0
NGROK_BACKEND_URL=""

while [ $RETRY -lt $MAX_RETRIES ]; do
    sleep 2
    NGROK_BACKEND_URL=$(curl -s "$NGROK_API/tunnels" 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | sed 's/"public_url":"\(.*\)"/\1/' || true)
    if [ -n "$NGROK_BACKEND_URL" ]; then
        break
    fi
    RETRY=$((RETRY + 1))
    echo "  Waiting for ngrok... ($RETRY/$MAX_RETRIES)"
done

if [ -z "$NGROK_BACKEND_URL" ]; then
    echo "  WARNING: Could not get ngrok tunnel URLs. Frontend will use localhost."
    NGROK_BACKEND_URL="http://localhost:5000"
    NGROK_FRONTEND_URL="http://localhost:3000"
else
    NGROK_FRONTEND_URL=$(curl -s "$NGROK_API/tunnels" 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | tail -1 | sed 's/"public_url":"\(.*\)"/\1/' || true)
    
    echo "  Ngrok backend tunnel:  $NGROK_BACKEND_URL"
    echo "  Ngrok frontend tunnel: $NGROK_FRONTEND_URL"
    
    echo ""
    echo ">>> Step 9/9: Restarting frontend with ngrok backend URL..."
    VITE_API_URL="${NGROK_BACKEND_URL}/api" docker compose up -d --force-recreate frontend
fi

echo ""
echo "============================================"
echo "  All services are running!"
echo "============================================"
echo "  Backend:      http://localhost:5000"
echo "  Frontend:     http://localhost:3000"
echo "  Explorer:     http://localhost:8080"
echo "    Login:      exploreradmin / exploreradminpw"
echo "  Database:     localhost:5432"
echo "  Peer:         localhost:7051"
echo "  Orderer:      localhost:7050"
echo "  CouchDB:      http://localhost:5984/_utils"
echo "    Login:      admin / adminpw"
echo ""
echo "  --- Ngrok Public URLs ---"
echo "  Backend:      $NGROK_BACKEND_URL"
echo "  Frontend:     $NGROK_FRONTEND_URL"
echo "  Ngrok UI:     http://localhost:4040"
echo "============================================"
