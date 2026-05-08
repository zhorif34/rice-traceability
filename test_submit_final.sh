#!/bin/bash
docker restart rice-traceability-backend-1 2>&1
sleep 8

echo "=== Backend logs ==="
docker logs --tail 5 rice-traceability-backend-1 2>&1

TOKEN=$(docker exec rice-traceability-frontend-1 wget -q -O- --post-data='{"email":"petani@test.com","password":"password123"}' --header='Content-Type: application/json' http://backend:5000/api/auth/login 2>&1 | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo "Token: ${#TOKEN} chars"

echo ""
echo "=== Sending farmer batch POST (15s timeout) ==="
START=$(date +%s)
RESULT=$(docker exec rice-traceability-frontend-1 timeout 15 wget -q -O- \
  --post-data='{"lokasi_gps":"test","luas_area_ha":"1","riwayat_pupuk_pestisida":"none","tanggal_tanam":"2026-01-01","varietas_benih":"IR64","sumber_benih":"cert","pestisida":"none","tanggal_panen":"2026-05-01","volume_gkg_kg":"100","hasil_panen_per_ha":"100"}' \
  --header='Content-Type: application/json' \
  --header="Authorization: Bearer $TOKEN" \
  http://backend:5000/api/farmer/batch 2>&1)
END=$(date +%s)
ELAPSED=$((END - START))
echo "Time: ${ELAPSED}s"
echo "Result: $RESULT"

echo ""
echo "=== Backend logs after request ==="
docker logs --tail 10 rice-traceability-backend-1 2>&1
