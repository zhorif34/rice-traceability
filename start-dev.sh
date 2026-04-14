#!/bin/bash
cd /home/zhorif34/rice-traceability/backend
node src/app.js &
sleep 3
curl -s http://localhost:5000/api/health
echo ""
cd /home/zhorif34/rice-traceability/frontend
npx next dev -p 3000 &
sleep 5
echo ""
echo "============================================"
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo "============================================"
wait
