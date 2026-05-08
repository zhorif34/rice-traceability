#!/bin/bash
# First login to get a token
echo "=== Login as petani ==="
LOGIN_RES=$(docker exec rice-traceability-frontend-1 wget -q -O- --post-data='{"email":"petani@test.com","password":"password123"}' --header='Content-Type: application/json' http://backend:5000/api/auth/login 2>&1)
echo "$LOGIN_RES"

TOKEN=$(echo "$LOGIN_RES" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "Token: ${TOKEN:0:20}..."

if [ -z "$TOKEN" ]; then
  echo "Failed to get token, trying alternate login..."
  exit 1
fi

echo ""
echo "=== Submit farmer batch ==="
BATCH_RES=$(docker exec rice-traceability-frontend-1 wget -q -O- \
  --post-data='{"lokasi_gps":"Test","luas_area_ha":"1","riwayat_pupuk_pestisida":"test","tanggal_tanam":"2026-01-01","varietas_benih":"IR64","sumber_benih":"test","pestisida":"test","tanggal_panen":"2026-05-01","volume_gkg_kg":"100","hasil_panen_per_ha":"100"}' \
  --header="Content-Type: application/json" \
  --header="Authorization: Bearer $TOKEN" \
  http://backend:5000/api/farmer/batch 2>&1)
echo "$BATCH_RES"

echo ""
echo "=== Backend logs (last 3) ==="
docker logs rice-traceability-backend-1 2>&1 | tail -3
