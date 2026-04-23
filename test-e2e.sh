#!/bin/bash
set -e
API=http://localhost:5000/api

echo "=== Registering users ==="

PETANI_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"petani@test.com","password":"password123","role":"petani","entityName":"Petani Sejahtera"}')
echo "Petani: $PETANI_RES"
PETANI_TOKEN=$(echo $PETANI_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

PENGEPUL_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"pengepul@test.com","password":"password123","role":"pengepul","entityName":"Pengepul Makmur"}')
echo "Pengepul registered"
PENGEPUL_TOKEN=$(echo $PENGEPUL_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

RMU_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"rmu@test.com","password":"password123","role":"rmu","entityName":"Penggilingan Padi Jaya"}')
echo "RMU registered"
RMU_TOKEN=$(echo $RMU_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

DIST_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"distributor@test.com","password":"password123","role":"distributor","entityName":"Distributor Beras Nusantara"}')
echo "Distributor registered"
DIST_TOKEN=$(echo $DIST_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

BULOG_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"bulog@test.com","password":"password123","role":"bulog","entityName":"BULOG Cabang Jawa Barat"}')
echo "Bulog registered"
BULOG_TOKEN=$(echo $BULOG_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

RET_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"retailer@test.com","password":"password123","role":"retailer","entityName":"Toko Beras Sehat"}')
echo "Retailer registered"
RET_TOKEN=$(echo $RET_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

ADMIN_RES=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"password123","role":"admin","entityName":"System Admin"}')
echo "Admin registered"
ADMIN_TOKEN=$(echo $ADMIN_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

echo ""
echo "=== Step 1: Petani creates batch ==="
FARMER_RES=$(curl -s -X POST $API/farmer/batch \
  -H "Authorization: Bearer $PETANI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lokasi_gps":"Desa Suka Maju, Karawang","luas_area_ha":"2.5","jenis_tanah":"Lempung","riwayat_pupuk_pestisida":"Urea 2x, NPK 1x","tanggal_tanam":"2025-01-15","varietas_benih":"IR64","sumber_benih":"Bersertifikat BPSB","pestisida":"Decis 2.5 EC","tanggal_panen":"2025-05-10","volume_gkg_kg":"5000","hasil_panen_per_ha":"6000"}')
echo "$FARMER_RES" | python3 -m json.tool
FARMER_BATCH=$(echo $FARMER_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "Farmer Batch ID: $FARMER_BATCH"

echo ""
echo "=== Step 2: Pengepul creates batch ==="
COLLECTOR_RES=$(curl -s -X POST $API/collector/batch \
  -H "Authorization: Bearer $PENGEPUL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prev_batch_id\":\"$FARMER_BATCH\",\"nomor_pengiriman\":\"COL-2025-001\",\"volume_gkg_diterima_kg\":\"5000\",\"asal_petani_lokasi\":\"Desa Suka Maju\",\"tanggal_pengiriman\":\"2025-05-12\"}")
echo "$COLLECTOR_RES" | python3 -m json.tool
COLLECTOR_BATCH=$(echo $COLLECTOR_RES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "Collector Batch ID: $COLLECTOR_BATCH"

echo ""
echo "=== Step 3: RMU creates batch (with SNI validation) ==="
RMU_BRES=$(curl -s -X POST $API/rmu/batch \
  -H "Authorization: Bearer $RMU_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prev_batch_id\":\"$COLLECTOR_BATCH\",\"volume_gkg_masuk_kg\":\"5000\",\"kadar_air_masuk\":\"18\",\"pemeriksaan_visual\":\"Lolos\",\"tanggal_penerimaan\":\"2025-05-13\",\"supplier_id\":\"SUP-001\",\"jenis_kemasan\":\"Karung 25kg\",\"berat_netto\":\"25\",\"tanggal_pengemasan\":\"2025-05-14\",\"nomor_batch_beras\":\"RICE-2025-001\",\"sertifikat_mutu_sni\":\"SNI-2025-001\",\"kadar_air\":\"13\",\"derajat_sosoh\":\"96\",\"butir_kepala\":\"80\",\"butir_patah\":\"18\",\"butir_menir\":\"2\"}")
echo "$RMU_BRES" | python3 -m json.tool
RMU_BATCH=$(echo $RMU_BRES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "RMU Batch ID: $RMU_BATCH"

echo ""
echo "=== Step 4: Distributor creates batch ==="
DIST_BRES=$(curl -s -X POST $API/distributor/batch \
  -H "Authorization: Bearer $DIST_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prev_batch_id\":\"$RMU_BATCH\",\"nomor_po\":\"PO-2025-001\",\"volume_beras_dikirim_karung\":\"200\",\"tujuan_pengiriman\":\"bulog\",\"tanggal_pengiriman\":\"2025-05-15\"}")
echo "$DIST_BRES" | python3 -m json.tool
DIST_BATCH=$(echo $DIST_BRES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "Distributor Batch ID: $DIST_BATCH"

echo ""
echo "=== Step 5: Bulog creates batch ==="
BULOG_BRES=$(curl -s -X POST $API/bulog/batch \
  -H "Authorization: Bearer $BULOG_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prev_batch_id\":\"$DIST_BATCH\",\"nomor_po\":\"PO-BULOG-001\",\"volume_dibeli_ton\":\"5\",\"harga_satuan_rp_per_kg\":\"12000\",\"mutu_beras_sni\":\"Medium\",\"nomor_gudang_penerimaan\":\"GDG-001\",\"tanggal_pembelian\":\"2025-05-16\",\"nomor_so\":\"SO-BULOG-001\",\"volume_dijual_ton\":\"3\",\"penerima\":\"Toko Beras Sehat\",\"tanggal_pengiriman_gudang\":\"2025-05-18\"}")
echo "$BULOG_BRES" | python3 -m json.tool
BULOG_BATCH=$(echo $BULOG_BRES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "Bulog Batch ID: $BULOG_BATCH"

echo ""
echo "=== Step 6: Retailer creates batch (QR generated) ==="
RET_BRES=$(curl -s -X POST $API/retailer/batch \
  -H "Authorization: Bearer $RET_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prev_batch_id\":\"$BULOG_BATCH\",\"nomor_invoice\":\"INV-2025-001\",\"volume_dibeli_karung\":\"120\",\"tanggal_terima\":\"2025-05-19\",\"nomor_batch_beras\":\"RICE-2025-001\",\"harga_eceran\":\"14500\",\"tanggal_penjualan\":\"2025-05-20\",\"keterangan_berat_bersih\":\"true\",\"logo_halal\":\"true\",\"keterangan_nama_alamat_produsen\":\"true\",\"tanggal_kadaluarsa\":\"2026-05-20\"}")
echo "$RET_BRES" | python3 -c "import sys,json;d=json.load(sys.stdin);print(json.dumps({k:v for k,v in d.items() if k != 'qrCode'},indent=2))"
RET_BATCH=$(echo $RET_BRES | python3 -c "import sys,json;print(json.load(sys.stdin)['batchId'])")
echo "Retailer Batch ID: $RET_BATCH"
echo "(QR Code generated - view via frontend)"

echo ""
echo "=== Step 7: Trace full supply chain ==="
curl -s $API/traceability/trace/$RET_BATCH | python3 -m json.tool

echo ""
echo "========================================"
echo "  E2E Test Complete!"
echo "========================================"
echo "  Farmer Batch:      $FARMER_BATCH"
echo "  Collector Batch:   $COLLECTOR_BATCH"
echo "  RMU Batch:         $RMU_BATCH"
echo "  Distributor Batch: $DIST_BATCH"
echo "  Bulog Batch:       $BULOG_BATCH"
echo "  Retailer Batch:    $RET_BATCH"
echo "========================================"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Explorer:  http://localhost:8080"
echo "  Trace:     http://localhost:5000/api/traceability/trace/$RET_BATCH"
echo "========================================"
