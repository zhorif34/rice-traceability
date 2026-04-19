FROM node:18-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

COPY backend/src ./src

COPY network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem /app/fabric/crypto/admin-cert.pem
COPY network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk /app/fabric/crypto/admin-key.pem
COPY network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt /app/fabric/crypto/peer-tls-ca.crt
COPY network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt /app/fabric/crypto/orderer-tls-ca.crt

EXPOSE 5000

CMD ["node", "src/app.js"]
