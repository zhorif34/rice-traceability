#!/bin/bash
mkdir -p /tmp/testdetect
echo '{"path":"","type":"external","label":"riceTraceability"}' > /tmp/testdetect/metadata.json
docker cp /tmp/testdetect peer0.org1.example.com:/tmp/testdetect
docker exec peer0.org1.example.com /opt/externalbuilders/external/detect /tmp/testdetect
echo "Detect exit code: $?"
