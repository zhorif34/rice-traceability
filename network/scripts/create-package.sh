#!/bin/bash
set -e

mkdir -p /tmp/ccpkg/staging

cat > /tmp/ccpkg/staging/connection.json << 'CONNEOF'
{"address":"riceTraceability_chaincode:9999","dial_timeout":"10s","tls_required":false}
CONNEOF

cat > /tmp/ccpkg/metadata.json << 'METAEOF'
{"path":"","type":"ccaas","label":"riceTraceability"}
METAEOF

cd /tmp/ccpkg/staging
tar -czf /tmp/ccpkg/code.tar.gz connection.json

cd /tmp/ccpkg
tar -czf /tmp/riceTraceability.tar.gz metadata.json code.tar.gz

echo "Package created:"
tar -tzf /tmp/riceTraceability.tar.gz
echo ""
echo "metadata.json:"
cat /tmp/ccpkg/metadata.json
echo ""
echo "connection.json:"
cat /tmp/ccpkg/staging/connection.json
