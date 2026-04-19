#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"petani@test.com","password":"password123","role":"petani","entityName":"Petani Test"}' 2>&1)
echo "Register: $TOKEN"

LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"petani@test.com","password":"password123"}' 2>&1)
echo "Login: $LOGIN"

JWT=$(echo $LOGIN | grep -oP '"token":"\K[^"]+')
echo "JWT: $JWT"

echo ""
echo "=== Creating farmer batch ==="
RESULT=$(curl -s -X POST http://localhost:5000/api/farmer/batch \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "lokasi_gps": "-6.2088,106.8456",
    "luas_area_ha": 2.5,
    "jenis_tanah": "Aluvial",
    "riwayat_pupuk_pestisida": "Urea, NPK",
    "tanggal_tanam": "2024-01-01",
    "varietas_benih": "IR64",
    "sumber_benih": "PT Benih Indonesia",
    "pestisida": "Furadan",
    "tanggal_panen": "2024-04-15",
    "volume_gkg_kg": 1000,
    "hasil_panen_per_ha": 4.5
  }')
echo "Create Batch: $RESULT"

echo ""
echo "=== Getting batch ==="
BATCH_ID=$(echo $RESULT | grep -oP '"batchId":"\K[^"]+')
echo "Batch ID: $BATCH_ID"
GET_RESULT=$(curl -s "http://localhost:5000/api/traceability/batch/$BATCH_ID" \
  -H "Authorization: Bearer $JWT")
echo "Get Batch: $GET_RESULT"
