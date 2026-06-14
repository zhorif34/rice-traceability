#!/bin/bash
set -e

CHANNEL_NAME="mychannel"
ORDERER_CA="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
ORDERER_ADDRESS="orderer.example.com:7050"
ORDERER_ADMIN_TLS_SIGN_CERT="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt"
ORDERER_ADMIN_TLS_PRIVATE_KEY="/opt/fabric/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key"

echo "=== Step 1: Fetch current channel config ==="
peer channel fetch config config_block.pb \
    -o ${ORDERER_ADDRESS} \
    -c ${CHANNEL_NAME} \
    --tls \
    --cafile ${ORDERER_CA}

echo "=== Step 2: Decode config block ==="
configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json

jq '.data.data[0].payload.data.config' config_block.json > config.json

echo "=== Step 3: Prepare Org2 MSP from Org1 template ==="
ORG2_CA_CERT=$(cat /opt/fabric/peerOrganizations/org2.example.com/ca/ca.org2.example.com-cert.pem | base64 -w0)
ORG2_TLS_CA_CERT=$(cat /opt/fabric/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem | base64 -w0)
ORG2_ADMIN_CERT=$(cat /opt/fabric/peerOrganizations/org2.example.com/msp/admincerts/Admin@org2.example.com-cert.pem | base64 -w0)

jq \
  --arg ca_cert "$ORG2_CA_CERT" \
  --arg tls_ca_cert "$ORG2_TLS_CA_CERT" \
  --arg admin_cert "$ORG2_ADMIN_CERT" \
  '.values.MSP.value.config.name = "Org2MSP" |
   .values.MSP.value.config.root_certs = [$ca_cert] |
   .values.MSP.value.config.tls_root_certs = [$tls_ca_cert] |
   .values.MSP.value.config.admins = [$admin_cert] |
   .values.MSP.value.config.fabric_node_ous = null |
   .values.MSP.value.config.intermediate_certs = [] |
   .values.MSP.value.config.organizational_unit_identifiers = [] |
   .values.MSP.value.config.revocation_list = [] |
   .values.MSP.value.config.signing_identity = null |
   .values.MSP.value.config.tls_intermediate_certs = [] |
   .values.AnchorPeers.value.anchor_peers = [{"host": "peer0.org2.example.com", "port": 7052}] |
   .policies.Admins.policy.value.identities[0].principal.msp_identifier = "Org2MSP" |
   .policies.Endorsement.policy.value.identities[0].principal.msp_identifier = "Org2MSP" |
   .policies.Readers.policy.value.identities[0].principal.msp_identifier = "Org2MSP" |
   .policies.Writers.policy.value.identities[0].principal.msp_identifier = "Org2MSP"
' /tmp/org1_msp.json > /tmp/org2_msp.json

echo "=== Step 4: Add Org2 to channel config ==="
jq -s '.[0].channel_group.groups.Application.groups.Org2MSP = .[1] | .[0]' config.json /tmp/org2_msp.json > modified_config.json

echo "=== Step 5: Encode configs ==="
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb

echo "=== Step 6: Compute config update ==="
configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output org2_update.pb

echo "=== Step 7: Decode update and wrap in envelope ==="
configtxlator proto_decode --input org2_update.pb --type common.ConfigUpdate --output org2_update.json

echo '{"payload":{"header":{"channel_header":{"channel_id":"'${CHANNEL_NAME}'","type":2}},"data":{"config_update":'$(cat org2_update.json)'}}}' > org2_update_envelope.json

configtxlator proto_encode --input org2_update_envelope.json --type common.Envelope --output org2_update_envelope.pb

echo "=== Step 8: Sign config update ==="
peer channel signconfigtx -f org2_update_envelope.pb

echo "=== Step 9: Submit config update ==="
peer channel update \
    -f org2_update_envelope.pb \
    -o ${ORDERER_ADDRESS} \
    -c ${CHANNEL_NAME} \
    --tls \
    --cafile ${ORDERER_CA}

echo "=== Org2 added to channel successfully! ==="
