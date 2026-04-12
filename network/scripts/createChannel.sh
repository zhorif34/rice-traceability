#!/bin/bash
set -e

echo "Creating channel..."
docker exec cli peer channel create -o orderer.example.com:7050 -c mychannel -f ./channel-artifacts/channel.tx --outputBlock ./channel-artifacts/mychannel.block

echo "Joining Org1 peer to channel..."
docker exec cli peer channel join -b ./channel-artifacts/mychannel.block

echo "Channel created and peers joined."
