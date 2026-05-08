#!/bin/bash
echo "=== Login response ==="
LOGIN=$(curl -s http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"petani1","password":"password123"}')
echo "$LOGIN"

TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null)

echo ""
echo "Token: ${TOKEN:0:30}..."

echo ""
echo "=== Creating farmer batch ==="
curl -s -X POST http://localhost:5000/api/farmer/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "batchId": "FARM_TEST_001",
    "data": {
      "variety": "IR64",
      "quantity": 100,
      "harvestDate": "2026-05-06"
    }
  }' 2>&1
