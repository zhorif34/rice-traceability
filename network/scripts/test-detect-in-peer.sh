#!/bin/bash
docker exec peer0.org1.example.com bash -c '
mkdir -p /tmp/testmeta
echo "{\"type\":\"external\",\"label\":\"test\"}" > /tmp/testmeta/metadata.json
/opt/externalbuilders/external/detect /tmp/testmeta
echo "EXIT_CODE=$?"
'
