#!/bin/bash
cd /home/zhorif34/rice-traceability

echo "Starting rice-traceability with Docker..."
docker-compose up --build

echo ""
echo "============================================"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "  Database: localhost:5432"
echo "============================================"
