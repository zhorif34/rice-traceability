FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

CMD ["npm", "start", "--", "--peer.address", "peer0.org1.example.com:7052"]
