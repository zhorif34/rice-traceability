#!/bin/bash
# Test 1: Simple GET to health
echo "=== Test 1: Health check ==="
docker exec rice-traceability-backend-1 wget -q -O- http://localhost:5000/api/health 2>&1
echo ""

# Test 2: Login (POST)
echo "=== Test 2: Login ==="
docker exec rice-traceability-backend-1 wget -q -O- \
  --post-data='{"email":"petani@test.com","password":"password123"}' \
  --header='Content-Type: application/json' \
  http://localhost:5000/api/auth/login 2>&1
echo ""

# Test 3: Submit batch directly from backend container
echo "=== Test 3: Farmer batch (from backend, with timeout) ==="
TOKEN=$(docker exec rice-traceability-backend-1 wget -q -O- \
  --post-data='{"email":"petani@test.com","password":"password123"}' \
  --header='Content-Type: application/json' \
  http://localhost:5000/api/auth/login 2>&1 | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "Got token: ${#TOKEN} chars"

docker exec rice-traceability-backend-1 timeout 20 wget -q -O- \
  --post-data='{"lokasi_gps":"test","luas_area_ha":"1","riwayat_pupuk_pestisida":"none","tanggal_tanam":"2026-01-01","varietas_benih":"IR64","sumber_benih":"cert","pestisida":"none","tanggal_panen":"2026-05-01","volume_gkg_kg":"100","hasil_panen_per_ha":"100"}' \
  --header='Content-Type: application/json' \
  --header="Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/farmer/batch 2>&1
echo ""
echo "Exit code: $?"
